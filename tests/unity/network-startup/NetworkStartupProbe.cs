// Copy explicitly to a disposable validation project's Assets. No runtime-package test hooks.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Reflection;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Scripting;

namespace LGUI.Tests
{
    [Preserve]
    public static class NetworkStartupProbe
    {
        [Serializable] sealed class Response {public int status; public string text; public string error;}
        [Serializable] sealed class FetchCase
        {
            public bool ok; public int callbacks; public Response response;
            public int trackedBefore, trackedAfter, staleCallbacks; public bool staleYielded; public string error;
        }
        [Serializable] sealed class RawCase {public string kind; public bool threw; public string exceptionType; public string detail;}
        [Serializable] sealed class RawCases {public RawCase[] cases;}
        [Serializable] sealed class MediaCase
        {
            public bool ok; public int imageErrors, imageLoads, secondImageErrors, secondImageLoads;
            public int trackedBefore, trackedAfter, cacheBefore, cacheAfter, soundsBefore, soundsAfter;
            public string[] audioErrors; public string[] unexpectedErrors; public string error;
        }
        [Serializable] sealed class ShutdownCase {public bool ok; public int firstWaiter, lateWaiter, trackedAfter, cacheAfter; public bool ownerClosed; public string error;}
        static readonly BindingFlags PrivateStatic = BindingFlags.Static | BindingFlags.NonPublic;
        static InvalidOperationException Invalid(string message) {return new InvalidOperationException("LGUI-RT-001 NetworkStartupProbe.cs: " + message + " → Run this explicit negative probe in the initialized test Player with insecure HTTP disallowed.");}
        static int Tracked() {return ((ICollection<UnityWebRequest>)typeof(Platform).GetField("requests", PrivateStatic).GetValue(null)).Count;}
        static Type CacheType() {return typeof(Platform).Assembly.GetType("LGUI.ExternalImageCache", true);}
        static IDictionary Cache() {return (IDictionary)CacheType().GetField("entries", PrivateStatic).GetValue(null);}
        static int Sounds() {return ((ICollection<AudioClip>)typeof(Platform).GetField("downloadedSounds", PrivateStatic).GetValue(null)).Count;}

        [Preserve]
        public static string RunFetchCase(string blockedHttpUrl)
        {
            var result = new FetchCase();
            try
            {
                if (typeof(Platform).GetField("owner", PrivateStatic).GetValue(null) == null) throw Invalid("LGUIBoot has not initialized Platform.");
                result.trackedBefore = Tracked();
                Platform.Fetch(blockedHttpUrl, "GET", "{\"items\":[]}", null, value => {result.callbacks++; result.response = JsonUtility.FromJson<Response>(value);});
                result.trackedAfter = Tracked();
                if (result.callbacks != 1 || result.response == null || result.response.status != 0 || result.response.text != "" ||
                    !result.response.error.Contains("LGUI-RT-161") || !result.response.error.Contains("InvalidOperationException") ||
                    !result.response.error.Contains("Insecure connection not allowed")) throw Invalid("Expected one synchronous coded startup-failure callback with the original exception details.");
                if (result.trackedAfter != result.trackedBefore) throw Invalid("The failed request is still tracked.");
                int currentGeneration = (int)typeof(Platform).GetField("generation", PrivateStatic).GetValue(null);
                var request = UnityWebRequest.Get(blockedHttpUrl);
                var routine = (IEnumerator)typeof(Platform).GetMethod("Send", PrivateStatic).Invoke(null, new object[] {request, new Action<string>(value => result.staleCallbacks++), currentGeneration - 1});
                try {result.staleYielded = routine.MoveNext();} finally {(routine as IDisposable)?.Dispose();}
                if (result.staleCallbacks != 0 || result.staleYielded || Tracked() != result.trackedBefore) throw Invalid("The stale generation ran a callback or retained its request.");
                result.ok = true;
            }
            catch (Exception error) {result.error = Invalid(error.ToString()).ToString();}
            return JsonUtility.ToJson(result);
        }

        static RawCase Classify(string kind, UnityWebRequest request)
        {
            var result = new RawCase {kind = kind};
            try {request.SendWebRequest(); request.Abort();}
            catch (Exception error) {result.threw = true; result.exceptionType = error.GetType().FullName; result.detail = error.ToString();}
            finally {request.Dispose();}
            return result;
        }
        // Separate diagnostic: establish whether the same Unity startup policy throws for each factory.
        // A raw exception is caught locally; no production coroutine or loader is changed by this probe.
        [Preserve]
        public static string ClassifyOtherStarts(string blockedHttpUrl)
        {
            return JsonUtility.ToJson(new RawCases {cases = new[] {
                Classify("buffer", UnityWebRequest.Get(blockedHttpUrl)),
                Classify("texture", UnityWebRequestTexture.GetTexture(blockedHttpUrl)),
                Classify("audio-wav", UnityWebRequestMultimedia.GetAudioClip(blockedHttpUrl, AudioType.WAV))
            }});
        }

