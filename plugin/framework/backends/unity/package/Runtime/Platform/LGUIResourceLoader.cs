using System;
using System.Collections;
using System.Collections.Generic;
using FairyGUI;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Scripting;

namespace LGUI
{
    /// <summary>External image loading with explicit completion and owned-texture cleanup.</summary>
    [Preserve]
    public sealed class LGUIResourceLoader : GLoader
    {
        public readonly EventListener onLoaded;
        public readonly EventListener onLoadError;
        readonly HashSet<NTexture> externalTextures = new HashSet<NTexture>();
        UnityWebRequest pending;
        int loadGeneration;

        public LGUIResourceLoader()
        {
            onLoaded = new EventListener(this, "lguiLoaded");
            onLoadError = new EventListener(this, "lguiLoadError");
        }

        protected override void LoadExternal()
        {
            var requested = url;
            var startedGeneration = ++loadGeneration;
            if (pending != null) pending.Abort();
            Uri uri;
            if (Uri.TryCreate(requested, UriKind.Absolute, out uri))
            {
                if (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                    Platform.Run(Download(requested, startedGeneration));
                else Failed(requested);
                return;
            }
            var image = Resources.Load<Texture2D>(requested);
            if (image == null) { Failed(requested); return; }
            Loaded(requested, image, false);
        }

        IEnumerator Download(string requested, int startedGeneration)
        {
            var request = UnityWebRequestTexture.GetTexture(requested);
            pending = request;
            Platform.Track(request);
            try
            {
                yield return request.SendWebRequest();
                var current = !isDisposed && url == requested && startedGeneration == loadGeneration;
                if (request.result != UnityWebRequest.Result.Success) { if (current) Failed(requested); yield break; }
                var image = DownloadHandlerTexture.GetContent(request);
                if (!current) { if (image != null) UnityEngine.Object.Destroy(image); yield break; }
                if (image == null) { Failed(requested); yield break; }
                Loaded(requested, image, true);
            }
            finally
            {
                if (ReferenceEquals(pending, request)) pending = null;
                Platform.Untrack(request);
                request.Dispose();
            }
        }

        void Loaded(string requested, Texture2D image, bool ownsImage)
        {
            if (isDisposed || url != requested)
            {
                if (ownsImage) UnityEngine.Object.Destroy(image);
                return;
            }
            var texture = new NTexture(image) { destroyMethod = ownsImage ? DestroyMethod.Destroy : DestroyMethod.None };
            externalTextures.Add(texture);
            onExternalLoadSuccess(texture);
            onLoaded.Call(requested);
        }

        void Failed(string requested)
        {
            if (isDisposed || url != requested) return;
            onExternalLoadFailed();
            onLoadError.Call(requested);
        }

        protected override void FreeExternal(NTexture texture)
        {
            if (externalTextures.Remove(texture)) texture.Dispose();
        }

        public override void Dispose()
        {
            loadGeneration++;
            if (pending != null) { pending.Abort(); pending = null; }
            base.Dispose();
            foreach (var texture in externalTextures) texture.Dispose();
            externalTextures.Clear();
        }
    }
}
