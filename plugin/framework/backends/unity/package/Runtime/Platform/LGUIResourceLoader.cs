using System;
using System.Collections.Generic;
using FairyGUI;
using UnityEngine;
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
        Action cancelPending;
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
            if (cancelPending != null) { cancelPending(); cancelPending = null; }
            Uri uri;
            if (Uri.TryCreate(requested, UriKind.Absolute, out uri))
            {
                if (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                {
                    var cancel = ExternalImageCache.Load(requested, texture =>
                    {
                        if (isDisposed || url != requested || startedGeneration != loadGeneration) return;
                        cancelPending = null;
                        onExternalLoadSuccess(texture);
                        onLoaded.Call(requested);
                    }, () =>
                    {
                        if (isDisposed || url != requested || startedGeneration != loadGeneration) return;
                        cancelPending = null;
                        Failed(requested);
                    });
                    // A ready cache entry invokes onLoaded before Load returns. That
                    // callback may start another URL; publish only this generation's handle.
                    if (isDisposed || url != requested || startedGeneration != loadGeneration)
                    {
                        if (cancel != null) cancel();
                    }
                    else cancelPending = cancel;
                }
                else Failed(requested);
                return;
            }
            var image = Resources.Load<Texture2D>(requested);
            if (image == null) { Failed(requested); return; }
            Loaded(requested, image, false);
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
            // Downloaded textures are shared. NGraphics.ReleaseRef/onRelease retires
            // those through ExternalImageCache; only this loader's local wrappers live here.
            if (externalTextures.Remove(texture)) texture.Dispose();
        }

        public override void Dispose()
        {
            loadGeneration++;
            if (cancelPending != null) { cancelPending(); cancelPending = null; }
            base.Dispose();
            foreach (var texture in externalTextures) texture.Dispose();
            externalTextures.Clear();
        }
    }
}
