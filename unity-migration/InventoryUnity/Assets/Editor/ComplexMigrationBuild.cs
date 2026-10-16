using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public static class ComplexMigrationBuild
{
    public static string Root { get { return Path.Combine(Directory.GetParent(Application.dataPath).Parent.FullName, "complex-inventory"); } }
    public const string ScenePath = "Assets/ComplexInventoryValidation.unity";
    [MenuItem("Complex Inventory Validation/Prepare")]
    public static void Prepare()
    {
        if (Resources.Load<TextAsset>("ComplexInventoryApp") == null || Resources.Load<TextAsset>("ComplexInventoryLayout") == null || Resources.Load<TextAsset>("ComplexInventoryUI/Inventory_fui") == null)
            throw new InvalidDataException("Run complex-inventory/scripts/setup-unity.mjs before Prepare.");
        PlayerSettings.companyName = "LumioValidation"; PlayerSettings.productName = "Complex Inventory Validation";
        PlayerSettings.defaultScreenWidth = 1280; PlayerSettings.defaultScreenHeight = 800;
        PlayerSettings.fullScreenMode = FullScreenMode.Windowed; PlayerSettings.resizableWindow = true; PlayerSettings.runInBackground = true;
        PlayerSettings.SetScriptingDefineSymbols(NamedBuildTarget.Standalone, "FAIRYGUI_PUERTS");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.Standalone, ManagedStrippingLevel.Low);
        PlayerSettings.SetIl2CppCompilerConfiguration(NamedBuildTarget.Standalone, Il2CppCompilerConfiguration.Release);
        PlayerSettings.SetApiCompatibilityLevel(NamedBuildTarget.Standalone, ApiCompatibilityLevel.NET_Standard);
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cameraObject = new GameObject("Main Camera"); var camera = cameraObject.AddComponent<Camera>(); cameraObject.AddComponent<AudioListener>();
        camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = new Color(0.025f, 0.04f, 0.08f); camera.orthographic = true; cameraObject.tag = "MainCamera";
        var host = new GameObject("Complex Inventory PuerTS Runtime").AddComponent<ComplexInventoryHost>(); host.verificationDirectory = Path.Combine(Root, "evidence", "editor");
        EditorSceneManager.SaveScene(scene, ScenePath); EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        foreach (string file in Directory.GetFiles(Path.Combine(Application.dataPath, "Resources/ComplexInventoryUI"), "*.png"))
        {
            string assetPath = "Assets" + file.Substring(Application.dataPath.Length).Replace('\\', '/'); var texture = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (texture != null) { texture.textureType = TextureImporterType.Default; texture.mipmapEnabled = false; texture.alphaIsTransparency = true; texture.textureCompression = TextureImporterCompression.Uncompressed; texture.maxTextureSize = 4096; texture.SaveAndReimport(); }
        }
        AssetDatabase.SaveAssets(); Directory.CreateDirectory(Path.Combine(Root, "evidence"));
        File.WriteAllText(Path.Combine(Root, "evidence/prepare.json"), "{\"prepared\":true,\"unity\":\"" + Application.unityVersion + "\",\"scene\":\"" + ScenePath + "\",\"scriptingBackend\":\"IL2CPP\"}");
        Debug.Log("COMPLEX_PREPARED " + Application.unityVersion);
    }
    [MenuItem("Complex Inventory Validation/Generate PuerTS IL2CPP Bridge")]
    public static void GeneratePuerTS() { Puerts.Editor.Generator.UnityMenu.GenV2WithoutWrapper(); AssetDatabase.SaveAssets(); Debug.Log("COMPLEX_PUERTS_BRIDGE_GENERATED"); }
    [MenuItem("Complex Inventory Validation/Build Windows x64 IL2CPP")]
    public static void BuildWindows()
    {
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        string migration = Directory.GetParent(Application.dataPath).Parent.FullName;
        string folder = Path.Combine(migration, "build/complex-windows-il2cpp"); Directory.CreateDirectory(folder); Directory.CreateDirectory(Path.Combine(Root, "evidence"));
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { ScenePath }, locationPathName = Path.Combine(folder, "ComplexInventory.exe"), target = BuildTarget.StandaloneWindows64, options = BuildOptions.Development });
        var s = report.summary; string json = "{\"result\":\"" + s.result + "\",\"unity\":\"" + Application.unityVersion + "\",\"target\":\"StandaloneWindows64\",\"scriptingBackend\":\"IL2CPP\",\"totalBytes\":" + s.totalSize + ",\"totalSeconds\":" + s.totalTime.TotalSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture) + ",\"errors\":" + s.totalErrors + ",\"warnings\":" + s.totalWarnings + "}";
        File.WriteAllText(Path.Combine(Root, "evidence/player-build.json"), json); Debug.Log("COMPLEX_BUILD " + json);
        if (s.result != BuildResult.Succeeded) throw new Exception("Complex Windows IL2CPP build failed: " + s.result);
    }
}
