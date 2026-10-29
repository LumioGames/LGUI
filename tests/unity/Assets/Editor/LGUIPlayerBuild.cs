// Development-only build entry points; never included in the runtime package or generated game JS.
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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
    public static class LGUIPlayerBuild
    {
        const string Scene = "Assets/LGUI/LGUIBoot.unity";
        const string Template = "Packages/com.tencent.puerts.core/Editor/Resources/puerts/xil2cpp/Puerts_il2cpp.cpp.txt";
        const string PatchedHash = "3e3b479159fdd56c94ed08f4a7e756dbbfa36b9b4c714e99a40e5fc8f6ec9b83";
        static readonly Encoding Utf8 = new UTF8Encoding(false);
        static readonly NamedBuildTarget Standalone = NamedBuildTarget.Standalone;

        [Serializable] sealed class SourceFile { public string path; public long bytes; public string sha256; }
        [Serializable] sealed class Message { public string type; public string content; public string stack; }
        [Serializable] sealed class Step { public string name; public int depth; public double milliseconds; public Message[] messages; }
        [Serializable] sealed class OutputFile { public uint id; public string path; public string role; public ulong bytes; }
        [Serializable] sealed class Asset { public long id; public string path; public string guid; public string type; public ulong bytes; public ulong offset; }
        [Serializable] sealed class Packed { public string path; public ulong overhead; public Asset[] contents; }
        [Serializable] sealed class Configuration
        {
            public string unity;
            public string target;
            public string backend;
            public string compiler;
            public string managedCodeVariant;
            public string stripping;
            public string apiCompatibility;
            public string defines;
            public bool development;
            public string buildOptions = "None";
            public int width;
            public int height;
            public string screenMode;
            public bool resizable;
            public int debugPort;
        }
        [Serializable] sealed class Report
        {
            public bool ok;
            public string phase;
            public string error;
            public string utc;
            public Configuration config;
            public bool testOnlyHTTP;
            public string insecureHttpOption;
            public int insecureHttpOptionValue;
            public string scene = Scene;
            public string generator = "Puerts.Editor.Generator.UnityMenu.GenV2WithoutWrapper";
            public bool noTypeStaticWrappers = true;
            public string nativeSourceDirectory = "Assets/Gen/Plugins/puerts_il2cpp";
            public SourceFile patchTemplate;
            public SourceFile game;
            public SourceFile[] nativeSourceInputs;
            public SourceFile[] managedSourceInputs;
            public string[] unexpectedStaticWrappers;
            public Message[] editorMessages;
            public string buildResult;
            public string output;
            public ulong totalBytes;
            public double totalSeconds;
            public int totalErrors;
            public int totalWarnings;
            public OutputFile[] files;
            public Packed[] packedAssets;
            public Step[] steps;
            public string attributionLimit = "Packed assets describe serialized assets. They do not partition managed/native code inside GameAssembly.dll. BuildOptions.None may omit detailed packed asset contents.";
        }

        static string Root { get { return Directory.GetParent(Application.dataPath).FullName; } }
        static string Arg(string name)
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == name) return args[i + 1];
            return null;
        }
        static InvalidOperationException Invalid(string message)
        {
            return new InvalidOperationException("LGUI-RT-001 LGUIPlayerBuild.cs: " + message +
                " → Inspect the explicit Unity test project, official PuerTS 3.0.3 packages and build evidence.");
        }
        static bool TestHttpEnabled()
        {
            string[] args = Environment.GetCommandLineArgs();
            bool found = false, enabled = false;
            for (int i = 0; i < args.Length; i++)
            {
                if (args[i] != "-lguiTestHTTP") continue;
                if (found || i + 1 >= args.Length || (args[i + 1] != "true" && args[i + 1] != "false")) throw Invalid("-lguiTestHTTP must occur once with true or false.");
                found = true; enabled = args[i + 1] == "true";
            }
            return enabled;
        }
        static void RequireHttpTestBridges()
        {
            if (!TestHttpEnabled()) return;
            foreach (string file in new[] {"Assets/LGUIConformanceBridge.cs", "Assets/LGUIPlayerAcceptance.cs"})
                if (!File.Exists(file) || new FileInfo(file).Length == 0 || (File.GetAttributes(file) & FileAttributes.ReparsePoint) != 0)
                    throw Invalid("Test HTTP requires a real nonempty " + file + ".");
        }
        static void RequireHttpPolicy()
        {
            RequireHttpTestBridges();
            var expected = TestHttpEnabled() ? InsecureHttpOption.AlwaysAllowed : InsecureHttpOption.NotAllowed;
            if (PlayerSettings.insecureHttpOption != expected) throw Invalid("Actual HTTP policy differs from the explicit test-only HTTP flag. Run Configure with the same flag.");
        }
        static string Relative(string file)
        {
            return Path.GetRelativePath(Root, Path.GetFullPath(file)).Replace('\\', '/');
        }
        static SourceFile Hash(string file)
        {
            using (var sha = SHA256.Create())
            using (var stream = File.OpenRead(file))
                return new SourceFile {path = Relative(file), bytes = stream.Length, sha256 = BitConverter.ToString(sha.ComputeHash(stream)).Replace("-", "").ToLowerInvariant()};
        }
        static SourceFile[] NativeSources()
        {
            string directory = Path.Combine(Application.dataPath, "Gen/Plugins/puerts_il2cpp");
            return Directory.Exists(directory) ? Directory.GetFiles(directory, "*", SearchOption.AllDirectories)
                .Where(file => file.EndsWith(".cpp", StringComparison.Ordinal) || file.EndsWith(".h", StringComparison.Ordinal))
                .OrderBy(file => file, StringComparer.Ordinal).Select(Hash).ToArray() : Array.Empty<SourceFile>();
        }
        static SourceFile[] ManagedSources()
        {
            var directories = new[] {Application.dataPath, Path.Combine(Root, "Packages/com.lumiogames.lgui"), Path.Combine(Root, "Packages/com.tencent.puerts.core"), Path.Combine(Root, "Packages/com.tencent.puerts.v8")};
            return directories.SelectMany(directory => Directory.GetFiles(directory, "*.cs", SearchOption.AllDirectories))
                .OrderBy(file => file, StringComparer.Ordinal).Select(Hash).ToArray();
        }
        static string[] StaticWrappers()
        {
            return Directory.GetFiles(Application.dataPath, "*", SearchOption.AllDirectories).Where(file =>
                file.EndsWith("_Wrap.cs", StringComparison.Ordinal) || Path.GetFileName(file) == "RegisterInfo_Gen.cs" ||
                System.Text.RegularExpressions.Regex.IsMatch(Path.GetFileName(file), @"^PuertsIl2cppWrapperDef\d+\.cpp$"))
                .Select(Relative).OrderBy(file => file, StringComparer.Ordinal).ToArray();
        }
        static int DebugPort()
        {
            if (AssetDatabase.LoadAssetAtPath<SceneAsset>(Scene) == null) throw Invalid("The exported boot scene did not import.");
            var scene = EditorSceneManager.OpenScene(Scene, OpenSceneMode.Single);
            var boots = scene.GetRootGameObjects().SelectMany(root => root.GetComponentsInChildren<LGUIBoot>(true)).ToArray();
            if (boots.Length != 1) throw Invalid("The validation scene must have exactly one LGUIBoot.");
            var value = new SerializedObject(boots[0]).FindProperty("debugPort");
            if (value == null) throw Invalid("LGUIBoot debugPort field is missing.");
            return value.intValue;
        }
        static Configuration Config()
        {
            return new Configuration {unity = Application.unityVersion, target = EditorUserBuildSettings.activeBuildTarget.ToString(),
                backend = PlayerSettings.GetScriptingBackend(Standalone).ToString(), compiler = PlayerSettings.GetIl2CppCompilerConfiguration(Standalone).ToString(),
                managedCodeVariant = PlayerSettings.GetManagedCodeVariant(Standalone).ToString(),
                stripping = PlayerSettings.GetManagedStrippingLevel(Standalone).ToString(), apiCompatibility = PlayerSettings.GetApiCompatibilityLevel(Standalone).ToString(),
                defines = PlayerSettings.GetScriptingDefineSymbols(Standalone), development = EditorUserBuildSettings.development,
                width = PlayerSettings.defaultScreenWidth, height = PlayerSettings.defaultScreenHeight, screenMode = PlayerSettings.fullScreenMode.ToString(),
                resizable = PlayerSettings.resizableWindow, debugPort = DebugPort()};
        }
        static void Prerequisites(bool configuring)
        {
            RequireHttpTestBridges();
            if (!configuring) RequireHttpPolicy();
            if (Application.unityVersion != "6000.6.6f1") throw Invalid("Expected Unity 6000.6.6f1; found " + Application.unityVersion + ".");
            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.StandaloneWindows64) throw Invalid("Use -buildTarget Win64.");
            if (Hash(Template).sha256 != PatchedHash) throw Invalid("PuerTS template raw SHA256 mismatch. Re-export the official local package.");
            var document = new XmlDocument(); document.Load("Assets/LGUI/link.xml");
            foreach (string assembly in new[] {"FairyGUI", "LGUI.Runtime", "com.tencent.puerts.core", "com.tencent.puerts.v8"})
                if (document.SelectSingleNode("/linker/assembly[@fullname='" + assembly + "'][@preserve='all']") == null)
                    throw Invalid("Assets/LGUI/link.xml must preserve all of " + assembly + ".");
            if (StaticWrappers().Length > 0) throw Invalid("Unexpected type static wrapper inputs. Use a clean Reflection Mode test project.");
            if (DebugPort() != -1) throw Invalid("Ordinary preview Player requires the default debugPort=-1.");
            if (PlayerSettings.GetScriptingDefineSymbols(Standalone).Split(';').Any(value => value == "PUERTS_DISABLE_IL2CPP_OPTIMIZATION" || value == "CPP_OUTPUT_TO_NATIVE_SRC" || value == "PUERTS_CPP_OUTPUT_TO_UPM"))
                throw Invalid("The test requires the normal optimized IL2CPP route and default Assets/Gen native output.");
        }
        static void RequireConfig()
        {
            RequireHttpPolicy();
            if (PlayerSettings.GetScriptingBackend(Standalone) != ScriptingImplementation.IL2CPP ||
                PlayerSettings.GetIl2CppCompilerConfiguration(Standalone) != Il2CppCompilerConfiguration.Release ||
                PlayerSettings.GetManagedCodeVariant(Standalone) != ManagedCodeVariant.Release ||
                PlayerSettings.GetManagedStrippingLevel(Standalone) != ManagedStrippingLevel.Low ||
                PlayerSettings.GetApiCompatibilityLevel(Standalone) != ApiCompatibilityLevel.NET_Standard || EditorUserBuildSettings.development)
                throw Invalid("Run Configure first: IL2CPP, C++/managed Release, Low stripping, .NET Standard and non-development are required.");
        }
        static void CheckGeneratedBridge()
        {
            string expected = Path.GetFullPath(Path.Combine(Application.dataPath, "Gen"));
            if (Path.GetFullPath(Puerts.Configure.GetCodeOutputDirectory()).TrimEnd('\\', '/') != expected) throw Invalid("Expected the official default Assets/Gen output directory.");
            string directory = Path.Combine(expected, "Plugins/puerts_il2cpp");
            foreach (string name in new[] {"Puerts_il2cpp.cpp", "PuertsIl2cppBridge.cpp", "PuertsIl2cppWrapper.cpp", "PuertsIl2cppFieldWrapper.cpp", "PuertsValueType.h", "TDataTrans.h", "pesapi.h", "unityenv_for_puerts.h"})
                if (!File.Exists(Path.Combine(directory, name)) || new FileInfo(Path.Combine(directory, name)).Length == 0) throw Invalid("Missing generated native bridge input " + name + ".");
            string compiled = File.ReadAllText(Path.Combine(directory, "Puerts_il2cpp.cpp"));
            if (compiled.Contains("Object::Unbox") || System.Text.RegularExpressions.Regex.Matches(compiled, @"il2cpp_object_unbox\(").Count != 4)
                throw Invalid("The generated native bridge did not incorporate all four patched public unbox calls.");
            if (StaticWrappers().Length > 0) throw Invalid("Reflection Mode unexpectedly produced type static wrappers.");
            if (!File.Exists(Path.Combine(expected, "ExtensionMethodInfos_Gen.cs")) || !File.Exists(Path.Combine(expected, "link.xml")))
                throw Invalid("Reflection Mode extension metadata or generated linker input is missing.");
        }
        static void Run(string phase, Action<Report> work)
        {
            string result = Arg("-lguiBuildReport");
            if (string.IsNullOrEmpty(result) || !Path.IsPathRooted(result) || File.Exists(result)) throw Invalid("-lguiBuildReport must be a fresh absolute JSON path.");
            Directory.CreateDirectory(Path.GetDirectoryName(result));
            var messages = new List<Message>();
            Application.LogCallback capture = (content, stack, type) => { if (type == LogType.Warning || type == LogType.Error || type == LogType.Assert || type == LogType.Exception) messages.Add(new Message {type = type.ToString(), content = content, stack = stack}); };
            Application.logMessageReceived += capture;
            var report = new Report {phase = phase, utc = DateTime.UtcNow.ToString("O")};
            try
            {
                report.testOnlyHTTP = TestHttpEnabled();
                Prerequisites(phase == "configure");
                report.patchTemplate = Hash(Template);
                report.game = Hash("Assets/LGUI/Resources/Game/game.js.txt");
                work(report);
                RequireHttpPolicy();
                report.config = Config();
                report.nativeSourceInputs = NativeSources();
                report.managedSourceInputs = ManagedSources();
                report.unexpectedStaticWrappers = StaticWrappers();
                if (messages.Any(message => message.type == "Error" || message.type == "Exception" || message.type == "Assert"))
                    throw Invalid("Unity logged an Error, Exception or Assert during this phase. Read editorMessages and the complete native log.");
                report.ok = true;
            }
            catch (Exception error) { report.error = error.Message.StartsWith("LGUI-RT-001", StringComparison.Ordinal) ? error.ToString() : Invalid(error.ToString()).ToString(); }
            finally
            {
                Application.logMessageReceived -= capture;
                report.insecureHttpOption = PlayerSettings.insecureHttpOption.ToString();
                report.insecureHttpOptionValue = (int)PlayerSettings.insecureHttpOption;
                report.editorMessages = messages.ToArray();
                File.WriteAllText(result, JsonUtility.ToJson(report, true), Utf8);
            }
            if (!report.ok) throw Invalid(report.error);
        }

        public static void Configure()
        {
            Run("configure", report => {
                PlayerSettings.insecureHttpOption = TestHttpEnabled() ? InsecureHttpOption.AlwaysAllowed : InsecureHttpOption.NotAllowed;
                PlayerSettings.companyName = "LumioGames"; PlayerSettings.productName = "LGUI Inventory Validation";
                PlayerSettings.SetApplicationIdentifier(Standalone, "com.lumiogames.lgui.validation");
                PlayerSettings.defaultScreenWidth = 1280; PlayerSettings.defaultScreenHeight = 720;
                PlayerSettings.fullScreenMode = FullScreenMode.Windowed; PlayerSettings.resizableWindow = true; PlayerSettings.runInBackground = true;
                PlayerSettings.SetScriptingBackend(Standalone, ScriptingImplementation.IL2CPP);
                PlayerSettings.SetIl2CppCompilerConfiguration(Standalone, Il2CppCompilerConfiguration.Release);
                PlayerSettings.SetManagedCodeVariant(Standalone, ManagedCodeVariant.Release);
                PlayerSettings.SetManagedStrippingLevel(Standalone, ManagedStrippingLevel.Low);
                PlayerSettings.SetApiCompatibilityLevel(Standalone, ApiCompatibilityLevel.NET_Standard);
                EditorUserBuildSettings.development = false;
                EditorBuildSettings.scenes = new[] {new EditorBuildSettingsScene(Scene, true)};
                AssetDatabase.SaveAssets();
            });
        }
        public static void Generate()
        {
            Run("generate", report => {
                RequireConfig();
                Puerts.Editor.Generator.UnityMenu.GenV2WithoutWrapper();
                AssetDatabase.SaveAssets();
                CheckGeneratedBridge();
            });
        }
        public static void Build()
        {
            Run("build", report => {
                RequireConfig(); CheckGeneratedBridge();
                string output = Arg("-lguiOutput");
                if (string.IsNullOrEmpty(output) || !Path.IsPathRooted(output) || Path.GetExtension(output).ToLowerInvariant() != ".exe") throw Invalid("-lguiOutput must be an absolute Windows .exe path.");
                Directory.CreateDirectory(Path.GetDirectoryName(output));
                var build = BuildPipeline.BuildPlayer(new BuildPlayerOptions {scenes = new[] {Scene}, locationPathName = output,
                    target = BuildTarget.StandaloneWindows64, targetGroup = BuildTargetGroup.Standalone, options = BuildOptions.None});
                if (build == null) throw Invalid("BuildPipeline returned no BuildReport.");
                var summary = build.summary;
                report.buildResult = summary.result.ToString(); report.output = summary.outputPath;
                report.totalBytes = summary.totalSize; report.totalSeconds = summary.totalTime.TotalSeconds;
                report.totalErrors = summary.totalErrors; report.totalWarnings = summary.totalWarnings;
                report.files = build.GetFiles().Select(file => new OutputFile {id = file.id, path = file.path, role = file.role, bytes = file.size}).ToArray();
                report.packedAssets = build.packedAssets.Select(pack => new Packed {path = pack.shortPath, overhead = pack.overhead,
                    contents = pack.contents.Select(asset => new Asset {id = asset.id, path = asset.sourceAssetPath, guid = asset.sourceAssetGUID.ToString(),
                        type = asset.type == null ? null : asset.type.FullName, bytes = asset.packedSize, offset = asset.offset}).ToArray()}).ToArray();
                report.steps = build.steps.Select(step => new Step {name = step.name, depth = step.depth, milliseconds = step.duration.TotalMilliseconds,
                    messages = step.messages.Select(message => new Message {type = message.type.ToString(), content = message.content}).ToArray()}).ToArray();
                if (summary.result != BuildResult.Succeeded || summary.totalErrors != 0) throw Invalid("IL2CPP build " + summary.result + " with " + summary.totalErrors + " errors. Read build.json and the complete native log.");
            });
        }
    }
}
