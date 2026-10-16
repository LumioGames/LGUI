using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using FairyGUI;
using Puerts;
using UnityEngine;
using UnityEngine.Profiling;
using Stopwatch = System.Diagnostics.Stopwatch;

// Platform adapter only. Inventory state and all state transitions live in InventoryApp.txt.
public sealed class InventoryHost : MonoBehaviour
{
    public static InventoryHost Instance { get; private set; }
    public string verificationDirectory = "";
    public int initialCount = 30;
    public bool Ready { get; private set; }
    public RenderMetrics metrics = new RenderMetrics();

    ScriptEnv environment;
    GComponent main, popup, launch;
    GGraph shade;
    GList list;
    GTextInput search;
    AppResponse response;
    string rawTsResponse = "";
    string lastUiOperation = "";
    readonly List<string> errors = new List<string>();
    readonly HashSet<GObject> wiredRows = new HashSet<GObject>();
    readonly Stopwatch lifetime = Stopwatch.StartNew();
    float nextEvidenceAt, lastRootWidth, lastRootHeight;
    bool inputUpdating, destroying, initialized;
    UIPackage package;

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Debug.LogError("Only one InventoryHost may own the shared ScriptEnv.");
            Destroy(this);
            return;
        }
        Instance = this;
        Application.logMessageReceived += CaptureUnityError;
        var args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++)
        {
            if (args[i] == "-verificationDir") verificationDirectory = args[i + 1];
            if (args[i] == "-inventoryCount")
            {
                int requested;
                if (int.TryParse(args[i + 1], out requested) && requested >= 3 && requested <= 10000)
                    initialCount = requested;
                else throw new ArgumentOutOfRangeException("-inventoryCount", "Expected an integer from 3 to 10000.");
            }
        }
    }

    void Start()
    {
        if (Instance != this) return;
        try { Initialize(); }
        catch (Exception e) { RecordError("initialize", e); }
        WriteEvidence();
    }

    void Initialize()
    {
        if (initialized) return;
        initialized = true;
        UIConfig.defaultFont = "Microsoft YaHei";
        FontManager.RegisterFont(FontManager.GetFont(UIConfig.defaultFont), "Arial");
        GRoot.inst.SetContentScaleFactor(1f);
        var packageTimer = Stopwatch.StartNew();
        package = UIPackage.GetByName("Inventory") ?? UIPackage.AddPackage("InventoryUI/Inventory");
        if (package == null) throw new InvalidOperationException("Inventory UI package is missing.");
        metrics.packageMs = packageTimer.Elapsed.TotalMilliseconds;
        var script = Resources.Load<TextAsset>("InventoryApp");
        if (script == null) throw new InvalidOperationException("Resources/InventoryApp.txt is missing.");
        var runtimeTimer = Stopwatch.StartNew();
        environment = new ScriptEnv(new BackendV8());
        metrics.runtimeInstances++;
        environment.Eval("globalThis.inventoryInitialCount = " + Math.Max(3, Math.Min(10000, initialCount)) + ";", "inventory-bootstrap");
        environment.Eval(script.text, "inventory-app.js");
        metrics.runtimeInitMs = runtimeTimer.Elapsed.TotalMilliseconds;
        launch = RequiredComponent(UIPackage.CreateObject("Inventory", "Btn"), "Inventory/Btn");
        launch.name = "launch";
        launch.GetChild("title").text = "打开背包";
        ArrangeButton(launch, 20, 20, 160);
        GRoot.inst.AddChild(launch);
        launch.onClick.Add(() => ExecuteUi("open"));
        Open();
        Ready = true;
        metrics.readyMs = lifetime.Elapsed.TotalMilliseconds;
    }

    void Update()
    {
        if (environment != null)
        {
            metrics.updateFrames++;
            try { environment.Tick(); metrics.tickCalls++; }
            catch (Exception e) { RecordError("tick", e); }
        }
        if (main != null && (lastRootWidth != GRoot.inst.width || lastRootHeight != GRoot.inst.height))
        {
            try { Layout(); Render(); }
            catch (Exception e) { RecordError("resize-layout", e); }
        }
        if (Time.unscaledTime >= nextEvidenceAt)
        {
            nextEvidenceAt = Time.unscaledTime + 0.25f;
            WriteEvidence();
        }
    }

    AppResponse Dispatch(string op, string argsJson = "{}")
    {
        if (environment == null) throw new InvalidOperationException("PuerTS environment is unavailable.");
        var timer = Stopwatch.StartNew();
        rawTsResponse = environment.Eval<string>("globalThis.inventoryApp.dispatch(" + Quote(op) + "," + Quote(argsJson ?? "{}") + ")", "inventory-dispatch");
        response = JsonUtility.FromJson<AppResponse>(rawTsResponse);
        if (response == null || response.view == null || response.session == null)
            throw new InvalidDataException("Inventory dispatch returned an incomplete response: " + rawTsResponse);
        metrics.dispatchCalls++;
        metrics.lastDispatchMs = timer.Elapsed.TotalMilliseconds;
        metrics.totalDispatchMs += metrics.lastDispatchMs;
        return response;
    }

    void Open()
    {
        if (main != null) { Dispatch("open"); return; }
        var timer = Stopwatch.StartNew();
        Dispatch("open");
        try
        {
            main = RequiredComponent(UIPackage.CreateObject("Inventory", "Main"), "Inventory/Main");
            main.name = "inventory";
            GRoot.inst.AddChild(main);
            list = main.GetChild("list").asList;
            search = main.GetChild("search").asTextInput;
            if (list == null || search == null) throw new InvalidDataException("Main must contain GList list and GTextInput search.");
            search.text = response.view.query;
            search.onChanged.Add(() =>
            {
                if (!inputUpdating) ExecuteUi("query", "{\"query\":" + Quote(search.text) + "}");
            });
            main.GetChild("update").onClick.Add(() => ExecuteUi("progress"));
            main.GetChild("reward").onClick.Add(() => ExecuteUi("reward"));
            main.GetChild("close").onClick.Add(() => ExecuteUi("close"));
            list.itemRenderer = RenderRow;
            list.SetVirtual();
            list.scrollPane.mouseWheelEnabled = true;
            Layout();
            Render();
            var enter = main.GetTransition("enter");
            if (enter != null) { enter.Play(); metrics.transitionPlays++; }
            launch.visible = false;
            metrics.opened++;
            metrics.lastOpenMs = timer.Elapsed.TotalMilliseconds;
        }
        catch
        {
            DisposeView();
            Dispatch("close");
            throw;
        }
    }

    void Close()
    {
        Dispatch("close");
        if (main != null) { DisposeView(); metrics.closed++; }
        if (launch != null) launch.visible = true;
    }

    void DisposeView()
    {
        ClosePopup();
        if (main != null) main.Dispose();
        main = null;
        list = null;
        search = null;
        wiredRows.Clear();
    }

    void Render()
    {
        if (main == null) return;
        var timer = Stopwatch.StartNew();
        inputUpdating = true;
        try { search.text = response.view.query ?? ""; }
        finally { inputUpdating = false; }
        list.numItems = response.view.visible.Length;
        list.RefreshVirtualList();
        main.GetChild("summary").text = response.view.visible.Length + " / " + response.session.count
            + " 个道具 · 金币 " + response.view.coins + " · 未达成 / 可领取 / 已领取";
        metrics.renders++;
        metrics.lastRenderMs = timer.Elapsed.TotalMilliseconds;
        metrics.totalRenderMs += metrics.lastRenderMs;
        metrics.maxRenderMs = Math.Max(metrics.maxRenderMs, metrics.lastRenderMs);
    }

    void RenderRow(int index, GObject obj)
    {
        if (response == null || index < 0 || index >= response.view.visible.Length) return;
        var timer = Stopwatch.StartNew();
        var row = obj.asCom;
        var item = response.view.visible[index];
        row.data = item.id;
        row.GetChild("label").text = item.name;
        row.GetController("state").selectedPage = item.state;
        var claim = row.GetChild("claim");
        claim.touchable = item.state == "ready";
        claim.grayed = item.state != "ready";
        if (wiredRows.Add(row))
        {
            // Virtual rows change index/id. Resolve the current ID at click time.
            claim.onClick.Add(() => ExecuteUi("claim", "{\"id\":" + Quote(row.data as string) + "}"));
            metrics.rowObjectsCreated++;
        }
        float width = list.width;
        row.SetSize(width, 72);
        row.GetChild("rowbg").SetSize(width, 72);
        row.GetChild("label").SetSize(Math.Max(80, width - 228), 26);
        row.GetChild("label").asTextField.singleLine = true;
        FontSize(row.GetChild("label"), width < 500 ? 16 : 20);
        row.GetChild("status").SetSize(Math.Max(80, width - 228), 22);
        ArrangeButton(claim.asCom, width - 142, 16);
        metrics.rowRenderCalls++;
        metrics.lastRowRenderMs = timer.Elapsed.TotalMilliseconds;
        metrics.totalRowRenderMs += metrics.lastRowRenderMs;
    }

    void Layout()
    {
        if (main == null) return;
        var root = GRoot.inst;
        lastRootWidth = root.width;
        lastRootHeight = root.height;
        float width = Math.Min(900, Math.Max(300, root.width - 16));
        float height = Math.Min(690, Math.Max(360, root.height - 16));
        bool narrow = width < 600;
        main.SetSize(width, height);
        main.SetXY((root.width - width) / 2, 8);
        main.GetChild("background").SetSize(width, height);
        var title = main.GetChild("title");
        title.SetXY(narrow ? 20 : 46, narrow ? 20 : 29);
        title.SetSize(width - 150, 42);
        FontSize(title, narrow ? 16 : 30);
        ArrangeButton(main.GetChild("close").asCom, width - 116, 22, 96);
        float searchWidth = narrow ? width - 40 : width - 340;
        search.SetXY(24, 91);
        search.SetSize(searchWidth - 8, 36);
        main.GetChild("searchbg").SetXY(20, 85);
        main.GetChild("searchbg").SetSize(searchWidth, 48);
        ArrangeButton(main.GetChild("update").asCom, narrow ? 20 : width - 298, narrow ? 144 : 89);
        ArrangeButton(main.GetChild("reward").asCom, width - 152, narrow ? 144 : 89);
        list.SetXY(20, narrow ? 204 : 158);
        list.SetSize(width - 40, height - (narrow ? 268 : 224));
        main.GetChild("summary").SetXY(20, height - 48);
        main.GetChild("summary").SetSize(width - 40, 42);
        FontSize(main.GetChild("summary"), narrow ? 14 : 18);
        if (popup != null) LayoutPopup(true);
        metrics.layouts++;
    }

    void ShowReward(string message, string title)
    {
        ClosePopup();
        shade = new GGraph();
        shade.name = "shade";
        shade.DrawRect(GRoot.inst.width, GRoot.inst.height, 0, Color.clear, new Color(0, 0, 0, 0.65f));
        GRoot.inst.AddChild(shade);
        popup = RequiredComponent(UIPackage.CreateObject("Inventory", "Reward"), "Inventory/Reward");
        popup.name = "popup";
        GRoot.inst.AddChild(popup);
        popup.GetChild("title").text = title;
        popup.GetChild("body").text = message;
        popup.GetChild("confirm").onClick.Add(() => ExecuteUi("confirm"));
        popup.draggable = true;
        popup.onDragEnd.Add(() => metrics.dragEnds++);
        LayoutPopup(true);
        metrics.popups++;
    }

    void LayoutPopup(bool center)
    {
        if (popup == null) return;
        float width = Math.Min(480, GRoot.inst.width - 24);
        popup.SetSize(width, 330);
        if (center) popup.SetXY((GRoot.inst.width - width) / 2, (GRoot.inst.height - 330) / 2);
        popup.GetChild("rewardbg").SetSize(width, 330);
        popup.GetChild("title").SetSize(width - 48, 40);
        popup.GetChild("body").SetSize(width - 48, 174);
        FontSize(popup.GetChild("body"), GRoot.inst.width < 500 ? 17 : 20);
        ArrangeButton(popup.GetChild("confirm").asCom, (width - 132) / 2, 270);
        shade.SetSize(GRoot.inst.width, GRoot.inst.height);
    }

    void ClosePopup()
    {
        if (popup != null) popup.Dispose();
        if (shade != null) shade.Dispose();
        popup = null;
        shade = null;
    }

    void ExecuteUi(string op, string argsJson = "{}")
    {
        try { ExecuteOperation(op, argsJson); }
        catch (Exception e) { RecordError(op, e); }
    }

    void ExecuteOperation(string op, string argsJson)
    {
        lastUiOperation = op;
        switch (op)
        {
            case "open": Open(); break;
            case "close": Close(); break;
            case "reward":
                if (main != null) ShowReward("未达成：先推进任务。可领取：点击领取获得 10 金币。已领取：不会重复发奖。\n拖拽弹窗空白区域可移动；搜索支持中文。", "奖励说明");
                break;
            case "confirm": ClosePopup(); break;
            case "scroll":
                if (list != null) list.scrollPane.SetPosY(JsonUtility.FromJson<UiArgs>(argsJson).y, false);
                break;
            case "resize":
                var size = JsonUtility.FromJson<UiArgs>(argsJson);
                if (size.width < 300 || size.height < 360) throw new ArgumentOutOfRangeException("resize", "Minimum requested viewport is 300x360.");
                Screen.SetResolution(size.width, size.height, FullScreenMode.Windowed);
                break;
            default:
                var timer = Stopwatch.StartNew();
                var state = Dispatch(op, argsJson);
                if (op != "snapshot") Render();
                if (op == "claim" && state.ok && main != null)
                    ShowReward(state.result.message, "奖励已领取");
                if (op == "claim") metrics.lastClaimMs = timer.Elapsed.TotalMilliseconds;
                break;
        }
    }

    public string ExecuteVerification(string op, string argsJson = "{}")
    {
        ExecuteUi(op, argsJson);
        return SnapshotJson();
    }

    public void SetVerificationDirectory(string directory)
    {
        verificationDirectory = directory ?? "";
        nextEvidenceAt = 0;
    }

    public string SnapshotJson()
    {
        var ui = new UiSnapshot();
        ui.screenWidth = Screen.width;
        ui.screenHeight = Screen.height;
        ui.open = main != null;
        ui.popup = popup != null;
        ui.lastOperation = lastUiOperation;
        ui.inputText = search != null ? search.text : "";
        ui.packageId = package != null ? package.id : "";
        var controls = new List<ControlRect>();
        var rows = new List<RowSnapshot>();
        if (initialized && !destroying)
        {
            ui.stageWidth = Stage.inst.stageWidth;
            ui.stageHeight = Stage.inst.stageHeight;
            ui.rootWidth = GRoot.inst.width;
            ui.rootHeight = GRoot.inst.height;
            AddControl(controls, "launch", launch);
        }
        if (main != null)
        {
            ui.title = main.GetChild("title").text;
            ui.mainResourceId = main.packageItem != null ? main.packageItem.id : "";
            ui.mainResourceUrl = main.resourceURL;
            ui.summary = main.GetChild("summary").text;
            ui.mainAlpha = main.alpha;
            ui.transitionPresent = main.GetTransition("enter") != null;
            ui.transitionDuration = ui.transitionPresent ? main.GetTransition("enter").totalDuration : 0;
            AddControl(controls, "inventory", main);
            foreach (string name in new[] { "title", "search", "list", "update", "reward", "close", "summary" })
                AddControl(controls, name, main.GetChild(name));
            ui.virtualList = list.isVirtual;
            ui.physicalRows = list.numChildren;
            ui.virtualItems = list.numItems;
            ui.scrollY = list.scrollPane.posY;
            ui.contentHeight = list.scrollPane.contentHeight;
            for (int i = 0; i < list.numChildren; i++)
            {
                var row = list.GetChildAt(i).asCom;
                ui.rowResourceId = row.packageItem != null ? row.packageItem.id : "";
                ui.rowResourceUrl = row.resourceURL;
                var claim = row.GetChild("claim");
                rows.Add(new RowSnapshot { id = row.data as string, label = row.GetChild("label").text,
                    state = row.GetController("state").selectedPage, status = row.GetChild("status").text,
                    claimEnabled = claim.touchable, rect = RectOf(row), claimRect = RectOf(claim) });
                AddControl(controls, "claim:" + (row.data as string), claim);
            }
        }
        if (popup != null)
        {
            ui.popupTitle = popup.GetChild("title").text;
            ui.popupResourceId = popup.packageItem != null ? popup.packageItem.id : "";
            ui.popupBody = popup.GetChild("body").text;
            AddControl(controls, "popup", popup);
            AddControl(controls, "confirm", popup.GetChild("confirm"));
        }
        ui.controls = controls.ToArray();
        ui.rows = rows.ToArray();
        metrics.elapsedMs = lifetime.Elapsed.TotalMilliseconds;
        metrics.managedMemoryBytes = GC.GetTotalMemory(false);
        metrics.unityAllocatedBytes = Profiler.GetTotalAllocatedMemoryLong();
        metrics.unityReservedBytes = Profiler.GetTotalReservedMemoryLong();
        metrics.physicalRows = ui.physicalRows;
        metrics.displayObjectsLastStageUpdate = Stats.ObjectCount;
        metrics.graphicsLastStageUpdate = Stats.GraphicsCount;
        return JsonUtility.ToJson(new HostSnapshot { ready = Ready, response = response, rawTsResponse = rawTsResponse,
            ui = ui, metrics = metrics, errors = errors.ToArray() });
    }

    void WriteEvidence()
    {
        try
        {
            string json = SnapshotJson();
            if (string.IsNullOrWhiteSpace(verificationDirectory)) Debug.Log("INVENTORY_SNAPSHOT " + json);
            else
            {
                Directory.CreateDirectory(verificationDirectory);
                File.WriteAllText(Path.Combine(verificationDirectory, "latest-snapshot.json"), json, new UTF8Encoding(false));
                File.AppendAllText(Path.Combine(verificationDirectory, "snapshots.jsonl"), json + Environment.NewLine, new UTF8Encoding(false));
                metrics.evidenceWrites++;
            }
        }
        catch (Exception e) { RecordError("evidence", e); }
    }

    void CaptureUnityError(string message, string stack, LogType type)
    {
        if (type == LogType.Error || type == LogType.Exception || type == LogType.Assert)
        {
            string entry = message + (string.IsNullOrEmpty(stack) ? "" : "\n" + stack);
            if (errors.Count < 100 && !errors.Contains(entry)) errors.Add(entry);
        }
    }

    void RecordError(string operation, Exception e)
    {
        string message = operation + ": " + e;
        if (errors.Count < 100 && !errors.Contains(message)) errors.Add(message);
        Debug.LogError(message);
    }

    void OnDestroy()
    {
        if (Instance != this || destroying) return;
        destroying = true;
        Ready = false;
        try { if (environment != null) Dispatch("close"); }
        catch (Exception e) { RecordError("destroy-close", e); }
        try { DisposeView(); if (launch != null) launch.Dispose(); launch = null; }
        catch (Exception e) { RecordError("destroy-ui", e); }
        try
        {
            if (environment != null) { environment.Dispose(); metrics.runtimeDisposals++; }
        }
        catch (Exception e) { RecordError("destroy-runtime", e); }
        finally
        {
            environment = null;
            WriteEvidence();
            Application.logMessageReceived -= CaptureUnityError;
            Instance = null;
        }
    }

    static GComponent RequiredComponent(GObject obj, string name)
    {
        if (obj == null || obj.asCom == null) throw new InvalidDataException("Missing component " + name);
        return obj.asCom;
    }

    static void ArrangeButton(GComponent button, float x, float y, float width = 132)
    {
        button.SetXY(x, y);
        button.SetSize(width, 40);
        var background = button.GetChild("btnbg");
        if (background != null) background.SetSize(width, 40);
        var title = button.GetChild("title");
        if (title != null) title.SetSize(width, 28);
    }

    static void FontSize(GObject obj, int size)
    {
        var text = obj.asTextField;
        if (text == null) return;
        var format = text.textFormat;
        format.size = size;
        text.textFormat = format;
    }

    static ScreenRect RectOf(GObject obj)
    {
        var r = obj.LocalToGlobal(new Rect(0, 0, obj.width, obj.height));
        float sx = Stage.inst.stageWidth > 0 ? (float)Screen.width / Stage.inst.stageWidth : 1;
        float sy = Stage.inst.stageHeight > 0 ? (float)Screen.height / Stage.inst.stageHeight : 1;
        return new ScreenRect { x = r.x * sx, y = r.y * sy, width = r.width * sx, height = r.height * sy };
    }

    static void AddControl(List<ControlRect> target, string name, GObject obj)
    {
        if (obj == null || obj.isDisposed) return;
        var rect = RectOf(obj);
        target.Add(new ControlRect { name = name, visible = obj.visible, enabled = obj.touchable,
            rect = rect, unityRect = new ScreenRect { x = rect.x, y = Screen.height - rect.y - rect.height, width = rect.width, height = rect.height } });
    }

    static string Quote(string value)
    {
        if (value == null) return "null";
        var b = new StringBuilder("\"");
        foreach (char c in value)
        {
            switch (c)
            {
                case '"': b.Append("\\\""); break;
                case '\\': b.Append("\\\\"); break;
                case '\n': b.Append("\\n"); break;
                case '\r': b.Append("\\r"); break;
                case '\t': b.Append("\\t"); break;
                default:
                    if (c < 32 || c == '\u2028' || c == '\u2029') b.Append("\\u" + ((int)c).ToString("x4"));
                    else b.Append(c);
                    break;
            }
        }
        return b.Append('"').ToString();
    }

    [Serializable] public sealed class UiArgs { public float y; public int width, height; }
    [Serializable] public sealed class Item { public string id, name, state, description; }
    [Serializable] public sealed class AppView { public Item[] items, visible; public int coins; public string query; }
    [Serializable] public sealed class AppSession { public bool open; public int listenerCount, notifications, opens, closes, closedCallbacks, modelRevision, count; }
    [Serializable] public sealed class AppResult { public bool ok; public string message; }
    [Serializable] public sealed class AppError { public string code, message; }
    [Serializable] public sealed class AppResponse { public bool ok; public string op; public AppResult result; public AppError error; public AppView view; public AppSession session; }
    [Serializable] public sealed class ScreenRect { public float x, y, width, height; }
    [Serializable] public sealed class ControlRect { public string name; public bool visible, enabled; public ScreenRect rect, unityRect; }
    [Serializable] public sealed class RowSnapshot { public string id, label, state, status; public bool claimEnabled; public ScreenRect rect, claimRect; }
    [Serializable] public sealed class UiSnapshot
    {
        public bool open, popup, transitionPresent, virtualList;
        public int screenWidth, screenHeight, stageWidth, stageHeight, physicalRows, virtualItems;
        public float rootWidth, rootHeight, scrollY, contentHeight, mainAlpha, transitionDuration;
        public string title, summary, inputText, popupTitle, popupBody, lastOperation;
        public string packageId, mainResourceId, mainResourceUrl, rowResourceId, rowResourceUrl, popupResourceId;
        public ControlRect[] controls;
        public RowSnapshot[] rows;
    }
    [Serializable] public sealed class RenderMetrics
    {
        public long updateFrames, tickCalls, dispatchCalls, renders, layouts, opened, closed, rowRenderCalls, rowObjectsCreated, popups, dragEnds, transitionPlays, evidenceWrites;
        public int runtimeInstances, runtimeDisposals, physicalRows, displayObjectsLastStageUpdate, graphicsLastStageUpdate;
        public long managedMemoryBytes, unityAllocatedBytes, unityReservedBytes;
        public double packageMs, runtimeInitMs, readyMs, elapsedMs, lastOpenMs, lastClaimMs, lastDispatchMs, totalDispatchMs, lastRenderMs, totalRenderMs, maxRenderMs, lastRowRenderMs, totalRowRenderMs;
    }
    [Serializable] public sealed class HostSnapshot { public bool ready; public AppResponse response; public string rawTsResponse; public UiSnapshot ui; public RenderMetrics metrics; public string[] errors; }
}
