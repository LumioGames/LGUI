using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public static class MigrationBuild
{
    public static string Root => Directory.GetParent(Application.dataPath).Parent.FullName;
    public const string ScenePath = "Assets/InventoryValidation.unity";

    [MenuItem("Inventory Validation/Prepare")]
    public static void Prepare()
    {
        PlayerSettings.companyName = "LumioValidation";
        PlayerSettings.productName = "Inventory Unity PuerTS Validation";
        PlayerSettings.defaultScreenWidth = 1100;
        PlayerSettings.defaultScreenHeight = 800;
        PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
        PlayerSettings.resizableWindow = true;
        PlayerSettings.runInBackground = true;
        PlayerSettings.SetScriptingDefineSymbols(NamedBuildTarget.Standalone, "FAIRYGUI_PUERTS");
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        PlayerSettings.SetManagedStrippingLevel(NamedBuildTarget.Standalone, ManagedStrippingLevel.Low);
        PlayerSettings.SetIl2CppCompilerConfiguration(NamedBuildTarget.Standalone, Il2CppCompilerConfiguration.Release);
        PlayerSettings.SetApiCompatibilityLevel(NamedBuildTarget.Standalone, ApiCompatibilityLevel.NET_Standard);
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        var cameraObject = new GameObject("Main Camera");
        var camera = cameraObject.AddComponent<Camera>();
        cameraObject.AddComponent<AudioListener>();
        camera.clearFlags = CameraClearFlags.SolidColor;
        camera.backgroundColor = new Color(0.025f, 0.04f, 0.08f);
        camera.orthographic = true;
        cameraObject.tag = "MainCamera";
        var host = new GameObject("Inventory PuerTS Runtime").AddComponent<InventoryHost>();
        host.verificationDirectory = Path.Combine(Root, "evidence", "editor");
        EditorSceneManager.SaveScene(scene, ScenePath);
        EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
        foreach (string assetPath in new[] { "Assets/Resources/InventoryUI/Inventory_atlas0.png" })
        {
            var texture = AssetImporter.GetAtPath(assetPath) as TextureImporter;
            if (texture != null) { texture.textureType = TextureImporterType.Default; texture.mipmapEnabled = false; texture.alphaIsTransparency = true; texture.textureCompression = TextureImporterCompression.Uncompressed; texture.SaveAndReimport(); }
        }
        AssetDatabase.SaveAssets();
        Directory.CreateDirectory(Path.Combine(Root, "evidence"));
        File.WriteAllText(Path.Combine(Root, "evidence", "editor-prepare.json"), "{\"prepared\":true,\"unity\":\"" + Application.unityVersion + "\",\"backend\":\"IL2CPP\",\"scene\":\"" + ScenePath + "\"}");
        Debug.Log("MIGRATION_PREPARED " + Application.unityVersion);
    }

    [MenuItem("Inventory Validation/Play")]
    public static void LaunchEditor()
    {
        EditorSceneManager.OpenScene(ScenePath);
        EditorApplication.isPlaying = true;
    }

    [MenuItem("Inventory Validation/Generate PuerTS IL2CPP Bridge")]
    public static void GeneratePuerTS()
    {
        Puerts.Editor.Generator.UnityMenu.GenV2WithoutWrapper();
        AssetDatabase.SaveAssets();
        Debug.Log("MIGRATION_PUERTS_BRIDGE_GENERATED");
    }

    [MenuItem("Inventory Validation/Build Windows x64 IL2CPP")]
    public static void BuildWindows()
    {
        PlayerSettings.SetScriptingBackend(NamedBuildTarget.Standalone, ScriptingImplementation.IL2CPP);
        var buildFolder = Path.Combine(Root, "build", "windows-il2cpp");
        Directory.CreateDirectory(buildFolder);
        var report = BuildPipeline.BuildPlayer(new BuildPlayerOptions {
            scenes = new[] { ScenePath },
            locationPathName = Path.Combine(buildFolder, "InventoryValidation.exe"),
            target = BuildTarget.StandaloneWindows64,
            options = BuildOptions.Development
        });
        var summary = report.summary;
        string json = "{\"result\":\"" + summary.result + "\",\"unity\":\"" + Application.unityVersion + "\",\"target\":\"StandaloneWindows64\",\"scriptingBackend\":\"IL2CPP\",\"totalBytes\":" + summary.totalSize + ",\"totalSeconds\":" + summary.totalTime.TotalSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture) + ",\"errors\":" + summary.totalErrors + ",\"warnings\":" + summary.totalWarnings + "}";
        File.WriteAllText(Path.Combine(Root, "evidence", "player-build.json"), json);
        Debug.Log("MIGRATION_BUILD " + json);
        if (summary.result != BuildResult.Succeeded) throw new Exception("Windows IL2CPP build did not succeed: " + summary.result);
    }
}
