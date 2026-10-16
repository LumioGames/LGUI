using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using FairyGUI;
using Puerts;
using UnityEngine;
using UnityEngine.Profiling;
using Stopwatch = System.Diagnostics.Stopwatch;

// Native FairyGUI platform adapter. Business, display projections, and layout run in shared JS.
public sealed class FidelityInventoryHost : MonoBehaviour
{
    public static FidelityInventoryHost Instance { get; private set; }
    public bool Ready { get; private set; }
    public string verificationDirectory = "";
    public ComplexInventoryHost.Metrics metrics = new ComplexInventoryHost.Metrics();
    public string SavePath { get { return Path.Combine(Application.persistentDataPath, "FidelityInventory-v1.json"); } }
    ScriptEnv environment;
    UIPackage package;
    GComponent main, slotsRoot, launch, popup, menu;
    GGraph shade;
    GTextInput search;
    Geometry geometry;
    ResourceMap resources;
    AppResponse response;
    Presentation presentation;
    string rawTsResponse = "", rawLayout = "", lastOperation = "", notice = "", pendingSellId, businessSha256 = "", layoutSha256 = "";
    bool updatingInput, destroying, initialized;
    float lastWidth, lastHeight, nextEvidence;
    readonly Dictionary<string, Resource> skins = new Dictionary<string, Resource>();
    readonly Dictionary<string, GObject> controls = new Dictionary<string, GObject>();
    readonly List<GComponent> slots = new List<GComponent>();
    readonly List<string> errors = new List<string>();
    readonly Stopwatch lifetime = Stopwatch.StartNew();
    static readonly string[] Categories = { "all", "equipment", "consumable", "material", "quest" };
    static readonly string[] Sorts = { "default", "name", "rarity", "price", "quantity" };
    static readonly string[] SortLabels = { "默认顺序", "名称", "稀有度", "价格", "数量" };

