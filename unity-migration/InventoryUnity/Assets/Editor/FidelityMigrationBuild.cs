using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

// Separate validation scene and output; no baseline or Complex scene is overwritten.
public static class FidelityMigrationBuild
{
    public const string ScenePath = "Assets/FidelityInventoryValidation.unity";
    public static string MigrationRoot { get { return Directory.GetParent(Application.dataPath).Parent.FullName; } }
    public static string Root { get { return Path.Combine(MigrationRoot, "complex-inventory/fidelity"); } }
    public static string EvidenceDirectory(string action)
    {
        string directory = Path.Combine(Root, "evidence/unity-" + action);
        string[] args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++) if (args[i] == "-verificationDir") directory = args[i + 1];
        directory = Path.GetFullPath(directory); Directory.CreateDirectory(directory); return directory;
    }
    [MenuItem("Fidelity Inventory Validation/Prepare")]
    public static void Prepare()
    {
        string[] required = { "FidelityInventoryApp", "FidelityInventoryLayout", "FidelityReferenceFixture", "FidelityResourceMap", "FidelitySkinManifest", "FidelityLayoutReference", "FidelityInventoryUI/Inventory_fui" };
        foreach (string asset in required) if (Resources.Load<TextAsset>(asset) == null) throw new InvalidDataException("Fidelity resource is missing: " + asset + ". Complete the resource setup before Prepare.");
        PlayerSettings.companyName = "LumioValidation"; PlayerSettings.productName = "Fidelity Inventory";
        PlayerSettings.defaultScreenWidth = 1280; PlayerSettings.defaultScreenHeight = 800;
        PlayerSettings.fullScreenMode = FullScreenMode.Windowed; PlayerSettings.resizableWindow = true; PlayerSettings.runInBackground = true;
        PlayerSettings.SetScriptingDefineSymbols(NamedBuildTarget.Standalone, "FAIRYGUI_PUERTS");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.Standalone, ManagedStrippingLevel.Low);
        PlayerSettings.SetIl2CppCompilerConfiguration(NamedBuildTarget.Standalone, Il2CppCompilerConfiguration.Release);
        PlayerSettings.SetApiCompatibilityLevel(NamedBuildTarget.Standalone, ApiCompatibilityLevel.NET_Standard);
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cameraObject = new GameObject("Main Camera"); var camera = cameraObject.AddComponent<Camera>(); cameraObject.AddComponent<AudioListener>();
        cameraObject.tag = "MainCamera"; camera.orthographic = true; camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = new Color(0.012f, 0.035f, 0.055f);
        var host = new GameObject("Fidelity Inventory PuerTS Runtime").AddComponent<FidelityInventoryHost>();
        // Distribution starts without file instrumentation; test launch scripts explicitly opt in.
        host.verificationDirectory = "";
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        string textureRoot = "Assets/Resources/FidelityInventoryUI";
        if (!AssetDatabase.IsValidFolder(textureRoot)) throw new DirectoryNotFoundException(textureRoot);
        foreach (string guid in AssetDatabase.FindAssets("t:Texture2D", new[] { textureRoot }))
        {
            var importer = AssetImporter.GetAtPath(AssetDatabase.GUIDToAssetPath(guid)) as TextureImporter;
            if (importer == null) continue;
            importer.textureType = TextureImporterType.Default; importer.mipmapEnabled = false; importer.alphaIsTransparency = true;
            importer.textureCompression = TextureImporterCompression.Uncompressed; importer.maxTextureSize = 16384;
            importer.npotScale = TextureImporterNPOTScale.None; importer.wrapMode = TextureWrapMode.Clamp; importer.SaveAndReimport();
        }
        AssetDatabase.SaveAssets();
        string json = "{\"prepared\":true,\"unity\":\"" + Application.unityVersion + "\",\"scene\":\"" + ScenePath + "\",\"scriptingBackend\":\"IL2CPP\",\"purpose\":\"native FairyGUI/PuerTS validation\"}";
        File.WriteAllText(Path.Combine(EvidenceDirectory("prepare"), "prepare.json"), json); Debug.Log("FIDELITY_PREPARED " + json);
    }
    [MenuItem("Fidelity Inventory Validation/Generate PuerTS IL2CPP Bridge")]
    public static void GeneratePuerTS()
    {
        string template = Path.Combine(MigrationRoot, "packages/puerts-core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt");
        string source = File.ReadAllText(template);
        if (source.Contains("il2cpp::vm::Object::Unbox")) throw new InvalidDataException("Unity 6000.6 requires the recorded public il2cpp_object_unbox compatibility patch before generation.");
        Puerts.Editor.Generator.UnityMenu.GenV2WithoutWrapper(); AssetDatabase.SaveAssets(); Debug.Log("FIDELITY_PUERTS_BRIDGE_GENERATED");
    }
    [MenuItem("Fidelity Inventory Validation/Build Windows x64 IL2CPP")]
    public static void BuildWindows()
    {
        if (!File.Exists(Path.Combine(Directory.GetParent(Application.dataPath).FullName, ScenePath))) throw new FileNotFoundException("Run FidelityMigrationBuild.Prepare first.", ScenePath);
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        string folder = Path.Combine(MigrationRoot, "build/fidelity-windows-il2cpp"); Directory.CreateDirectory(folder);
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions { scenes = new[] { ScenePath }, locationPathName = Path.Combine(folder, "FidelityInventory.exe"), target = BuildTarget.StandaloneWindows64, options = BuildOptions.None });
        var s = report.summary;
        string json = "{\"result\":\"" + s.result + "\",\"unity\":\"" + Application.unityVersion + "\",\"target\":\"StandaloneWindows64\",\"scriptingBackend\":\"IL2CPP\",\"developmentBuild\":false,\"totalBytes\":" + s.totalSize + ",\"totalSeconds\":" + s.totalTime.TotalSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture) + ",\"errors\":" + s.totalErrors + ",\"warnings\":" + s.totalWarnings + "}";
        File.WriteAllText(Path.Combine(EvidenceDirectory("build"), "player-build.json"), json); Debug.Log("FIDELITY_BUILD " + json);
        if (s.result != BuildResult.Succeeded) throw new Exception("Fidelity Windows IL2CPP build failed: " + s.result);
    }
}
