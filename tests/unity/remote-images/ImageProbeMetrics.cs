using UnityEngine;
using UnityEngine.Scripting;
using FairyGUI;
namespace LGUI.Tests
{
    [Preserve]
    public static class ImageProbeMetrics
    {
        [Preserve]
        public static int TextureCount() { return Resources.FindObjectsOfTypeAll<Texture2D>().Length; }
        [Preserve]
        public static bool Alive(GLoader loader) { return loader.texture != null && loader.texture.nativeTexture != null; }
        [Preserve]
        public static bool SameTexture(GLoader a, GLoader b) { return ReferenceEquals(a.texture, b.texture); }
    }
}
