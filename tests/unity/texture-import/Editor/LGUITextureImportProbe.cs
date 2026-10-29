// Copy explicitly to Assets/Editor in a disposable native validation project.
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using UnityEditor;
using UnityEngine;

namespace LGUI.Tests
{
    public static class LGUITextureImportProbe
    {
        const string ProbeDirectory = "Assets/LGUITextureImportProbe";
        [Serializable] sealed class TextureState { public string path; public bool mipmapEnabled; public int mipmapCount; }
        [Serializable] sealed class ScopeCase { public string path; public bool expected; public bool actual; }
        [Serializable] sealed class Report { public bool ok; public string error; public TextureState[] generated; public TextureState unrelatedBefore; public TextureState unrelatedAfter; public ScopeCase[] scope; }

        static InvalidOperationException Invalid(string message)
        {
            return new InvalidOperationException("LGUI-RT-001 LGUITextureImportProbe.cs: " + message + " → Inspect the package Editor importer and native import evidence.");
        }
        static string Argument(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == name) return args[i + 1];
            return null;
        }
        static TextureState Read(string path)
        {
            var importer = AssetImporter.GetAtPath(path) as TextureImporter;
            var texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (importer == null || texture == null) throw Invalid("The texture did not import: " + path);
            return new TextureState {path = path, mipmapEnabled = importer.mipmapEnabled, mipmapCount = texture.mipmapCount};
        }
        public static void Run()
        {
            string result = Argument("-lguiTextureImportResult");
            if (string.IsNullOrEmpty(result) || !Path.IsPathRooted(result) || File.Exists(result)) throw Invalid("Use a fresh absolute -lguiTextureImportResult JSON path.");
            if (Directory.Exists(ProbeDirectory)) throw Invalid("The probe directory already exists; use a clean validation project.");
            var report = new Report();
            bool created = false;
            try
            {
                var type = Type.GetType("LGUI.Editor.LGUIAtlasTextureImporter, LGUI.Editor", false);
                var predicate = type == null ? null : type.GetMethod("IsGeneratedAtlas", BindingFlags.Static | BindingFlags.NonPublic);
                if (predicate == null) throw Invalid("The package Editor importer did not compile or load.");
                report.scope = new[] {
                    new ScopeCase {path = "Assets/LGUI/Resources/UI/Main_atlas0.png", expected = true},
                    new ScopeCase {path = "Assets/LGUI/Resources/UI/LGUI_NoPackage_atlas0.png", expected = false},
                    new ScopeCase {path = "Assets/LGUI/Resources/UI/Main.png", expected = false},
                    new ScopeCase {path = "Assets/LGUI/Resources/UI/Main_atlasCustom.png", expected = false},
                    new ScopeCase {path = "Assets/LGUI/Resources/UI/Nested/Main_atlas0.png", expected = false},
                    new ScopeCase {path = "Assets/Other/Resources/UI/Main_atlas0.png", expected = false},
                    new ScopeCase {path = "Packages/com.example/UI/Main_atlas0.png", expected = false}
                };
                foreach (var item in report.scope)
                {
                    item.actual = (bool)predicate.Invoke(null, new object[] {item.path});
                    if (item.actual != item.expected) throw Invalid("The importer scope is wrong for " + item.path);
                }
                var generated = new List<TextureState>();
                foreach (string name in new[] {"Main", "Common", "Bag"})
                {
                    string path = "Assets/LGUI/Resources/UI/" + name + "_atlas0.png";
                    AssetDatabase.ImportAsset(path, ImportAssetOptions.ForceUpdate | ImportAssetOptions.ForceSynchronousImport);
                    var state = Read(path); generated.Add(state); report.generated = generated.ToArray();
                    if (state.mipmapEnabled || state.mipmapCount != 1) throw Invalid("Generated atlas still has mipmaps: " + path);
                }
                Directory.CreateDirectory(ProbeDirectory); created = true;
                string unrelated = ProbeDirectory + "/User_atlas0.png";
                var image = new Texture2D(4, 4, TextureFormat.RGBA32, false);
                try {File.WriteAllBytes(unrelated, image.EncodeToPNG());} finally {UnityEngine.Object.DestroyImmediate(image);}
                AssetDatabase.ImportAsset(unrelated, ImportAssetOptions.ForceSynchronousImport);
                var control = (TextureImporter)AssetImporter.GetAtPath(unrelated);
                control.mipmapEnabled = true; control.SaveAndReimport();
                report.unrelatedBefore = Read(unrelated);
                AssetDatabase.ImportAsset(unrelated, ImportAssetOptions.ForceUpdate | ImportAssetOptions.ForceSynchronousImport);
                report.unrelatedAfter = Read(unrelated);
                if (!report.unrelatedBefore.mipmapEnabled || !report.unrelatedAfter.mipmapEnabled || report.unrelatedAfter.mipmapCount <= 1)
                    throw Invalid("An unrelated user's texture import settings changed.");
                report.ok = true;
            }
            catch (Exception error) {report.error = Invalid(error.ToString()).ToString();}
            finally
            {
                if (created) AssetDatabase.DeleteAsset(ProbeDirectory);
                Directory.CreateDirectory(Path.GetDirectoryName(result));
                File.WriteAllText(result, JsonUtility.ToJson(report, true), new UTF8Encoding(false));
            }
            if (!report.ok) throw Invalid(report.error);
        }
    }
}
