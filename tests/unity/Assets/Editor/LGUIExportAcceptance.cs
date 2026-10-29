// Development-only acceptance of the actual scene and JavaScript produced by lgui unity export.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;
using FairyGUI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
#pragma warning disable CS0618
using Puerts;

namespace LGUI.Tests
{
    [InitializeOnLoad]
    public static class LGUIExportAcceptance
    {
        const string Key = "LGUI.ExportAcceptance.";
        static readonly Encoding Utf8 = new UTF8Encoding(false);
        static readonly FieldInfo EnvironmentField = typeof(LGUIBoot).GetField("environment", BindingFlags.Instance | BindingFlags.NonPublic);
        [Serializable] sealed class Report
        {
            public bool ok;
            public string scene = "Assets/LGUI/LGUIBoot.unity";
            public string message;
            public string itemBefore;
            public string itemAfter;
            public string category;
            public int itemCount;
            public int clickedChildIndex;
            public int clickedItemIndex;
            public int mappedChildIndex;
            public int selectedItemIndex;
            public string clickedItemIcon;
            public string[] steps;
            public string[] screenshots;
            public string[] errors;
        }
        static LGUIExportAcceptance()
        {
            Application.logMessageReceived += OnLog;
            EditorApplication.update += Update;
        }
        static string Arg(string name)
        {
            var args = Environment.GetCommandLineArgs();
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == name) return args[i + 1];
            return null;
        }
        static string Stamp() { return DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture); }
        static double Since(string name)
        {
            return (DateTime.UtcNow - DateTime.Parse(SessionState.GetString(Key + name, Stamp()), CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind)).TotalSeconds;
        }
        static Report Read() { return JsonUtility.FromJson<Report>(SessionState.GetString(Key + "Report", "{}")); }
        static void Save(Report value) { SessionState.SetString(Key + "Report", JsonUtility.ToJson(value)); }
        static void Step(string name)
        {
            var report = Read(); var values = new List<string>(report.steps ?? Array.Empty<string>()) { name };
            report.steps = values.ToArray(); Save(report);
            Debug.Log("LGUI export acceptance: " + name);
        }
        static void Phase(int phase)
        {
            SessionState.SetInt(Key + "Phase", phase);
            SessionState.SetString(Key + "PhaseStart", Stamp());
            SessionState.SetInt(Key + "PhaseFrame", ConformanceBridge.RenderedFrame);
        }
        static bool Rendered(double seconds)
        {
            return Since("PhaseStart") > seconds && ConformanceBridge.RenderedFrame > SessionState.GetInt(Key + "PhaseFrame", -1);
        }
        static void Shot(string name)
        {
            var file = Path.Combine(SessionState.GetString(Key + "Evidence", ""), name + ".png");
            ScreenCapture.CaptureScreenshot(file);
            var report = Read(); var values = new List<string>(report.screenshots ?? Array.Empty<string>()) { file };
            report.screenshots = values.ToArray(); Save(report);
        }
        public static void Run()
        {
            if (SessionState.GetBool(Key + "Active", false)) throw new InvalidOperationException("LGUI-RT-001 Export acceptance is already active. → Use a separate Unity project.");
            var result = Arg("-lguiResult"); var evidence = Arg("-lguiEvidence");
            if (string.IsNullOrEmpty(result) || !Path.IsPathRooted(result) || File.Exists(result)) throw new InvalidOperationException("LGUI-RT-001 -lguiResult must be a fresh absolute path. → Choose a fresh result path.");
            if (string.IsNullOrEmpty(evidence) || !Path.IsPathRooted(evidence)) throw new InvalidOperationException("LGUI-RT-001 -lguiEvidence must be absolute. → Choose an evidence directory.");
            Directory.CreateDirectory(evidence);
            SessionState.SetString(Key + "Result", result);
            SessionState.SetString(Key + "Evidence", evidence);
            SessionState.SetString(Key + "Start", Stamp());
            SessionState.SetBool(Key + "Active", true);
            Save(new Report {ok = true, steps = Array.Empty<string>(), screenshots = Array.Empty<string>(), errors = Array.Empty<string>()});
            Phase(0);
            try
            {
                if (AssetDatabase.LoadAssetAtPath<SceneAsset>("Assets/LGUI/LGUIBoot.unity") == null) throw new InvalidOperationException("The exported boot scene did not import.");
                ConformanceBridge.SetScreen(1280, 720);
                EditorSceneManager.OpenScene("Assets/LGUI/LGUIBoot.unity", OpenSceneMode.Single);
                Step("opened-exported-scene");
                EditorApplication.isPlaying = true;
            }
            catch (Exception error) { Fail(error.ToString()); }
        }
        static void OnLog(string message, string stack, LogType type)
        {
            if (!SessionState.GetBool(Key + "Active", false) || (type != LogType.Error && type != LogType.Assert && type != LogType.Exception)) return;
            var report = Read(); var values = new List<string>(report.errors ?? Array.Empty<string>()) {type + ": " + message + "\n" + stack};
            report.errors = values.ToArray(); report.ok = false; Save(report);
        }
        static GComponent Find(string child)
        {
            var root = GRoot.inst;
            return FindIn(root, child);
        }
        static GComponent FindIn(GComponent root, string child)
        {
            if (root.GetChild(child) != null && root.visible) return root;
            for (int i = 0; i < root.numChildren; i++)
            {
                var node = root.GetChildAt(i).asCom;
                if (node == null || !node.visible) continue;
                var found = FindIn(node, child); if (found != null) return found;
            }
            return null;
        }
        static GObject Require(GComponent component, string child)
        {
            if (component == null || component.GetChild(child) == null) throw new InvalidOperationException("Missing displayed control " + child);
            return component.GetChild(child);
        }
        static void Down(GObject item)
        {
            var point = item.LocalToGlobal(new Vector2(item.width / 2, item.height / 2));
            SessionState.SetFloat(Key + "X", point.x); SessionState.SetFloat(Key + "Y", point.y);
            SessionState.SetInt(Key + "DownRequest", ConformanceBridge.Pointer(point.x, point.y, true, false));
            SessionState.SetInt(Key + "HoldRequest", -1);
        }
        static bool CanRelease()
        {
            int request = SessionState.GetInt(Key + "DownRequest", -1);
            if (request < 0 || ConformanceBridge.ConsumedPointerDown < request) return false;
            if (SessionState.GetInt(Key + "HoldRequest", -1) != request)
            {
                SessionState.SetInt(Key + "HoldRequest", request);
                SessionState.SetString(Key + "HoldStart", Stamp());
                return false;
            }
            return Since("HoldStart") > 0.15 && Rendered(0);
        }
        static void Up()
        {
            SessionState.SetInt(Key + "UpRequest", ConformanceBridge.Pointer(SessionState.GetFloat(Key + "X", 0), SessionState.GetFloat(Key + "Y", 0), false, false));
        }
        static bool Released(double seconds)
        {
            return ConformanceBridge.ConsumedPointerUp >= SessionState.GetInt(Key + "UpRequest", int.MaxValue) && Rendered(seconds);
        }
        static void Fail(string message)
        {
            var report = Read(); report.ok = false;
            report.message = "LGUI-RT-001 Export acceptance: " + message + " → Inspect the native log and generated boot scene.";
            Save(report); Stop();
        }
        static void Stop()
        {
            if (SessionState.GetInt(Key + "Phase", 0) == 99) return;
            Phase(99);
            if (EditorApplication.isPlaying) EditorApplication.isPlaying = false;
        }
        static void Update()
        {
            if (!SessionState.GetBool(Key + "Active", false)) return;
            try
            {
                int phase = SessionState.GetInt(Key + "Phase", 0);
                if (phase == 99)
                {
                    if (EditorApplication.isPlayingOrWillChangePlaymode || EditorApplication.isCompiling || Since("PhaseStart") < 0.5) return;
                    var report = Read();
                    if (report.errors != null && report.errors.Length > 0) report.ok = false;
                    foreach (var image in report.screenshots ?? Array.Empty<string>())
                        if (!File.Exists(image) || new FileInfo(image).Length < 1000) { report.ok = false; report.message = "A requested screenshot is missing or empty."; }
                    File.WriteAllText(SessionState.GetString(Key + "Result", ""), JsonUtility.ToJson(report, true), Utf8);
                    SessionState.SetBool(Key + "Active", false);
                    EditorApplication.Exit(report.ok ? 0 : 1);
                    return;
                }
                if (Since("Start") > 180) { Fail("Play or interaction timed out at phase " + phase); return; }
                if (!Read().ok) { Fail("Unity logged an error at phase " + phase); return; }
                if (!EditorApplication.isPlaying) return;
                if (phase == 0)
                {
                    var boot = UnityEngine.Object.FindFirstObjectByType<LGUIBoot>();
                    var env = boot == null ? null : EnvironmentField.GetValue(boot) as JsEnv;
                    if (env == null || !env.Eval<bool>("globalThis.__lguiReady === true")) return;
                    if (Find("bagEntry") == null) return;
                    Step("exported-js-ready-and-camp-visible"); Shot("camp-landscape"); Phase(1);
                }
                else if (phase == 1 && Rendered(0.5)) { Down(Require(Find("bagEntry"), "bagEntry")); Phase(2); }
                else if (phase == 2 && CanRelease()) { Up(); Phase(3); }
                else if (phase == 3 && Released(0.4))
                {
                    var bag = Find("itemName"); if (bag == null) return;
                    var list = Require(bag, "list").asList;
                    if (list.numChildren < 3) return;
                    var report = Read(); report.itemBefore = Require(bag, "itemName").text; report.itemCount = list.numItems;
                    // The first two inventory entries are both swords; choose the axe to test detail changes.
                    report.clickedChildIndex = 2;
                    report.clickedItemIndex = list.ChildIndexToItemIndex(report.clickedChildIndex);
                    report.mappedChildIndex = list.ItemIndexToChildIndex(report.clickedItemIndex);
                    report.clickedItemIcon = list.GetChildAt(report.clickedChildIndex).asCom.GetChild("icon").asLoader.url;
                    Save(report);
                    Step("native-click-opened-backpack"); Shot("bag-landscape-before");
                    Down(list.GetChildAt(report.clickedChildIndex)); Phase(4);
                }
                else if (phase == 4 && CanRelease()) { Up(); Phase(5); }
                else if (phase == 5 && Released(0.5))
                {
                    var bag = Find("itemName"); var report = Read(); report.itemAfter = Require(bag, "itemName").text;
                    report.selectedItemIndex = Require(bag, "list").asList.selectedIndex;
                    Save(report);
                    if (string.IsNullOrEmpty(report.itemAfter) || report.itemAfter == report.itemBefore) throw new InvalidOperationException("Clicking the different-kind inventory item did not change the displayed detail.");
                    Save(report); Step("native-list-selection-changed-detail"); Shot("bag-landscape-selected");
                    Down(Require(bag, "tabConsumable")); Phase(6);
                }
                else if (phase == 6 && CanRelease()) { Up(); Phase(7); }
                else if (phase == 7 && Released(0.5))
                {
                    var bag = Find("itemName"); var report = Read(); report.category = bag.GetController("category").selectedPage;
                    if (report.category != "consumable") throw new InvalidOperationException("The consumable tab did not change the controller page.");
                    Save(report); Step("native-click-filtered-consumables"); Shot("bag-landscape-consumables");
                    Phase(8);
                }
                else if (phase == 8 && Rendered(0.5))
                {
                    // CaptureScreenshot is fulfilled at the next render; do not change the view in that frame.
                    ConformanceBridge.Key("Escape"); Phase(9);
                }
                else if (phase == 9 && Rendered(0.5))
                {
                    if (Find("itemName") != null || Find("bagEntry") == null) throw new InvalidOperationException("Escape did not close the backpack and restore the camp.");
                    Step("native-escape-restored-camp"); Phase(10);
                }
                else if (phase == 10 && Rendered(0.5)) Stop();
            }
            catch (Exception error) { Fail(error.ToString()); }
        }
    }
}
#pragma warning restore CS0618
