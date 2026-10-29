using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace LGUI.Tests
{
    // The test is invoked without -quit: this class owns completion, timeout and exit status.
    [InitializeOnLoad]
    public static class LGUIConformanceEditor
    {
        const string Key = "LGUI.Conformance.";
        const string Active = Key + "Active";
        const string Result = Key + "Result";
        const string Start = Key + "Start";
        const string Timeout = Key + "Timeout";
        const string Errors = Key + "Errors";
        const string Phase = Key + "Phase";
        const string Stop = Key + "Stop";
        const string Exit = Key + "Exit";
        static readonly Encoding utf8 = new UTF8Encoding(false);

        [Serializable]
        sealed class ErrorReport
        {
            public string code = "LGUI-RT-001";
            public string message;
            public string[] errors = Array.Empty<string>();
        }

        static LGUIConformanceEditor()
        {
            Application.logMessageReceived += OnLog;
            EditorApplication.update += Update;
        }

        static string Argument(string name)
        {
            var arguments = Environment.GetCommandLineArgs();
            for (int index = 0; index + 1 < arguments.Length; index++)
                if (arguments[index] == name) return arguments[index + 1];
            return null;
        }

        static string Timestamp() { return DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture); }
        static double Elapsed(string key)
        {
            return (DateTime.UtcNow - DateTime.Parse(SessionState.GetString(key, Timestamp()), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)).TotalSeconds;
        }

        public static void Run()
        {
            if (SessionState.GetBool(Active, false)) throw new InvalidOperationException("LGUI-RT-001 LGUIConformanceEditor.cs: A conformance run is already active. → Use a separate Unity test project.");
            var result = Argument("-lguiResult");
            if (string.IsNullOrEmpty(result) || !Path.IsPathRooted(result)) throw new InvalidOperationException("LGUI-RT-001 LGUIConformanceEditor.cs: -lguiResult must be an absolute file path. → Provide a fresh result path.");
            if (File.Exists(result)) throw new InvalidOperationException("LGUI-RT-001 LGUIConformanceEditor.cs: The result already exists. → Select a fresh result path.");
            int seconds = 120;
            var timeout = Argument("-lguiTimeout");
            if (timeout != null && (!int.TryParse(timeout, out seconds) || seconds <= 0)) throw new InvalidOperationException("LGUI-RT-001 LGUIConformanceEditor.cs: -lguiTimeout must be positive seconds. → Use 120 or a larger test budget.");
            SessionState.SetString(Result, result);
            SessionState.SetString(Start, Timestamp());
            SessionState.SetInt(Timeout, seconds);
            SessionState.SetString(Errors, JsonUtility.ToJson(new ErrorReport()));
            SessionState.SetString(Phase, "running");
            SessionState.SetInt(Exit, 0);
            SessionState.SetBool(Active, true);
            try
            {
                var generatedScript = AssetDatabase.LoadAssetAtPath<TextAsset>("Assets/LGUI/Resources/Game/game.js.txt");
                Debug.Log("LGUI conformance resource probe: asset.name=" + (generatedScript == null ? "<missing>" : generatedScript.name));
                Debug.Log("LGUI conformance resource probe: Game/game=" + (Resources.Load<TextAsset>("Game/game") != null));
                Debug.Log("LGUI conformance resource probe: Game/game.js=" + (Resources.Load<TextAsset>("Game/game.js") != null));
                int width = 1280, height = 720;
                var widthArg = Argument("-lguiWidth"); var heightArg = Argument("-lguiHeight");
                if (widthArg != null && (!int.TryParse(widthArg, out width) || width <= 0)) throw new ArgumentException("-lguiWidth must be a positive integer.");
                if (heightArg != null && (!int.TryParse(heightArg, out height) || height <= 0)) throw new ArgumentException("-lguiHeight must be a positive integer.");
                ConformanceBridge.SetScreen(width, height);
                EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
                var camera = new GameObject("Main Camera").AddComponent<Camera>();
                camera.tag = "MainCamera";
                camera.clearFlags = CameraClearFlags.SolidColor;
                camera.backgroundColor = Color.black;
                new GameObject("LGUI").AddComponent<LGUIBoot>();
                EditorApplication.isPlaying = true;
            }
            catch (Exception error) { Fail("The conformance scene could not start: " + error); }
        }

        static ErrorReport ReadErrors()
        {
            return JsonUtility.FromJson<ErrorReport>(SessionState.GetString(Errors, "{}")) ?? new ErrorReport();
        }

        static void Write(string path, ErrorReport report)
        {
            var parent = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(parent)) Directory.CreateDirectory(parent);
            File.WriteAllText(path, JsonUtility.ToJson(report, true), utf8);
        }

        static void OnLog(string message, string stack, LogType type)
        {
            if (!SessionState.GetBool(Active, false) || (type != LogType.Error && type != LogType.Assert && type != LogType.Exception)) return;
            var report = ReadErrors();
            var list = new List<string>(report.errors ?? Array.Empty<string>()) {type + ": " + message + "\n" + stack};
            report.errors = list.ToArray();
            report.message = "Unity logged errors during conformance or shutdown.";
            SessionState.SetString(Errors, JsonUtility.ToJson(report));
            SessionState.SetInt(Exit, 1);
            Write(SessionState.GetString(Result, "") + ".errors.json", report);
        }

        static void Fail(string message)
        {
            var report = ReadErrors();
            report.message = "LGUI-RT-001 LGUIConformanceEditor.cs: " + message + " → Inspect the Unity log and native test bridge.";
            Write(SessionState.GetString(Result, "") + ".failure.json", report);
            SessionState.SetInt(Exit, 1);
            BeginStop();
        }

        static void BeginStop()
        {
            if (SessionState.GetString(Phase, "") != "stopping")
            {
                SessionState.SetString(Phase, "stopping");
                SessionState.SetString(Stop, Timestamp());
            }
            if (EditorApplication.isPlaying) EditorApplication.isPlaying = false;
        }

        static void Update()
        {
            if (!SessionState.GetBool(Active, false)) return;
            try
            {
                if (SessionState.GetInt(Exit, 0) != 0 && SessionState.GetString(Phase, "") != "stopping") Fail("Unity reported a native error.");
                if (SessionState.GetString(Phase, "") == "running")
                {
                    if (File.Exists(SessionState.GetString(Result, ""))) BeginStop();
                    else if (Elapsed(Start) > SessionState.GetInt(Timeout, 120)) Fail("The conformance result timed out.");
                }
                if (SessionState.GetString(Phase, "") == "stopping" && !EditorApplication.isPlayingOrWillChangePlaymode && !EditorApplication.isCompiling && Elapsed(Stop) >= 0.5)
                {
                    var code = SessionState.GetInt(Exit, 0);
                    SessionState.SetBool(Active, false);
                    EditorApplication.Exit(code);
                }
            }
            catch (Exception error)
            {
                // Preserve the original exception; reporting it also enters the error collector.
                Debug.LogException(error);
                Fail("The editor conformance driver failed: " + error);
            }
        }
    }
}
