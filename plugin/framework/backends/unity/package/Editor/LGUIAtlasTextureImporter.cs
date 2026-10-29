using System.IO;
using System.Text.RegularExpressions;
using UnityEditor;

namespace LGUI.Editor
{
    /// <summary>Imports generated FairyGUI atlases without mipmaps, as UIPackage.LoadAtlas requires.</summary>
    sealed class LGUIAtlasTextureImporter : AssetPostprocessor
    {
        static readonly Regex Atlas = new Regex(@"^Assets/LGUI/Resources/UI/(?<package>[^/]+)_atlas[0-9]+\.png$", RegexOptions.CultureInvariant);

        internal static bool IsGeneratedAtlas(string path)
        {
            var match = Atlas.Match(path);
            return match.Success && File.Exists(Path.Combine(Path.GetDirectoryName(path), match.Groups["package"].Value + "_fui.bytes"));
        }

        void OnPreprocessTexture()
        {
            if (IsGeneratedAtlas(assetPath))
                ((TextureImporter)assetImporter).mipmapEnabled = false;
        }
    }
}
