using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using FairyGUI;
using Puerts;
using UnityEngine;
using UnityEngine.Profiling;
using Stopwatch = System.Diagnostics.Stopwatch;

// Platform adapter: all inventory/reward rules and responsive geometry execute in shared JS.
public sealed class ComplexInventoryHost : MonoBehaviour
{
    public static ComplexInventoryHost Instance { get; private set; }
    public string verificationDirectory = "";
    public bool Ready { get; private set; }
    public Metrics metrics = new Metrics();
    ScriptEnv environment;
    UIPackage package;
    GComponent main, launch, popup;
    GGraph shade;
    GList list;
    GTextInput search;
    AppResponse response;
    Geometry geometry;
    string rawTsResponse = "", rawLayout = "", notice = "", lastOperation = "";
    string pendingSellId;
    bool inputUpdating, destroying, initialized;
    float nextEvidenceAt, lastWidth, lastHeight;
    readonly HashSet<GObject> wiredSlots = new HashSet<GObject>();
    readonly List<string> errors = new List<string>();
    readonly Stopwatch lifetime = Stopwatch.StartNew();
    static readonly string[] Categories = { "all", "equipment", "consumable", "material", "quest" };
    static readonly string[] Sorts = { "default", "name", "rarity", "price", "quantity" };
    static readonly string[] SortLabels = { "默认", "名称", "稀有度", "价格", "数量" };
    static readonly string[] MainNames = { "backdrop", "panel", "title", "subtitle", "coins", "close", "searchbg", "search", "tab_all", "tab_equipment", "tab_consumable", "tab_material", "tab_quest", "list", "detailbg", "detailIcon", "detailTitle", "rarity", "stats", "description", "primary", "sell", "summary", "sort", "save", "load", "reward", "notice" };
    public string SavePath { get { return Path.Combine(Application.persistentDataPath, "ComplexInventory-v1.json"); } }