    void Awake()
    {
        if (Instance != null && Instance != this) { Destroy(this); return; }
        Instance = this; Application.logMessageReceived += CaptureError;
        var args = Environment.GetCommandLineArgs();
        for (int i = 0; i + 1 < args.Length; i++) if (args[i] == "-verificationDir") verificationDirectory = args[i + 1];
    }
    void Start() { if (Instance != this) return; try { Initialize(); } catch (Exception error) { RecordError("initialize", error); } WriteEvidence(); }
    void Initialize()
    {
        if (initialized) return; initialized = true;
        UIConfig.defaultFont = "SimSun"; FontManager.RegisterFont(FontManager.GetFont("SimSun"), "Arial");
        GRoot.inst.SetContentScaleFactor(1f);
        package = UIPackage.GetByName("Inventory") ?? UIPackage.AddPackage("FidelityInventoryUI/Inventory");
        if (package == null) throw new InvalidDataException("Fidelity Inventory package missing.");
        resources = JsonUtility.FromJson<ResourceMap>(ResourceText("FidelityResourceMap"));
        if (resources == null || resources.skinEntries == null || resources.details == null || resources.tiles == null || resources.details.Length != 24 || resources.tiles.Length != 24) throw new InvalidDataException("Incomplete fidelity resource map.");
        foreach (var entry in resources.skinEntries) { skins.Add(entry.key, entry); if (UIPackage.GetItemAssetByURL(entry.url) == null) throw new InvalidDataException("Missing skin " + entry.key); }
        environment = new ScriptEnv(new BackendV8()); metrics.runtimeInstances++;
        var businessAsset = Resources.Load<TextAsset>("FidelityInventoryApp"); var layoutAsset = Resources.Load<TextAsset>("FidelityInventoryLayout");
        if (businessAsset == null || layoutAsset == null) throw new InvalidDataException("Shared business/layout TextAssets missing.");
        businessSha256 = Sha256(businessAsset.bytes); layoutSha256 = Sha256(layoutAsset.bytes);
        environment.Eval(businessAsset.text, "fidelity-business.js");
        environment.Eval(layoutAsset.text, "fidelity-layout-shared.js");
        environment.Eval("globalThis.fidelityReference=" + ResourceText("FidelityLayoutReference") + ";globalThis.fidelitySkins=" + ResourceText("FidelitySkinManifest") + ";", "fidelity-layout-inputs.js");
        Dispatch("load", "{\"json\":" + Quote(ResourceText("FidelityReferenceFixture")) + "}");
        if (!response.ok) throw new InvalidDataException("Reference fixture rejected: " + rawTsResponse);
        launch = CreateButton("launch", "打开旅者背包", new Box { x = 20, y = 20, width = 240, height = 54 }, "secondaryBg", () => Ui("open"), 24, GRoot.inst);
        Open(); Ready = true; metrics.readyMs = lifetime.Elapsed.TotalMilliseconds;
    }
    static string ResourceText(string name) { var file = Resources.Load<TextAsset>(name); if (file == null) throw new InvalidDataException("Missing Resources/" + name); return file.text; }
    void Update()
    {
        if (environment != null) { metrics.updateFrames++; try { environment.Tick(); metrics.tickCalls++; } catch (Exception e) { RecordError("tick", e); } }
        if (main != null && (lastWidth != GRoot.inst.width || lastHeight != GRoot.inst.height)) try { Layout(); Render(); } catch (Exception e) { RecordError("resize", e); }
        if (Time.unscaledTime >= nextEvidence) { nextEvidence = Time.unscaledTime + .5f; WriteEvidence(); }
    }
    AppResponse Dispatch(string op, string args = "{}")
    {
        if (environment == null) throw new InvalidOperationException("Fidelity ScriptEnv unavailable.");
        var timer = Stopwatch.StartNew();
        rawTsResponse = environment.Eval<string>("globalThis.complexInventoryApp.dispatch(" + Quote(op) + "," + Quote(args ?? "{}") + ")", "fidelity-dispatch");
        response = JsonUtility.FromJson<AppResponse>(rawTsResponse);
        if (response == null || response.view == null || response.session == null) throw new InvalidDataException("Incomplete shared response.");
        metrics.dispatchCalls++; metrics.lastDispatchMs = timer.Elapsed.TotalMilliseconds; metrics.totalDispatchMs += metrics.lastDispatchMs;
        return response;
    }
    void Open()
    {
        if (main != null) return; Dispatch("open");
        try
        {
            main = Component(UIPackage.CreateObject("Inventory", "ComplexMain"), "ComplexMain"); main.name = "fidelityInventory"; GRoot.inst.AddChild(main); controls.Clear();
            for (int i = 0; i < main.numChildren; i++) { var child = main.GetChildAt(i); child.visible = false; }
            string[] names = { "coins", "close", "search", "detailIcon", "detailTitle", "rarity", "description", "primary", "sell", "summary", "sort", "menu" };
            foreach (string name in names) controls[name] = Required(name);
            foreach (string category in Categories) { string captured = category; controls["tab_" + category] = Required("tab_" + category); Required("tab_" + category).onClick.Add(() => Ui("category", "{\"category\":" + Quote(captured) + "}")); }
            controls["title"] = Required("art_headerBranding"); controls["capacity-fill"] = Required("capacityFill");
            controls["footer"] = Required("footer");
            for (int i = 0; i < 3; i++) { string key = new[] { "attack", "crit", "durability" }[i]; controls["stat-label-" + key] = Required("statLabel" + i); controls["stat_" + key] = Required("statValue" + i); }
            controls["description"].asTextField.singleLine = false;
            controls["itemNote"] = NewText("itemNote", "", main, 16, "#bec0ba"); controls["itemNote"].asTextField.singleLine = false;
            var mask = new GGraph(); mask.name = "stats-background-mask"; mask.DrawRect(194, 183, 0, Color.clear, Hex("#041019")); main.AddChildAt(mask, main.GetChildIndex(Required("statLabel0"))); controls[mask.name] = mask;
            int backgroundIndex = Math.Min(main.GetChildIndex(Required("art_leftBackground")), Math.Min(main.GetChildIndex(Required("art_detailBackground")), main.GetChildIndex(Required("art_footerBackground"))));
            foreach (string key in new[] { "left-background-base", "detail-background-base", "footer-background-base" }) { var graph = new GGraph(); graph.name = key; graph.DrawRect(1, 1, 0, Color.clear, Hex("#041019")); graph.touchable = false; main.AddChildAt(graph, backgroundIndex++); }
            var sourceList = Required("list"); sourceList.visible = false;
            slotsRoot = new GComponent(); slotsRoot.name = "fidelitySlots"; main.AddChildAt(slotsRoot, main.GetChildIndex(sourceList)); controls["list"] = slotsRoot;
            search = controls["search"].asTextInput; if (search == null) throw new InvalidDataException("search is not GTextInput"); search.promptText = "搜索物品……";
            search.onChanged.Add(() => { if (!updatingInput) Ui("query", "{\"query\":" + Quote(search.text) + "}"); });
            controls["close"].onClick.Add(() => Ui("close")); controls["primary"].onClick.Add(() => Ui("primary")); controls["sell"].onClick.Add(() => Ui("sell-confirm"));
            controls["sort"].onClick.Add(ShowSort); controls["menu"].onClick.Add(ToggleMenu);
            Layout(); Render(); launch.visible = false; metrics.opened++;
        }
        catch { DisposeView(); Dispatch("close"); throw; }
    }
    GObject Required(string name) { var obj = main.GetChild(name); if (obj == null) throw new InvalidDataException("ComplexMain missing " + name); return obj; }
    void Close() { if (main == null) return; Dispatch("close"); DisposeView(); metrics.closed++; if (launch != null) launch.visible = true; }
    void DisposeView() { ClosePopup(); CloseMenu(); if (main != null) main.Dispose(); main = null; slotsRoot = null; search = null; controls.Clear(); slots.Clear(); }
    void Layout()
    {
        ClosePopup(); CloseMenu(); lastWidth = GRoot.inst.width; lastHeight = GRoot.inst.height;
        rawLayout = environment.Eval<string>("JSON.stringify(globalThis.fidelityLayout(" + Number(lastWidth) + "," + Number(lastHeight) + ",globalThis.fidelityReference,globalThis.fidelitySkins))", "fidelity-layout");
        geometry = JsonUtility.FromJson<Geometry>(rawLayout);
        if (geometry == null || geometry.slots == null || geometry.slots.Length != 24) throw new InvalidDataException("Invalid shared layout.");
        main.SetSize(geometry.designWidth, geometry.designHeight); main.SetScale(geometry.scale, geometry.scale); main.SetXY(geometry.offsetX, geometry.offsetY);
        foreach (var skin in resources.skinEntries) { var art = main.GetChild("art_" + skin.key); if (art != null) art.visible = false; }
        foreach (var node in geometry.art)
        {
            var art = main.GetChild(node.graph ? node.name : "art_" + node.name) ?? main.GetChild(node.name); if (art == null) continue; art.visible = node.visible; if (!node.visible) continue;
            Place(art, node);
            if (node.graph) art.asGraph.DrawRect(node.width, node.height, 0, Color.clear, Hex("#041019"));
            else if (!string.IsNullOrEmpty(node.asset) && skins.ContainsKey(node.asset)) SetArtAsset(art, skins[node.asset], node, node.fill == "scale");
            art.touchable = false;
        }
        foreach (var node in geometry.controls)
        {
            GObject obj; if (!controls.TryGetValue(node.name, out obj)) continue; Place(obj, node); obj.visible = node.visible;
            if (node.name == "title") { SetArtAsset(obj, skins["headerBranding"], node, geometry.mode == "adaptive"); continue; }
            if (node.button) ConfigureButton(obj.asCom, node, ButtonSkin(node.name));
            else if (obj.asTextField != null) Style(obj.asTextField, node.fontSize, TextColor(node.name), node.name.StartsWith("stat_") || node.name == "coins" || node.name == "summary" ? "Times New Roman" : "SimSun", node.name == "detailTitle", node.name.StartsWith("stat_") ? AlignType.Right : node.name == "footer" ? AlignType.Center : AlignType.Left, node.name == "description" || node.name == "itemNote" ? VertAlignType.Top : VertAlignType.Middle, node.lineSpacing, node.singleLine);
        }
        metrics.layouts++;
    }
    void Render()
    {
        if (main == null || response == null) return;
        presentation = JsonUtility.FromJson<Presentation>(environment.Eval<string>("JSON.stringify(globalThis.fidelityPresentation(JSON.parse(" + Quote(rawTsResponse) + ").view," + Quote(geometry.variant) + "))", "fidelity-presentation"));
        if (presentation == null) throw new InvalidDataException("Shared display projection unavailable.");
        updatingInput = true; try { search.text = response.view.query ?? ""; } finally { updatingInput = false; }
        SetText("coins", presentation.coins); SetText("summary", presentation.summary); SetText("detailTitle", presentation.detailTitle); SetText("rarity", presentation.rarity); SetText("description", presentation.description); SetText("itemNote", presentation.note);
        FitCanonicalDescription();
        controls["itemNote"].visible = !string.IsNullOrEmpty(presentation.note);
        controls["stats-background-mask"].visible = !presentation.selectedSword;
        for (int i = 0; i < 3; i++)
        {
            string key = new[] { "attack", "crit", "durability" }[i]; var label = controls["stat-label-" + key]; var value = controls["stat_" + key]; bool visible = presentation.stats != null && i < presentation.stats.Length;
            label.visible = value.visible = visible; label.text = visible ? presentation.stats[i].label : ""; value.text = visible ? presentation.stats[i].value : "";
            var icon = main.GetChild("art_" + new[] { "statAttack", "statCrit", "statDurability" }[i]); if (icon != null) icon.visible = presentation.selectedSword;
        }
        var selected = response.view.selected; var detail = controls["detailIcon"].asLoader;
        detail.fill = FillType.Scale; detail.align = AlignType.Center; detail.verticalAlign = VertAlignType.Middle;
        detail.url = selected == null ? null : presentation.selectedSword ? skins["detailSword"].url : resources.details[selected.iconIndex].url;
        SetButtonState("primary", presentation.primaryText, presentation.primaryEnabled); SetButtonState("sell", presentation.sellText, presentation.sellEnabled);
        foreach (string category in Categories) SetButtonBackground(controls["tab_" + category].asCom, response.view.category == category ? "tabSelectedBg" : "tabNormalBg");
        SetText("sort", response.view.sort == "default" ? "稀有度" : SortLabels[Math.Max(0, Array.IndexOf(Sorts, response.view.sort))]);
        controls["capacity-fill"].asLoader.url = skins["progressFill"].url; controls["capacity-fill"].width = geometry.progressMaximum * Mathf.Min(1f, (float)response.view.usedSlots / response.view.capacity);
        RenderSlots(); metrics.renders++;
    }
    void RenderSlots()
    {
        var items = response.view.visible;
        while (slots.Count > items.Length) { int last = slots.Count - 1; slots[last].Dispose(); slots.RemoveAt(last); }
        for (int i = 0; i < items.Length; i++)
        {
            GComponent slot;
            if (i < slots.Count) slot = slots[i]; else { slot = Component(UIPackage.CreateObjectFromURL("ui://invtest1cxslot01"), "ItemSlot"); slotsRoot.AddChild(slot); slots.Add(slot); slot.onClick.Add(() => Ui("select", "{\"id\":" + Quote(slot.data as string) + "}")); metrics.slotObjectsCreated++; }
            var item = items[i]; var r = geometry.slots[i % 24]; var source = resources.tiles[item.iconIndex]; slot.data = item.id; slot.SetXY(r.x - geometry.gridBounds.x, r.y - geometry.gridBounds.y); slot.SetSize(r.width, r.height);
            foreach (string name in new[] { "border", "tile", "label", "selected" }) slot.GetChild(name).visible = false;
            var image = slot.GetChild("icon").asLoader; image.SetXY(0, 0); image.SetSize(r.width, r.height); image.fill = FillType.ScaleFree; image.url = source.url; image.touchable = false;
            var q = source.quantityRect; var mask = slot.GetChild("quantityMask").asGraph; mask.SetXY(q.x * r.width / source.width, q.y * r.height / source.height); mask.DrawRect(q.width * r.width / source.width, q.height * r.height / source.height, 0, Color.clear, Hex("#050e14")); mask.touchable = false;
            var text = slot.GetChild("quantity").asTextField; bool narrow = geometry.variant == "narrow";
            text.SetXY(geometry.mode == "canonical" ? mask.x - 20 : narrow ? 3 : Mathf.Max(0, r.width - 48), geometry.mode == "canonical" ? mask.y - 5 : r.height - (narrow ? 22 : 25));
            text.SetSize(geometry.mode == "canonical" ? mask.width + 18 : narrow ? Mathf.Max(16, r.width - 6) : 42, geometry.mode == "canonical" ? 28 : narrow ? 22 : 24);
            Style(text, geometry.quantityFontSize, "#f0eee0", "Times New Roman", false, AlignType.Right, VertAlignType.Middle, 0, true); text.text = item.quantity.ToString(); text.touchable = false;
            var selected = slot.GetChild("selectedFrame").asLoader; selected.visible = item.id == response.view.selectedId; selected.url = skins["slotSelectedFrame"].url; selected.fill = FillType.ScaleFree;
            selected.SetXY(-5 * r.width / source.width, -5 * r.height / source.height); selected.SetSize(skins["slotSelectedFrame"].width * r.width / source.width, skins["slotSelectedFrame"].height * r.height / source.height); selected.touchable = false;
            metrics.slotRenderCalls++;
        }
    }
    void SetButtonState(string name, string text, bool enabled)
    {
        var button = controls[name].asCom; button.text = text; button.touchable = enabled; button.grayed = !enabled;
        if (geometry.mode != "adaptive") { var original = skins[name == "primary" ? "compass" : "sellCoins"]; var originalIcon = button.GetChild("icon").asLoader; originalIcon.visible = true; originalIcon.url = original.url; originalIcon.fill = FillType.ScaleFree; originalIcon.SetXY(original.sourceRect.x - button.x, original.sourceRect.y - button.y); originalIcon.SetSize(original.width, original.height); return; }
        string iconKey = name == "primary" ? "compassAlpha" : "sellCoinsAlpha"; var source = skins[iconKey]; var icon = button.GetChild("icon").asLoader; icon.visible = true; icon.url = source.url; icon.fill = FillType.Scale; icon.align = AlignType.Center; icon.verticalAlign = VertAlignType.Middle;
        var title = button.GetChild("title").asTextField; float textWidth = Mathf.Ceil(title.textWidth + 8),iconHeight = button.height * (name == "primary" ? 39f / 64 : 33f / 62),iconWidth = iconHeight * source.width / source.height,start = (button.width - iconWidth - 12 - textWidth) / 2;
        icon.SetXY(start, (button.height - iconHeight) / 2); icon.SetSize(iconWidth, iconHeight); title.SetXY(start + iconWidth + 12, 0); title.SetSize(textWidth, button.height);
    }
    void SetText(string name, string value) { controls[name].text = value ?? ""; }
    void FitCanonicalDescription()
    {
        if (geometry.mode != "canonical") return;
        var text = controls["description"].asTextField; float baseline = text.height;
        foreach (var node in geometry.controls) if (node.name == "description") { baseline = node.height; break; }
        // Native font line metrics differ from CSS. Keep shared coordinates, font and full text.
        text.height = baseline;
        float needed = Mathf.Ceil(text.textHeight) + 4,cap = controls["primary"].y - text.y - 12;
        text.height = Mathf.Max(baseline, Mathf.Min(needed, cap));
    }
    void Ui(string op, string args = "{}") { try { ExecuteOperation(op, args); } catch (Exception e) { RecordError(op, e); } }
    public string ExecuteVerification(string op, string argsJson = "{}") { ExecuteOperation(op, argsJson); WriteEvidence(); return SnapshotJson(); }
    void ExecuteOperation(string op, string args)
    {
        lastOperation = op;
        if (op == "open") { Open(); return; } if (op == "close") { Close(); return; }
        if (op == "snapshot") return;
        if (op == "resize") { var a = JsonUtility.FromJson<UiArgs>(args); if (a.width < 300 || a.height < 500) throw new ArgumentOutOfRangeException("resize"); Screen.SetResolution(a.width, a.height, FullScreenMode.Windowed); return; }
        if (op == "scroll") return; // Exact24 fixed components; this adapter does not claim virtualization.
        if (op == "click-control") { var a = JsonUtility.FromJson<UiArgs>(args); string name = a.name ?? ""; if (name.StartsWith("popup:")) { name = name.Substring(6); if (name == "progress" || name == "claim") name = "reward-" + name; } GObject obj; if (name == "launch") obj = launch; else controls.TryGetValue(name, out obj); if (obj == null || !obj.visible || !obj.touchable) throw new InvalidOperationException("Control unavailable: " + a.name); obj.onClick.Call(); return; }
        if (op == "select-slot") { var a = JsonUtility.FromJson<UiArgs>(args); foreach (var slot in slots) if ((string)slot.data == a.id) { slot.onClick.Call(); return; } throw new InvalidOperationException("Visible slot missing: " + a.id); }
        if (op == "confirm") { var id = pendingSellId; ClosePopup(); if (id != null) ExecuteOperation("sell", "{\"id\":" + Quote(id) + ",\"quantity\":1}"); return; }
        if (op == "cancel") { ClosePopup(); return; }
        if (op == "popup" || op == "reward" || op == "rewards") { ShowRewards(); return; }
        if (op == "menu") { ToggleMenu(); return; }
        if (op == "sell-confirm") { var item = response.view.selected; if (item != null) { ShowPopup("确认出售", "出售「" + item.name + "」 ×1\n获得 " + item.price + " 金币。", false); pendingSellId = item.id; } return; }
        if (op == "primary") { var item = response.view.selected; if (item == null) return; ExecuteOperation(item.equipped ? "unequip" : item.type == "equipment" ? "equip" : "use", item.equipped ? "{\"slot\":" + Quote(item.slot) + "}" : "{\"id\":" + Quote(item.id) + "}"); return; }
        if (op == "save-file") { var saved = Dispatch("save"); if (saved.ok) { Directory.CreateDirectory(Application.persistentDataPath); File.WriteAllText(SavePath, saved.result.json, new UTF8Encoding(false)); metrics.fileSaves++; notice = "背包已保存"; } Render(); return; }
        if (op == "load-file") { if (!File.Exists(SavePath)) { notice = "尚无保存的背包"; return; } var loaded = Dispatch("load", "{\"json\":" + Quote(File.ReadAllText(SavePath, Encoding.UTF8)) + "}"); if (loaded.ok) metrics.fileLoads++; Render(); return; }
        if (op == "claim-first") { foreach (var item in response.view.rewards.items) if (item.state == "ready") { ExecuteOperation("claim", "{\"id\":" + Quote(item.id) + "}"); return; } return; }
        var result = Dispatch(op, args); notice = result.ok ? result.result != null ? result.result.message ?? "" : "" : result.error; Render();
        if (popup != null && (op == "progress" || op == "claim")) ShowRewards(notice);
    }
    void ClosePopup() { pendingSellId = null; Forget(popup); if (popup != null) popup.Dispose(); popup = null; if (shade != null) shade.Dispose(); shade = null; }
    void CloseMenu() { Forget(menu); if (menu != null) menu.Dispose(); menu = null; }
    void Forget(GComponent owner) { if (owner == null) return; var remove = new List<string>(); foreach (var pair in controls) { GObject parent = pair.Value; while (parent != null) { if (parent == owner) { remove.Add(pair.Key); break; } parent = parent.parent; } } foreach (string key in remove) controls.Remove(key); }
    void ShowPopup(string title, string body, bool rewards)
    {
        ClosePopup(); CloseMenu(); if (main == null) return;
        float cw = geometry.designWidth,ch = geometry.designHeight; bool compact = cw < 620; float w = Mathf.Min(586, cw - 24),h = Mathf.Min(compact ? 450 : 390, ch - 24),x = (cw - w) / 2,y = (ch - h) / 2,inset = compact ? 20 : 50,bw = compact ? (w - 52) / 2 : 220,second = compact ? inset + bw + 12 : 316;
        shade = new GGraph(); shade.DrawRect(cw, ch, 0, Color.clear, new Color(0, 0, 0, .78f)); main.AddChild(shade);
        popup = new GComponent(); popup.name = "popup"; popup.SetXY(x, y); popup.SetSize(w, h); main.AddChild(popup); var bg = new GGraph(); bg.DrawRect(w, h, 2, Hex("#b29b6b"), Hex("#07151f")); popup.AddChild(bg);
        var heading = NewText("popup-title", title, popup, compact ? 26 : 32, "#f2dcb3"); heading.SetXY(compact ? 20 : 28, 24); heading.SetSize(w - (compact ? 40 : 56), 42);
        var text = NewText("popup-body", body, popup, compact ? 18 : 24, "#d5d3c7"); text.singleLine = false; text.verticalAlign = VertAlignType.Top; text.SetXY(compact ? 20 : 28, compact ? 76 : 83); text.SetSize(w - (compact ? 40 : 56), compact ? h - (rewards ? 236 : 166) : 210); var fmt = text.textFormat; fmt.lineSpacing = compact ? 6 : 8; text.textFormat = fmt;
        CreateButton("confirm", rewards ? "关闭" : "确认", new Box { x = inset, y = h - 72, width = bw, height = 48 }, "primaryBg", () => Ui("confirm"), compact ? 22 : 25, popup);
        CreateButton("cancel", rewards ? "返回" : "取消", new Box { x = second, y = h - 72, width = bw, height = 48 }, "secondaryBg", () => Ui("cancel"), compact ? 22 : 25, popup);
        if (rewards)
        {
            CreateButton("reward-progress", "推进进度", new Box { x = inset, y = h - (compact ? 142 : 180), width = bw, height = 42 }, "secondaryBg", () => Ui("progress"), compact ? 20 : 22, popup);
            var claim = CreateButton("reward-claim", "领取一项", new Box { x = compact ? second : w - 270, y = h - (compact ? 142 : 180), width = bw, height = 42 }, "secondaryBg", () => Ui("claim-first"), compact ? 20 : 22, popup);
            bool ready = false; foreach (var item in response.view.rewards.items) if (item.state == "ready") ready = true; claim.touchable = ready; claim.grayed = !ready;
        }
        metrics.popups++;
    }
    void ShowRewards(string message = "") { int locked = 0,ready = 0,claimed = 0; foreach (var item in response.view.rewards.items) { if (item.state == "locked") locked++; else if (item.state == "ready") ready++; else if (item.state == "claimed") claimed++; } ShowPopup("旅途奖励", (string.IsNullOrEmpty(message) ? "" : message + "\n") + "共30项：未达成 " + locked + " · 可领取 " + ready + " · 已领取 " + claimed + "\n每项奖励仅可领取一次，获得10金币。", true); }
    void ToggleMenu() { if (menu != null) { CloseMenu(); return; } OpenMenu(false); }
    void ShowSort() { CloseMenu(); OpenMenu(true); }
    void OpenMenu(bool sorting)
    {
        if (main == null) return; menu = new GComponent(); menu.name = sorting ? "sort-menu" : "menu-panel"; bool adaptive = geometry.mode == "adaptive";
        menu.SetXY(adaptive ? geometry.designWidth - (sorting ? 276 : 257) : sorting ? 1141 : 1200, adaptive ? geometry.designHeight - (sorting ? 336 : 228) : sorting ? 590 : 696); menu.SetSize(sorting ? 216 : 245, sorting ? 285 : 177); main.AddChild(menu);
        var bg = new GGraph(); bg.DrawRect(menu.width, menu.height, 1, Hex("#ab8a56"), Hex("#07151f")); menu.AddChild(bg);
        if (sorting) for (int i = 0; i < Sorts.Length; i++) { string sort = Sorts[i]; CreateButton("sort_" + sort, SortLabels[i] + (response.view.sort == sort ? " ✓" : ""), new Box { x = 6, y = 6 + i * 55, width = 204, height = 49 }, "secondaryBg", () => { CloseMenu(); Ui("sort", "{\"sort\":" + Quote(sort) + "}"); }, 23, menu); }
        else { string[] names = { "save", "load", "reward" },labels = { "保存背包", "恢复背包", "旅途奖励" }; for (int i = 0; i < 3; i++) { string op = names[i]; CreateButton("menu_" + op, labels[i], new Box { x = 8, y = 8 + i * 54, width = 229, height = 48 }, "secondaryBg", () => { CloseMenu(); Ui(op == "reward" ? "rewards" : op + "-file"); }, 23, menu); } }
    }
    GComponent CreateButton(string name, string title, Box box, string skin, Action action, int size, GComponent parent)
    {
        var button = Component(UIPackage.CreateObjectFromURL("ui://invtest1cxbtn001"), "ComplexBtn"); button.name = name; parent.AddChild(button); ConfigureButton(button, new Node { x = box.x, y = box.y, width = box.width, height = box.height, fontSize = size, labelRect = new Box { width = box.width, height = box.height } }, skin); button.text = title; button.onClick.Add(() => action()); controls[name] = button; return button;
    }
    void ConfigureButton(GComponent button, Node node, string skin)
    {
        Place(button, node); SetButtonBackground(button, skin); var title = button.GetChild("title").asTextField; var box = node.labelRect ?? new Box { width = node.width, height = node.height }; Place(title, box);
        Style(title, node.fontSize, skin == "primaryBg" ? "#251b0c" : "#e9dfc8", "SimSun", skin == "primaryBg", AlignType.Center, VertAlignType.Middle, 5, true); button.GetChild("icon").visible = false;
        if (node.name == "close" || node.name == "menu") { button.text = ""; title.text = ""; }
    }
    void SetButtonBackground(GComponent button, string skin) { var background = button.GetChild("btnbg").asLoader; background.SetXY(0, 0); background.SetSize(button.width, button.height); background.fill = FillType.ScaleFree; background.url = skins[skin].url; background.touchable = false; }
    static string ButtonSkin(string name) { if (name == "primary") return "primaryBg"; if (name == "sell") return "secondaryBg"; if (name == "sort") return "sortBg"; if (name == "close") return "close"; if (name == "menu") return "menu"; return "tabNormalBg"; }
    static string TextColor(string name) { if (name == "detailTitle") return "#eee2cb"; if (name == "rarity") return "#74c5e8"; if (name == "description" || name == "itemNote") return "#bec0ba"; if (name.StartsWith("stat-label")) return "#c9cbc6"; if (name.StartsWith("stat_")) return "#e4e4dc"; if (name == "coins") return "#f5e5c9"; if (name == "footer") return "#72818a"; return "#eee4ce"; }
    void SetArtAsset(GObject art, Resource asset, Node node, bool contain)
    {
        if (art.asImage != null) art.asImage.texture = UIPackage.GetItemAssetByURL(asset.url) as NTexture;
        else if (art.asLoader != null) { art.asLoader.url = asset.url; art.asLoader.fill = contain ? FillType.Scale : FillType.ScaleFree; }
        if (contain && art.asImage != null) { float scale = Mathf.Min(node.width / asset.width, node.height / asset.height),w = asset.width * scale,h = asset.height * scale; art.SetSize(w, h); art.SetXY(node.x + (node.align == "center" ? (node.width - w) / 2 : 0), node.y + (node.verticalAlign == "middle" ? (node.height - h) / 2 : 0)); }
    }
    static GTextField NewText(string name, string value, GComponent parent, int size, string color) { var text = new GTextField(); text.name = name; text.autoSize = AutoSizeType.None; parent.AddChild(text); Style(text, size, color, "SimSun", false, AlignType.Left, VertAlignType.Middle, 5, true); text.text = value; text.touchable = false; return text; }
    static void Style(GTextField text, float size, string color, string font, bool bold, AlignType align, VertAlignType vertical, float spacing, bool singleLine) { var f = text.textFormat; if (size > 0) f.size = Mathf.RoundToInt(size); f.font = font; f.color = Hex(color); f.bold = bold; f.align = align; f.lineSpacing = Mathf.RoundToInt(spacing); text.textFormat = f; text.verticalAlign = vertical; text.singleLine = singleLine; text.autoSize = AutoSizeType.None; }
    static void Place(GObject obj, Box box) { obj.SetXY(box.x, box.y); obj.SetSize(box.width, box.height); }
    static GComponent Component(GObject obj, string label) { if (obj == null || obj.asCom == null) throw new InvalidDataException("Missing component " + label); return obj.asCom; }
    static Color Hex(string value) { Color c; return ColorUtility.TryParseHtmlString(value, out c) ? c : Color.white; }
    static string Number(float value) { return value.ToString(CultureInfo.InvariantCulture); }
    static string Sha256(byte[] bytes) { using (var hash = SHA256.Create()) { return BitConverter.ToString(hash.ComputeHash(bytes)).Replace("-", "").ToLowerInvariant(); } }
    static string Quote(string value) { if (value == null) return "null"; var b = new StringBuilder("\""); foreach (char c in value) { switch (c) { case '"': b.Append("\\\""); break; case '\\': b.Append("\\\\"); break; case '\n': b.Append("\\n"); break; case '\r': b.Append("\\r"); break; case '\t': b.Append("\\t"); break; default: if (c < 32 || c == '\u2028' || c == '\u2029') b.Append("\\u" + ((int)c).ToString("x4")); else b.Append(c); break; } } return b.Append('"').ToString(); }
    void CaptureError(string message, string stack, LogType type) { if (type == LogType.Error || type == LogType.Exception || type == LogType.Assert) { string text = message + "\n" + stack; if (!errors.Contains(text) && errors.Count < 100) errors.Add(text); } }
    void RecordError(string op, Exception error) { string text = op + ": " + error; if (!errors.Contains(text) && errors.Count < 100) errors.Add(text); Debug.LogError(text); }
    void WriteEvidence() { if (string.IsNullOrWhiteSpace(verificationDirectory)) return; try { Directory.CreateDirectory(verificationDirectory); string json = SnapshotJson(); File.WriteAllText(Path.Combine(verificationDirectory, "latest-snapshot.json"), json, new UTF8Encoding(false)); File.AppendAllText(Path.Combine(verificationDirectory, "snapshots.jsonl"), json + Environment.NewLine, new UTF8Encoding(false)); metrics.evidenceWrites++; } catch (Exception e) { RecordError("evidence", e); } }
    void OnDestroy()
    {
        if (Instance != this || destroying) return; destroying = true; Ready = false;
        try { if (environment != null) Dispatch("close"); } catch (Exception e) { RecordError("destroy-close", e); }
        try { DisposeView(); if (launch != null) launch.Dispose(); launch = null; } catch (Exception e) { RecordError("destroy-ui", e); }
        try { if (environment != null) { environment.Dispose(); metrics.runtimeDisposals++; } } catch (Exception e) { RecordError("destroy-runtime", e); }
        finally { environment = null; WriteEvidence(); Application.logMessageReceived -= CaptureError; Instance = null; }
    }
    public string SnapshotJson()
    {
        var ui = new UiSnapshot { open = main != null, popup = popup != null, menu = menu != null, screenWidth = Screen.width, screenHeight = Screen.height, rootWidth = initialized && !destroying ? GRoot.inst.width : lastWidth, rootHeight = initialized && !destroying ? GRoot.inst.height : lastHeight, title = "旅者背包", virtualList = false, physicalRows = slots.Count, virtualItems = response != null ? response.view.visible.Length : 0, packageId = package != null ? package.id : "", mainResourceId = main != null ? main.packageItem.id : "", mainResourceUrl = main != null ? main.resourceURL : "", lastOperation = lastOperation, notice = notice, savePath = SavePath, fidelity = geometry };
        var positions = new List<ControlRect>(); foreach (var pair in controls) if (pair.Value != null && !pair.Value.isDisposed) positions.Add(Control(pair.Key, pair.Value, TextFitCap(pair.Key, pair.Value))); if (launch != null && !launch.isDisposed && !controls.ContainsKey("launch")) positions.Add(Control("launch", launch)); ui.controls = positions.ToArray();
        var rows = new List<SlotSnapshot>(); foreach (var slot in slots) rows.Add(new SlotSnapshot { id = slot.data as string, rect = RectOf(slot), quantity = slot.GetChild("quantity").text, selected = slot.GetChild("selectedFrame").visible, iconUrl = slot.GetChild("icon").asLoader.url }); ui.rows = rows.ToArray();
        if (main != null) { ui.inputText = search.text; ui.primaryText = controls["primary"].text; ui.detailIconUrl = controls["detailIcon"].asLoader.url; ui.detailTitle = controls["detailTitle"].text; ui.columns = geometry.columns; ui.cellSize = geometry.cellWidth; if (slots.Count > 0) ui.rowResourceId = slots[0].packageItem.id; }
        if (popup != null) { ui.popupTitle = popup.GetChild("popup-title").text; ui.popupBody = popup.GetChild("popup-body").text; }
        metrics.elapsedMs = lifetime.Elapsed.TotalMilliseconds; metrics.managedMemoryBytes = GC.GetTotalMemory(false); metrics.unityAllocatedBytes = Profiler.GetTotalAllocatedMemoryLong(); metrics.unityReservedBytes = Profiler.GetTotalReservedMemoryLong();
        return JsonUtility.ToJson(new HostSnapshot { ready = Ready, response = response, rawTsResponse = rawTsResponse, rawLayout = rawLayout, businessSha256 = businessSha256, layoutSha256 = layoutSha256, ui = ui, metrics = metrics, errors = errors.ToArray() });
    }
    static Box RectOf(GObject obj) { var rect = obj.LocalToGlobal(new Rect(0, 0, obj.width, obj.height)); float sx = Stage.inst.size.x > 0 ? Screen.width / Stage.inst.size.x : 1,sy = Stage.inst.size.y > 0 ? Screen.height / Stage.inst.size.y : 1; return new Box { x = rect.x * sx, y = rect.y * sy, width = rect.width * sx, height = rect.height * sy }; }
    float TextFitCap(string name, GObject obj) { if (name == "description" && controls.ContainsKey("primary")) return controls["primary"].y - obj.y - 12; if (name == "itemNote" && controls.ContainsKey("description")) return controls["description"].y - obj.y - 8; return obj.height; }
    static ControlRect Control(string name, GObject obj, float cap = 0) { var rect = RectOf(obj); var text = obj.asTextField; if (text == null && obj.asCom != null && obj.asCom.GetChild("title") != null) text = obj.asCom.GetChild("title").asTextField; float needed = text != null ? text.textHeight : 0; return new ControlRect { name = name, rect = rect, unityRect = new Box { x = rect.x, y = Screen.height - rect.y - rect.height, width = rect.width, height = rect.height }, visible = obj.visible, enabled = obj.touchable, text = obj.text, fontSize = text != null ? text.textFormat.size : 0, textWidth = text != null ? text.textWidth : 0, textHeight = needed, localWidth = obj.width, localHeight = obj.height, textFitCap = cap > 0 ? cap : obj.height, textNeededHeight = needed > 0 ? Mathf.Ceil(needed) + 4 : 0, textFits = needed <= obj.height + .1f }; }