        [Preserve]
        public static string RunMediaCases(string blockedHttpUrl)
        {
            var result = new MediaCase();
            var audioErrors = new List<string>(); var unexpected = new List<string>();
            Application.LogCallback capture = (message, stack, type) => {
                if (type == LogType.Error && message.Contains("LGUI-RT-161")) audioErrors.Add(message);
                else if (type == LogType.Error || type == LogType.Exception || type == LogType.Assert) unexpected.Add(type + ": " + message + "\n" + stack);
            };
            Application.logMessageReceived += capture;
            try
            {
                if (typeof(Platform).GetField("owner", PrivateStatic).GetValue(null) == null) throw Invalid("LGUIBoot has not initialized Platform.");
                result.trackedBefore = Tracked(); result.cacheBefore = Cache().Count; result.soundsBefore = Sounds();
                var loader = new LGUIResourceLoader();
                try
                {
                    loader.onLoadError.Add(() => result.imageErrors++); loader.onLoaded.Add(() => result.imageLoads++);
                    loader.url = blockedHttpUrl;
                }
                finally {loader.Dispose();}
                var second = new LGUIResourceLoader();
                try
                {
                    second.onLoadError.Add(() => result.secondImageErrors++); second.onLoaded.Add(() => result.secondImageLoads++);
                    second.url = blockedHttpUrl;
                }
                finally {second.Dispose();}
                Platform.PlayAudio(new Uri(new Uri(blockedHttpUrl), "startup-probe.wav").AbsoluteUri, 0);
                result.trackedAfter = Tracked(); result.cacheAfter = Cache().Count; result.soundsAfter = Sounds();
                if (result.imageErrors != 1 || result.secondImageErrors != 1 || result.imageLoads != 0 || result.secondImageLoads != 0) throw Invalid("Each texture attempt must fail once, including a second request for the same URL.");
                if (result.trackedBefore != result.trackedAfter || result.cacheBefore != result.cacheAfter || result.soundsBefore != result.soundsAfter) throw Invalid("A failed media startup retained a request, cache entry or audio clip.");
                if (audioErrors.Count != 1 || !audioErrors[0].Contains("InvalidOperationException") || !audioErrors[0].Contains("Insecure connection not allowed") || unexpected.Count != 0) throw Invalid("Expected exactly one coded audio error with its original exception and no unhandled errors.");
                result.ok = true;
            }
            catch (Exception error) {result.error = Invalid(error.ToString()).ToString();}
            finally {Application.logMessageReceived -= capture; result.audioErrors = audioErrors.ToArray(); result.unexpectedErrors = unexpected.ToArray();}
            return JsonUtility.ToJson(result);
        }

        // Explicit destructive lifecycle test. Use a fresh negative-test Player and exit it afterward.
        // It constructs two native cache waiters to isolate reentrant shutdown during real Failed dispatch.
        [Preserve]
        public static string RunShutdownCase(string cacheKey)
        {
            var result = new ShutdownCase();
            try
            {
                var ownerField = typeof(Platform).GetField("owner", PrivateStatic);
                var owner = (MonoBehaviour)ownerField.GetValue(null);
                if (owner == null) throw Invalid("LGUIBoot has not initialized Platform.");
                if (Cache().Contains(cacheKey)) throw Invalid("Use a fresh lifecycle probe cache key.");
                var flags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
                var entryType = CacheType().GetNestedType("Entry", BindingFlags.NonPublic);
                var waiterType = CacheType().GetNestedType("Waiter", BindingFlags.NonPublic);
                var entry = Activator.CreateInstance(entryType, true);
                entryType.GetField("url", flags).SetValue(entry, cacheKey);
                entryType.GetField("generation", flags).SetValue(entry, typeof(Platform).GetField("generation", PrivateStatic).GetValue(null));
                var waiters = (IList)entryType.GetField("waiters", flags).GetValue(entry);
                var first = Activator.CreateInstance(waiterType, true); var late = Activator.CreateInstance(waiterType, true);
                waiterType.GetField("failed", flags).SetValue(first, new Action(() => {result.firstWaiter++; Platform.Shutdown(owner);}));
                waiterType.GetField("failed", flags).SetValue(late, new Action(() => result.lateWaiter++));
                waiters.Add(first); waiters.Add(late); Cache().Add(cacheKey, entry);
                CacheType().GetMethod("Failed", PrivateStatic).Invoke(null, new[] {entry});
                result.ownerClosed = ownerField.GetValue(null) == null; result.trackedAfter = Tracked(); result.cacheAfter = Cache().Count;
                if (result.firstWaiter != 1 || result.lateWaiter != 0 || !result.ownerClosed || result.trackedAfter != 0 || result.cacheAfter != 0) throw Invalid("Shutdown reentry dispatched to a stale waiter or retained native resources.");
                result.ok = true;
            }
            catch (Exception error) {result.error = Invalid(error.ToString()).ToString();}
            return JsonUtility.ToJson(result);
        }
    }
}