    void Awake()
    {
        if (Instance != null && Instance != this) { Debug.LogError("Only one ComplexInventoryHost may own ScriptEnv."); Destroy(this); return; }
        Instance = this;
        Application.logMessageReceived += CaptureError;
        var args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++) if (args[i] == "-verificationDir") verificationDirectory = args[i + 1];
    }
    void Start()
    {
        if (Instance != this) return;
        try { Initialize(); }
        catch (Exception error) { RecordError("initialize", error); }
        WriteEvidence();
    }
    void Initialize()
    {
        if (initialized) return;
        initialized = true;
        UIConfig.defaultFont = "Microsoft YaHei";
        FontManager.RegisterFont(FontManager.GetFont(UIConfig.defaultFont), "Arial");
        GRoot.inst.SetContentScaleFactor(1f);
        var timer = Stopwatch.StartNew();
        package = UIPackage.GetByName("Inventory") ?? UIPackage.AddPackage("ComplexInventoryUI/Inventory");
        if (package == null) throw new InvalidDataException("Complex Inventory package missing.");
        for (int i = 0; i < 24; i++) if (UIPackage.GetItemAssetByURL(IconUrl(i)) == null) throw new InvalidDataException("Missing icon " + IconUrl(i));
        metrics.packageMs = timer.Elapsed.TotalMilliseconds;
        var script = Resources.Load<TextAsset>("ComplexInventoryApp");
        var layout = Resources.Load<TextAsset>("ComplexInventoryLayout");
        if (script == null || layout == null) throw new InvalidDataException("ComplexInventoryApp/Layout TextAssets missing.");
        timer.Restart();
        environment = new ScriptEnv(new BackendV8()); metrics.runtimeInstances++;
        environment.Eval(script.text, "complex-inventory-app.js");
        environment.Eval(layout.text, "complex-layout.js");
        metrics.runtimeInitMs = timer.Elapsed.TotalMilliseconds;
        launch = Component(UIPackage.CreateObject("Inventory", "ComplexBtn"), "ComplexBtn");
        launch.name = "complexLaunch"; ButtonSize(launch, 20, 20, 180, 44); launch.GetChild("title").text = "打开旅者背包";
        launch.onClick.Add(() => ExecuteUi("open")); GRoot.inst.AddChild(launch);
        Open(); Ready = true; metrics.readyMs = lifetime.Elapsed.TotalMilliseconds;
    }
    void Update()
    {
        if (environment != null)
        {
            metrics.updateFrames++;
            try { environment.Tick(); metrics.tickCalls++; } catch (Exception error) { RecordError("tick", error); }
        }
        if (main != null && (GRoot.inst.width != lastWidth || GRoot.inst.height != lastHeight))
            try { Layout(); Render(); } catch (Exception error) { RecordError("layout", error); }
        if (Time.unscaledTime >= nextEvidenceAt) { nextEvidenceAt = Time.unscaledTime + 0.5f; WriteEvidence(); }
    }
    AppResponse Dispatch(string op, string argsJson = "{}")
    {
        if (environment == null) throw new InvalidOperationException("ScriptEnv unavailable.");
        var timer = Stopwatch.StartNew();
        rawTsResponse = environment.Eval<string>("globalThis.complexInventoryApp.dispatch(" + Quote(op) + "," + Quote(argsJson ?? "{}") + ")", "complex-dispatch");
        response = JsonUtility.FromJson<AppResponse>(rawTsResponse);
        if (response == null || response.view == null || response.session == null) throw new InvalidDataException("Incomplete complex response.");
        metrics.dispatchCalls++; metrics.lastDispatchMs = timer.Elapsed.TotalMilliseconds; metrics.totalDispatchMs += metrics.lastDispatchMs;
        return response;
    }
    void Open()
    {
        Dispatch("open");
        if (main != null) return;
        var timer = Stopwatch.StartNew();
        try
        {
            main = Component(UIPackage.CreateObject("Inventory", "ComplexMain"), "ComplexMain"); main.name = "complexInventory";
            foreach (string name in MainNames) if (main.GetChild(name) == null) throw new InvalidDataException("ComplexMain missing " + name);
            GRoot.inst.AddChild(main);
            list = main.GetChild("list").asList; search = main.GetChild("search").asTextInput;
            if (list == null || search == null) throw new InvalidDataException("ComplexMain list/search types mismatch.");
            search.text = response.view.query ?? "";
            search.onChanged.Add(() => { if (!inputUpdating) ExecuteUi("query", "{\"query\":" + Quote(search.text) + "}"); });
            foreach (string category in Categories) { string key = category; main.GetChild("tab_" + key).onClick.Add(() => ExecuteUi("category", "{\"category\":" + Quote(key) + "}")); }
            main.GetChild("close").onClick.Add(() => ExecuteUi("close"));
            main.GetChild("primary").onClick.Add(() => ExecuteUi("primary"));
            main.GetChild("sell").onClick.Add(() => ExecuteUi("sell-confirm"));
            main.GetChild("sort").onClick.Add(() => ExecuteUi("sort-next"));
            main.GetChild("save").onClick.Add(() => ExecuteUi("save-file"));
            main.GetChild("load").onClick.Add(() => ExecuteUi("load-file"));
            main.GetChild("reward").onClick.Add(() => ExecuteUi("rewards"));
            list.layout = ListLayoutType.FlowHorizontal; list.autoResizeItem = false; list.selectionMode = ListSelectionMode.None;
            list.defaultItem = "ui://invtest1cxslot01"; list.itemRenderer = RenderSlot;
            Layout(); list.SetVirtual(); list.scrollPane.mouseWheelEnabled = true;
            Render(); launch.visible = false; metrics.opened++; metrics.lastOpenMs = timer.Elapsed.TotalMilliseconds;
        }
        catch { DisposeView(); Dispatch("close"); throw; }
    }
    void Close() { Dispatch("close"); if (main != null) { DisposeView(); metrics.closed++; } if (launch != null) launch.visible = true; }
    void DisposeView() { ClosePopup(); if (main != null) main.Dispose(); main = null; list = null; search = null; wiredSlots.Clear(); }
    void Layout()
    {
        if (main == null) return;
        var root = GRoot.inst; lastWidth = root.width; lastHeight = root.height;
        rawLayout = environment.Eval<string>("JSON.stringify(globalThis.complexLayout(" + root.width.ToString(System.Globalization.CultureInfo.InvariantCulture) + "," + root.height.ToString(System.Globalization.CultureInfo.InvariantCulture) + "))", "complex-layout");
        geometry = JsonUtility.FromJson<Geometry>(rawLayout);
        if (geometry == null || geometry.controls == null || geometry.columns < 1) throw new InvalidDataException("Invalid shared geometry.");
        main.SetSize(root.width, root.height); main.SetXY(0, 0);
        foreach (var control in geometry.controls)
        {
            var obj = main.GetChild(control.name); if (obj == null) throw new InvalidDataException("Shared layout target missing: " + control.name);
            obj.SetXY(control.x, control.y); obj.SetSize(control.width, control.height); obj.visible = control.visible;
            if (obj.asCom != null && obj.asCom.GetChild("btnbg") != null) ButtonSize(obj.asCom, control.x, control.y, control.width, control.height);
            FontSize(obj, control.fontSize);
        }
        list.columnCount = geometry.columns; list.columnGap = geometry.gap; list.lineGap = geometry.gap;
        if (popup != null) LayoutPopup(); metrics.layouts++;
    }
    void Render()
    {
        if (main == null || response == null) return;
        var timer = Stopwatch.StartNew(); var view = response.view;
        inputUpdating = true; try { search.text = view.query ?? ""; } finally { inputUpdating = false; }
        main.GetChild("title").text = "旅者背包";
        main.GetChild("subtitle").text = "TRAVELER'S INVENTORY · 装备与旅途珍藏";
        main.GetChild("coins").text = view.coins.ToString("N0", System.Globalization.CultureInfo.InvariantCulture) + " 金币";
        main.GetChild("summary").text = "容量 " + view.usedSlots + " / " + view.capacity + " · 当前 " + view.visible.Length + " 件";
        main.GetChild("notice").text = notice;
        foreach (string category in Categories) TintButton(main.GetChild("tab_" + category).asCom, view.category == category);
        int sortIndex = Array.IndexOf(Sorts, view.sort); main.GetChild("sort").text = "排序·" + SortLabels[Math.Max(0, sortIndex)];
        var selected = view.selected;
        main.GetChild("detailTitle").text = selected != null ? selected.name : "选择一件道具";
        main.GetChild("rarity").text = selected != null ? RarityName(selected.rarity) + (selected.equipped ? " · 已装备" : " · " + selected.quantity + " 件") : "查看物品详情";
        main.GetChild("stats").text = selected != null ? selected.displayStats ?? "" : "";
        main.GetChild("description").text = selected != null ? selected.description : "点击背包中的物品，查看详情并选择装备、使用或出售。";
        var loader = main.GetChild("detailIcon").asLoader;
        loader.fill = FillType.Scale; loader.align = AlignType.Center; loader.verticalAlign = VertAlignType.Middle;
        loader.url = selected != null ? IconUrl(selected.iconIndex) : null;
        var primary = main.GetChild("primary"); string action = selected == null ? "请选择道具" : selected.equipped ? "卸下装备" : selected.type == "equipment" ? "装备" : selected.type == "consumable" ? "使用" : "不可使用";
        primary.text = action; primary.touchable = selected != null && (selected.equipped || selected.type == "equipment" || selected.type == "consumable"); primary.grayed = !primary.touchable;
        var sell = main.GetChild("sell"); sell.text = selected != null ? "出售 1 件 · " + selected.price + " 金币" : "出售";
        sell.touchable = selected != null && !selected.equipped && selected.type != "quest"; sell.grayed = !sell.touchable;
        list.numItems = view.visible.Length; list.RefreshVirtualList();
        metrics.renders++; metrics.lastRenderMs = timer.Elapsed.TotalMilliseconds; metrics.maxRenderMs = Math.Max(metrics.maxRenderMs, metrics.lastRenderMs);
    }
    void RenderSlot(int index, GObject obj)
    {
        if (response == null || index < 0 || index >= response.view.visible.Length) return;
        var item = response.view.visible[index]; var slot = obj.asCom; float c = geometry.cellSize;
        slot.data = item.id; slot.SetSize(c, c);
        var border = slot.GetChild("border").asGraph; border.SetXY(0, 0); border.DrawRect(c, c, 0, Color.clear, RarityColor(item.rarity));
        var tile = slot.GetChild("tile").asGraph; tile.SetXY(2, 2); tile.DrawRect(c - 4, c - 4, 0, Color.clear, Hex("#111d2d"));
        var icon = slot.GetChild("icon").asLoader; icon.SetXY(8, 6); icon.SetSize(c - 16, c - 31); icon.fill = FillType.Scale; icon.align = AlignType.Center; icon.verticalAlign = VertAlignType.Middle; icon.url = IconUrl(item.iconIndex);
        var label = slot.GetChild("label"); label.SetXY(4, c - 23); label.SetSize(c - 8, 20); label.text = item.name; label.asTextField.singleLine = true; FontSize(label, geometry.narrow ? 11 : 13);
        var quantity = slot.GetChild("quantity"); quantity.SetXY(4, c - 45); quantity.SetSize(c - 12, 22); quantity.text = item.quantity > 1 ? "×" + item.quantity : "";
        var format = quantity.asTextField.textFormat; format.align = AlignType.Right; format.size = geometry.narrow ? 14 : 17; quantity.asTextField.textFormat = format;
        var selected = slot.GetChild("selected").asGraph; selected.SetXY(0, 0); selected.DrawRect(c, c, 2, Hex("#f4c66a"), Color.clear); selected.visible = item.id == response.view.selectedId;
        border.touchable = false; tile.touchable = false; icon.touchable = false; label.touchable = false; quantity.touchable = false; selected.touchable = false;
        if (wiredSlots.Add(slot)) { slot.onClick.Add(() => ExecuteUi("select", "{\"id\":" + Quote(slot.data as string) + "}")); metrics.slotObjectsCreated++; }
        metrics.slotRenderCalls++;
    }
    void ExecuteUi(string op, string argsJson = "{}") { try { ExecuteOperation(op, argsJson); } catch (Exception error) { RecordError(op, error); } }
    void ExecuteOperation(string op, string argsJson)
    {
        lastOperation = op;
        if (op == "open") { Open(); return; } if (op == "close") { Close(); return; }
        if (op == "resize") { var size = JsonUtility.FromJson<UiArgs>(argsJson); if (size.width < 300 || size.height < 640) throw new ArgumentOutOfRangeException("resize", "Minimum complex viewport is 300x640."); Screen.SetResolution(size.width, size.height, FullScreenMode.Windowed); return; }
        if (op == "scroll") { if (list != null) list.scrollPane.SetPosY(JsonUtility.FromJson<UiArgs>(argsJson).y, false); return; }
        if (op == "confirm") { string sellId = pendingSellId; ClosePopup(); if (sellId != null) ExecuteOperation("sell", "{\"id\":" + Quote(sellId) + ",\"quantity\":1}"); return; }
        if (op == "cancel") { ClosePopup(); return; }
        if (op == "rewards") { ShowPopup("旅途奖励", "推进原任务后可领取奖励；每项仅发放一次。", true); return; }
        if (op == "sell-confirm") { var item = response.view.selected; if (item == null) { notice = "请先选择道具"; Render(); return; } ShowPopup("确认出售", "出售 1 件「" + item.name + "」，获得 " + item.price + " 金币？", false); pendingSellId = item.id; return; }
        if (op == "primary")
        {
            var item = response.view.selected; if (item == null) { notice = "请先选择道具"; Render(); return; }
            ExecuteOperation(item.equipped ? "unequip" : item.type == "equipment" ? "equip" : "use", item.equipped ? "{\"slot\":" + Quote(item.slot) + "}" : "{\"id\":" + Quote(item.id) + "}"); return;
        }
        if (op == "sort-next") { int i = Array.IndexOf(Sorts, response.view.sort); ExecuteOperation("sort", "{\"sort\":" + Quote(Sorts[(i + 1) % Sorts.Length]) + "}"); return; }
        if (op == "claim-first")
        {
            foreach (var item in response.view.rewards.visible) if (item.state == "ready") { ExecuteOperation("claim", "{\"id\":" + Quote(item.id) + "}"); return; }
            notice = "暂无可领取奖励，请先推进任务"; Render(); return;
        }
        if (op == "save-file")
        {
            var saved = Dispatch("save"); if (!saved.ok) { notice = saved.error; Render(); return; }
            Directory.CreateDirectory(Application.persistentDataPath); File.WriteAllText(SavePath, saved.result.json, new UTF8Encoding(false)); notice = "存档已保存"; metrics.fileSaves++; Render(); return;
        }
        if (op == "load-file")
        {
            if (!File.Exists(SavePath)) { notice = "尚无本地存档"; Render(); return; }
            var loaded = Dispatch("load", "{\"json\":" + Quote(File.ReadAllText(SavePath, Encoding.UTF8)) + "}"); notice = loaded.ok ? "存档已恢复" : loaded.error; if (loaded.ok) metrics.fileLoads++; Render(); return;
        }
        var state = Dispatch(op, argsJson);
        if (op != "snapshot") { notice = state.ok ? SuccessNotice(op) : state.error ?? "操作被拒绝"; Render(); }
        if (popup != null && (op == "progress" || op == "claim")) popup.GetChild("body").text = notice + "\n奖励金币 " + state.view.rewards.coins + " · 共享原奖励模型";
    }
    void ShowPopup(string title, string body, bool rewards)
    {
        if (main == null) return; ClosePopup();
        shade = new GGraph(); shade.name = "complexShade"; shade.DrawRect(GRoot.inst.width, GRoot.inst.height, 0, Color.clear, new Color(0, 0, 0, 0.7f)); GRoot.inst.AddChild(shade);
        popup = Component(UIPackage.CreateObject("Inventory", "Reward"), "Reward"); popup.name = "complexPopup"; GRoot.inst.AddChild(popup);
        popup.GetChild("title").text = title; popup.GetChild("body").text = body; popup.GetChild("confirm").text = rewards ? "关闭" : "确认";
        popup.GetChild("confirm").onClick.Add(() => ExecuteUi("confirm"));
        var cancel = Component(UIPackage.CreateObject("Inventory", "ComplexBtn"), "ComplexBtn"); cancel.name = "cancel"; cancel.text = "取消"; popup.AddChild(cancel); cancel.onClick.Add(() => ExecuteUi("cancel"));
        if (rewards)
        {
            var progress = Component(UIPackage.CreateObject("Inventory", "ComplexBtn"), "ComplexBtn"); progress.name = "progress"; progress.text = "推进任务"; popup.AddChild(progress); progress.onClick.Add(() => ExecuteUi("progress"));
            var claim = Component(UIPackage.CreateObject("Inventory", "ComplexBtn"), "ComplexBtn"); claim.name = "claim"; claim.text = "领取首项"; popup.AddChild(claim); claim.onClick.Add(() => ExecuteUi("claim-first"));
        }
        LayoutPopup(); metrics.popups++;
    }
    void LayoutPopup()
    {
        float w = Math.Min(480, GRoot.inst.width - 24); popup.SetSize(w, 340); popup.SetXY((GRoot.inst.width - w) / 2, (GRoot.inst.height - 340) / 2);
        popup.GetChild("rewardbg").SetSize(w, 340); popup.GetChild("title").SetSize(w - 48, 38); popup.GetChild("body").SetXY(24, 78); popup.GetChild("body").SetSize(w - 48, 120);
        ButtonSize(popup.GetChild("confirm").asCom, w - 148, 282, 124, 36); ButtonSize(popup.GetChild("cancel").asCom, 24, 282, 124, 36);
        if (popup.GetChild("progress") != null) { ButtonSize(popup.GetChild("progress").asCom, 24, 228, (w - 56) / 2, 36); ButtonSize(popup.GetChild("claim").asCom, 32 + (w - 56) / 2, 228, (w - 56) / 2, 36); }
        shade.SetSize(GRoot.inst.width, GRoot.inst.height);
    }
    void ClosePopup() { pendingSellId = null; if (popup != null) popup.Dispose(); if (shade != null) shade.Dispose(); popup = null; shade = null; }
    public string ExecuteVerification(string op, string argsJson = "{}")
    {
        if (op == "click-control")
        {
            string name = JsonUtility.FromJson<UiArgs>(argsJson).name;
            GObject control = name == "launch" ? launch : null;
            if (control == null && popup != null) control = popup.GetChild((name ?? "").Replace("popup:", ""));
            if (control == null && main != null && popup == null) control = main.GetChild(name ?? "");
            if (control == null || control.isDisposed || !control.visible || !control.touchable || control.grayed) throw new InvalidOperationException("Requested control is missing, disabled or blocked by a modal: " + name);
            control.onClick.Call();
        }
        else if (op == "select-slot")
        {
            string id = JsonUtility.FromJson<UiArgs>(argsJson).id; GObject slot = null;
            if (list != null && popup == null) for (int i = 0; i < list.numChildren; i++) if ((list.GetChildAt(i).data as string) == id) { slot = list.GetChildAt(i); break; }
            if (slot == null || !slot.visible || !slot.touchable) throw new InvalidOperationException("Requested physical pooled slot is not available: " + id);
            slot.onClick.Call();
        }
        else ExecuteUi(op, argsJson);
        return SnapshotJson();
    }
    public string SnapshotJson()
    {
        var ui = new UiSnapshot { open = main != null, popup = popup != null, screenWidth = Screen.width, screenHeight = Screen.height, lastOperation = lastOperation, notice = notice, savePath = SavePath, packageId = package != null ? package.id : "" };
        var controls = new List<ControlRect>(); var slots = new List<SlotSnapshot>();
        if (!destroying && initialized) { ui.rootWidth = GRoot.inst.width; ui.rootHeight = GRoot.inst.height; AddControl(controls, "launch", launch); }
        if (main != null)
        {
            ui.title = main.GetChild("title").text; ui.mainResourceId = main.packageItem.id; ui.mainResourceUrl = main.resourceURL; ui.inputText = search.text;
            ui.virtualList = list.isVirtual; ui.physicalRows = list.numChildren; ui.virtualItems = list.numItems; ui.scrollY = list.scrollPane.posY; ui.contentHeight = list.scrollPane.contentHeight;
            ui.columns = geometry.columns; ui.cellSize = geometry.cellSize; ui.detailTitle = main.GetChild("detailTitle").text; ui.primaryText = main.GetChild("primary").text; ui.detailIconUrl = main.GetChild("detailIcon").asLoader.url;
            foreach (string name in MainNames) AddControl(controls, name, main.GetChild(name));
            for (int i = 0; i < list.numChildren; i++)
            {
                var slot = list.GetChildAt(i).asCom; ui.rowResourceId = slot.packageItem.id;
                slots.Add(new SlotSnapshot { id = slot.data as string, label = slot.GetChild("label").text, iconUrl = slot.GetChild("icon").asLoader.url, quantity = slot.GetChild("quantity").text, selected = slot.GetChild("selected").visible, rect = RectOf(slot) });
                AddControl(controls, "slot:" + slot.data, slot);
            }
        }
        if (popup != null) { ui.popupTitle = popup.GetChild("title").text; ui.popupBody = popup.GetChild("body").text; AddControl(controls, "popup", popup); foreach (string name in new[] { "confirm", "cancel", "progress", "claim" }) AddControl(controls, "popup:" + name, popup.GetChild(name)); }
        ui.controls = controls.ToArray(); ui.rows = slots.ToArray();
        metrics.elapsedMs = lifetime.Elapsed.TotalMilliseconds; metrics.physicalRows = ui.physicalRows; metrics.managedMemoryBytes = GC.GetTotalMemory(false); metrics.unityAllocatedBytes = Profiler.GetTotalAllocatedMemoryLong(); metrics.unityReservedBytes = Profiler.GetTotalReservedMemoryLong();
        return JsonUtility.ToJson(new HostSnapshot { ready = Ready, response = response, rawTsResponse = rawTsResponse, rawLayout = rawLayout, ui = ui, metrics = metrics, errors = errors.ToArray() });
    }
    void WriteEvidence()
    {
        if (string.IsNullOrWhiteSpace(verificationDirectory)) return;
        try { Directory.CreateDirectory(verificationDirectory); string json = SnapshotJson(); File.WriteAllText(Path.Combine(verificationDirectory, "latest-snapshot.json"), json, new UTF8Encoding(false)); File.AppendAllText(Path.Combine(verificationDirectory, "snapshots.jsonl"), json + Environment.NewLine, new UTF8Encoding(false)); metrics.evidenceWrites++; }
        catch (Exception error) { RecordError("evidence", error); }
    }
    void CaptureError(string message, string stack, LogType type) { if (type == LogType.Error || type == LogType.Exception || type == LogType.Assert) { string text = message + "\n" + stack; if (errors.Count < 100 && !errors.Contains(text)) errors.Add(text); } }
    void RecordError(string op, Exception error) { string text = op + ": " + error; if (errors.Count < 100 && !errors.Contains(text)) errors.Add(text); Debug.LogError(text); }
    void OnDestroy()
    {
        if (Instance != this || destroying) return; destroying = true; Ready = false;
        try { if (environment != null) Dispatch("close"); } catch (Exception error) { RecordError("destroy-close", error); }
        try { DisposeView(); if (launch != null) launch.Dispose(); launch = null; } catch (Exception error) { RecordError("destroy-ui", error); }
        try { if (environment != null) { environment.Dispose(); metrics.runtimeDisposals++; } } catch (Exception error) { RecordError("destroy-runtime", error); }
        finally { environment = null; WriteEvidence(); Application.logMessageReceived -= CaptureError; Instance = null; }
    }
    static string IconUrl(int index) { return "ui://invtest1icx" + index.ToString("D5"); }
    static GComponent Component(GObject obj, string name) { if (obj == null || obj.asCom == null) throw new InvalidDataException("Missing component " + name); return obj.asCom; }
    static void ButtonSize(GComponent button, float x, float y, float w, float h) { button.SetXY(x, y); button.SetSize(w, h); var bg = button.GetChild("btnbg"); if (bg != null) bg.SetSize(w, h); var title = button.GetChild("title"); if (title != null) { title.SetXY(0, 0); title.SetSize(w, h); if (title.asTextField != null) title.asTextField.verticalAlign = VertAlignType.Middle; } }
    static void FontSize(GObject obj, int size) { if (size <= 0) return; var text = obj.asTextField; if (text == null && obj.asCom != null) { var title = obj.asCom.GetChild("title"); text = title != null ? title.asTextField : null; } if (text != null) { var format = text.textFormat; format.size = size; text.textFormat = format; } }
    static Color Hex(string text) { Color color; return ColorUtility.TryParseHtmlString(text, out color) ? color : Color.white; }
    static Color RarityColor(string rarity) { switch (rarity) { case "uncommon": return Hex("#54b775"); case "rare": return Hex("#55a9e8"); case "epic": return Hex("#b77bea"); case "legendary": return Hex("#e6ad45"); default: return Hex("#8f9ca8"); } }
    static string RarityName(string rarity) { switch (rarity) { case "uncommon": return "精良"; case "rare": return "稀有"; case "epic": return "史诗"; case "legendary": return "传说"; default: return "普通"; } }
    static string SuccessNotice(string op) { switch (op) { case "equip": return "已装备，旧装备已放回背包"; case "unequip": return "装备已放回背包"; case "use": return "已使用一份消耗品"; case "sell": return "出售成功"; case "progress": return "原奖励任务已推进"; case "claim": return "原奖励领取成功"; case "load": return "存档已恢复"; case "save": return "存档数据已生成"; default: return ""; } }
    static void TintButton(GComponent button, bool active) { var bg = button.GetChild("btnbg").asGraph; if (bg != null) bg.DrawRect(button.width, button.height, 1, Hex(active ? "#d0a35a" : "#506079"), Hex(active ? "#4a3c2b" : "#182438")); }
    static ScreenRect RectOf(GObject obj) { var rect = obj.LocalToGlobal(new Rect(0, 0, obj.width, obj.height)); float sx = Stage.inst.size.x > 0 ? Screen.width / Stage.inst.size.x : 1; float sy = Stage.inst.size.y > 0 ? Screen.height / Stage.inst.size.y : 1; return new ScreenRect { x = rect.x * sx, y = rect.y * sy, width = rect.width * sx, height = rect.height * sy }; }
    static void AddControl(List<ControlRect> target, string name, GObject obj) { if (obj == null || obj.isDisposed) return; var r = RectOf(obj); var text = obj.asTextField; if (text == null && obj.asCom != null && obj.asCom.GetChild("title") != null) text = obj.asCom.GetChild("title").asTextField; target.Add(new ControlRect { name = name, visible = obj.visible, enabled = obj.touchable, grayed = obj.grayed, text = obj.text, fontSize = text != null ? text.textFormat.size : 0, rect = r, unityRect = new ScreenRect { x = r.x, y = Screen.height - r.y - r.height, width = r.width, height = r.height } }); }
    static string Quote(string value) { if (value == null) return "null"; var b = new StringBuilder("\""); foreach (char c in value) { switch (c) { case '"': b.Append("\\\""); break; case '\\': b.Append("\\\\"); break; case '\n': b.Append("\\n"); break; case '\r': b.Append("\\r"); break; case '\t': b.Append("\\t"); break; default: if (c < 32 || c == '\u2028' || c == '\u2029') b.Append("\\u" + ((int)c).ToString("x4")); else b.Append(c); break; } } return b.Append('"').ToString(); }

    [Serializable] public sealed class UiArgs { public int width, height; public float y; public string name, id; }
    [Serializable] public sealed class Item { public string id, kind, name, type, rarity, description, slot, displayStats; public int iconIndex, quantity, price; public bool equipped; public ItemStats stats; }
    [Serializable] public sealed class ItemStats { public int attack, defense, health, mana, stamina; }
    [Serializable] public sealed class Equipment { public Item weapon, offhand, head, body, feet, ring, neck; }
    [Serializable] public sealed class RewardItem { public string id, name, state, description; }
    [Serializable] public sealed class Rewards { public RewardItem[] items, visible; public long coins; public string query; }
    [Serializable] public sealed class AppView { public int schemaVersion, revision, capacity, usedSlots; public long coins; public Item[] items, visible; public string selectedId, query, category, sort; public Item selected; public Equipment equipment; public ItemStats equipmentStats; public Rewards rewards; }
    [Serializable] public sealed class AppSession { public bool open; public int listenerCount, notifications, opens, closes, closedCallbacks, listenerErrors; }
    [Serializable] public sealed class AppResult { public string json, message; public bool ok; }
    [Serializable] public sealed class AppResponse { public bool ok; public string op, error, errorCode; public AppResult result; public AppView view; public AppSession session; }
    [Serializable] public sealed class Geometry { public float width, height, cellSize; public bool narrow; public int columns, gap; public LayoutControl[] controls; }
    [Serializable] public sealed class LayoutControl { public string name; public float x, y, width, height; public int fontSize; public bool visible; }
    [Serializable] public sealed class ScreenRect { public float x, y, width, height; }
    [Serializable] public sealed class ControlRect { public string name, text; public bool visible, enabled, grayed; public int fontSize; public ScreenRect rect, unityRect; }
    [Serializable] public sealed class SlotSnapshot { public string id, label, iconUrl, quantity; public bool selected; public ScreenRect rect; }
    [Serializable] public sealed class UiSnapshot { public bool open, popup, virtualList; public int screenWidth, screenHeight, physicalRows, virtualItems, columns; public float rootWidth, rootHeight, cellSize, scrollY, contentHeight; public string title, mainResourceId, mainResourceUrl, rowResourceId, packageId, inputText, detailTitle, detailIconUrl, primaryText, notice, popupTitle, popupBody, lastOperation, savePath; public ControlRect[] controls; public SlotSnapshot[] rows; }
    [Serializable] public sealed class Metrics { public int runtimeInstances, runtimeDisposals, physicalRows; public long updateFrames, tickCalls, dispatchCalls, renders, layouts, opened, closed, slotRenderCalls, slotObjectsCreated, fileSaves, fileLoads, popups, evidenceWrites, managedMemoryBytes, unityAllocatedBytes, unityReservedBytes; public double readyMs, packageMs, runtimeInitMs, elapsedMs, lastOpenMs, lastDispatchMs, totalDispatchMs, lastRenderMs, maxRenderMs; }
    [Serializable] public sealed class HostSnapshot { public bool ready; public AppResponse response; public string rawTsResponse, rawLayout; public UiSnapshot ui; public Metrics metrics; public string[] errors; }
}