    [Serializable] public class Box { public float x, y, width, height; }
    [Serializable] public sealed class Node : Box { public string name, asset, skin, fill, align, verticalAlign, url; public bool visible, button, graph, fillCenter, singleLine; public float fontSize, lineSpacing, border, sourceWidth, sourceHeight; public Box labelRect; }
    [Serializable] public sealed class Geometry { public int schemaVersion, columns, gap, quantityFontSize; public string mode, variant; public float width, height, designWidth, designHeight, scale, offsetX, offsetY, cellWidth, cellHeight, progressMaximum; public Box gridBounds; public Box[] slots; public Node[] controls, art; }
    [Serializable] public sealed class Resource { public string key, id, url, kind; public int index; public float width, height; public float[] scale9Grid, insets; public Box quantityRect, sourceRect; }
    [Serializable] public sealed class ResourceMap { public Resource[] skinEntries, tiles, details; }
    [Serializable] public sealed class Stat { public string key, label, value; }
    [Serializable] public sealed class Presentation { public string title, coins, summary, detailTitle, rarity, description, note, primaryText, sellText, selectedId; public int selectedIconIndex; public bool primaryEnabled, sellEnabled, selectedSword; public Stat[] stats; }
    [Serializable] public sealed class UiArgs { public int width, height; public string id, name; public float y; }
    [Serializable] public sealed class ItemStats { public int attack, defense, health, mana, stamina, crit, durability; }
    [Serializable] public sealed class Item { public string id, kind, name, type, rarity, description, slot, displayStats; public int iconIndex, quantity, price; public bool equipped; public ItemStats stats; }
    [Serializable] public sealed class Equipment { public Item weapon, offhand, head, body, feet, ring, neck; }
    [Serializable] public sealed class RewardItem { public string id, name, state, description; }
    [Serializable] public sealed class Rewards { public RewardItem[] items, visible; public long coins; public string query; }
    [Serializable] public sealed class AppView { public int schemaVersion, revision, capacity, usedSlots; public long coins; public Item[] items, visible; public string selectedId, query, category, sort; public Item selected; public Equipment equipment; public ItemStats equipmentStats; public Rewards rewards; }
    [Serializable] public sealed class AppSession { public bool open; public int listenerCount, notifications, opens, closes, closedCallbacks, listenerErrors; }
    [Serializable] public sealed class AppResult { public string json, message; public bool ok; }
    [Serializable] public sealed class AppResponse { public bool ok; public string op, error, errorCode; public AppResult result; public AppView view; public AppSession session; }
    [Serializable] public sealed class ControlRect { public string name, text; public bool visible, enabled, textFits; public int fontSize; public float textWidth, textHeight, localWidth, localHeight, textFitCap, textNeededHeight; public Box rect, unityRect; }
    [Serializable] public sealed class SlotSnapshot { public string id, iconUrl, quantity; public bool selected; public Box rect; }
    [Serializable] public sealed class UiSnapshot { public bool open, popup, menu, virtualList; public int screenWidth, screenHeight, physicalRows, virtualItems, columns; public float rootWidth, rootHeight, scrollY, cellSize; public string title, packageId, mainResourceId, mainResourceUrl, rowResourceId, inputText, primaryText, detailTitle, detailIconUrl, notice, savePath, lastOperation, popupTitle, popupBody; public Geometry fidelity; public ControlRect[] controls; public SlotSnapshot[] rows; }
    [Serializable] public sealed class HostSnapshot { public bool ready; public AppResponse response; public string rawTsResponse, rawLayout, businessSha256, layoutSha256; public UiSnapshot ui; public ComplexInventoryHost.Metrics metrics; public string[] errors; }
}
