using System;
using System.Collections;
using System.Collections.Generic;
using FairyGUI;
using UnityEngine;
using UnityEngine.Networking;

namespace LGUI
{
    // Native graphics own active references. The cache only bridges a completed preload
    // to its Promise consumer, and removes unused textures after two frames.
    internal static class ExternalImageCache
    {
        sealed class Waiter
        {
            public Action<NTexture> loaded;
            public Action failed;
        }

        sealed class Entry
        {
            public string url;
            public NTexture texture;
            public UnityWebRequest request;
            public int idleUntilFrame;
            public readonly List<Waiter> waiters = new List<Waiter>();
        }

        const int HandoffFrames = 2;
        static readonly Dictionary<string, Entry> entries = new Dictionary<string, Entry>(StringComparer.Ordinal);

        static bool Current(Entry entry)
        {
            Entry current;
            return entries.TryGetValue(entry.url, out current) && ReferenceEquals(current, entry);
        }

        internal static Action Load(string url, Action<NTexture> loaded, Action failed)
        {
            Entry entry;
            if (entries.TryGetValue(url, out entry) && entry.texture != null)
            {
                loaded(entry.texture);
                return null;
            }
            bool start = entry == null;
            if (start) { entry = new Entry {url = url}; entries.Add(url, entry); }
            var waiter = new Waiter {loaded = loaded, failed = failed};
            entry.waiters.Add(waiter);
            if (start) Platform.Run(Download(entry));
            return () =>
            {
                entry.waiters.Remove(waiter);
                if (entry.texture == null && entry.waiters.Count == 0 && Current(entry))
                {
                    entries.Remove(url);
                    if (entry.request != null) entry.request.Abort();
                }
            };
        }

        static void Failed(Entry entry)
        {
            if (!Current(entry)) return;
            entries.Remove(entry.url);
            var waiters = entry.waiters.ToArray();
            entry.waiters.Clear();
            foreach (var waiter in waiters) waiter.failed();
        }

        static IEnumerator Download(Entry entry)
        {
            var request = UnityWebRequestTexture.GetTexture(entry.url);
            entry.request = request;
            Platform.Track(request);
            try
            {
                yield return request.SendWebRequest();
                if (request.result != UnityWebRequest.Result.Success) { Failed(entry); yield break; }
                var image = DownloadHandlerTexture.GetContent(request);
                if (!Current(entry)) { if (image != null) UnityEngine.Object.Destroy(image); yield break; }
                if (image == null) { Failed(entry); yield break; }
                var texture = new NTexture(image) {destroyMethod = DestroyMethod.Destroy};
                entry.texture = texture;
                entry.idleUntilFrame = Time.frameCount + HandoffFrames;
                texture.onRelease += unused => entry.idleUntilFrame = Time.frameCount + HandoffFrames;
                var waiters = entry.waiters.ToArray();
                entry.waiters.Clear();
                foreach (var waiter in waiters) waiter.loaded(texture);
            }
            finally
            {
                entry.request = null;
                Platform.Untrack(request);
                request.Dispose();
            }
        }

        // Boot invokes this after env.Tick and the frame callback: a completion after
        // Update remains available to the next Tick's Promise continuation. This is a
        // fixed ownership handoff window, not a retry or an unbounded texture cache.
        internal static void Trim()
        {
            if (entries.Count == 0) return;
            var expired = new List<string>();
            foreach (var pair in entries)
            {
                var entry = pair.Value;
                if (entry.texture != null && entry.texture.refCount == 0 && Time.frameCount >= entry.idleUntilFrame)
                {
                    entry.texture.Dispose();
                    expired.Add(pair.Key);
                }
            }
            foreach (var url in expired) entries.Remove(url);
        }

        internal static void Clear()
        {
            foreach (var entry in entries.Values)
            {
                entry.waiters.Clear();
                if (entry.texture != null) entry.texture.Dispose();
            }
            entries.Clear();
            // Platform.Shutdown owns cancellation and disposal of all tracked requests.
        }
    }
}
