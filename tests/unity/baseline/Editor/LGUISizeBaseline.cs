// Explicit package-size control projects. No dependency on PuerTS/LGUI when preparing empty control A.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Xml;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace LGUI.Tests
{
    public static class LGUISizeBaseline
    {
        const string Scene = "Assets/Baseline/LGUISizeBaseline.unity";
        const string Core = "Packages/com.tencent.puerts.core";
        const string V8 = "Packages/com.tencent.puerts.v8";
        const string Lgui = "Packages/com.lumiogames.lgui";
        const string Template = Core + "/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt";
        const string PatchHash = "3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83";
        static readonly NamedBuildTarget Standalone = NamedBuildTarget.Standalone;
        [Serializable] sealed class HashInfo {public long bytes; public string sha256;}
        [Serializable] sealed class LguiInput {public HashInfo manifest; public HashInfo boot;}
        [Serializable] sealed class Setup {public string mode; public string label; public LguiInput lguiPackage;}
        [Serializable] sealed class Config
        {
            public string unity, target, backend, compiler, stripping, apiCompatibility, managedCodeVariant;
            public bool development; public string buildOptions = "None";
            public int width, height; public string screenMode; public bool resizable;
        }
        [Serializable] sealed class Message {public string type, content, stack;}
        [Serializable] sealed class Output {public string path, role; public ulong bytes;}
        [Serializable] sealed class Asset {public string path, type; public ulong bytes;}
        [Serializable] sealed class Pack {public string path; public ulong overhead; public Asset[] contents;}
        [Serializable] sealed class Report
        {
            public bool ok; public string phase, mode, error; public Config config;
            public string scene = Scene; public string generator; public bool noTypeStaticWrappers = true;
            public HashInfo patchTemplate; public HashInfo lguiBoot; public HashInfo emptyGame;
            public string buildResult, output; public ulong totalBytes; public double totalSeconds; public int totalErrors, totalWarnings;
            public Output[] files; public Pack[] packedAssets; public Message[] editorMessages;
        }
        static string Arg(string name)
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == name) return args[i + 1];
            return null;
        }
        static InvalidOperationException Invalid(string message) {return new InvalidOperationException("LGUI-RT-001 LGUISizeBaseline.cs: " + message + " → Inspect the explicit baseline project and native evidence.");}
        static HashInfo Hash(string file)
        {
            using (var sha = SHA256.Create()) using (var stream = File.OpenRead(file))
                return new HashInfo {bytes = stream.Length, sha256 = BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant()};
        }
        static Setup ReadSetup()
        {
            var setup = JsonUtility.FromJson<Setup>(File.ReadAllText("ProjectSettings/LGUISizeBaseline.json"));
            if (setup == null || (setup.mode != "A" && setup.mode != "B" && setup.mode != "lgui")) throw Invalid("Expected an explicit A, B or lgui baseline project.");
            return setup;
        }
        static void Inputs(Setup setup, Report report)
        {
            if (Application.unityVersion != "6000.6.6f1" || EditorUserBuildSettings.activeBuildTarget != BuildTarget.StandaloneWindows64) throw Invalid("Use Unity 6000.6.6f1 and -buildTarget Win64.");
            if (Directory.Exists("Assets/LGUI/Resources/UI")) throw Invalid("Size controls must have no exported UI resource directory.");
            if (setup.mode == "A")
            {
                if (Directory.Exists(Core) || Directory.Exists(V8) || Directory.Exists(Lgui)) throw Invalid("A must have no PuerTS or LGUI package.");
            }
            else
            {
                if (Hash(Template).sha256 != PatchHash) throw Invalid("The four-patch PuerTS template raw SHA256 is wrong.");
                report.patchTemplate = Hash(Template);
                string link = setup.mode == "lgui" ? "Assets/LGUI/link.xml" : "Assets/Baseline/link.xml";
                var document = new XmlDocument(); document.Load(link);
                var assemblies = setup.mode == "lgui" ? new[] {"FairyGUI", "LGUI.Runtime", "com.tencent.puerts.core", "com.tencent.puerts.v8"} : new[] {"com.tencent.puerts.core", "com.tencent.puerts.v8"};
                foreach (string name in assemblies) if (document.SelectSingleNode("/linker/assembly[@fullname='" + name + "'][@preserve='all']") == null) throw Invalid("Missing active linker preservation for " + name);
                if (Directory.GetFiles(Application.dataPath, "*", SearchOption.AllDirectories).Any(file => file.EndsWith("_Wrap.cs", StringComparison.Ordinal) || Path.GetFileName(file) == "RegisterInfo_Gen.cs" || System.Text.RegularExpressions.Regex.IsMatch(Path.GetFileName(file), @"^PuertsIl2cppWrapperDef\d+\.cpp$"))) throw Invalid("Unexpected type static wrapper inputs.");
            }
            if (setup.mode == "B" && Directory.Exists(Lgui)) throw Invalid("B must have no LGUI package.");
            if (setup.mode == "lgui")
            {
                if (setup.lguiPackage == null || Hash(Lgui + "/package.json").sha256 != setup.lguiPackage.manifest.sha256 || Hash(Lgui + "/Runtime/LGUIBoot.cs").sha256 != setup.lguiPackage.boot.sha256) throw Invalid("LGUI package/Boot input SHA256 changed.");
                report.lguiBoot = Hash(Lgui + "/Runtime/LGUIBoot.cs"); report.emptyGame = Hash("Assets/LGUI/Resources/Game/game.js.txt");
            }
        }
        static Config Configuration()
        {
            return new Config {unity = Application.unityVersion, target = EditorUserBuildSettings.activeBuildTarget.ToString(), backend = PlayerSettings.GetScriptingBackend(Standalone).ToString(),
                compiler = PlayerSettings.GetIl2CppCompilerConfiguration(Standalone).ToString(), stripping = PlayerSettings.GetManagedStrippingLevel(Standalone).ToString(),
                apiCompatibility = PlayerSettings.GetApiCompatibilityLevel(Standalone).ToString(), managedCodeVariant = PlayerSettings.GetManagedCodeVariant(Standalone).ToString(),
                development = EditorUserBuildSettings.development, width = PlayerSettings.defaultScreenWidth, height = PlayerSettings.defaultScreenHeight,
                screenMode = PlayerSettings.fullScreenMode.ToString(), resizable = PlayerSettings.resizableWindow};
        }
        static void RequireConfig()
        {
            var config = Configuration();
            if (config.backend != "IL2CPP" || config.compiler != "Release" || config.managedCodeVariant != "Release" || config.stripping != "Low" || config.development || PlayerSettings.GetApiCompatibilityLevel(Standalone) != ApiCompatibilityLevel.NET_Standard) throw Invalid("Expected IL2CPP, C++/managed Release, Low, .NET Standard and non-development.");
            if (PlayerSettings.GetScriptingDefineSymbols(Standalone).Split(';').Any(value => value == "PUERTS_DISABLE_IL2CPP_OPTIMIZATION" || value == "CPP_OUTPUT_TO_NATIVE_SRC" || value == "PUERTS_CPP_OUTPUT_TO_UPM")) throw Invalid("Use the default optimized native Reflection Mode output route.");
        }
        static void CheckBridge()
        {
            string file = "Assets/Gen/Plugins/puerts_il2cpp/Puerts_il2cpp.cpp";
            if (!File.Exists(file)) throw Invalid("Reflection Mode native bridge was not generated.");
            string source = File.ReadAllText(file);
            if (source.Contains("Object::Unbox") || System.Text.RegularExpressions.Regex.Matches(source, @"il2cpp_object_unbox\(").Count != 4) throw Invalid("Generated bridge did not incorporate all four patched unbox calls.");
        }
        static void Run(string phase, Action<Setup, Report> work)
        {
            string result = Arg("-lguiBaselineReport");
            if (string.IsNullOrEmpty(result) || !Path.IsPathRooted(result) || File.Exists(result)) throw Invalid("Use a fresh absolute -lguiBaselineReport path.");
            var messages = new List<Message>();
            Application.LogCallback capture = (content, stack, type) => {if (type == LogType.Warning || type == LogType.Error || type == LogType.Exception || type == LogType.Assert) messages.Add(new Message {type = type.ToString(), content = content, stack = stack});};
            var report = new Report {phase = phase}; Application.logMessageReceived += capture;
            try
            {
                var setup = ReadSetup(); report.mode = setup.label; Inputs(setup, report); work(setup, report); report.config = Configuration();
                if (messages.Any(message => message.type != "Warning")) throw Invalid("Unity logged a native Error, Exception or Assert; inspect editorMessages.");
                report.ok = true;
            }
            catch (Exception error) {report.error = Invalid(error.ToString()).ToString();}
            finally {Application.logMessageReceived -= capture; report.editorMessages = messages.ToArray(); Directory.CreateDirectory(Path.GetDirectoryName(result)); File.WriteAllText(result, JsonUtility.ToJson(report, true), new UTF8Encoding(false));}
            if (!report.ok) throw Invalid(report.error);
        }
        public static void Configure()
        {
            Run("configure", (setup, report) => {
                PlayerSettings.companyName = "LumioGames"; PlayerSettings.productName = "LGUI Inventory Validation";
                PlayerSettings.SetApplicationIdentifier(Standalone, "com.lumiogames.lgui.validation");
                PlayerSettings.defaultScreenWidth = 1280; PlayerSettings.defaultScreenHeight = 720; PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
                PlayerSettings.resizableWindow = true; PlayerSettings.runInBackground = true;
                PlayerSettings.SetScriptingBackend(Standalone, ScriptingImplementation.IL2CPP); PlayerSettings.SetIl2CppCompilerConfiguration(Standalone, Il2CppCompilerConfiguration.Release);
                PlayerSettings.SetManagedCodeVariant(Standalone, ManagedCodeVariant.Release); PlayerSettings.SetManagedStrippingLevel(Standalone, ManagedStrippingLevel.Low);
                PlayerSettings.SetApiCompatibilityLevel(Standalone, ApiCompatibilityLevel.NET_Standard); EditorUserBuildSettings.development = false;
                var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var camera = new GameObject("Main Camera").AddComponent<Camera>(); camera.tag = "MainCamera"; camera.gameObject.AddComponent<AudioListener>();
                camera.transform.position = new Vector3(0, 0, -10); camera.clearFlags = CameraClearFlags.SolidColor; camera.backgroundColor = Color.black;
                if (setup.mode != "A")
                {
                    string name = setup.mode == "B" ? "LGUI.Tests.LGUIPuerTSBaseline, Assembly-CSharp" : "LGUI.LGUIBoot, LGUI.Runtime";
                    var type = Type.GetType(name, false); if (type == null || !typeof(MonoBehaviour).IsAssignableFrom(type)) throw Invalid("Runtime host did not compile: " + name);
                    var host = new GameObject(setup.mode == "B" ? "PuerTS Size Baseline" : "LGUIBoot").AddComponent(type);
                    if (setup.mode == "lgui") {var debug = new SerializedObject(host).FindProperty("debugPort"); if (debug == null || debug.intValue != -1) throw Invalid("The empty real LGUIBoot must retain debugPort=-1.");}
                }
                Directory.CreateDirectory("Assets/Baseline"); EditorSceneManager.SaveScene(scene, Scene);
                EditorBuildSettings.scenes = new[] {new EditorBuildSettingsScene(Scene, true)}; AssetDatabase.SaveAssets();
            });
        }
        public static void Generate()
        {
            Run("generate", (setup, report) => {
                RequireConfig(); if (setup.mode == "A") throw Invalid("A has no PuerTS and must not generate a native bridge.");
                var type = Type.GetType("Puerts.Editor.Generator.UnityMenu, com.tencent.puerts.core.Editor", false);
                var method = type == null ? null : type.GetMethod("GenV2WithoutWrapper", BindingFlags.Static | BindingFlags.Public);
                if (method == null) throw Invalid("The official PuerTS Reflection Mode generator did not compile.");
                report.generator = method.DeclaringType.FullName + "." + method.Name;
                method.Invoke(null, null); AssetDatabase.SaveAssets(); CheckBridge(); Inputs(setup, report);
            });
        }
        public static void Build()
        {
            Run("build", (setup, report) => {
                RequireConfig(); if (setup.mode != "A") CheckBridge();
                string output = Arg("-lguiOutput");
                if (string.IsNullOrEmpty(output) || !Path.IsPathRooted(output) || Path.GetExtension(output).ToLowerInvariant() != ".exe") throw Invalid("Use an absolute Windows .exe output path.");
                var build = BuildPipeline.BuildPlayer(new BuildPlayerOptions {scenes = new[] {Scene}, target = BuildTarget.StandaloneWindows64, targetGroup = BuildTargetGroup.Standalone, locationPathName = output, options = BuildOptions.None});
                if (build == null) throw Invalid("BuildPlayer returned no BuildReport.");
                var summary = build.summary; report.buildResult = summary.result.ToString(); report.output = summary.outputPath;
                report.totalBytes = summary.totalSize; report.totalSeconds = summary.totalTime.TotalSeconds; report.totalErrors = summary.totalErrors; report.totalWarnings = summary.totalWarnings;
                report.files = build.GetFiles().Select(file => new Output {path = file.path, role = file.role, bytes = file.size}).ToArray();
                report.packedAssets = build.packedAssets.Select(pack => new Pack {path = pack.shortPath, overhead = pack.overhead, contents = pack.contents.Select(asset => new Asset {path = asset.sourceAssetPath, type = asset.type == null ? null : asset.type.FullName, bytes = asset.packedSize}).ToArray()}).ToArray();
                if (summary.result != BuildResult.Succeeded || summary.totalErrors != 0) throw Invalid("Build " + summary.result + " with " + summary.totalErrors + " errors.");
            });
        }
    }
}
