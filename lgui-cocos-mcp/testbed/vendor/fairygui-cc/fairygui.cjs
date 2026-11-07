"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lgui-cocos-mcp/testbed/vendor/fairygui-cc/cc-env.cjs
var require_cc_env = __commonJS({
  "lgui-cocos-mcp/testbed/vendor/fairygui-cc/cc-env.cjs"(exports, module2) {
    "use strict";
    module2.exports = { EDITOR: false, PREVIEW: false, BUILD: true, MINIGAME: false };
  }
});

// ../../workspace/fairygui-cocos/sdk/source/dist/fairygui.mjs
var fairygui_exports = {};
__export(fairygui_exports, {
  AlignType: () => AlignType,
  AsyncOperation: () => AsyncOperation,
  AutoSizeType: () => AutoSizeType,
  BlendMode: () => BlendMode,
  ButtonMode: () => ButtonMode,
  ByteBuffer: () => ByteBuffer,
  ChildrenRenderOrder: () => ChildrenRenderOrder,
  Controller: () => Controller,
  DragDropManager: () => DragDropManager,
  EaseType: () => EaseType,
  Event: () => Event,
  FillMethod: () => FillMethod,
  FillOrigin: () => FillOrigin,
  FlipType: () => FlipType,
  GButton: () => GButton,
  GComboBox: () => GComboBox,
  GComponent: () => GComponent,
  GGraph: () => GGraph,
  GGroup: () => GGroup,
  GImage: () => GImage,
  GLabel: () => GLabel,
  GList: () => GList,
  GLoader: () => GLoader,
  GLoader3D: () => GLoader3D,
  GMovieClip: () => GMovieClip,
  GObject: () => GObject,
  GObjectPool: () => GObjectPool,
  GProgressBar: () => GProgressBar,
  GRichTextField: () => GRichTextField,
  GRoot: () => GRoot,
  GScrollBar: () => GScrollBar,
  GSlider: () => GSlider,
  GTextField: () => GTextField,
  GTextInput: () => GTextInput,
  GTree: () => GTree,
  GTreeNode: () => GTreeNode,
  GTween: () => GTween,
  GTweener: () => GTweener,
  GearAnimation: () => GearAnimation,
  GearBase: () => GearBase,
  GearColor: () => GearColor,
  GearDisplay: () => GearDisplay,
  GearDisplay2: () => GearDisplay2,
  GearFontSize: () => GearFontSize,
  GearIcon: () => GearIcon,
  GearLook: () => GearLook,
  GearSize: () => GearSize,
  GearText: () => GearText,
  GearXY: () => GearXY,
  GroupLayoutType: () => GroupLayoutType,
  Image: () => Image$1,
  ListLayoutType: () => ListLayoutType,
  ListSelectionMode: () => ListSelectionMode,
  LoaderFillType: () => LoaderFillType,
  MovieClip: () => MovieClip,
  ObjectPropID: () => ObjectPropID,
  ObjectType: () => ObjectType,
  OverflowType: () => OverflowType,
  PackageItem: () => PackageItem,
  PackageItemType: () => PackageItemType,
  PopupDirection: () => PopupDirection,
  PopupMenu: () => PopupMenu,
  ProgressTitleType: () => ProgressTitleType,
  RelationType: () => RelationType,
  ScrollBarDisplayType: () => ScrollBarDisplayType,
  ScrollPane: () => ScrollPane,
  ScrollType: () => ScrollType,
  Transition: () => Transition,
  TranslationHelper: () => TranslationHelper,
  UBBParser: () => UBBParser,
  UIConfig: () => UIConfig,
  UIObjectFactory: () => UIObjectFactory,
  UIPackage: () => UIPackage,
  VertAlignType: () => VertAlignType,
  Window: () => Window,
  XMLPackageReader: () => XMLPackageReader,
  registerFont: () => registerFont
});
module.exports = __toCommonJS(fairygui_exports);
var import_cc = require("cc");
var import_env = __toESM(require_cc_env(), 1);
var ButtonMode;
(function(ButtonMode2) {
  ButtonMode2[ButtonMode2["Common"] = 0] = "Common";
  ButtonMode2[ButtonMode2["Check"] = 1] = "Check";
  ButtonMode2[ButtonMode2["Radio"] = 2] = "Radio";
})(ButtonMode || (ButtonMode = {}));
var AutoSizeType;
(function(AutoSizeType2) {
  AutoSizeType2[AutoSizeType2["None"] = 0] = "None";
  AutoSizeType2[AutoSizeType2["Both"] = 1] = "Both";
  AutoSizeType2[AutoSizeType2["Height"] = 2] = "Height";
  AutoSizeType2[AutoSizeType2["Shrink"] = 3] = "Shrink";
})(AutoSizeType || (AutoSizeType = {}));
var AlignType;
(function(AlignType2) {
  AlignType2[AlignType2["Left"] = 0] = "Left";
  AlignType2[AlignType2["Center"] = 1] = "Center";
  AlignType2[AlignType2["Right"] = 2] = "Right";
})(AlignType || (AlignType = {}));
var VertAlignType;
(function(VertAlignType2) {
  VertAlignType2[VertAlignType2["Top"] = 0] = "Top";
  VertAlignType2[VertAlignType2["Middle"] = 1] = "Middle";
  VertAlignType2[VertAlignType2["Bottom"] = 2] = "Bottom";
})(VertAlignType || (VertAlignType = {}));
var LoaderFillType;
(function(LoaderFillType2) {
  LoaderFillType2[LoaderFillType2["None"] = 0] = "None";
  LoaderFillType2[LoaderFillType2["Scale"] = 1] = "Scale";
  LoaderFillType2[LoaderFillType2["ScaleMatchHeight"] = 2] = "ScaleMatchHeight";
  LoaderFillType2[LoaderFillType2["ScaleMatchWidth"] = 3] = "ScaleMatchWidth";
  LoaderFillType2[LoaderFillType2["ScaleFree"] = 4] = "ScaleFree";
  LoaderFillType2[LoaderFillType2["ScaleNoBorder"] = 5] = "ScaleNoBorder";
})(LoaderFillType || (LoaderFillType = {}));
var ListLayoutType;
(function(ListLayoutType2) {
  ListLayoutType2[ListLayoutType2["SingleColumn"] = 0] = "SingleColumn";
  ListLayoutType2[ListLayoutType2["SingleRow"] = 1] = "SingleRow";
  ListLayoutType2[ListLayoutType2["FlowHorizontal"] = 2] = "FlowHorizontal";
  ListLayoutType2[ListLayoutType2["FlowVertical"] = 3] = "FlowVertical";
  ListLayoutType2[ListLayoutType2["Pagination"] = 4] = "Pagination";
})(ListLayoutType || (ListLayoutType = {}));
var ListSelectionMode;
(function(ListSelectionMode2) {
  ListSelectionMode2[ListSelectionMode2["Single"] = 0] = "Single";
  ListSelectionMode2[ListSelectionMode2["Multiple"] = 1] = "Multiple";
  ListSelectionMode2[ListSelectionMode2["Multiple_SingleClick"] = 2] = "Multiple_SingleClick";
  ListSelectionMode2[ListSelectionMode2["None"] = 3] = "None";
})(ListSelectionMode || (ListSelectionMode = {}));
var OverflowType;
(function(OverflowType2) {
  OverflowType2[OverflowType2["Visible"] = 0] = "Visible";
  OverflowType2[OverflowType2["Hidden"] = 1] = "Hidden";
  OverflowType2[OverflowType2["Scroll"] = 2] = "Scroll";
})(OverflowType || (OverflowType = {}));
var PackageItemType;
(function(PackageItemType2) {
  PackageItemType2[PackageItemType2["Image"] = 0] = "Image";
  PackageItemType2[PackageItemType2["MovieClip"] = 1] = "MovieClip";
  PackageItemType2[PackageItemType2["Sound"] = 2] = "Sound";
  PackageItemType2[PackageItemType2["Component"] = 3] = "Component";
  PackageItemType2[PackageItemType2["Atlas"] = 4] = "Atlas";
  PackageItemType2[PackageItemType2["Font"] = 5] = "Font";
  PackageItemType2[PackageItemType2["Swf"] = 6] = "Swf";
  PackageItemType2[PackageItemType2["Misc"] = 7] = "Misc";
  PackageItemType2[PackageItemType2["Unknown"] = 8] = "Unknown";
  PackageItemType2[PackageItemType2["Spine"] = 9] = "Spine";
  PackageItemType2[PackageItemType2["DragonBones"] = 10] = "DragonBones";
})(PackageItemType || (PackageItemType = {}));
var ObjectType;
(function(ObjectType2) {
  ObjectType2[ObjectType2["Image"] = 0] = "Image";
  ObjectType2[ObjectType2["MovieClip"] = 1] = "MovieClip";
  ObjectType2[ObjectType2["Swf"] = 2] = "Swf";
  ObjectType2[ObjectType2["Graph"] = 3] = "Graph";
  ObjectType2[ObjectType2["Loader"] = 4] = "Loader";
  ObjectType2[ObjectType2["Group"] = 5] = "Group";
  ObjectType2[ObjectType2["Text"] = 6] = "Text";
  ObjectType2[ObjectType2["RichText"] = 7] = "RichText";
  ObjectType2[ObjectType2["InputText"] = 8] = "InputText";
  ObjectType2[ObjectType2["Component"] = 9] = "Component";
  ObjectType2[ObjectType2["List"] = 10] = "List";
  ObjectType2[ObjectType2["Label"] = 11] = "Label";
  ObjectType2[ObjectType2["Button"] = 12] = "Button";
  ObjectType2[ObjectType2["ComboBox"] = 13] = "ComboBox";
  ObjectType2[ObjectType2["ProgressBar"] = 14] = "ProgressBar";
  ObjectType2[ObjectType2["Slider"] = 15] = "Slider";
  ObjectType2[ObjectType2["ScrollBar"] = 16] = "ScrollBar";
  ObjectType2[ObjectType2["Tree"] = 17] = "Tree";
  ObjectType2[ObjectType2["Loader3D"] = 18] = "Loader3D";
})(ObjectType || (ObjectType = {}));
var ProgressTitleType;
(function(ProgressTitleType2) {
  ProgressTitleType2[ProgressTitleType2["Percent"] = 0] = "Percent";
  ProgressTitleType2[ProgressTitleType2["ValueAndMax"] = 1] = "ValueAndMax";
  ProgressTitleType2[ProgressTitleType2["Value"] = 2] = "Value";
  ProgressTitleType2[ProgressTitleType2["Max"] = 3] = "Max";
})(ProgressTitleType || (ProgressTitleType = {}));
var ScrollBarDisplayType;
(function(ScrollBarDisplayType2) {
  ScrollBarDisplayType2[ScrollBarDisplayType2["Default"] = 0] = "Default";
  ScrollBarDisplayType2[ScrollBarDisplayType2["Visible"] = 1] = "Visible";
  ScrollBarDisplayType2[ScrollBarDisplayType2["Auto"] = 2] = "Auto";
  ScrollBarDisplayType2[ScrollBarDisplayType2["Hidden"] = 3] = "Hidden";
})(ScrollBarDisplayType || (ScrollBarDisplayType = {}));
var ScrollType;
(function(ScrollType2) {
  ScrollType2[ScrollType2["Horizontal"] = 0] = "Horizontal";
  ScrollType2[ScrollType2["Vertical"] = 1] = "Vertical";
  ScrollType2[ScrollType2["Both"] = 2] = "Both";
})(ScrollType || (ScrollType = {}));
var FlipType;
(function(FlipType2) {
  FlipType2[FlipType2["None"] = 0] = "None";
  FlipType2[FlipType2["Horizontal"] = 1] = "Horizontal";
  FlipType2[FlipType2["Vertical"] = 2] = "Vertical";
  FlipType2[FlipType2["Both"] = 3] = "Both";
})(FlipType || (FlipType = {}));
var ChildrenRenderOrder;
(function(ChildrenRenderOrder2) {
  ChildrenRenderOrder2[ChildrenRenderOrder2["Ascent"] = 0] = "Ascent";
  ChildrenRenderOrder2[ChildrenRenderOrder2["Descent"] = 1] = "Descent";
  ChildrenRenderOrder2[ChildrenRenderOrder2["Arch"] = 2] = "Arch";
})(ChildrenRenderOrder || (ChildrenRenderOrder = {}));
var GroupLayoutType;
(function(GroupLayoutType2) {
  GroupLayoutType2[GroupLayoutType2["None"] = 0] = "None";
  GroupLayoutType2[GroupLayoutType2["Horizontal"] = 1] = "Horizontal";
  GroupLayoutType2[GroupLayoutType2["Vertical"] = 2] = "Vertical";
})(GroupLayoutType || (GroupLayoutType = {}));
var PopupDirection;
(function(PopupDirection2) {
  PopupDirection2[PopupDirection2["Auto"] = 0] = "Auto";
  PopupDirection2[PopupDirection2["Up"] = 1] = "Up";
  PopupDirection2[PopupDirection2["Down"] = 2] = "Down";
})(PopupDirection || (PopupDirection = {}));
var RelationType;
(function(RelationType2) {
  RelationType2[RelationType2["Left_Left"] = 0] = "Left_Left";
  RelationType2[RelationType2["Left_Center"] = 1] = "Left_Center";
  RelationType2[RelationType2["Left_Right"] = 2] = "Left_Right";
  RelationType2[RelationType2["Center_Center"] = 3] = "Center_Center";
  RelationType2[RelationType2["Right_Left"] = 4] = "Right_Left";
  RelationType2[RelationType2["Right_Center"] = 5] = "Right_Center";
  RelationType2[RelationType2["Right_Right"] = 6] = "Right_Right";
  RelationType2[RelationType2["Top_Top"] = 7] = "Top_Top";
  RelationType2[RelationType2["Top_Middle"] = 8] = "Top_Middle";
  RelationType2[RelationType2["Top_Bottom"] = 9] = "Top_Bottom";
  RelationType2[RelationType2["Middle_Middle"] = 10] = "Middle_Middle";
  RelationType2[RelationType2["Bottom_Top"] = 11] = "Bottom_Top";
  RelationType2[RelationType2["Bottom_Middle"] = 12] = "Bottom_Middle";
  RelationType2[RelationType2["Bottom_Bottom"] = 13] = "Bottom_Bottom";
  RelationType2[RelationType2["Width"] = 14] = "Width";
  RelationType2[RelationType2["Height"] = 15] = "Height";
  RelationType2[RelationType2["LeftExt_Left"] = 16] = "LeftExt_Left";
  RelationType2[RelationType2["LeftExt_Right"] = 17] = "LeftExt_Right";
  RelationType2[RelationType2["RightExt_Left"] = 18] = "RightExt_Left";
  RelationType2[RelationType2["RightExt_Right"] = 19] = "RightExt_Right";
  RelationType2[RelationType2["TopExt_Top"] = 20] = "TopExt_Top";
  RelationType2[RelationType2["TopExt_Bottom"] = 21] = "TopExt_Bottom";
  RelationType2[RelationType2["BottomExt_Top"] = 22] = "BottomExt_Top";
  RelationType2[RelationType2["BottomExt_Bottom"] = 23] = "BottomExt_Bottom";
  RelationType2[RelationType2["Size"] = 24] = "Size";
})(RelationType || (RelationType = {}));
var FillMethod;
(function(FillMethod2) {
  FillMethod2[FillMethod2["None"] = 0] = "None";
  FillMethod2[FillMethod2["Horizontal"] = 1] = "Horizontal";
  FillMethod2[FillMethod2["Vertical"] = 2] = "Vertical";
  FillMethod2[FillMethod2["Radial90"] = 3] = "Radial90";
  FillMethod2[FillMethod2["Radial180"] = 4] = "Radial180";
  FillMethod2[FillMethod2["Radial360"] = 5] = "Radial360";
})(FillMethod || (FillMethod = {}));
var FillOrigin;
(function(FillOrigin2) {
  FillOrigin2[FillOrigin2["Top"] = 0] = "Top";
  FillOrigin2[FillOrigin2["Bottom"] = 1] = "Bottom";
  FillOrigin2[FillOrigin2["Left"] = 2] = "Left";
  FillOrigin2[FillOrigin2["Right"] = 3] = "Right";
})(FillOrigin || (FillOrigin = {}));
var ObjectPropID;
(function(ObjectPropID2) {
  ObjectPropID2[ObjectPropID2["Text"] = 0] = "Text";
  ObjectPropID2[ObjectPropID2["Icon"] = 1] = "Icon";
  ObjectPropID2[ObjectPropID2["Color"] = 2] = "Color";
  ObjectPropID2[ObjectPropID2["OutlineColor"] = 3] = "OutlineColor";
  ObjectPropID2[ObjectPropID2["Playing"] = 4] = "Playing";
  ObjectPropID2[ObjectPropID2["Frame"] = 5] = "Frame";
  ObjectPropID2[ObjectPropID2["DeltaTime"] = 6] = "DeltaTime";
  ObjectPropID2[ObjectPropID2["TimeScale"] = 7] = "TimeScale";
  ObjectPropID2[ObjectPropID2["FontSize"] = 8] = "FontSize";
  ObjectPropID2[ObjectPropID2["Selected"] = 9] = "Selected";
})(ObjectPropID || (ObjectPropID = {}));
var BlendMode;
(function(BlendMode2) {
  BlendMode2[BlendMode2["Normal"] = 0] = "Normal";
  BlendMode2[BlendMode2["None"] = 1] = "None";
  BlendMode2[BlendMode2["Add"] = 2] = "Add";
  BlendMode2[BlendMode2["Multiply"] = 3] = "Multiply";
  BlendMode2[BlendMode2["Screen"] = 4] = "Screen";
  BlendMode2[BlendMode2["Erase"] = 5] = "Erase";
  BlendMode2[BlendMode2["Mask"] = 6] = "Mask";
  BlendMode2[BlendMode2["Below"] = 7] = "Below";
  BlendMode2[BlendMode2["Off"] = 8] = "Off";
  BlendMode2[BlendMode2["Custom1"] = 9] = "Custom1";
  BlendMode2[BlendMode2["Custom2"] = 10] = "Custom2";
  BlendMode2[BlendMode2["Custom3"] = 11] = "Custom3";
})(BlendMode || (BlendMode = {}));
var BlendModeUtils = class {
  static apply(node, blendMode) {
    let f = factors[blendMode];
    let renderers = node.getComponentsInChildren(import_cc.UIRenderer);
    renderers.forEach((element) => {
      element.srcBlendFactor = f[0];
      element.dstBlendFactor = f[1];
    });
  }
  static override(blendMode, srcFactor, dstFactor) {
    factors[blendMode][0] = srcFactor;
    factors[blendMode][1] = dstFactor;
  }
};
var factors = [
  [import_cc.gfx.BlendFactor.SRC_ALPHA, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA],
  //normal
  [import_cc.gfx.BlendFactor.ONE, import_cc.gfx.BlendFactor.ONE],
  //none
  [import_cc.gfx.BlendFactor.SRC_ALPHA, import_cc.gfx.BlendFactor.ONE],
  //add
  [import_cc.gfx.BlendFactor.DST_COLOR, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA],
  //mul
  [import_cc.gfx.BlendFactor.ONE, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_COLOR],
  //screen
  [import_cc.gfx.BlendFactor.ZERO, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA],
  //erase
  [import_cc.gfx.BlendFactor.ZERO, import_cc.gfx.BlendFactor.SRC_ALPHA],
  //mask
  [import_cc.gfx.BlendFactor.ONE_MINUS_DST_ALPHA, import_cc.gfx.BlendFactor.DST_ALPHA],
  //below
  [import_cc.gfx.BlendFactor.ONE, import_cc.gfx.BlendFactor.ZERO],
  //off
  [import_cc.gfx.BlendFactor.SRC_ALPHA, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA],
  //custom1
  [import_cc.gfx.BlendFactor.SRC_ALPHA, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA],
  //custom2
  [import_cc.gfx.BlendFactor.SRC_ALPHA, import_cc.gfx.BlendFactor.ONE_MINUS_SRC_ALPHA]
  //custom2
];
var Event = class extends import_cc.Event {
  constructor(type, bubbles) {
    super(type, bubbles);
    this.pos = new import_cc.Vec2();
    this.touchId = 0;
    this.clickCount = 0;
    this.button = 0;
    this.keyModifiers = 0;
    this.mouseWheelDelta = 0;
  }
  get sender() {
    return GObject.cast(this.currentTarget);
  }
  get isShiftDown() {
    return false;
  }
  get isCtrlDown() {
    return false;
  }
  captureTouch() {
    let obj = GObject.cast(this.currentTarget);
    if (obj)
      this._processor.addTouchMonitor(this.touchId, obj);
  }
};
Event.TOUCH_BEGIN = "fui_touch_begin";
Event.TOUCH_MOVE = "fui_touch_move";
Event.TOUCH_END = "fui_touch_end";
Event.CLICK = "fui_click";
Event.ROLL_OVER = "fui_roll_over";
Event.ROLL_OUT = "fui_roll_out";
Event.MOUSE_WHEEL = "fui_mouse_wheel";
Event.DISPLAY = "fui_display";
Event.UNDISPLAY = "fui_undisplay";
Event.GEAR_STOP = "fui_gear_stop";
Event.LINK = "fui_text_link";
Event.Submit = "editing-return";
Event.TEXT_CHANGE = "text-changed";
Event.STATUS_CHANGED = "fui_status_changed";
Event.XY_CHANGED = "fui_xy_changed";
Event.SIZE_CHANGED = "fui_size_changed";
Event.SIZE_DELAY_CHANGE = "fui_size_delay_change";
Event.DRAG_START = "fui_drag_start";
Event.DRAG_MOVE = "fui_drag_move";
Event.DRAG_END = "fui_drag_end";
Event.DROP = "fui_drop";
Event.SCROLL = "fui_scroll";
Event.SCROLL_END = "fui_scroll_end";
Event.PULL_DOWN_RELEASE = "fui_pull_down_release";
Event.PULL_UP_RELEASE = "fui_pull_up_release";
Event.CLICK_ITEM = "fui_click_item";
var eventPool = new Array();
function borrowEvent(type, bubbles) {
  let evt;
  if (eventPool.length) {
    evt = eventPool.pop();
    evt.type = type;
    evt.bubbles = bubbles;
  } else {
    evt = new Event(type, bubbles);
  }
  return evt;
}
function returnEvent(evt) {
  evt.initiator = null;
  evt.unuse();
  eventPool.push(evt);
}
var EaseType;
(function(EaseType2) {
  EaseType2[EaseType2["Linear"] = 0] = "Linear";
  EaseType2[EaseType2["SineIn"] = 1] = "SineIn";
  EaseType2[EaseType2["SineOut"] = 2] = "SineOut";
  EaseType2[EaseType2["SineInOut"] = 3] = "SineInOut";
  EaseType2[EaseType2["QuadIn"] = 4] = "QuadIn";
  EaseType2[EaseType2["QuadOut"] = 5] = "QuadOut";
  EaseType2[EaseType2["QuadInOut"] = 6] = "QuadInOut";
  EaseType2[EaseType2["CubicIn"] = 7] = "CubicIn";
  EaseType2[EaseType2["CubicOut"] = 8] = "CubicOut";
  EaseType2[EaseType2["CubicInOut"] = 9] = "CubicInOut";
  EaseType2[EaseType2["QuartIn"] = 10] = "QuartIn";
  EaseType2[EaseType2["QuartOut"] = 11] = "QuartOut";
  EaseType2[EaseType2["QuartInOut"] = 12] = "QuartInOut";
  EaseType2[EaseType2["QuintIn"] = 13] = "QuintIn";
  EaseType2[EaseType2["QuintOut"] = 14] = "QuintOut";
  EaseType2[EaseType2["QuintInOut"] = 15] = "QuintInOut";
  EaseType2[EaseType2["ExpoIn"] = 16] = "ExpoIn";
  EaseType2[EaseType2["ExpoOut"] = 17] = "ExpoOut";
  EaseType2[EaseType2["ExpoInOut"] = 18] = "ExpoInOut";
  EaseType2[EaseType2["CircIn"] = 19] = "CircIn";
  EaseType2[EaseType2["CircOut"] = 20] = "CircOut";
  EaseType2[EaseType2["CircInOut"] = 21] = "CircInOut";
  EaseType2[EaseType2["ElasticIn"] = 22] = "ElasticIn";
  EaseType2[EaseType2["ElasticOut"] = 23] = "ElasticOut";
  EaseType2[EaseType2["ElasticInOut"] = 24] = "ElasticInOut";
  EaseType2[EaseType2["BackIn"] = 25] = "BackIn";
  EaseType2[EaseType2["BackOut"] = 26] = "BackOut";
  EaseType2[EaseType2["BackInOut"] = 27] = "BackInOut";
  EaseType2[EaseType2["BounceIn"] = 28] = "BounceIn";
  EaseType2[EaseType2["BounceOut"] = 29] = "BounceOut";
  EaseType2[EaseType2["BounceInOut"] = 30] = "BounceInOut";
  EaseType2[EaseType2["Custom"] = 31] = "Custom";
})(EaseType || (EaseType = {}));
var GearBase = class _GearBase {
  dispose() {
    if (this._tweenConfig && this._tweenConfig._tweener) {
      this._tweenConfig._tweener.kill();
      this._tweenConfig._tweener = null;
    }
  }
  get controller() {
    return this._controller;
  }
  set controller(val) {
    if (val != this._controller) {
      this._controller = val;
      if (this._controller)
        this.init();
    }
  }
  get tweenConfig() {
    if (!this._tweenConfig)
      this._tweenConfig = new GearTweenConfig();
    return this._tweenConfig;
  }
  get allowTween() {
    return this._tweenConfig && this._tweenConfig.tween && constructingDepth.n == 0 && !_GearBase.disableAllTweenEffect;
  }
  setup(buffer) {
    this._controller = this._owner.parent.getControllerAt(buffer.readShort());
    this.init();
    var i;
    var page;
    var cnt = buffer.readShort();
    if ("pages" in this) {
      this.pages = buffer.readSArray(cnt);
    } else {
      for (i = 0; i < cnt; i++) {
        page = buffer.readS();
        if (page == null)
          continue;
        this.addStatus(page, buffer);
      }
      if (buffer.readBool())
        this.addStatus(null, buffer);
    }
    if (buffer.readBool()) {
      this._tweenConfig = new GearTweenConfig();
      this._tweenConfig.easeType = buffer.readByte();
      this._tweenConfig.duration = buffer.readFloat();
      this._tweenConfig.delay = buffer.readFloat();
    }
    if (buffer.version >= 2) {
      if ("positionsInPercent" in this) {
        if (buffer.readBool()) {
          this.positionsInPercent = true;
          for (i = 0; i < cnt; i++) {
            page = buffer.readS();
            if (page == null)
              continue;
            this.addExtStatus(page, buffer);
          }
          if (buffer.readBool())
            this.addExtStatus(null, buffer);
        }
      } else if ("condition" in this)
        this.condition = buffer.readByte();
    }
  }
  updateFromRelations(dx, dy) {
  }
  addStatus(pageId, buffer) {
  }
  init() {
  }
  apply() {
  }
  updateState() {
  }
};
var GearTweenConfig = class {
  constructor() {
    this.tween = true;
    this.easeType = EaseType.QuadOut;
    this.duration = 0.3;
    this.delay = 0;
  }
};
var GearAnimation = class extends GearBase {
  init() {
    this._default = {
      playing: this._owner.getProp(ObjectPropID.Playing),
      frame: this._owner.getProp(ObjectPropID.Frame)
    };
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else {
      gv = {};
      this._storage[pageId] = gv;
    }
    gv.playing = buffer.readBool();
    gv.frame = buffer.readInt();
  }
  apply() {
    this._owner._gearLocked = true;
    var gv = this._storage[this._controller.selectedPageId] || this._default;
    this._owner.setProp(ObjectPropID.Playing, gv.playing);
    this._owner.setProp(ObjectPropID.Frame, gv.frame);
    this._owner._gearLocked = false;
  }
  updateState() {
    var gv = this._storage[this._controller.selectedPageId];
    if (!gv) {
      gv = {};
      this._storage[this._controller.selectedPageId] = gv;
    }
    gv.playing = this._owner.getProp(ObjectPropID.Playing);
    gv.frame = this._owner.getProp(ObjectPropID.Frame);
  }
};
var GearColor = class extends GearBase {
  init() {
    this._default = {
      color: this._owner.getProp(ObjectPropID.Color),
      strokeColor: this._owner.getProp(ObjectPropID.OutlineColor)
    };
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else {
      gv = {};
      this._storage[pageId] = gv;
    }
    gv.color = buffer.readColor();
    gv.strokeColor = buffer.readColor();
  }
  apply() {
    this._owner._gearLocked = true;
    var gv = this._storage[this._controller.selectedPageId] || this._default;
    this._owner.setProp(ObjectPropID.Color, gv.color);
    this._owner.setProp(ObjectPropID.OutlineColor, gv.strokeColor);
    this._owner._gearLocked = false;
  }
  updateState() {
    var gv = this._storage[this._controller.selectedPageId];
    if (!gv) {
      gv = {};
      this._storage[this._controller.selectedPageId] = gv;
    }
    gv.color = this._owner.getProp(ObjectPropID.Color);
    gv.strokeColor = this._owner.getProp(ObjectPropID.OutlineColor);
  }
};
var GearDisplay = class extends GearBase {
  constructor() {
    super(...arguments);
    this.pages = null;
    this._visible = 0;
    this._displayLockToken = 1;
  }
  init() {
    this.pages = null;
  }
  addLock() {
    this._visible++;
    return this._displayLockToken;
  }
  releaseLock(token) {
    if (token == this._displayLockToken)
      this._visible--;
  }
  get connected() {
    return this._controller == null || this._visible > 0;
  }
  apply() {
    this._displayLockToken++;
    if (this._displayLockToken <= 0)
      this._displayLockToken = 1;
    if (this.pages == null || this.pages.length == 0 || this.pages.indexOf(this._controller.selectedPageId) != -1)
      this._visible = 1;
    else
      this._visible = 0;
  }
};
var GearDisplay2 = class extends GearBase {
  constructor() {
    super(...arguments);
    this.pages = null;
    this.condition = 0;
    this._visible = 0;
  }
  init() {
    this.pages = null;
  }
  apply() {
    if (this.pages == null || this.pages.length == 0 || this.pages.indexOf(this._controller.selectedPageId) != -1)
      this._visible = 1;
    else
      this._visible = 0;
  }
  evaluate(connected) {
    var v = this._controller == null || this._visible > 0;
    if (this.condition == 0)
      v = v && connected;
    else
      v = v || connected;
    return v;
  }
};
var GearFontSize = class extends GearBase {
  constructor() {
    super(...arguments);
    this._default = 0;
  }
  init() {
    this._default = this._owner.getProp(ObjectPropID.FontSize);
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    if (!pageId)
      this._default = buffer.readInt();
    else
      this._storage[pageId] = buffer.readInt();
  }
  apply() {
    this._owner._gearLocked = true;
    var data = this._storage[this._controller.selectedPageId];
    if (data !== void 0)
      this._owner.setProp(ObjectPropID.FontSize, data);
    else
      this._owner.setProp(ObjectPropID.FontSize, this._default);
    this._owner._gearLocked = false;
  }
  updateState() {
    this._storage[this._controller.selectedPageId] = this._owner.getProp(ObjectPropID.FontSize);
  }
};
var GearIcon = class extends GearBase {
  init() {
    this._default = this._owner.icon;
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    if (!pageId)
      this._default = buffer.readS();
    else
      this._storage[pageId] = buffer.readS();
  }
  apply() {
    this._owner._gearLocked = true;
    var data = this._storage[this._controller.selectedPageId];
    if (data !== void 0)
      this._owner.icon = data;
    else
      this._owner.icon = this._default;
    this._owner._gearLocked = false;
  }
  updateState() {
    this._storage[this._controller.selectedPageId] = this._owner.icon;
  }
};
var Pool = class {
  constructor(type, init, reset) {
    this.pool = [];
    this._init = init;
    this._reset = reset;
    this._ct = type;
  }
  borrow(...argArray) {
    let ret;
    if (this.pool.length > 0)
      ret = this.pool.pop();
    else
      ret = new this._ct();
    if (this._init)
      this._init(ret, ...argArray);
    return ret;
  }
  returns(element) {
    if (Array.isArray(element)) {
      let count = element.length;
      for (let i = 0; i < count; i++) {
        let element2 = element[i];
        if (this._reset)
          this._reset(element2);
        this.pool.push(element2);
      }
      element.length = 0;
    } else {
      if (this._reset)
        this._reset(element);
      this.pool.push(element);
    }
  }
};
var _PiOver2 = Math.PI * 0.5;
var _TwoPi = Math.PI * 2;
function evaluateEase(easeType, time, duration, overshootOrAmplitude, period) {
  switch (easeType) {
    case EaseType.Linear:
      return time / duration;
    case EaseType.SineIn:
      return -Math.cos(time / duration * _PiOver2) + 1;
    case EaseType.SineOut:
      return Math.sin(time / duration * _PiOver2);
    case EaseType.SineInOut:
      return -0.5 * (Math.cos(Math.PI * time / duration) - 1);
    case EaseType.QuadIn:
      return (time /= duration) * time;
    case EaseType.QuadOut:
      return -(time /= duration) * (time - 2);
    case EaseType.QuadInOut:
      if ((time /= duration * 0.5) < 1)
        return 0.5 * time * time;
      return -0.5 * (--time * (time - 2) - 1);
    case EaseType.CubicIn:
      return (time /= duration) * time * time;
    case EaseType.CubicOut:
      return (time = time / duration - 1) * time * time + 1;
    case EaseType.CubicInOut:
      if ((time /= duration * 0.5) < 1)
        return 0.5 * time * time * time;
      return 0.5 * ((time -= 2) * time * time + 2);
    case EaseType.QuartIn:
      return (time /= duration) * time * time * time;
    case EaseType.QuartOut:
      return -((time = time / duration - 1) * time * time * time - 1);
    case EaseType.QuartInOut:
      if ((time /= duration * 0.5) < 1)
        return 0.5 * time * time * time * time;
      return -0.5 * ((time -= 2) * time * time * time - 2);
    case EaseType.QuintIn:
      return (time /= duration) * time * time * time * time;
    case EaseType.QuintOut:
      return (time = time / duration - 1) * time * time * time * time + 1;
    case EaseType.QuintInOut:
      if ((time /= duration * 0.5) < 1)
        return 0.5 * time * time * time * time * time;
      return 0.5 * ((time -= 2) * time * time * time * time + 2);
    case EaseType.ExpoIn:
      return time == 0 ? 0 : Math.pow(2, 10 * (time / duration - 1));
    case EaseType.ExpoOut:
      if (time == duration)
        return 1;
      return -Math.pow(2, -10 * time / duration) + 1;
    case EaseType.ExpoInOut:
      if (time == 0)
        return 0;
      if (time == duration)
        return 1;
      if ((time /= duration * 0.5) < 1)
        return 0.5 * Math.pow(2, 10 * (time - 1));
      return 0.5 * (-Math.pow(2, -10 * --time) + 2);
    case EaseType.CircIn:
      return -(Math.sqrt(1 - (time /= duration) * time) - 1);
    case EaseType.CircOut:
      return Math.sqrt(1 - (time = time / duration - 1) * time);
    case EaseType.CircInOut:
      if ((time /= duration * 0.5) < 1)
        return -0.5 * (Math.sqrt(1 - time * time) - 1);
      return 0.5 * (Math.sqrt(1 - (time -= 2) * time) + 1);
    case EaseType.ElasticIn:
      var s0;
      if (time == 0)
        return 0;
      if ((time /= duration) == 1)
        return 1;
      if (period == 0)
        period = duration * 0.3;
      if (overshootOrAmplitude < 1) {
        overshootOrAmplitude = 1;
        s0 = period / 4;
      } else
        s0 = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);
      return -(overshootOrAmplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s0) * _TwoPi / period));
    case EaseType.ElasticOut:
      var s1;
      if (time == 0)
        return 0;
      if ((time /= duration) == 1)
        return 1;
      if (period == 0)
        period = duration * 0.3;
      if (overshootOrAmplitude < 1) {
        overshootOrAmplitude = 1;
        s1 = period / 4;
      } else
        s1 = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);
      return overshootOrAmplitude * Math.pow(2, -10 * time) * Math.sin((time * duration - s1) * _TwoPi / period) + 1;
    case EaseType.ElasticInOut:
      var s;
      if (time == 0)
        return 0;
      if ((time /= duration * 0.5) == 2)
        return 1;
      if (period == 0)
        period = duration * (0.3 * 1.5);
      if (overshootOrAmplitude < 1) {
        overshootOrAmplitude = 1;
        s = period / 4;
      } else
        s = period / _TwoPi * Math.asin(1 / overshootOrAmplitude);
      if (time < 1)
        return -0.5 * (overshootOrAmplitude * Math.pow(2, 10 * (time -= 1)) * Math.sin((time * duration - s) * _TwoPi / period));
      return overshootOrAmplitude * Math.pow(2, -10 * (time -= 1)) * Math.sin((time * duration - s) * _TwoPi / period) * 0.5 + 1;
    case EaseType.BackIn:
      return (time /= duration) * time * ((overshootOrAmplitude + 1) * time - overshootOrAmplitude);
    case EaseType.BackOut:
      return (time = time / duration - 1) * time * ((overshootOrAmplitude + 1) * time + overshootOrAmplitude) + 1;
    case EaseType.BackInOut:
      if ((time /= duration * 0.5) < 1)
        return 0.5 * (time * time * (((overshootOrAmplitude *= 1.525) + 1) * time - overshootOrAmplitude));
      return 0.5 * ((time -= 2) * time * (((overshootOrAmplitude *= 1.525) + 1) * time + overshootOrAmplitude) + 2);
    case EaseType.BounceIn:
      return bounce_easeIn(time, duration);
    case EaseType.BounceOut:
      return bounce_easeOut(time, duration);
    case EaseType.BounceInOut:
      return bounce_easeInOut(time, duration);
    default:
      return -(time /= duration) * (time - 2);
  }
}
function bounce_easeIn(time, duration) {
  return 1 - bounce_easeOut(duration - time, duration);
}
function bounce_easeOut(time, duration) {
  if ((time /= duration) < 1 / 2.75) {
    return 7.5625 * time * time;
  }
  if (time < 2 / 2.75) {
    return 7.5625 * (time -= 1.5 / 2.75) * time + 0.75;
  }
  if (time < 2.5 / 2.75) {
    return 7.5625 * (time -= 2.25 / 2.75) * time + 0.9375;
  }
  return 7.5625 * (time -= 2.625 / 2.75) * time + 0.984375;
}
function bounce_easeInOut(time, duration) {
  if (time < duration * 0.5) {
    return bounce_easeIn(time * 2, duration) * 0.5;
  }
  return bounce_easeOut(time * 2 - duration, duration) * 0.5 + 0.5;
}
var TweenValue = class {
  constructor() {
    this.x = this.y = this.z = this.w = 0;
  }
  get color() {
    return (this.w << 24) + (this.x << 16) + (this.y << 8) + this.z;
  }
  set color(value) {
    this.x = (value & 16711680) >> 16;
    this.y = (value & 65280) >> 8;
    this.z = value & 255;
    this.w = (value & 4278190080) >> 24;
  }
  getField(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("Index out of bounds: " + index);
    }
  }
  setField(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      case 3:
        this.w = value;
        break;
      default:
        throw new Error("Index out of bounds: " + index);
    }
  }
  setZero() {
    this.x = this.y = this.z = this.w = 0;
  }
};
var s_vec2$5 = new import_cc.Vec2();
var GTweener = class {
  constructor() {
    this._delay = 0;
    this._duration = 0;
    this._breakpoint = 0;
    this._easeType = 0;
    this._easeOvershootOrAmplitude = 0;
    this._easePeriod = 0;
    this._repeat = 0;
    this._yoyo = false;
    this._timeScale = 1;
    this._snapping = false;
    this._startValue = new TweenValue();
    this._endValue = new TweenValue();
    this._value = new TweenValue();
    this._deltaValue = new TweenValue();
    this._reset();
  }
  setDelay(value) {
    this._delay = value;
    return this;
  }
  get delay() {
    return this._delay;
  }
  setDuration(value) {
    this._duration = value;
    return this;
  }
  get duration() {
    return this._duration;
  }
  setBreakpoint(value) {
    this._breakpoint = value;
    return this;
  }
  setEase(value) {
    this._easeType = value;
    return this;
  }
  setEasePeriod(value) {
    this._easePeriod = value;
    return this;
  }
  setEaseOvershootOrAmplitude(value) {
    this._easeOvershootOrAmplitude = value;
    return this;
  }
  setRepeat(repeat, yoyo) {
    this._repeat = repeat;
    this._yoyo = yoyo;
    return this;
  }
  get repeat() {
    return this._repeat;
  }
  setTimeScale(value) {
    this._timeScale = value;
    return this;
  }
  setSnapping(value) {
    this._snapping = value;
    return this;
  }
  setTarget(value, propType) {
    this._target = value;
    this._propType = propType;
    return this;
  }
  get target() {
    return this._target;
  }
  setPath(value) {
    this._path = value;
    return this;
  }
  setUserData(value) {
    this._userData = value;
    return this;
  }
  get userData() {
    return this._userData;
  }
  onUpdate(callback, target) {
    this._onUpdate = callback;
    this._onUpdateCaller = target;
    return this;
  }
  onStart(callback, target) {
    this._onStart = callback;
    this._onStartCaller = target;
    return this;
  }
  onComplete(callback, target) {
    this._onComplete = callback;
    this._onCompleteCaller = target;
    return this;
  }
  get startValue() {
    return this._startValue;
  }
  get endValue() {
    return this._endValue;
  }
  get value() {
    return this._value;
  }
  get deltaValue() {
    return this._deltaValue;
  }
  get normalizedTime() {
    return this._normalizedTime;
  }
  get completed() {
    return this._ended != 0;
  }
  get allCompleted() {
    return this._ended == 1;
  }
  setPaused(paused) {
    this._paused = paused;
    return this;
  }
  /**
   * seek position of the tween, in seconds.
   */
  seek(time) {
    if (this._killed)
      return;
    this._elapsedTime = time;
    if (this._elapsedTime < this._delay) {
      if (this._started)
        this._elapsedTime = this._delay;
      else
        return;
    }
    this.update();
  }
  kill(complete) {
    if (this._killed)
      return;
    if (complete) {
      if (this._ended == 0) {
        if (this._breakpoint >= 0)
          this._elapsedTime = this._delay + this._breakpoint;
        else if (this._repeat >= 0)
          this._elapsedTime = this._delay + this._duration * (this._repeat + 1);
        else
          this._elapsedTime = this._delay + this._duration * 2;
        this.update();
      }
      this.callCompleteCallback();
    }
    this._killed = true;
  }
  _to(start, end, duration) {
    this._valueSize = 1;
    this._startValue.x = start;
    this._endValue.x = end;
    this._value.x = start;
    this._duration = duration;
    return this;
  }
  _to2(start, start2, end, end2, duration) {
    this._valueSize = 2;
    this._startValue.x = start;
    this._endValue.x = end;
    this._startValue.y = start2;
    this._endValue.y = end2;
    this._value.x = start;
    this._value.y = start2;
    this._duration = duration;
    return this;
  }
  _to3(start, start2, start3, end, end2, end3, duration) {
    this._valueSize = 3;
    this._startValue.x = start;
    this._endValue.x = end;
    this._startValue.y = start2;
    this._endValue.y = end2;
    this._startValue.z = start3;
    this._endValue.z = end3;
    this._value.x = start;
    this._value.y = start2;
    this._value.z = start3;
    this._duration = duration;
    return this;
  }
  _to4(start, start2, start3, start4, end, end2, end3, end4, duration) {
    this._valueSize = 4;
    this._startValue.x = start;
    this._endValue.x = end;
    this._startValue.y = start2;
    this._endValue.y = end2;
    this._startValue.z = start3;
    this._endValue.z = end3;
    this._startValue.w = start4;
    this._endValue.w = end4;
    this._value.x = start;
    this._value.y = start2;
    this._value.z = start3;
    this._value.w = start4;
    this._duration = duration;
    return this;
  }
  _toColor(start, end, duration) {
    this._valueSize = 5;
    this._startValue.color = start;
    this._endValue.color = end;
    this._value.color = start;
    this._duration = duration;
    return this;
  }
  _shake(startX, startY, amplitude, duration) {
    this._valueSize = 6;
    this._startValue.x = startX;
    this._startValue.y = startY;
    this._startValue.w = amplitude;
    this._duration = duration;
    return this;
  }
  _init() {
    this._delay = 0;
    this._duration = 0;
    this._breakpoint = -1;
    this._easeType = EaseType.QuadOut;
    this._timeScale = 1;
    this._easePeriod = 0;
    this._easeOvershootOrAmplitude = 1.70158;
    this._snapping = false;
    this._repeat = 0;
    this._yoyo = false;
    this._valueSize = 0;
    this._started = false;
    this._paused = false;
    this._killed = false;
    this._elapsedTime = 0;
    this._normalizedTime = 0;
    this._ended = 0;
  }
  _reset() {
    this._target = null;
    this._propType = null;
    this._userData = null;
    this._path = null;
    this._onStart = this._onUpdate = this._onComplete = null;
    this._onStartCaller = this._onUpdateCaller = this._onCompleteCaller = null;
  }
  _update(dt) {
    if (this._timeScale != 1)
      dt *= this._timeScale;
    if (dt == 0)
      return;
    if (this._ended != 0) {
      this.callCompleteCallback();
      this._killed = true;
      return;
    }
    this._elapsedTime += dt;
    this.update();
    if (this._ended != 0) {
      if (!this._killed) {
        this.callCompleteCallback();
        this._killed = true;
      }
    }
  }
  update() {
    this._ended = 0;
    if (this._valueSize == 0) {
      if (this._elapsedTime >= this._delay + this._duration)
        this._ended = 1;
      return;
    }
    if (!this._started) {
      if (this._elapsedTime < this._delay)
        return;
      this._started = true;
      this.callStartCallback();
      if (this._killed)
        return;
    }
    var reversed = false;
    var tt = this._elapsedTime - this._delay;
    if (this._breakpoint >= 0 && tt >= this._breakpoint) {
      tt = this._breakpoint;
      this._ended = 2;
    }
    if (this._repeat != 0) {
      var round = Math.floor(tt / this._duration);
      tt -= this._duration * round;
      if (this._yoyo)
        reversed = round % 2 == 1;
      if (this._repeat > 0 && this._repeat - round < 0) {
        if (this._yoyo)
          reversed = this._repeat % 2 == 1;
        tt = this._duration;
        this._ended = 1;
      }
    } else if (tt >= this._duration) {
      tt = this._duration;
      this._ended = 1;
    }
    this._normalizedTime = evaluateEase(this._easeType, reversed ? this._duration - tt : tt, this._duration, this._easeOvershootOrAmplitude, this._easePeriod);
    this._value.setZero();
    this._deltaValue.setZero();
    if (this._valueSize == 6) {
      if (this._ended == 0) {
        var r = this._startValue.w * (1 - this._normalizedTime);
        var rx = r * (Math.random() > 0.5 ? 1 : -1);
        var ry = r * (Math.random() > 0.5 ? 1 : -1);
        this._deltaValue.x = rx;
        this._deltaValue.y = ry;
        this._value.x = this._startValue.x + rx;
        this._value.y = this._startValue.y + ry;
      } else {
        this._value.x = this._startValue.x;
        this._value.y = this._startValue.y;
      }
    } else if (this._path) {
      let pt = this._path.getPointAt(this._normalizedTime, s_vec2$5);
      if (this._snapping) {
        pt.x = Math.round(pt.x);
        pt.y = Math.round(pt.y);
      }
      this._deltaValue.x = pt.x - this._value.x;
      this._deltaValue.y = pt.y - this._value.y;
      this._value.x = pt.x;
      this._value.y = pt.y;
    } else {
      let cnt = Math.min(this._valueSize, 4);
      for (var i = 0; i < cnt; i++) {
        var n1 = this._startValue.getField(i);
        var n2 = this._endValue.getField(i);
        var f = n1 + (n2 - n1) * this._normalizedTime;
        if (this._snapping)
          f = Math.round(f);
        this._deltaValue.setField(i, f - this._value.getField(i));
        this._value.setField(i, f);
      }
    }
    if (this._target && this._propType) {
      if (this._propType instanceof Function) {
        switch (this._valueSize) {
          case 1:
            this._propType.call(this._target, this._value.x);
            break;
          case 2:
            this._propType.call(this._target, this._value.x, this._value.y);
            break;
          case 3:
            this._propType.call(this._target, this._value.x, this._value.y, this._value.z);
            break;
          case 4:
            this._propType.call(this._target, this._value.x, this._value.y, this._value.z, this._value.w);
            break;
          case 5:
            this._propType.call(this._target, this._value.color);
            break;
          case 6:
            this._propType.call(this._target, this._value.x, this._value.y);
            break;
        }
      } else {
        if (this._valueSize == 5)
          this._target[this._propType] = this._value.color;
        else
          this._target[this._propType] = this._value.x;
      }
    }
    this.callUpdateCallback();
  }
  callStartCallback() {
    if (this._onStart) {
      try {
        this._onStart.call(this._onStartCaller, this);
      } catch (err) {
        console.log("error in start callback > " + err);
      }
    }
  }
  callUpdateCallback() {
    if (this._onUpdate) {
      try {
        this._onUpdate.call(this._onUpdateCaller, this);
      } catch (err) {
        console.log("error in update callback > " + err);
      }
    }
  }
  callCompleteCallback() {
    if (this._onComplete) {
      try {
        this._onComplete.call(this._onCompleteCaller, this);
      } catch (err) {
        console.log("error in complete callback > " + err);
      }
    }
  }
};
var TweenManager = class _TweenManager {
  static createTween() {
    if (!_root) {
      _root = new import_cc.Node("[TweenManager]");
      import_cc.game.addPersistRootNode(_root);
      import_cc.director.getScheduler().schedule(_TweenManager.update, _root, 0, import_cc.macro.REPEAT_FOREVER, 0, false);
    }
    var tweener = _tweenerPool.borrow();
    _activeTweens[_totalActiveTweens++] = tweener;
    return tweener;
  }
  static isTweening(target, propType) {
    if (target == null)
      return false;
    var anyType = !propType;
    for (var i = 0; i < _totalActiveTweens; i++) {
      var tweener = _activeTweens[i];
      if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType))
        return true;
    }
    return false;
  }
  static killTweens(target, completed, propType) {
    if (target == null)
      return false;
    var flag = false;
    var cnt = _totalActiveTweens;
    var anyType = !propType;
    for (var i = 0; i < cnt; i++) {
      var tweener = _activeTweens[i];
      if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType)) {
        tweener.kill(completed);
        flag = true;
      }
    }
    return flag;
  }
  static getTween(target, propType) {
    if (target == null)
      return null;
    var cnt = _totalActiveTweens;
    var anyType = !propType;
    for (var i = 0; i < cnt; i++) {
      var tweener = _activeTweens[i];
      if (tweener && tweener.target == target && !tweener._killed && (anyType || tweener._propType == propType)) {
        return tweener;
      }
    }
    return null;
  }
  static update(dt) {
    let tweens = _activeTweens;
    var cnt = _totalActiveTweens;
    var freePosStart = -1;
    for (var i = 0; i < cnt; i++) {
      var tweener = tweens[i];
      if (tweener == null) {
        if (freePosStart == -1)
          freePosStart = i;
      } else if (tweener._killed) {
        tweener._reset();
        _tweenerPool.returns(tweener);
        tweens[i] = null;
        if (freePosStart == -1)
          freePosStart = i;
      } else {
        if (tweener._target && "isDisposed" in tweener._target && tweener._target.isDisposed)
          tweener._killed = true;
        else if (!tweener._paused)
          tweener._update(dt);
        if (freePosStart != -1) {
          tweens[freePosStart] = tweener;
          tweens[i] = null;
          freePosStart++;
        }
      }
    }
    if (freePosStart >= 0) {
      if (_totalActiveTweens != cnt) {
        var j = cnt;
        cnt = _totalActiveTweens - cnt;
        for (i = 0; i < cnt; i++)
          tweens[freePosStart++] = tweens[j++];
      }
      _totalActiveTweens = freePosStart;
    }
    return false;
  }
};
var _activeTweens = new Array();
var _tweenerPool = new Pool(GTweener, (e) => e._init(), (e) => e._reset());
var _totalActiveTweens = 0;
var _root;
var GTween = class {
  static to(start, end, duration) {
    return TweenManager.createTween()._to(start, end, duration);
  }
  static to2(start, start2, end, end2, duration) {
    return TweenManager.createTween()._to2(start, start2, end, end2, duration);
  }
  static to3(start, start2, start3, end, end2, end3, duration) {
    return TweenManager.createTween()._to3(start, start2, start3, end, end2, end3, duration);
  }
  static to4(start, start2, start3, start4, end, end2, end3, end4, duration) {
    return TweenManager.createTween()._to4(start, start2, start3, start4, end, end2, end3, end4, duration);
  }
  static toColor(start, end, duration) {
    return TweenManager.createTween()._toColor(start, end, duration);
  }
  static delayedCall(delay) {
    return TweenManager.createTween().setDelay(delay);
  }
  static shake(startX, startY, amplitude, duration) {
    return TweenManager.createTween()._shake(startX, startY, amplitude, duration);
  }
  static isTweening(target, propType) {
    return TweenManager.isTweening(target, propType);
  }
  static kill(target, complete, propType) {
    TweenManager.killTweens(target, complete, propType);
  }
  static getTween(target, propType) {
    return TweenManager.getTween(target, propType);
  }
};
GTween.catchCallbackExceptions = true;
var GearLook = class extends GearBase {
  init() {
    this._default = {
      alpha: this._owner.alpha,
      rotation: this._owner.rotation,
      grayed: this._owner.grayed,
      touchable: this._owner.touchable
    };
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else {
      gv = {};
      this._storage[pageId] = gv;
    }
    gv.alpha = buffer.readFloat();
    gv.rotation = buffer.readFloat();
    gv.grayed = buffer.readBool();
    gv.touchable = buffer.readBool();
  }
  apply() {
    var gv = this._storage[this._controller.selectedPageId] || this._default;
    if (this.allowTween) {
      this._owner._gearLocked = true;
      this._owner.grayed = gv.grayed;
      this._owner.touchable = gv.touchable;
      this._owner._gearLocked = false;
      if (this._tweenConfig._tweener) {
        if (this._tweenConfig._tweener.endValue.x != gv.alpha || this._tweenConfig._tweener.endValue.y != gv.rotation) {
          this._tweenConfig._tweener.kill(true);
          this._tweenConfig._tweener = null;
        } else
          return;
      }
      var a = gv.alpha != this._owner.alpha;
      var b = gv.rotation != this._owner.rotation;
      if (a || b) {
        if (this._owner.checkGearController(0, this._controller))
          this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
        this._tweenConfig._tweener = GTween.to2(this._owner.alpha, this._owner.rotation, gv.alpha, gv.rotation, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((a ? 1 : 0) + (b ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
      }
    } else {
      this._owner._gearLocked = true;
      this._owner.grayed = gv.grayed;
      this._owner.alpha = gv.alpha;
      this._owner.rotation = gv.rotation;
      this._owner.touchable = gv.touchable;
      this._owner._gearLocked = false;
    }
  }
  __tweenUpdate(tweener) {
    var flag = tweener.userData;
    this._owner._gearLocked = true;
    if ((flag & 1) != 0)
      this._owner.alpha = tweener.value.x;
    if ((flag & 2) != 0)
      this._owner.rotation = tweener.value.y;
    this._owner._gearLocked = false;
  }
  __tweenComplete() {
    if (this._tweenConfig._displayLockToken != 0) {
      this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
      this._tweenConfig._displayLockToken = 0;
    }
    this._tweenConfig._tweener = null;
  }
  updateState() {
    var gv = this._storage[this._controller.selectedPageId];
    if (!gv) {
      gv = {};
      this._storage[this._controller.selectedPageId] = gv;
    }
    gv.alpha = this._owner.alpha;
    gv.rotation = this._owner.rotation;
    gv.grayed = this._owner.grayed;
    gv.touchable = this._owner.touchable;
  }
};
var GearSize = class extends GearBase {
  init() {
    this._default = {
      width: this._owner.width,
      height: this._owner.height,
      scaleX: this._owner.scaleX,
      scaleY: this._owner.scaleY
    };
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else {
      gv = {};
      this._storage[pageId] = gv;
    }
    gv.width = buffer.readInt();
    gv.height = buffer.readInt();
    gv.scaleX = buffer.readFloat();
    gv.scaleY = buffer.readFloat();
  }
  apply() {
    var gv = this._storage[this._controller.selectedPageId] || this._default;
    if (this.allowTween) {
      if (this._tweenConfig._tweener) {
        if (this._tweenConfig._tweener.endValue.x != gv.width || this._tweenConfig._tweener.endValue.y != gv.height || this._tweenConfig._tweener.endValue.z != gv.scaleX || this._tweenConfig._tweener.endValue.w != gv.scaleY) {
          this._tweenConfig._tweener.kill(true);
          this._tweenConfig._tweener = null;
        } else
          return;
      }
      var a = gv.width != this._owner.width || gv.height != this._owner.height;
      var b = gv.scaleX != this._owner.scaleX || gv.scaleY != this._owner.scaleY;
      if (a || b) {
        if (this._owner.checkGearController(0, this._controller))
          this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
        this._tweenConfig._tweener = GTween.to4(this._owner.width, this._owner.height, this._owner.scaleX, this._owner.scaleY, gv.width, gv.height, gv.scaleX, gv.scaleY, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setUserData((a ? 1 : 0) + (b ? 2 : 0)).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
      }
    } else {
      this._owner._gearLocked = true;
      this._owner.setSize(gv.width, gv.height, this._owner.checkGearController(1, this._controller));
      this._owner.setScale(gv.scaleX, gv.scaleY);
      this._owner._gearLocked = false;
    }
  }
  __tweenUpdate(tweener) {
    var flag = tweener.userData;
    this._owner._gearLocked = true;
    if ((flag & 1) != 0)
      this._owner.setSize(tweener.value.x, tweener.value.y, this._owner.checkGearController(1, this._controller));
    if ((flag & 2) != 0)
      this._owner.setScale(tweener.value.z, tweener.value.w);
    this._owner._gearLocked = false;
  }
  __tweenComplete() {
    if (this._tweenConfig._displayLockToken != 0) {
      this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
      this._tweenConfig._displayLockToken = 0;
    }
    this._tweenConfig._tweener = null;
  }
  updateState() {
    var gv = this._storage[this._controller.selectedPageId];
    if (!gv) {
      gv = {};
      this._storage[this._controller.selectedPageId] = gv;
    }
    gv.width = this._owner.width;
    gv.height = this._owner.height;
    gv.scaleX = this._owner.scaleX;
    gv.scaleY = this._owner.scaleY;
  }
  updateFromRelations(dx, dy) {
    if (this._controller == null || this._storage == null)
      return;
    for (var key in this._storage) {
      var gv = this._storage[key];
      gv.width += dx;
      gv.height += dy;
    }
    this._default.width += dx;
    this._default.height += dy;
    this.updateState();
  }
};
var GearText = class extends GearBase {
  init() {
    this._default = this._owner.text;
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    if (pageId == null)
      this._default = buffer.readS();
    else
      this._storage[pageId] = buffer.readS();
  }
  apply() {
    this._owner._gearLocked = true;
    var data = this._storage[this._controller.selectedPageId];
    if (data !== void 0)
      this._owner.text = data;
    else
      this._owner.text = this._default;
    this._owner._gearLocked = false;
  }
  updateState() {
    this._storage[this._controller.selectedPageId] = this._owner.text;
  }
};
var GearXY = class extends GearBase {
  init() {
    this._default = {
      x: this._owner.x,
      y: this._owner.y,
      px: this._owner.x / this._owner.parent.width,
      py: this._owner.y / this._owner.parent.height
    };
    this._storage = {};
  }
  addStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else {
      gv = {};
      this._storage[pageId] = gv;
    }
    gv.x = buffer.readInt();
    gv.y = buffer.readInt();
  }
  addExtStatus(pageId, buffer) {
    var gv;
    if (!pageId)
      gv = this._default;
    else
      gv = this._storage[pageId];
    gv.px = buffer.readFloat();
    gv.py = buffer.readFloat();
  }
  apply() {
    var pt = this._storage[this._controller.selectedPageId] || this._default;
    var ex;
    var ey;
    if (this.positionsInPercent && this._owner.parent) {
      ex = pt.px * this._owner.parent.width;
      ey = pt.py * this._owner.parent.height;
    } else {
      ex = pt.x;
      ey = pt.y;
    }
    if (this.allowTween) {
      if (this._tweenConfig._tweener) {
        if (this._tweenConfig._tweener.endValue.x != ex || this._tweenConfig._tweener.endValue.y != ey) {
          this._tweenConfig._tweener.kill(true);
          this._tweenConfig._tweener = null;
        } else
          return;
      }
      var ox = this._owner.x;
      var oy = this._owner.y;
      if (ox != ex || oy != ey) {
        if (this._owner.checkGearController(0, this._controller))
          this._tweenConfig._displayLockToken = this._owner.addDisplayLock();
        this._tweenConfig._tweener = GTween.to2(ox, oy, ex, ey, this._tweenConfig.duration).setDelay(this._tweenConfig.delay).setEase(this._tweenConfig.easeType).setTarget(this).onUpdate(this.__tweenUpdate, this).onComplete(this.__tweenComplete, this);
      }
    } else {
      this._owner._gearLocked = true;
      this._owner.setPosition(ex, ey);
      this._owner._gearLocked = false;
    }
  }
  __tweenUpdate(tweener) {
    this._owner._gearLocked = true;
    this._owner.setPosition(tweener.value.x, tweener.value.y);
    this._owner._gearLocked = false;
  }
  __tweenComplete() {
    if (this._tweenConfig._displayLockToken != 0) {
      this._owner.releaseDisplayLock(this._tweenConfig._displayLockToken);
      this._tweenConfig._displayLockToken = 0;
    }
    this._tweenConfig._tweener = null;
  }
  updateState() {
    var pt = this._storage[this._controller.selectedPageId];
    if (!pt) {
      pt = {};
      this._storage[this._controller.selectedPageId] = pt;
    }
    pt.x = this._owner.x;
    pt.y = this._owner.y;
    pt.px = this._owner.x / this._owner.parent.width;
    pt.py = this._owner.y / this._owner.parent.height;
  }
  updateFromRelations(dx, dy) {
    if (this._controller == null || this._storage == null || this.positionsInPercent)
      return;
    for (var key in this._storage) {
      var pt = this._storage[key];
      pt.x += dx;
      pt.y += dy;
    }
    this._default.x += dx;
    this._default.y += dy;
    this.updateState();
  }
};
var RelationItem = class {
  constructor(owner) {
    this._owner = owner;
    this._defs = new Array();
  }
  get owner() {
    return this._owner;
  }
  set target(value) {
    if (this._target != value) {
      if (this._target)
        this.releaseRefTarget(this._target);
      this._target = value;
      if (this._target)
        this.addRefTarget(this._target);
    }
  }
  get target() {
    return this._target;
  }
  add(relationType, usePercent) {
    if (relationType == RelationType.Size) {
      this.add(RelationType.Width, usePercent);
      this.add(RelationType.Height, usePercent);
      return;
    }
    var length = this._defs.length;
    for (var i = 0; i < length; i++) {
      var def = this._defs[i];
      if (def.type == relationType)
        return;
    }
    this.internalAdd(relationType, usePercent);
  }
  internalAdd(relationType, usePercent) {
    if (relationType == RelationType.Size) {
      this.internalAdd(RelationType.Width, usePercent);
      this.internalAdd(RelationType.Height, usePercent);
      return;
    }
    var info = new RelationDef();
    info.percent = usePercent;
    info.type = relationType;
    info.axis = relationType <= RelationType.Right_Right || relationType == RelationType.Width || relationType >= RelationType.LeftExt_Left && relationType <= RelationType.RightExt_Right ? 0 : 1;
    this._defs.push(info);
  }
  remove(relationType) {
    if (relationType == RelationType.Size) {
      this.remove(RelationType.Width);
      this.remove(RelationType.Height);
      return;
    }
    var dc = this._defs.length;
    for (var k = 0; k < dc; k++) {
      if (this._defs[k].type == relationType) {
        this._defs.splice(k, 1);
        break;
      }
    }
  }
  copyFrom(source) {
    this.target = source.target;
    this._defs.length = 0;
    var length = source._defs.length;
    for (var i = 0; i < length; i++) {
      var info = source._defs[i];
      var info2 = new RelationDef();
      info2.copyFrom(info);
      this._defs.push(info2);
    }
  }
  dispose() {
    if (this._target) {
      this.releaseRefTarget(this._target);
      this._target = null;
    }
  }
  get isEmpty() {
    return this._defs.length == 0;
  }
  applyOnSelfResized(dWidth, dHeight, applyPivot) {
    var ox = this._owner.x;
    var oy = this._owner.y;
    var length = this._defs.length;
    for (var i = 0; i < length; i++) {
      var info = this._defs[i];
      switch (info.type) {
        case RelationType.Center_Center:
          this._owner.x -= (0.5 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
          break;
        case RelationType.Right_Center:
        case RelationType.Right_Left:
        case RelationType.Right_Right:
          this._owner.x -= (1 - (applyPivot ? this._owner.pivotX : 0)) * dWidth;
          break;
        case RelationType.Middle_Middle:
          this._owner.y -= (0.5 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
          break;
        case RelationType.Bottom_Middle:
        case RelationType.Bottom_Top:
        case RelationType.Bottom_Bottom:
          this._owner.y -= (1 - (applyPivot ? this._owner.pivotY : 0)) * dHeight;
          break;
      }
    }
    if (ox != this._owner.x || oy != this._owner.y) {
      ox = this._owner.x - ox;
      oy = this._owner.y - oy;
      this._owner.updateGearFromRelations(1, ox, oy);
      if (this._owner.parent) {
        var len = this._owner.parent._transitions.length;
        if (len > 0) {
          for (var i = 0; i < len; ++i) {
            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
          }
        }
      }
    }
  }
  applyOnXYChanged(info, dx, dy) {
    var tmp;
    switch (info.type) {
      case RelationType.Left_Left:
      case RelationType.Left_Center:
      case RelationType.Left_Right:
      case RelationType.Center_Center:
      case RelationType.Right_Left:
      case RelationType.Right_Center:
      case RelationType.Right_Right:
        this._owner.x += dx;
        break;
      case RelationType.Top_Top:
      case RelationType.Top_Middle:
      case RelationType.Top_Bottom:
      case RelationType.Middle_Middle:
      case RelationType.Bottom_Top:
      case RelationType.Bottom_Middle:
      case RelationType.Bottom_Bottom:
        this._owner.y += dy;
        break;
      case RelationType.Width:
      case RelationType.Height:
        break;
      case RelationType.LeftExt_Left:
      case RelationType.LeftExt_Right:
        if (this._owner != this._target.parent) {
          tmp = this._owner.xMin;
          this._owner.width = this._owner._rawWidth - dx;
          this._owner.xMin = tmp + dx;
        } else
          this._owner.width = this._owner._rawWidth - dx;
        break;
      case RelationType.RightExt_Left:
      case RelationType.RightExt_Right:
        if (this._owner != this._target.parent) {
          tmp = this._owner.xMin;
          this._owner.width = this._owner._rawWidth + dx;
          this._owner.xMin = tmp;
        } else
          this._owner.width = this._owner._rawWidth + dx;
        break;
      case RelationType.TopExt_Top:
      case RelationType.TopExt_Bottom:
        if (this._owner != this._target.parent) {
          tmp = this._owner.yMin;
          this._owner.height = this._owner._rawHeight - dy;
          this._owner.yMin = tmp + dy;
        } else
          this._owner.height = this._owner._rawHeight - dy;
        break;
      case RelationType.BottomExt_Top:
      case RelationType.BottomExt_Bottom:
        if (this._owner != this._target.parent) {
          tmp = this._owner.yMin;
          this._owner.height = this._owner._rawHeight + dy;
          this._owner.yMin = tmp;
        } else
          this._owner.height = this._owner._rawHeight + dy;
        break;
    }
  }
  applyOnSizeChanged(info) {
    var pos = 0, pivot = 0, delta = 0;
    var v, tmp;
    if (info.axis == 0) {
      if (this._target != this._owner.parent) {
        pos = this._target.x;
        if (this._target.pivotAsAnchor)
          pivot = this._target.pivotX;
      }
      if (info.percent) {
        if (this._targetWidth != 0)
          delta = this._target._width / this._targetWidth;
      } else
        delta = this._target._width - this._targetWidth;
    } else {
      if (this._target != this._owner.parent) {
        pos = this._target.y;
        if (this._target.pivotAsAnchor)
          pivot = this._target.pivotY;
      }
      if (info.percent) {
        if (this._targetHeight != 0)
          delta = this._target._height / this._targetHeight;
      } else
        delta = this._target._height - this._targetHeight;
    }
    switch (info.type) {
      case RelationType.Left_Left:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
        else if (pivot != 0)
          this._owner.x += delta * -pivot;
        break;
      case RelationType.Left_Center:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
        else
          this._owner.x += delta * (0.5 - pivot);
        break;
      case RelationType.Left_Right:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin - pos) * delta;
        else
          this._owner.x += delta * (1 - pivot);
        break;
      case RelationType.Center_Center:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth * 0.5 - pos) * delta - this._owner._rawWidth * 0.5;
        else
          this._owner.x += delta * (0.5 - pivot);
        break;
      case RelationType.Right_Left:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
        else if (pivot != 0)
          this._owner.x += delta * -pivot;
        break;
      case RelationType.Right_Center:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
        else
          this._owner.x += delta * (0.5 - pivot);
        break;
      case RelationType.Right_Right:
        if (info.percent)
          this._owner.xMin = pos + (this._owner.xMin + this._owner._rawWidth - pos) * delta - this._owner._rawWidth;
        else
          this._owner.x += delta * (1 - pivot);
        break;
      case RelationType.Top_Top:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
        else if (pivot != 0)
          this._owner.y += delta * -pivot;
        break;
      case RelationType.Top_Middle:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
        else
          this._owner.y += delta * (0.5 - pivot);
        break;
      case RelationType.Top_Bottom:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin - pos) * delta;
        else
          this._owner.y += delta * (1 - pivot);
        break;
      case RelationType.Middle_Middle:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight * 0.5 - pos) * delta - this._owner._rawHeight * 0.5;
        else
          this._owner.y += delta * (0.5 - pivot);
        break;
      case RelationType.Bottom_Top:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
        else if (pivot != 0)
          this._owner.y += delta * -pivot;
        break;
      case RelationType.Bottom_Middle:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
        else
          this._owner.y += delta * (0.5 - pivot);
        break;
      case RelationType.Bottom_Bottom:
        if (info.percent)
          this._owner.yMin = pos + (this._owner.yMin + this._owner._rawHeight - pos) * delta - this._owner._rawHeight;
        else
          this._owner.y += delta * (1 - pivot);
        break;
      case RelationType.Width:
        if (this._owner._underConstruct && this._owner == this._target.parent)
          v = this._owner.sourceWidth - this._target.initWidth;
        else
          v = this._owner._rawWidth - this._targetWidth;
        if (info.percent)
          v = v * delta;
        if (this._target == this._owner.parent) {
          if (this._owner.pivotAsAnchor) {
            tmp = this._owner.xMin;
            this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);
            this._owner.xMin = tmp;
          } else
            this._owner.setSize(this._target._width + v, this._owner._rawHeight, true);
        } else
          this._owner.width = this._target._width + v;
        break;
      case RelationType.Height:
        if (this._owner._underConstruct && this._owner == this._target.parent)
          v = this._owner.sourceHeight - this._target.initHeight;
        else
          v = this._owner._rawHeight - this._targetHeight;
        if (info.percent)
          v = v * delta;
        if (this._target == this._owner.parent) {
          if (this._owner.pivotAsAnchor) {
            tmp = this._owner.yMin;
            this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);
            this._owner.yMin = tmp;
          } else
            this._owner.setSize(this._owner._rawWidth, this._target._height + v, true);
        } else
          this._owner.height = this._target._height + v;
        break;
      case RelationType.LeftExt_Left:
        tmp = this._owner.xMin;
        if (info.percent)
          v = pos + (tmp - pos) * delta - tmp;
        else
          v = delta * -pivot;
        this._owner.width = this._owner._rawWidth - v;
        this._owner.xMin = tmp + v;
        break;
      case RelationType.LeftExt_Right:
        tmp = this._owner.xMin;
        if (info.percent)
          v = pos + (tmp - pos) * delta - tmp;
        else
          v = delta * (1 - pivot);
        this._owner.width = this._owner._rawWidth - v;
        this._owner.xMin = tmp + v;
        break;
      case RelationType.RightExt_Left:
        tmp = this._owner.xMin;
        if (info.percent)
          v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);
        else
          v = delta * -pivot;
        this._owner.width = this._owner._rawWidth + v;
        this._owner.xMin = tmp;
        break;
      case RelationType.RightExt_Right:
        tmp = this._owner.xMin;
        if (info.percent) {
          if (this._owner == this._target.parent) {
            if (this._owner._underConstruct)
              this._owner.width = pos + this._target._width - this._target._width * pivot + (this._owner.sourceWidth - pos - this._target.initWidth + this._target.initWidth * pivot) * delta;
            else
              this._owner.width = pos + (this._owner._rawWidth - pos) * delta;
          } else {
            v = pos + (tmp + this._owner._rawWidth - pos) * delta - (tmp + this._owner._rawWidth);
            this._owner.width = this._owner._rawWidth + v;
            this._owner.xMin = tmp;
          }
        } else {
          if (this._owner == this._target.parent) {
            if (this._owner._underConstruct)
              this._owner.width = this._owner.sourceWidth + (this._target._width - this._target.initWidth) * (1 - pivot);
            else
              this._owner.width = this._owner._rawWidth + delta * (1 - pivot);
          } else {
            v = delta * (1 - pivot);
            this._owner.width = this._owner._rawWidth + v;
            this._owner.xMin = tmp;
          }
        }
        break;
      case RelationType.TopExt_Top:
        tmp = this._owner.yMin;
        if (info.percent)
          v = pos + (tmp - pos) * delta - tmp;
        else
          v = delta * -pivot;
        this._owner.height = this._owner._rawHeight - v;
        this._owner.yMin = tmp + v;
        break;
      case RelationType.TopExt_Bottom:
        tmp = this._owner.yMin;
        if (info.percent)
          v = pos + (tmp - pos) * delta - tmp;
        else
          v = delta * (1 - pivot);
        this._owner.height = this._owner._rawHeight - v;
        this._owner.yMin = tmp + v;
        break;
      case RelationType.BottomExt_Top:
        tmp = this._owner.yMin;
        if (info.percent)
          v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);
        else
          v = delta * -pivot;
        this._owner.height = this._owner._rawHeight + v;
        this._owner.yMin = tmp;
        break;
      case RelationType.BottomExt_Bottom:
        tmp = this._owner.yMin;
        if (info.percent) {
          if (this._owner == this._target.parent) {
            if (this._owner._underConstruct)
              this._owner.height = pos + this._target._height - this._target._height * pivot + (this._owner.sourceHeight - pos - this._target.initHeight + this._target.initHeight * pivot) * delta;
            else
              this._owner.height = pos + (this._owner._rawHeight - pos) * delta;
          } else {
            v = pos + (tmp + this._owner._rawHeight - pos) * delta - (tmp + this._owner._rawHeight);
            this._owner.height = this._owner._rawHeight + v;
            this._owner.yMin = tmp;
          }
        } else {
          if (this._owner == this._target.parent) {
            if (this._owner._underConstruct)
              this._owner.height = this._owner.sourceHeight + (this._target._height - this._target.initHeight) * (1 - pivot);
            else
              this._owner.height = this._owner._rawHeight + delta * (1 - pivot);
          } else {
            v = delta * (1 - pivot);
            this._owner.height = this._owner._rawHeight + v;
            this._owner.yMin = tmp;
          }
        }
        break;
    }
  }
  addRefTarget(target) {
    if (target != this._owner.parent)
      target.on(Event.XY_CHANGED, this.__targetXYChanged, this);
    target.on(Event.SIZE_CHANGED, this.__targetSizeChanged, this);
    target.on(Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
    this._targetX = this._target.x;
    this._targetY = this._target.y;
    this._targetWidth = this._target._width;
    this._targetHeight = this._target._height;
  }
  releaseRefTarget(target) {
    if (!target.node)
      return;
    target.off(Event.XY_CHANGED, this.__targetXYChanged, this);
    target.off(Event.SIZE_CHANGED, this.__targetSizeChanged, this);
    target.off(Event.SIZE_DELAY_CHANGE, this.__targetSizeWillChange, this);
  }
  __targetXYChanged(evt) {
    if (this._owner.relations.handling != null || this._owner.group != null && this._owner.group._updating) {
      this._targetX = this._target.x;
      this._targetY = this._target.y;
      return;
    }
    this._owner.relations.handling = this._target;
    var ox = this._owner.x;
    var oy = this._owner.y;
    var dx = this._target.x - this._targetX;
    var dy = this._target.y - this._targetY;
    var length = this._defs.length;
    for (var i = 0; i < length; i++) {
      var info = this._defs[i];
      this.applyOnXYChanged(info, dx, dy);
    }
    this._targetX = this._target.x;
    this._targetY = this._target.y;
    if (ox != this._owner.x || oy != this._owner.y) {
      ox = this._owner.x - ox;
      oy = this._owner.y - oy;
      this._owner.updateGearFromRelations(1, ox, oy);
      if (this._owner.parent) {
        var len = this._owner.parent._transitions.length;
        if (len > 0) {
          for (var i = 0; i < len; ++i) {
            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
          }
        }
      }
    }
    this._owner.relations.handling = null;
  }
  __targetSizeChanged(evt) {
    if (this._owner.relations.handling != null)
      return;
    this._owner.relations.handling = this._target;
    var ox = this._owner.x;
    var oy = this._owner.y;
    var ow = this._owner._rawWidth;
    var oh = this._owner._rawHeight;
    var length = this._defs.length;
    for (var i = 0; i < length; i++) {
      var info = this._defs[i];
      this.applyOnSizeChanged(info);
    }
    this._targetWidth = this._target._width;
    this._targetHeight = this._target._height;
    if (ox != this._owner.x || oy != this._owner.y) {
      ox = this._owner.x - ox;
      oy = this._owner.y - oy;
      this._owner.updateGearFromRelations(1, ox, oy);
      if (this._owner.parent) {
        var len = this._owner.parent._transitions.length;
        if (len > 0) {
          for (var i = 0; i < len; ++i) {
            this._owner.parent._transitions[i].updateFromRelations(this._owner.id, ox, oy);
          }
        }
      }
    }
    if (ow != this._owner._rawWidth || oh != this._owner._rawHeight) {
      ow = this._owner._rawWidth - ow;
      oh = this._owner._rawHeight - oh;
      this._owner.updateGearFromRelations(2, ow, oh);
    }
    this._owner.relations.handling = null;
  }
  __targetSizeWillChange(evt) {
    this._owner.relations.sizeDirty = true;
  }
};
var RelationDef = class {
  constructor() {
    this.percent = false;
    this.type = 0;
    this.axis = 0;
  }
  copyFrom(source) {
    this.percent = source.percent;
    this.type = source.type;
    this.axis = source.axis;
  }
};
var Relations = class {
  constructor(owner) {
    this.sizeDirty = false;
    this._owner = owner;
    this._items = new Array();
  }
  add(target, relationType, usePercent) {
    var length = this._items.length;
    for (var i = 0; i < length; i++) {
      var item = this._items[i];
      if (item.target == target) {
        item.add(relationType, usePercent);
        return;
      }
    }
    var newItem = new RelationItem(this._owner);
    newItem.target = target;
    newItem.add(relationType, usePercent);
    this._items.push(newItem);
  }
  remove(target, relationType) {
    relationType = relationType || 0;
    var cnt = this._items.length;
    var i = 0;
    while (i < cnt) {
      var item = this._items[i];
      if (item.target == target) {
        item.remove(relationType);
        if (item.isEmpty) {
          item.dispose();
          this._items.splice(i, 1);
          cnt--;
        } else
          i++;
      } else
        i++;
    }
  }
  contains(target) {
    var length = this._items.length;
    for (var i = 0; i < length; i++) {
      var item = this._items[i];
      if (item.target == target)
        return true;
    }
    return false;
  }
  clearFor(target) {
    var cnt = this._items.length;
    var i = 0;
    while (i < cnt) {
      var item = this._items[i];
      if (item.target == target) {
        item.dispose();
        this._items.splice(i, 1);
        cnt--;
      } else
        i++;
    }
  }
  clearAll() {
    var length = this._items.length;
    for (var i = 0; i < length; i++) {
      var item = this._items[i];
      item.dispose();
    }
    this._items.length = 0;
  }
  copyFrom(source) {
    this.clearAll();
    var arr = source._items;
    var length = arr.length;
    for (var i = 0; i < length; i++) {
      var ri = arr[i];
      var item = new RelationItem(this._owner);
      item.copyFrom(ri);
      this._items.push(item);
    }
  }
  dispose() {
    this.clearAll();
  }
  onOwnerSizeChanged(dWidth, dHeight, applyPivot) {
    if (this._items.length == 0)
      return;
    var length = this._items.length;
    for (var i = 0; i < length; i++) {
      var item = this._items[i];
      item.applyOnSelfResized(dWidth, dHeight, applyPivot);
    }
  }
  ensureRelationsSizeCorrect() {
    if (this._items.length == 0)
      return;
    this.sizeDirty = false;
    var length = this._items.length;
    for (var i = 0; i < length; i++) {
      var item = this._items[i];
      item.target.ensureSizeCorrect();
    }
  }
  get empty() {
    return this._items.length == 0;
  }
  setup(buffer, parentToChild) {
    var cnt = buffer.readByte();
    var target;
    for (var i = 0; i < cnt; i++) {
      var targetIndex = buffer.readShort();
      if (targetIndex == -1)
        target = this._owner.parent;
      else if (parentToChild)
        target = this._owner.getChildAt(targetIndex);
      else
        target = this._owner.parent.getChildAt(targetIndex);
      var newItem = new RelationItem(this._owner);
      newItem.target = target;
      this._items.push(newItem);
      var cnt2 = buffer.readByte();
      for (var j = 0; j < cnt2; j++) {
        var rt = buffer.readByte();
        var usePercent = buffer.readBool();
        newItem.internalAdd(rt, usePercent);
      }
    }
  }
};
var UIConfig = class {
  constructor() {
  }
};
UIConfig.defaultFont = "Arial";
UIConfig.modalLayerColor = new import_cc.Color(51, 51, 51, 51);
UIConfig.buttonSoundVolumeScale = 1;
UIConfig.defaultScrollStep = 25;
UIConfig.defaultScrollDecelerationRate = 0.967;
UIConfig.defaultScrollBarDisplay = ScrollBarDisplayType.Visible;
UIConfig.defaultScrollTouchEffect = true;
UIConfig.defaultScrollBounceEffect = true;
UIConfig.defaultComboBoxVisibleItemCount = 10;
UIConfig.touchScrollSensitivity = 20;
UIConfig.touchDragSensitivity = 10;
UIConfig.clickDragSensitivity = 2;
UIConfig.bringWindowToFrontOnClick = true;
UIConfig.frameTimeForAsyncUIConstruction = 2e-3;
UIConfig.linkUnderline = true;
UIConfig.defaultUILayer = import_cc.Layers.Enum.UI_2D;
var _fontRegistry = {};
function registerFont(name, font, bundle) {
  if (font instanceof import_cc.Font)
    _fontRegistry[name] = font;
  else {
    (bundle || import_cc.resources).load(font || name, import_cc.Font, (err, asset) => {
      _fontRegistry[name] = asset;
    });
  }
}
function getFontByName(name) {
  return _fontRegistry[name];
}
var GObject = class _GObject {
  constructor() {
    this._x = 0;
    this._y = 0;
    this._alpha = 1;
    this._visible = true;
    this._touchable = true;
    this._skewX = 0;
    this._skewY = 0;
    this._sortingOrder = 0;
    this._internalVisible = true;
    this.sourceWidth = 0;
    this.sourceHeight = 0;
    this.initWidth = 0;
    this.initHeight = 0;
    this.minWidth = 0;
    this.minHeight = 0;
    this.maxWidth = 0;
    this.maxHeight = 0;
    this._width = 0;
    this._height = 0;
    this._rawWidth = 0;
    this._rawHeight = 0;
    this._underConstruct = false;
    this._sizePercentInGroup = 0;
    this._node = new import_cc.Node();
    this._uiTrans = this._node.addComponent(import_cc.UITransform);
    this._uiOpacity = this.node.addComponent(import_cc.UIOpacity);
    this._node["$gobj"] = this;
    this._node.layer = UIConfig.defaultUILayer;
    this._uiTrans.setAnchorPoint(0, 1);
    this._node.on(import_cc.Node.EventType.ANCHOR_CHANGED, this.handleAnchorChanged, this);
    this._id = this._node.uuid;
    this._name = "";
    this._relations = new Relations(this);
    this._gears = new Array(10);
    this._blendMode = BlendMode.Normal;
    this._partner = this._node.addComponent(GObjectPartner);
  }
  get id() {
    return this._id;
  }
  assignIdFromXML(id) {
    this._id = id;
  }
  get name() {
    return this._name;
  }
  set name(value) {
    this._name = value;
    this._node.name = value || "";
  }
  get x() {
    return this._x;
  }
  set x(value) {
    this.setPosition(value, this._y);
  }
  get y() {
    return this._y;
  }
  set y(value) {
    this.setPosition(this._x, value);
  }
  setPosition(xv, yv) {
    if (this._x != xv || this._y != yv) {
      var dx = xv - this._x;
      var dy = yv - this._y;
      this._x = xv;
      this._y = yv;
      this.handlePositionChanged();
      if (this instanceof GGroup)
        this.moveChildren(dx, dy);
      this.updateGear(1);
      if (this._parent && !("setVirtual" in this._parent)) {
        this._parent.setBoundsChangedFlag();
        if (this._group)
          this._group.setBoundsChangedFlag(true);
        this._node.emit(Event.XY_CHANGED, this);
      }
      if (_GObject.draggingObject == this && !s_dragging)
        this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);
    }
  }
  get xMin() {
    return this._pivotAsAnchor ? this._x - this._width * this._uiTrans.anchorX : this._x;
  }
  set xMin(value) {
    if (this._pivotAsAnchor)
      this.setPosition(value + this._width * this._uiTrans.anchorX, this._y);
    else
      this.setPosition(value, this._y);
  }
  get yMin() {
    return this._pivotAsAnchor ? this._y - this._height * (1 - this._uiTrans.anchorY) : this._y;
  }
  set yMin(value) {
    if (this._pivotAsAnchor)
      this.setPosition(this._x, value + this._height * (1 - this._uiTrans.anchorY));
    else
      this.setPosition(this._x, value);
  }
  get pixelSnapping() {
    return this._pixelSnapping;
  }
  set pixelSnapping(value) {
    if (this._pixelSnapping != value) {
      this._pixelSnapping = value;
      this.handlePositionChanged();
    }
  }
  center(restraint) {
    var r;
    if (this._parent)
      r = this.parent;
    else
      r = Decls$1.GRoot.inst;
    this.setPosition((r.width - this._width) / 2, (r.height - this._height) / 2);
    if (restraint) {
      this.addRelation(r, RelationType.Center_Center);
      this.addRelation(r, RelationType.Middle_Middle);
    }
  }
  get width() {
    this.ensureSizeCorrect();
    if (this._relations.sizeDirty)
      this._relations.ensureRelationsSizeCorrect();
    return this._width;
  }
  set width(value) {
    this.setSize(value, this._rawHeight);
  }
  get height() {
    this.ensureSizeCorrect();
    if (this._relations.sizeDirty)
      this._relations.ensureRelationsSizeCorrect();
    return this._height;
  }
  set height(value) {
    this.setSize(this._rawWidth, value);
  }
  setSize(wv, hv, ignorePivot) {
    if (this._rawWidth != wv || this._rawHeight != hv) {
      this._rawWidth = wv;
      this._rawHeight = hv;
      if (wv < this.minWidth)
        wv = this.minWidth;
      if (hv < this.minHeight)
        hv = this.minHeight;
      if (this.maxWidth > 0 && wv > this.maxWidth)
        wv = this.maxWidth;
      if (this.maxHeight > 0 && hv > this.maxHeight)
        hv = this.maxHeight;
      var dWidth = wv - this._width;
      var dHeight = hv - this._height;
      this._width = wv;
      this._height = hv;
      this.handleSizeChanged();
      if ((this._uiTrans.anchorX != 0 || this._uiTrans.anchorY != 1) && !this._pivotAsAnchor && !ignorePivot)
        this.setPosition(this.x - this._uiTrans.anchorX * dWidth, this.y - (1 - this._uiTrans.anchorY) * dHeight);
      else
        this.handlePositionChanged();
      if (this instanceof GGroup)
        this.resizeChildren(dWidth, dHeight);
      this.updateGear(2);
      if (this._parent) {
        this._relations.onOwnerSizeChanged(dWidth, dHeight, this._pivotAsAnchor || !ignorePivot);
        this._parent.setBoundsChangedFlag();
        if (this._group)
          this._group.setBoundsChangedFlag();
      }
      this._node.emit(Event.SIZE_CHANGED, this);
    }
  }
  makeFullScreen() {
    this.setSize(Decls$1.GRoot.inst.width, Decls$1.GRoot.inst.height);
  }
  ensureSizeCorrect() {
  }
  get actualWidth() {
    return this.width * Math.abs(this._node.scale.x);
  }
  get actualHeight() {
    return this.height * Math.abs(this._node.scale.y);
  }
  get scaleX() {
    return this._node.scale.x;
  }
  set scaleX(value) {
    this.setScale(value, this._node.scale.y);
  }
  get scaleY() {
    return this._node.scale.y;
  }
  set scaleY(value) {
    this.setScale(this._node.scale.x, value);
  }
  setScale(sx, sy) {
    if (this._node.scale.x != sx || this._node.scale.y != sy) {
      this._node.setScale(sx, sy);
      this.updateGear(2);
    }
  }
  get skewX() {
    return this._skewX;
  }
  get pivotX() {
    return this._uiTrans.anchorX;
  }
  set pivotX(value) {
    this._uiTrans.anchorX = value;
  }
  get pivotY() {
    return 1 - this._uiTrans.anchorY;
  }
  set pivotY(value) {
    this._uiTrans.anchorY = 1 - value;
  }
  setPivot(xv, yv, asAnchor) {
    if (this._uiTrans.anchorX != xv || this._uiTrans.anchorY != 1 - yv) {
      this._pivotAsAnchor = asAnchor;
      this._uiTrans.setAnchorPoint(xv, 1 - yv);
    } else if (this._pivotAsAnchor != asAnchor) {
      this._pivotAsAnchor = asAnchor;
      this.handlePositionChanged();
    }
  }
  get pivotAsAnchor() {
    return this._pivotAsAnchor;
  }
  get touchable() {
    return this._touchable;
  }
  set touchable(value) {
    if (this._touchable != value) {
      this._touchable = value;
      this.updateGear(3);
    }
  }
  get grayed() {
    return this._grayed;
  }
  set grayed(value) {
    if (this._grayed != value) {
      this._grayed = value;
      this.handleGrayedChanged();
      this.updateGear(3);
    }
  }
  get enabled() {
    return !this._grayed && this._touchable;
  }
  set enabled(value) {
    this.grayed = !value;
    this.touchable = value;
  }
  get rotation() {
    return -this._node.angle;
  }
  set rotation(value) {
    value = -value;
    if (this._node.angle != value) {
      this._node.angle = value;
      this.updateGear(3);
    }
  }
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    if (this._alpha != value) {
      this._alpha = value;
      this._uiOpacity.opacity = this._alpha * 255;
      if (this instanceof GGroup)
        this.handleAlphaChanged();
      this.updateGear(3);
    }
  }
  get visible() {
    return this._visible;
  }
  set visible(value) {
    if (this._visible != value) {
      this._visible = value;
      this.handleVisibleChanged();
      if (this._group && this._group.excludeInvisibles)
        this._group.setBoundsChangedFlag();
    }
  }
  get _finalVisible() {
    return this._visible && this._internalVisible && (!this._group || this._group._finalVisible);
  }
  get internalVisible3() {
    return this._visible && this._internalVisible;
  }
  get sortingOrder() {
    return this._sortingOrder;
  }
  set sortingOrder(value) {
    if (value < 0)
      value = 0;
    if (this._sortingOrder != value) {
      var old = this._sortingOrder;
      this._sortingOrder = value;
      if (this._parent)
        this._parent.childSortingOrderChanged(this, old, this._sortingOrder);
    }
  }
  requestFocus() {
  }
  get tooltips() {
    return this._tooltips;
  }
  set tooltips(value) {
    if (this._tooltips) {
      this._node.off(Event.ROLL_OVER, this.onRollOver, this);
      this._node.off(Event.ROLL_OUT, this.onRollOut, this);
    }
    this._tooltips = value;
    if (this._tooltips) {
      this._node.on(Event.ROLL_OVER, this.onRollOver, this);
      this._node.on(Event.ROLL_OUT, this.onRollOut, this);
    }
  }
  get blendMode() {
    return this._blendMode;
  }
  set blendMode(value) {
    if (this._blendMode != value) {
      this._blendMode = value;
      BlendModeUtils.apply(this._node, value);
    }
  }
  get onStage() {
    return this._node && this._node.activeInHierarchy;
  }
  get resourceURL() {
    if (this.packageItem)
      return "ui://" + this.packageItem.owner.id + this.packageItem.id;
    else
      return null;
  }
  set group(value) {
    if (this._group != value) {
      if (this._group)
        this._group.setBoundsChangedFlag();
      this._group = value;
      if (this._group)
        this._group.setBoundsChangedFlag();
    }
  }
  get group() {
    return this._group;
  }
  getGear(index) {
    var gear = this._gears[index];
    if (!gear)
      this._gears[index] = gear = createGear(this, index);
    return gear;
  }
  updateGear(index) {
    if (this._underConstruct || this._gearLocked)
      return;
    var gear = this._gears[index];
    if (gear && gear.controller)
      gear.updateState();
  }
  checkGearController(index, c) {
    return this._gears[index] && this._gears[index].controller == c;
  }
  updateGearFromRelations(index, dx, dy) {
    if (this._gears[index])
      this._gears[index].updateFromRelations(dx, dy);
  }
  addDisplayLock() {
    var gearDisplay = this._gears[0];
    if (gearDisplay && gearDisplay.controller) {
      var ret = gearDisplay.addLock();
      this.checkGearDisplay();
      return ret;
    } else
      return 0;
  }
  releaseDisplayLock(token) {
    var gearDisplay = this._gears[0];
    if (gearDisplay && gearDisplay.controller) {
      gearDisplay.releaseLock(token);
      this.checkGearDisplay();
    }
  }
  checkGearDisplay() {
    if (this._handlingController)
      return;
    var connected = this._gears[0] == null || this._gears[0].connected;
    if (this._gears[8])
      connected = this._gears[8].evaluate(connected);
    if (connected != this._internalVisible) {
      this._internalVisible = connected;
      this.handleVisibleChanged();
      if (this._group && this._group.excludeInvisibles)
        this._group.setBoundsChangedFlag();
    }
  }
  get gearXY() {
    return this.getGear(1);
  }
  get gearSize() {
    return this.getGear(2);
  }
  get gearLook() {
    return this.getGear(3);
  }
  get relations() {
    return this._relations;
  }
  addRelation(target, relationType, usePercent) {
    this._relations.add(target, relationType, usePercent);
  }
  removeRelation(target, relationType) {
    this._relations.remove(target, relationType);
  }
  get node() {
    return this._node;
  }
  get parent() {
    return this._parent;
  }
  removeFromParent() {
    if (this._parent)
      this._parent.removeChild(this);
  }
  findParent() {
    if (this._parent)
      return this._parent;
    let pn = this._node.parent;
    while (pn) {
      let gobj = pn["$gobj"];
      if (gobj)
        return gobj;
      pn = pn.parent;
    }
    return null;
  }
  get asCom() {
    return this;
  }
  static cast(obj) {
    return obj["$gobj"];
  }
  get text() {
    return null;
  }
  set text(value) {
  }
  get icon() {
    return null;
  }
  set icon(value) {
  }
  get treeNode() {
    return this._treeNode;
  }
  get isDisposed() {
    return this._node == null;
  }
  dispose() {
    let n = this._node;
    if (!n)
      return;
    this.removeFromParent();
    this._relations.dispose();
    this._node = null;
    n.destroy();
    for (var i = 0; i < 10; i++) {
      var gear = this._gears[i];
      if (gear)
        gear.dispose();
    }
  }
  onEnable() {
  }
  onDisable() {
  }
  onUpdate() {
  }
  onDestroy() {
  }
  onClick(listener, target) {
    this._node.on(Event.CLICK, listener, target);
  }
  onceClick(listener, target) {
    this._node.once(Event.CLICK, listener, target);
  }
  offClick(listener, target) {
    this._node.off(Event.CLICK, listener, target);
  }
  clearClick() {
    this._node.off(Event.CLICK);
  }
  hasClickListener() {
    return this._node.hasEventListener(Event.CLICK);
  }
  on(type, listener, target) {
    if (type == Event.DISPLAY || type == Event.UNDISPLAY)
      this._partner._emitDisplayEvents = true;
    this._node.on(type, listener, target);
  }
  once(type, listener, target) {
    if (type == Event.DISPLAY || type == Event.UNDISPLAY)
      this._partner._emitDisplayEvents = true;
    this._node.once(type, listener, target);
  }
  off(type, listener, target) {
    this._node.off(type, listener, target);
  }
  get draggable() {
    return this._draggable;
  }
  set draggable(value) {
    if (this._draggable != value) {
      this._draggable = value;
      this.initDrag();
    }
  }
  get dragBounds() {
    return this._dragBounds;
  }
  set dragBounds(value) {
    this._dragBounds = value;
  }
  startDrag(touchId) {
    if (!this._node.activeInHierarchy)
      return;
    this.dragBegin(touchId);
  }
  stopDrag() {
    this.dragEnd();
  }
  get dragging() {
    return _GObject.draggingObject == this;
  }
  localToGlobal(ax, ay, result) {
    ax = ax || 0;
    ay = ay || 0;
    s_vec3$1.x = ax;
    s_vec3$1.y = -ay;
    if (!this._pivotAsAnchor) {
      s_vec3$1.x -= this._uiTrans.anchorX * this._width;
      s_vec3$1.y += (1 - this._uiTrans.anchorY) * this._height;
    }
    this._uiTrans.convertToWorldSpaceAR(s_vec3$1, s_vec3$1);
    s_vec3$1.y = Decls$1.GRoot.inst.height - s_vec3$1.y;
    result = result || new import_cc.Vec2();
    result.x = s_vec3$1.x;
    result.y = s_vec3$1.y;
    return result;
  }
  globalToLocal(ax, ay, result) {
    ax = ax || 0;
    ay = ay || 0;
    s_vec3$1.x = ax;
    s_vec3$1.y = Decls$1.GRoot.inst.height - ay;
    this._uiTrans.convertToNodeSpaceAR(s_vec3$1, s_vec3$1);
    if (!this._pivotAsAnchor) {
      s_vec3$1.x += this._uiTrans.anchorX * this._width;
      s_vec3$1.y -= (1 - this._uiTrans.anchorY) * this._height;
    }
    result = result || new import_cc.Vec2();
    result.x = s_vec3$1.x;
    result.y = -s_vec3$1.y;
    return result;
  }
  localToGlobalRect(ax, ay, aw, ah, result) {
    ax = ax || 0;
    ay = ay || 0;
    aw = aw || 0;
    ah = ah || 0;
    result = result || new import_cc.Rect();
    var pt = this.localToGlobal(ax, ay);
    result.x = pt.x;
    result.y = pt.y;
    pt = this.localToGlobal(ax + aw, ay + ah, pt);
    result.xMax = pt.x;
    result.yMax = pt.y;
    return result;
  }
  globalToLocalRect(ax, ay, aw, ah, result) {
    ax = ax || 0;
    ay = ay || 0;
    aw = aw || 0;
    ah = ah || 0;
    result = result || new import_cc.Rect();
    var pt = this.globalToLocal(ax, ay);
    result.x = pt.x;
    result.y = pt.y;
    pt = this.globalToLocal(ax + aw, ay + ah, pt);
    result.xMax = pt.x;
    result.yMax = pt.y;
    return result;
  }
  handleControllerChanged(c) {
    this._handlingController = true;
    for (var i = 0; i < 10; i++) {
      var gear = this._gears[i];
      if (gear && gear.controller == c)
        gear.apply();
    }
    this._handlingController = false;
    this.checkGearDisplay();
  }
  handleAnchorChanged() {
    this.handlePositionChanged();
  }
  handlePositionChanged() {
    var xv = this._x;
    var yv = -this._y;
    if (!this._pivotAsAnchor) {
      xv += this._uiTrans.anchorX * this._width;
      yv -= (1 - this._uiTrans.anchorY) * this._height;
    }
    if (this._pixelSnapping) {
      xv = Math.round(xv);
      yv = Math.round(yv);
    }
    this._node.setPosition(xv, yv);
  }
  handleSizeChanged() {
    this._uiTrans.setContentSize(this._width, this._height);
  }
  handleGrayedChanged() {
  }
  handleVisibleChanged() {
    this._node.active = this._finalVisible;
    if (this instanceof GGroup)
      this.handleVisibleChanged();
    if (this._parent)
      this._parent.setBoundsChangedFlag();
  }
  hitTest(globalPt, forTouch) {
    if (forTouch == null)
      forTouch = true;
    if (forTouch && (this._touchDisabled || !this._touchable || !this._node.activeInHierarchy))
      return null;
    if (!this._hitTestPt)
      this._hitTestPt = new import_cc.Vec2();
    this.globalToLocal(globalPt.x, globalPt.y, this._hitTestPt);
    if (this._pivotAsAnchor) {
      this._hitTestPt.x += this._uiTrans.anchorX * this._width;
      this._hitTestPt.y += (1 - this._uiTrans.anchorY) * this._height;
    }
    return this._hitTest(this._hitTestPt, globalPt);
  }
  _hitTest(pt, globalPt) {
    if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height)
      return this;
    else
      return null;
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Text:
        return this.text;
      case ObjectPropID.Icon:
        return this.icon;
      case ObjectPropID.Color:
        return null;
      case ObjectPropID.OutlineColor:
        return null;
      case ObjectPropID.Playing:
        return false;
      case ObjectPropID.Frame:
        return 0;
      case ObjectPropID.DeltaTime:
        return 0;
      case ObjectPropID.TimeScale:
        return 1;
      case ObjectPropID.FontSize:
        return 0;
      case ObjectPropID.Selected:
        return false;
      default:
        return void 0;
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Text:
        this.text = value;
        break;
      case ObjectPropID.Icon:
        this.icon = value;
        break;
    }
  }
  constructFromResource() {
  }
  setup_beforeAdd(buffer, beginPos) {
    buffer.seek(beginPos, 0);
    buffer.skip(5);
    var f1;
    var f2;
    this._id = buffer.readS();
    this.name = buffer.readS();
    f1 = buffer.readInt();
    f2 = buffer.readInt();
    this.setPosition(f1, f2);
    if (buffer.readBool()) {
      this.initWidth = buffer.readInt();
      this.initHeight = buffer.readInt();
      this.setSize(this.initWidth, this.initHeight, true);
    }
    if (buffer.readBool()) {
      this.minWidth = buffer.readInt();
      this.maxWidth = buffer.readInt();
      this.minHeight = buffer.readInt();
      this.maxHeight = buffer.readInt();
    }
    if (buffer.readBool()) {
      f1 = buffer.readFloat();
      f2 = buffer.readFloat();
      this.setScale(f1, f2);
    }
    if (buffer.readBool()) {
      f1 = buffer.readFloat();
      f2 = buffer.readFloat();
    }
    if (buffer.readBool()) {
      f1 = buffer.readFloat();
      f2 = buffer.readFloat();
      this.setPivot(f1, f2, buffer.readBool());
    }
    f1 = buffer.readFloat();
    if (f1 != 1)
      this.alpha = f1;
    f1 = buffer.readFloat();
    if (f1 != 0)
      this.rotation = f1;
    if (!buffer.readBool())
      this.visible = false;
    if (!buffer.readBool())
      this.touchable = false;
    if (buffer.readBool())
      this.grayed = true;
    this.blendMode = buffer.readByte();
    buffer.readByte();
    var str = buffer.readS();
    if (str != null)
      this.data = str;
  }
  setup_afterAdd(buffer, beginPos) {
    buffer.seek(beginPos, 1);
    var str = buffer.readS();
    if (str != null)
      this.tooltips = str;
    var groupId = buffer.readShort();
    if (groupId >= 0)
      this.group = this.parent.getChildAt(groupId);
    buffer.seek(beginPos, 2);
    var cnt = buffer.readShort();
    for (var i = 0; i < cnt; i++) {
      var nextPos = buffer.readShort();
      nextPos += buffer.position;
      var gear = this.getGear(buffer.readByte());
      gear.setup(buffer);
      buffer.position = nextPos;
    }
  }
  //toolTips support
  onRollOver() {
    Decls$1.GRoot.inst.showTooltips(this.tooltips);
  }
  onRollOut() {
    Decls$1.GRoot.inst.hideTooltips();
  }
  //drag support
  //-------------------------------------------------------------------
  initDrag() {
    if (this._draggable) {
      this.on(Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
      this.on(Event.TOUCH_MOVE, this.onTouchMove_0, this);
      this.on(Event.TOUCH_END, this.onTouchEnd_0, this);
    } else {
      this.off(Event.TOUCH_BEGIN, this.onTouchBegin_0, this);
      this.off(Event.TOUCH_MOVE, this.onTouchMove_0, this);
      this.off(Event.TOUCH_END, this.onTouchEnd_0, this);
    }
  }
  dragBegin(touchId) {
    if (_GObject.draggingObject) {
      let tmp = _GObject.draggingObject;
      tmp.stopDrag();
      _GObject.draggingObject = null;
      tmp._node.emit(Event.DRAG_END);
    }
    if (touchId == void 0)
      touchId = Decls$1.GRoot.inst.inputProcessor.getAllTouches()[0];
    sGlobalDragStart.set(Decls$1.GRoot.inst.getTouchPosition(touchId));
    this.localToGlobalRect(0, 0, this._width, this._height, sGlobalRect);
    _GObject.draggingObject = this;
    this._dragTesting = false;
    Decls$1.GRoot.inst.inputProcessor.addTouchMonitor(touchId, this);
    this.on(Event.TOUCH_MOVE, this.onTouchMove_0, this);
    this.on(Event.TOUCH_END, this.onTouchEnd_0, this);
  }
  dragEnd() {
    if (_GObject.draggingObject == this) {
      this._dragTesting = false;
      _GObject.draggingObject = null;
    }
    s_dragQuery = false;
  }
  onTouchBegin_0(evt) {
    if (this._dragStartPos == null)
      this._dragStartPos = new import_cc.Vec2();
    this._dragStartPos.set(evt.pos);
    this._dragTesting = true;
    evt.captureTouch();
  }
  onTouchMove_0(evt) {
    if (_GObject.draggingObject != this && this._draggable && this._dragTesting) {
      var sensitivity = UIConfig.touchDragSensitivity;
      if (this._dragStartPos && Math.abs(this._dragStartPos.x - evt.pos.x) < sensitivity && Math.abs(this._dragStartPos.y - evt.pos.y) < sensitivity)
        return;
      this._dragTesting = false;
      s_dragQuery = true;
      this._node.emit(Event.DRAG_START, evt);
      if (s_dragQuery)
        this.dragBegin(evt.touchId);
    }
    if (_GObject.draggingObject == this) {
      var xx = evt.pos.x - sGlobalDragStart.x + sGlobalRect.x;
      var yy = evt.pos.y - sGlobalDragStart.y + sGlobalRect.y;
      if (this._dragBounds) {
        var rect = Decls$1.GRoot.inst.localToGlobalRect(this._dragBounds.x, this._dragBounds.y, this._dragBounds.width, this._dragBounds.height, s_rect$1);
        if (xx < rect.x)
          xx = rect.x;
        else if (xx + sGlobalRect.width > rect.xMax) {
          xx = rect.xMax - sGlobalRect.width;
          if (xx < rect.x)
            xx = rect.x;
        }
        if (yy < rect.y)
          yy = rect.y;
        else if (yy + sGlobalRect.height > rect.yMax) {
          yy = rect.yMax - sGlobalRect.height;
          if (yy < rect.y)
            yy = rect.y;
        }
      }
      s_dragging = true;
      var pt = this.parent.globalToLocal(xx, yy, s_vec2$4);
      this.setPosition(Math.round(pt.x), Math.round(pt.y));
      s_dragging = false;
      this._node.emit(Event.DRAG_MOVE, evt);
    }
  }
  onTouchEnd_0(evt) {
    if (_GObject.draggingObject == this) {
      _GObject.draggingObject = null;
      this._node.emit(Event.DRAG_END, evt);
    }
  }
};
var GObjectPartner = class extends import_cc.Component {
  callLater(callback, delay) {
    if (!import_cc.director.getScheduler().isScheduled(callback, this))
      this.scheduleOnce(callback, delay);
  }
  onClickLink(evt, text) {
    this.node.emit(Event.LINK, text, evt);
  }
  onEnable() {
    this.node["$gobj"].onEnable();
    if (this._emitDisplayEvents)
      this.node.emit(Event.DISPLAY);
  }
  onDisable() {
    this.node["$gobj"].onDisable();
    if (this._emitDisplayEvents)
      this.node.emit(Event.UNDISPLAY);
  }
  update(dt) {
    this.node["$gobj"].onUpdate(dt);
  }
  onDestroy() {
    this.node["$gobj"].onDestroy();
  }
};
var GearClasses = [
  GearDisplay,
  GearXY,
  GearSize,
  GearLook,
  GearColor,
  GearAnimation,
  GearText,
  GearIcon,
  GearDisplay2,
  GearFontSize
];
function createGear(owner, index) {
  let ret = new GearClasses[index]();
  ret._owner = owner;
  return ret;
}
var s_vec2$4 = new import_cc.Vec2();
var s_vec3$1 = new import_cc.Vec3();
var s_rect$1 = new import_cc.Rect();
var sGlobalDragStart = new import_cc.Vec2();
var sGlobalRect = new import_cc.Rect();
var s_dragging;
var s_dragQuery;
var Decls$1 = {};
var constructingDepth = { n: 0 };
var GGroup = class extends GObject {
  constructor() {
    super();
    this._layout = 0;
    this._lineGap = 0;
    this._columnGap = 0;
    this._mainGridIndex = -1;
    this._mainGridMinSize = 50;
    this._mainChildIndex = -1;
    this._totalSize = 0;
    this._numChildren = 0;
    this._updating = 0;
    this._node.name = "GGroup";
    this._touchDisabled = true;
  }
  dispose() {
    this._boundsChanged = false;
    super.dispose();
  }
  get layout() {
    return this._layout;
  }
  set layout(value) {
    if (this._layout != value) {
      this._layout = value;
      this.setBoundsChangedFlag();
    }
  }
  get lineGap() {
    return this._lineGap;
  }
  set lineGap(value) {
    if (this._lineGap != value) {
      this._lineGap = value;
      this.setBoundsChangedFlag(true);
    }
  }
  get columnGap() {
    return this._columnGap;
  }
  set columnGap(value) {
    if (this._columnGap != value) {
      this._columnGap = value;
      this.setBoundsChangedFlag(true);
    }
  }
  get excludeInvisibles() {
    return this._excludeInvisibles;
  }
  set excludeInvisibles(value) {
    if (this._excludeInvisibles != value) {
      this._excludeInvisibles = value;
      this.setBoundsChangedFlag();
    }
  }
  get autoSizeDisabled() {
    return this._autoSizeDisabled;
  }
  set autoSizeDisabled(value) {
    this._autoSizeDisabled = value;
  }
  get mainGridMinSize() {
    return this._mainGridMinSize;
  }
  set mainGridMinSize(value) {
    if (this._mainGridMinSize != value) {
      this._mainGridMinSize = value;
      this.setBoundsChangedFlag();
    }
  }
  get mainGridIndex() {
    return this._mainGridIndex;
  }
  set mainGridIndex(value) {
    if (this._mainGridIndex != value) {
      this._mainGridIndex = value;
      this.setBoundsChangedFlag();
    }
  }
  setBoundsChangedFlag(positionChangedOnly = false) {
    if (this._updating == 0 && this._parent) {
      if (!positionChangedOnly)
        this._percentReady = false;
      if (!this._boundsChanged) {
        this._boundsChanged = true;
        if (this._layout != GroupLayoutType.None)
          this._partner.callLater(this._ensureBoundsCorrect);
      }
    }
  }
  _ensureBoundsCorrect() {
    let _t = GObject.cast(this.node);
    _t.ensureBoundsCorrect();
  }
  ensureSizeCorrect() {
    if (this._parent == null || !this._boundsChanged || this._layout == 0)
      return;
    this._boundsChanged = false;
    if (this._autoSizeDisabled)
      this.resizeChildren(0, 0);
    else {
      this.handleLayout();
      this.updateBounds();
    }
  }
  ensureBoundsCorrect() {
    if (this._parent == null || !this._boundsChanged)
      return;
    this._boundsChanged = false;
    if (this._layout == 0)
      this.updateBounds();
    else {
      if (this._autoSizeDisabled)
        this.resizeChildren(0, 0);
      else {
        this.handleLayout();
        this.updateBounds();
      }
    }
  }
  updateBounds() {
    this._partner.unschedule(this._ensureBoundsCorrect);
    var cnt = this._parent.numChildren;
    var i;
    var child;
    var ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
    var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
    var tmp;
    var empty = true;
    for (i = 0; i < cnt; i++) {
      child = this._parent.getChildAt(i);
      if (child.group != this || this._excludeInvisibles && !child.internalVisible3)
        continue;
      tmp = child.xMin;
      if (tmp < ax)
        ax = tmp;
      tmp = child.yMin;
      if (tmp < ay)
        ay = tmp;
      tmp = child.xMin + child.width;
      if (tmp > ar)
        ar = tmp;
      tmp = child.yMin + child.height;
      if (tmp > ab)
        ab = tmp;
      empty = false;
    }
    var w = 0, h = 0;
    if (!empty) {
      this._updating |= 1;
      this.setPosition(ax, ay);
      this._updating &= 2;
      w = ar - ax;
      h = ab - ay;
    }
    if ((this._updating & 2) == 0) {
      this._updating |= 2;
      this.setSize(w, h);
      this._updating &= 1;
    } else {
      this._updating &= 1;
      this.resizeChildren(this._width - w, this._height - h);
    }
  }
  handleLayout() {
    this._updating |= 1;
    var child;
    var i;
    var cnt;
    if (this._layout == GroupLayoutType.Horizontal) {
      var curX = this.x;
      cnt = this._parent.numChildren;
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (this._excludeInvisibles && !child.internalVisible3)
          continue;
        child.xMin = curX;
        if (child.width != 0)
          curX += child.width + this._columnGap;
      }
    } else if (this._layout == GroupLayoutType.Vertical) {
      var curY = this.y;
      cnt = this._parent.numChildren;
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (this._excludeInvisibles && !child.internalVisible3)
          continue;
        child.yMin = curY;
        if (child.height != 0)
          curY += child.height + this._lineGap;
      }
    }
    this._updating &= 2;
  }
  moveChildren(dx, dy) {
    if ((this._updating & 1) != 0 || this._parent == null)
      return;
    this._updating |= 1;
    var cnt = this._parent.numChildren;
    var i;
    var child;
    for (i = 0; i < cnt; i++) {
      child = this._parent.getChildAt(i);
      if (child.group == this) {
        child.setPosition(child.x + dx, child.y + dy);
      }
    }
    this._updating &= 2;
  }
  resizeChildren(dw, dh) {
    if (this._layout == GroupLayoutType.None || (this._updating & 2) != 0 || this._parent == null)
      return;
    this._updating |= 2;
    if (this._boundsChanged) {
      this._boundsChanged = false;
      if (!this._autoSizeDisabled) {
        this.updateBounds();
        return;
      }
    }
    var cnt = this._parent.numChildren;
    var i;
    var child;
    if (!this._percentReady) {
      this._percentReady = true;
      this._numChildren = 0;
      this._totalSize = 0;
      this._mainChildIndex = -1;
      var j = 0;
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (!this._excludeInvisibles || child.internalVisible3) {
          if (j == this._mainGridIndex)
            this._mainChildIndex = i;
          this._numChildren++;
          if (this._layout == 1)
            this._totalSize += child.width;
          else
            this._totalSize += child.height;
        }
        j++;
      }
      if (this._mainChildIndex != -1) {
        if (this._layout == 1) {
          child = this._parent.getChildAt(this._mainChildIndex);
          this._totalSize += this._mainGridMinSize - child.width;
          child._sizePercentInGroup = this._mainGridMinSize / this._totalSize;
        } else {
          child = this._parent.getChildAt(this._mainChildIndex);
          this._totalSize += this._mainGridMinSize - child.height;
          child._sizePercentInGroup = this._mainGridMinSize / this._totalSize;
        }
      }
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (i == this._mainChildIndex)
          continue;
        if (this._totalSize > 0)
          child._sizePercentInGroup = (this._layout == 1 ? child.width : child.height) / this._totalSize;
        else
          child._sizePercentInGroup = 0;
      }
    }
    var remainSize = 0;
    var remainPercent = 1;
    var priorHandled = false;
    if (this._layout == 1) {
      remainSize = this.width - (this._numChildren - 1) * this._columnGap;
      if (this._mainChildIndex != -1 && remainSize >= this._totalSize) {
        child = this._parent.getChildAt(this._mainChildIndex);
        child.setSize(remainSize - (this._totalSize - this._mainGridMinSize), child._rawHeight + dh, true);
        remainSize -= child.width;
        remainPercent -= child._sizePercentInGroup;
        priorHandled = true;
      }
      var curX = this.x;
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (this._excludeInvisibles && !child.internalVisible3) {
          child.setSize(child._rawWidth, child._rawHeight + dh, true);
          continue;
        }
        if (!priorHandled || i != this._mainChildIndex) {
          child.setSize(Math.round(child._sizePercentInGroup / remainPercent * remainSize), child._rawHeight + dh, true);
          remainPercent -= child._sizePercentInGroup;
          remainSize -= child.width;
        }
        child.xMin = curX;
        if (child.width != 0)
          curX += child.width + this._columnGap;
      }
    } else {
      remainSize = this.height - (this._numChildren - 1) * this._lineGap;
      if (this._mainChildIndex != -1 && remainSize >= this._totalSize) {
        child = this._parent.getChildAt(this._mainChildIndex);
        child.setSize(child._rawWidth + dw, remainSize - (this._totalSize - this._mainGridMinSize), true);
        remainSize -= child.height;
        remainPercent -= child._sizePercentInGroup;
        priorHandled = true;
      }
      var curY = this.y;
      for (i = 0; i < cnt; i++) {
        child = this._parent.getChildAt(i);
        if (child.group != this)
          continue;
        if (this._excludeInvisibles && !child.internalVisible3) {
          child.setSize(child._rawWidth + dw, child._rawHeight, true);
          continue;
        }
        if (!priorHandled || i != this._mainChildIndex) {
          child.setSize(child._rawWidth + dw, Math.round(child._sizePercentInGroup / remainPercent * remainSize), true);
          remainPercent -= child._sizePercentInGroup;
          remainSize -= child.height;
        }
        child.yMin = curY;
        if (child.height != 0)
          curY += child.height + this._lineGap;
      }
    }
    this._updating &= 1;
  }
  handleAlphaChanged() {
    if (this._underConstruct)
      return;
    var cnt = this._parent.numChildren;
    for (var i = 0; i < cnt; i++) {
      var child = this._parent.getChildAt(i);
      if (child.group == this)
        child.alpha = this.alpha;
    }
  }
  handleVisibleChanged() {
    if (!this._parent)
      return;
    var cnt = this._parent.numChildren;
    for (var i = 0; i < cnt; i++) {
      var child = this._parent.getChildAt(i);
      if (child.group == this)
        child.handleVisibleChanged();
    }
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this._layout = buffer.readByte();
    this._lineGap = buffer.readInt();
    this._columnGap = buffer.readInt();
    if (buffer.version >= 2) {
      this._excludeInvisibles = buffer.readBool();
      this._autoSizeDisabled = buffer.readBool();
      this._mainGridIndex = buffer.readShort();
    }
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!this.visible)
      this.handleVisibleChanged();
  }
};
var GGraph = class extends GObject {
  constructor() {
    super();
    this._type = 0;
    this._lineSize = 0;
    this._node.name = "GGraph";
    this._lineSize = 1;
    this._lineColor = new import_cc.Color();
    this._fillColor = new import_cc.Color(255, 255, 255, 255);
    this._content = this._node.addComponent(import_cc.Graphics);
  }
  drawRect(lineSize, lineColor, fillColor, corner) {
    this._type = 1;
    this._lineSize = lineSize;
    this._lineColor.set(lineColor);
    this._fillColor.set(fillColor);
    this._cornerRadius = corner;
    this.updateGraph();
  }
  drawEllipse(lineSize, lineColor, fillColor) {
    this._type = 2;
    this._lineSize = lineSize;
    this._lineColor.set(lineColor);
    this._fillColor.set(fillColor);
    this.updateGraph();
  }
  drawRegularPolygon(lineSize, lineColor, fillColor, sides, startAngle, distances) {
    this._type = 4;
    this._lineSize = lineSize;
    this._lineColor.set(lineColor);
    this._fillColor.set(fillColor);
    this._sides = sides;
    this._startAngle = startAngle || 0;
    this._distances = distances;
    this.updateGraph();
  }
  drawPolygon(lineSize, lineColor, fillColor, points) {
    this._type = 3;
    this._lineSize = lineSize;
    this._lineColor.set(lineColor);
    this._fillColor.set(fillColor);
    this._polygonPoints = points;
    this.updateGraph();
  }
  get distances() {
    return this._distances;
  }
  set distances(value) {
    this._distances = value;
    if (this._type == 3)
      this.updateGraph();
  }
  clearGraphics() {
    this._type = 0;
    if (this._hasContent) {
      this._content.clear();
      this._hasContent = false;
    }
  }
  get type() {
    return this._type;
  }
  get color() {
    return this._fillColor;
  }
  set color(value) {
    this._fillColor.set(value);
    if (this._type != 0)
      this.updateGraph();
  }
  updateGraph() {
    let ctx = this._content;
    if (this._hasContent) {
      this._hasContent = false;
      ctx.clear();
    }
    var w = this._width;
    var h = this._height;
    if (w == 0 || h == 0)
      return;
    var px = -this.pivotX * this._width;
    var py = this.pivotY * this._height;
    let ls = this._lineSize / 2;
    ctx.lineWidth = this._lineSize;
    ctx.strokeColor = this._lineColor;
    ctx.fillColor = this._fillColor;
    if (this._type == 1) {
      if (this._cornerRadius) {
        ctx.roundRect(px + ls, -h + py + ls, w - this._lineSize, h - this._lineSize, this._cornerRadius[0]);
      } else
        ctx.rect(px + ls, -h + py + ls, w - this._lineSize, h - this._lineSize);
    } else if (this._type == 2) {
      ctx.ellipse(w / 2 + px, -h / 2 + py, w / 2 - ls, h / 2 - ls);
    } else if (this._type == 3) {
      this.drawPath(ctx, this._polygonPoints, px, py);
    } else if (this._type == 4) {
      if (!this._polygonPoints)
        this._polygonPoints = [];
      var radius = Math.min(w, h) / 2 - ls;
      this._polygonPoints.length = 0;
      var angle = import_cc.misc.degreesToRadians(this._startAngle);
      var deltaAngle = 2 * Math.PI / this._sides;
      var dist;
      for (var i = 0; i < this._sides; i++) {
        if (this._distances) {
          dist = this._distances[i];
          if (isNaN(dist))
            dist = 1;
        } else
          dist = 1;
        var xv = radius + radius * dist * Math.cos(angle);
        var yv = radius + radius * dist * Math.sin(angle);
        this._polygonPoints.push(xv, yv);
        angle += deltaAngle;
      }
      this.drawPath(ctx, this._polygonPoints, px, py);
    }
    if (ls != 0)
      ctx.stroke();
    if (this._fillColor.a != 0)
      ctx.fill();
    this._hasContent = true;
  }
  drawPath(ctx, points, px, py) {
    var cnt = points.length;
    ctx.moveTo(points[0] + px, -points[1] + py);
    for (var i = 2; i < cnt; i += 2)
      ctx.lineTo(points[i] + px, -points[i + 1] + py);
    ctx.lineTo(points[0] + px, -points[1] + py);
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (this._type != 0)
      this.updateGraph();
  }
  handleAnchorChanged() {
    super.handleAnchorChanged();
    if (this._type != 0)
      this.updateGraph();
  }
  getProp(index) {
    if (index == ObjectPropID.Color)
      return this.color;
    else
      return super.getProp(index);
  }
  setProp(index, value) {
    if (index == ObjectPropID.Color)
      this.color = value;
    else
      super.setProp(index, value);
  }
  _hitTest(pt) {
    if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height) {
      if (this._type == 3) {
        let points = this._polygonPoints;
        let len = points.length / 2;
        let i;
        let j = len - 1;
        let oddNodes = false;
        this._width;
        this._height;
        for (i = 0; i < len; ++i) {
          let ix = points[i * 2];
          let iy = points[i * 2 + 1];
          let jx = points[j * 2];
          let jy = points[j * 2 + 1];
          if ((iy < pt.y && jy >= pt.y || jy < pt.y && iy >= pt.y) && (ix <= pt.x || jx <= pt.x)) {
            if (ix + (pt.y - iy) / (jy - iy) * (jx - ix) < pt.x)
              oddNodes = !oddNodes;
          }
          j = i;
        }
        return oddNodes ? this : null;
      } else
        return this;
    } else
      return null;
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this._type = buffer.readByte();
    if (this._type != 0) {
      var i;
      var cnt;
      this._lineSize = buffer.readInt();
      this._lineColor.set(buffer.readColor(true));
      this._fillColor.set(buffer.readColor(true));
      if (buffer.readBool()) {
        this._cornerRadius = new Array(4);
        for (i = 0; i < 4; i++)
          this._cornerRadius[i] = buffer.readFloat();
      }
      if (this._type == 3) {
        cnt = buffer.readShort();
        this._polygonPoints = [];
        this._polygonPoints.length = cnt;
        for (i = 0; i < cnt; i++)
          this._polygonPoints[i] = buffer.readFloat();
      } else if (this._type == 4) {
        this._sides = buffer.readShort();
        this._startAngle = buffer.readFloat();
        cnt = buffer.readShort();
        if (cnt > 0) {
          this._distances = [];
          for (i = 0; i < cnt; i++)
            this._distances[i] = buffer.readFloat();
        }
      }
      this.updateGraph();
    }
  }
};
var Image$1 = class Image2 extends import_cc.Sprite {
  constructor() {
    super();
    this._flip = FlipType.None;
    this._fillMethod = FillMethod.None;
    this._fillOrigin = FillOrigin.Left;
    this._fillAmount = 0;
  }
  get flip() {
    return this._flip;
  }
  set flip(value) {
    if (this._flip != value) {
      this._flip = value;
      let sx = 1, sy = 1;
      if (this._flip == FlipType.Horizontal || this._flip == FlipType.Both)
        sx = -1;
      if (this._flip == FlipType.Vertical || this._flip == FlipType.Both)
        sy = -1;
      if (sx != 1 || sy != 1) {
        let uiTrans = this.node.getComponent(import_cc.UITransform);
        uiTrans.setAnchorPoint(0.5, 0.5);
      }
      this.node.setScale(sx, sy);
    }
  }
  get fillMethod() {
    return this._fillMethod;
  }
  set fillMethod(value) {
    if (this._fillMethod != value) {
      this._fillMethod = value;
      if (this._fillMethod != 0) {
        this.type = import_cc.Sprite.Type.FILLED;
        if (this._fillMethod <= 3)
          this.fillType = this._fillMethod - 1;
        else
          this.fillType = import_cc.Sprite.FillType.RADIAL;
        this.fillCenter = new import_cc.Vec2(0.5, 0.5);
        this.setupFill();
      } else {
        this.type = import_cc.Sprite.Type.SIMPLE;
      }
    }
  }
  get fillOrigin() {
    return this._fillOrigin;
  }
  set fillOrigin(value) {
    if (this._fillOrigin != value) {
      this._fillOrigin = value;
      if (this._fillMethod != 0)
        this.setupFill();
    }
  }
  get fillClockwise() {
    return this._fillClockwise;
  }
  set fillClockwise(value) {
    if (this._fillClockwise != value) {
      this._fillClockwise = value;
      if (this._fillMethod != 0)
        this.setupFill();
    }
  }
  get fillAmount() {
    return this._fillAmount;
  }
  set fillAmount(value) {
    if (this._fillAmount != value) {
      this._fillAmount = value;
      if (this._fillMethod != 0) {
        if (this._fillClockwise)
          this.fillRange = -this._fillAmount;
        else
          this.fillRange = this._fillAmount;
      }
    }
  }
  setupFill() {
    if (this._fillMethod == FillMethod.Horizontal) {
      this._fillClockwise = this._fillOrigin == FillOrigin.Right || this._fillOrigin == FillOrigin.Bottom;
      this.fillStart = this._fillClockwise ? 1 : 0;
    } else if (this._fillMethod == FillMethod.Vertical) {
      this._fillClockwise = this._fillOrigin == FillOrigin.Left || this._fillOrigin == FillOrigin.Top;
      this.fillStart = this._fillClockwise ? 1 : 0;
    } else {
      switch (this._fillOrigin) {
        case FillOrigin.Right:
          this.fillOrigin = 0;
          break;
        case FillOrigin.Top:
          this.fillStart = 0.25;
          break;
        case FillOrigin.Left:
          this.fillStart = 0.5;
          break;
        case FillOrigin.Bottom:
          this.fillStart = 0.75;
          break;
      }
    }
  }
};
var GImage = class extends GObject {
  constructor() {
    super();
    this._node.name = "GImage";
    this._touchDisabled = true;
    this._content = this._node.addComponent(Image$1);
    this._content.sizeMode = import_cc.Sprite.SizeMode.CUSTOM;
    this._content.trim = false;
  }
  get color() {
    return this._content.color;
  }
  set color(value) {
    this._content.color = value;
    this.updateGear(4);
  }
  get flip() {
    return this._content.flip;
  }
  set flip(value) {
    this._content.flip = value;
  }
  get fillMethod() {
    return this._content.fillMethod;
  }
  set fillMethod(value) {
    this._content.fillMethod = value;
  }
  get fillOrigin() {
    return this._content.fillOrigin;
  }
  set fillOrigin(value) {
    this._content.fillOrigin = value;
  }
  get fillClockwise() {
    return this._content.fillClockwise;
  }
  set fillClockwise(value) {
    this._content.fillClockwise = value;
  }
  get fillAmount() {
    return this._content.fillAmount;
  }
  set fillAmount(value) {
    this._content.fillAmount = value;
  }
  constructFromResource() {
    var contentItem = this.packageItem.getBranch();
    this.sourceWidth = contentItem.width;
    this.sourceHeight = contentItem.height;
    this.initWidth = this.sourceWidth;
    this.initHeight = this.sourceHeight;
    this.setSize(this.sourceWidth, this.sourceHeight);
    contentItem = contentItem.getHighResolution();
    contentItem.load();
    if (contentItem.scale9Grid)
      this._content.type = import_cc.Sprite.Type.SLICED;
    else if (contentItem.scaleByTile)
      this._content.type = import_cc.Sprite.Type.TILED;
    this._content.spriteFrame = contentItem.asset;
  }
  handleGrayedChanged() {
    this._content.grayscale = this._grayed;
  }
  getProp(index) {
    if (index == ObjectPropID.Color)
      return this.color;
    else
      return super.getProp(index);
  }
  setProp(index, value) {
    if (index == ObjectPropID.Color)
      this.color = value;
    else
      super.setProp(index, value);
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    if (buffer.readBool())
      this.color = buffer.readColor();
    this._content.flip = buffer.readByte();
    this._content.fillMethod = buffer.readByte();
    if (this._content.fillMethod != 0) {
      this._content.fillOrigin = buffer.readByte();
      this._content.fillClockwise = buffer.readBool();
      this._content.fillAmount = buffer.readFloat();
    }
  }
};
var MovieClip = class extends Image$1 {
  constructor() {
    super();
    this.interval = 0;
    this.swing = false;
    this.repeatDelay = 0;
    this.timeScale = 1;
    this._playing = true;
    this._frameCount = 0;
    this._frame = 0;
    this._start = 0;
    this._end = 0;
    this._times = 0;
    this._endAt = 0;
    this._status = 0;
    this._smoothing = true;
    this._frameElapsed = 0;
    this._reversed = false;
    this._repeatedCount = 0;
  }
  get frames() {
    return this._frames;
  }
  set frames(value) {
    this._frames = value;
    if (this._frames) {
      this._frameCount = this._frames.length;
      if (this._end == -1 || this._end > this._frameCount - 1)
        this._end = this._frameCount - 1;
      if (this._endAt == -1 || this._endAt > this._frameCount - 1)
        this._endAt = this._frameCount - 1;
      if (this._frame < 0 || this._frame > this._frameCount - 1)
        this._frame = this._frameCount - 1;
      this.type = import_cc.Sprite.Type.SIMPLE;
      this.drawFrame();
      this._frameElapsed = 0;
      this._repeatedCount = 0;
      this._reversed = false;
    } else {
      this._frameCount = 0;
    }
  }
  get frameCount() {
    return this._frameCount;
  }
  get frame() {
    return this._frame;
  }
  set frame(value) {
    if (this._frame != value) {
      if (this._frames && value >= this._frameCount)
        value = this._frameCount - 1;
      this._frame = value;
      this._frameElapsed = 0;
      this.drawFrame();
    }
  }
  get playing() {
    return this._playing;
  }
  set playing(value) {
    if (this._playing != value) {
      this._playing = value;
    }
  }
  get smoothing() {
    return this._smoothing;
  }
  set smoothing(value) {
    this._smoothing = value;
  }
  rewind() {
    this._frame = 0;
    this._frameElapsed = 0;
    this._reversed = false;
    this._repeatedCount = 0;
    this.drawFrame();
  }
  syncStatus(anotherMc) {
    this._frame = anotherMc._frame;
    this._frameElapsed = anotherMc._frameElapsed;
    this._reversed = anotherMc._reversed;
    this._repeatedCount = anotherMc._repeatedCount;
    this.drawFrame();
  }
  advance(timeInSeconds) {
    var beginFrame = this._frame;
    var beginReversed = this._reversed;
    var backupTime = timeInSeconds;
    while (true) {
      var tt = this.interval + this._frames[this._frame].addDelay;
      if (this._frame == 0 && this._repeatedCount > 0)
        tt += this.repeatDelay;
      if (timeInSeconds < tt) {
        this._frameElapsed = 0;
        break;
      }
      timeInSeconds -= tt;
      if (this.swing) {
        if (this._reversed) {
          this._frame--;
          if (this._frame <= 0) {
            this._frame = 0;
            this._repeatedCount++;
            this._reversed = !this._reversed;
          }
        } else {
          this._frame++;
          if (this._frame > this._frameCount - 1) {
            this._frame = Math.max(0, this._frameCount - 2);
            this._repeatedCount++;
            this._reversed = !this._reversed;
          }
        }
      } else {
        this._frame++;
        if (this._frame > this._frameCount - 1) {
          this._frame = 0;
          this._repeatedCount++;
        }
      }
      if (this._frame == beginFrame && this._reversed == beginReversed) {
        var roundTime = backupTime - timeInSeconds;
        timeInSeconds -= Math.floor(timeInSeconds / roundTime) * roundTime;
      }
    }
    this.drawFrame();
  }
  //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
  setPlaySettings(start, end, times, endAt, endCallback) {
    if (start == void 0)
      start = 0;
    if (end == void 0)
      end = -1;
    if (times == void 0)
      times = 0;
    if (endAt == void 0)
      endAt = -1;
    this._start = start;
    this._end = end;
    if (this._end == -1 || this._end > this._frameCount - 1)
      this._end = this._frameCount - 1;
    this._times = times;
    this._endAt = endAt;
    if (this._endAt == -1)
      this._endAt = this._end;
    this._status = 0;
    this._callback = endCallback;
    this.frame = start;
  }
  update(dt) {
    if (!this._playing || this._frameCount == 0 || this._status == 3)
      return;
    if (this.timeScale != 1)
      dt *= this.timeScale;
    this._frameElapsed += dt;
    var tt = this.interval + this._frames[this._frame].addDelay;
    if (this._frame == 0 && this._repeatedCount > 0)
      tt += this.repeatDelay;
    if (this._frameElapsed < tt)
      return;
    this._frameElapsed -= tt;
    if (this._frameElapsed > this.interval)
      this._frameElapsed = this.interval;
    if (this.swing) {
      if (this._reversed) {
        this._frame--;
        if (this._frame <= 0) {
          this._frame = 0;
          this._repeatedCount++;
          this._reversed = !this._reversed;
        }
      } else {
        this._frame++;
        if (this._frame > this._frameCount - 1) {
          this._frame = Math.max(0, this._frameCount - 2);
          this._repeatedCount++;
          this._reversed = !this._reversed;
        }
      }
    } else {
      this._frame++;
      if (this._frame > this._frameCount - 1) {
        this._frame = 0;
        this._repeatedCount++;
      }
    }
    if (this._status == 1) {
      this._frame = this._start;
      this._frameElapsed = 0;
      this._status = 0;
    } else if (this._status == 2) {
      this._frame = this._endAt;
      this._frameElapsed = 0;
      this._status = 3;
      if (this._callback != null) {
        let callback = this._callback;
        this._callback = null;
        callback();
      }
    } else {
      if (this._frame == this._end) {
        if (this._times > 0) {
          this._times--;
          if (this._times == 0)
            this._status = 2;
          else
            this._status = 1;
        } else if (this._start != 0)
          this._status = 1;
      }
    }
    this.drawFrame();
  }
  drawFrame() {
    if (this._frameCount > 0 && this._frame < this._frames.length) {
      var frame = this._frames[this._frame];
      this.spriteFrame = frame.texture;
    }
  }
};
var GMovieClip = class extends GObject {
  constructor() {
    super();
    this._node.name = "GMovieClip";
    this._touchDisabled = true;
    this._content = this._node.addComponent(MovieClip);
    this._content.sizeMode = import_cc.Sprite.SizeMode.CUSTOM;
    this._content.trim = false;
    this._content.setPlaySettings();
  }
  get color() {
    return this._content.color;
  }
  set color(value) {
    this._content.color = value;
    this.updateGear(4);
  }
  get playing() {
    return this._content.playing;
  }
  set playing(value) {
    if (this._content.playing != value) {
      this._content.playing = value;
      this.updateGear(5);
    }
  }
  get frame() {
    return this._content.frame;
  }
  set frame(value) {
    if (this._content.frame != value) {
      this._content.frame = value;
      this.updateGear(5);
    }
  }
  get timeScale() {
    return this._content.timeScale;
  }
  set timeScale(value) {
    this._content.timeScale = value;
  }
  rewind() {
    this._content.rewind();
  }
  syncStatus(anotherMc) {
    this._content.syncStatus(anotherMc._content);
  }
  advance(timeInSeconds) {
    this._content.advance(timeInSeconds);
  }
  //从start帧开始，播放到end帧（-1表示结尾），重复times次（0表示无限循环），循环结束后，停止在endAt帧（-1表示参数end）
  setPlaySettings(start, end, times, endAt, endCallback) {
    this._content.setPlaySettings(start, end, times, endAt, endCallback);
  }
  handleGrayedChanged() {
    this._content.grayscale = this._grayed;
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    this._content.sizeMode = import_cc.Sprite.SizeMode.CUSTOM;
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.color;
      case ObjectPropID.Playing:
        return this.playing;
      case ObjectPropID.Frame:
        return this.frame;
      case ObjectPropID.TimeScale:
        return this.timeScale;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.color = value;
        break;
      case ObjectPropID.Playing:
        this.playing = value;
        break;
      case ObjectPropID.Frame:
        this.frame = value;
        break;
      case ObjectPropID.TimeScale:
        this.timeScale = value;
        break;
      case ObjectPropID.DeltaTime:
        this.advance(value);
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  constructFromResource() {
    var contentItem = this.packageItem.getBranch();
    this.sourceWidth = contentItem.width;
    this.sourceHeight = contentItem.height;
    this.initWidth = this.sourceWidth;
    this.initHeight = this.sourceHeight;
    this.setSize(this.sourceWidth, this.sourceHeight);
    contentItem = contentItem.getHighResolution();
    contentItem.load();
    this._content.interval = contentItem.interval;
    this._content.swing = contentItem.swing;
    this._content.repeatDelay = contentItem.repeatDelay;
    this._content.frames = contentItem.frames;
    this._content.smoothing = contentItem.smoothing;
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    if (buffer.readBool())
      this.color = buffer.readColor();
    buffer.readByte();
    this._content.frame = buffer.readInt();
    this._content.playing = buffer.readBool();
  }
};
var ControllerAction = class {
  constructor() {
  }
  run(controller, prevPage, curPage) {
    if ((!this.fromPage || this.fromPage.length == 0 || this.fromPage.indexOf(prevPage) != -1) && (!this.toPage || this.toPage.length == 0 || this.toPage.indexOf(curPage) != -1))
      this.enter(controller);
    else
      this.leave(controller);
  }
  enter(controller) {
  }
  leave(controller) {
  }
  setup(buffer) {
    var cnt;
    var i;
    cnt = buffer.readShort();
    this.fromPage = [];
    for (i = 0; i < cnt; i++)
      this.fromPage[i] = buffer.readS();
    cnt = buffer.readShort();
    this.toPage = [];
    for (i = 0; i < cnt; i++)
      this.toPage[i] = buffer.readS();
  }
};
var PlayTransitionAction = class extends ControllerAction {
  constructor() {
    super();
    this.playTimes = 1;
    this.delay = 0;
  }
  enter(controller) {
    var trans = controller.parent.getTransition(this.transitionName);
    if (trans) {
      if (this._currentTransition && this._currentTransition.playing)
        trans.changePlayTimes(this.playTimes);
      else
        trans.play(null, this.playTimes, this.delay);
      this._currentTransition = trans;
    }
  }
  leave(controller) {
    if (this.stopOnExit && this._currentTransition) {
      this._currentTransition.stop();
      this._currentTransition = null;
    }
  }
  setup(buffer) {
    super.setup(buffer);
    this.transitionName = buffer.readS();
    this.playTimes = buffer.readInt();
    this.delay = buffer.readFloat();
    this.stopOnExit = buffer.readBool();
  }
};
var ChangePageAction = class extends ControllerAction {
  constructor() {
    super();
  }
  enter(controller) {
    if (!this.controllerName)
      return;
    var gcom;
    if (this.objectId)
      gcom = controller.parent.getChildById(this.objectId);
    else
      gcom = controller.parent;
    if (gcom) {
      var cc = gcom.getController(this.controllerName);
      if (cc && cc != controller && !cc.changing) {
        if (this.targetPage == "~1") {
          if (controller.selectedIndex < cc.pageCount)
            cc.selectedIndex = controller.selectedIndex;
        } else if (this.targetPage == "~2")
          cc.selectedPage = controller.selectedPage;
        else
          cc.selectedPageId = this.targetPage;
      }
    }
  }
  setup(buffer) {
    super.setup(buffer);
    this.objectId = buffer.readS();
    this.controllerName = buffer.readS();
    this.targetPage = buffer.readS();
  }
};
var _nextPageId = 0;
var Controller = class extends import_cc.EventTarget {
  constructor() {
    super();
    this._pageIds = [];
    this._pageNames = [];
    this._selectedIndex = -1;
    this._previousIndex = -1;
  }
  dispose() {
  }
  get selectedIndex() {
    return this._selectedIndex;
  }
  set selectedIndex(value) {
    if (this._selectedIndex != value) {
      if (value > this._pageIds.length - 1)
        throw new Error("index out of bounds: " + value);
      this.changing = true;
      this._previousIndex = this._selectedIndex;
      this._selectedIndex = value;
      this.parent.applyController(this);
      this.emit(Event.STATUS_CHANGED, this);
      this.changing = false;
    }
  }
  onChanged(callback, thisArg) {
    this.on(Event.STATUS_CHANGED, callback, thisArg);
  }
  offChanged(callback, thisArg) {
    this.off(Event.STATUS_CHANGED, callback, thisArg);
  }
  //功能和设置selectedIndex一样，但不会触发事件
  setSelectedIndex(value) {
    if (this._selectedIndex != value) {
      if (value > this._pageIds.length - 1)
        throw new Error("index out of bounds: " + value);
      this.changing = true;
      this._previousIndex = this._selectedIndex;
      this._selectedIndex = value;
      this.parent.applyController(this);
      this.changing = false;
    }
  }
  get previsousIndex() {
    return this._previousIndex;
  }
  get selectedPage() {
    if (this._selectedIndex == -1)
      return null;
    else
      return this._pageNames[this._selectedIndex];
  }
  set selectedPage(val) {
    var i = this._pageNames.indexOf(val);
    if (i == -1)
      i = 0;
    this.selectedIndex = i;
  }
  //功能和设置selectedPage一样，但不会触发事件
  setSelectedPage(value) {
    var i = this._pageNames.indexOf(value);
    if (i == -1)
      i = 0;
    this.setSelectedIndex(i);
  }
  get previousPage() {
    if (this._previousIndex == -1)
      return null;
    else
      return this._pageNames[this._previousIndex];
  }
  get pageCount() {
    return this._pageIds.length;
  }
  getPageName(index) {
    return this._pageNames[index];
  }
  addPage(name) {
    name = name || "";
    this.addPageAt(name, this._pageIds.length);
  }
  addPageWithId(id, name) {
    name = name || "";
    this.addPageAt(name, this._pageIds.length, id);
  }
  addPageAt(name, index, id) {
    name = name || "";
    var nid = id || "" + _nextPageId++;
    if (index == null || index == this._pageIds.length) {
      this._pageIds.push(nid);
      this._pageNames.push(name);
    } else {
      this._pageIds.splice(index, 0, nid);
      this._pageNames.splice(index, 0, name);
    }
  }
  removePage(name) {
    var i = this._pageNames.indexOf(name);
    if (i != -1) {
      this._pageIds.splice(i, 1);
      this._pageNames.splice(i, 1);
      if (this._selectedIndex >= this._pageIds.length)
        this.selectedIndex = this._selectedIndex - 1;
      else
        this.parent.applyController(this);
    }
  }
  removePageAt(index) {
    this._pageIds.splice(index, 1);
    this._pageNames.splice(index, 1);
    if (this._selectedIndex >= this._pageIds.length)
      this.selectedIndex = this._selectedIndex - 1;
    else
      this.parent.applyController(this);
  }
  clearPages() {
    this._pageIds.length = 0;
    this._pageNames.length = 0;
    if (this._selectedIndex != -1)
      this.selectedIndex = -1;
    else
      this.parent.applyController(this);
  }
  hasPage(aName) {
    return this._pageNames.indexOf(aName) != -1;
  }
  getPageIndexById(aId) {
    return this._pageIds.indexOf(aId);
  }
  getPageIdByName(aName) {
    var i = this._pageNames.indexOf(aName);
    if (i != -1)
      return this._pageIds[i];
    else
      return null;
  }
  getPageNameById(aId) {
    var i = this._pageIds.indexOf(aId);
    if (i != -1)
      return this._pageNames[i];
    else
      return null;
  }
  getPageId(index) {
    return this._pageIds[index];
  }
  get selectedPageId() {
    if (this._selectedIndex == -1)
      return null;
    else
      return this._pageIds[this._selectedIndex];
  }
  set selectedPageId(val) {
    var i = this._pageIds.indexOf(val);
    this.selectedIndex = i;
  }
  set oppositePageId(val) {
    var i = this._pageIds.indexOf(val);
    if (i > 0)
      this.selectedIndex = 0;
    else if (this._pageIds.length > 1)
      this.selectedIndex = 1;
  }
  get previousPageId() {
    if (this._previousIndex == -1)
      return null;
    else
      return this._pageIds[this._previousIndex];
  }
  runActions() {
    if (this._actions) {
      var cnt = this._actions.length;
      for (var i = 0; i < cnt; i++) {
        this._actions[i].run(this, this.previousPageId, this.selectedPageId);
      }
    }
  }
  addAction(action) {
    if (!action)
      return;
    if (!this._actions)
      this._actions = [];
    this._actions.push(action);
  }
  setup(buffer) {
    var beginPos = buffer.position;
    buffer.seek(beginPos, 0);
    this.name = buffer.readS();
    if (buffer.readBool())
      this.autoRadioGroupDepth = true;
    buffer.seek(beginPos, 1);
    var i;
    var nextPos;
    var cnt = buffer.readShort();
    for (i = 0; i < cnt; i++) {
      this._pageIds.push(buffer.readS());
      this._pageNames.push(buffer.readS());
    }
    var homePageIndex = 0;
    if (buffer.version >= 2) {
      var homePageType = buffer.readByte();
      switch (homePageType) {
        case 1:
          homePageIndex = buffer.readShort();
          break;
        case 2:
          homePageIndex = this._pageNames.indexOf(UIPackage.branch);
          if (homePageIndex == -1)
            homePageIndex = 0;
          break;
        case 3:
          homePageIndex = this._pageNames.indexOf(UIPackage.getVar(buffer.readS()));
          if (homePageIndex == -1)
            homePageIndex = 0;
          break;
      }
    }
    buffer.seek(beginPos, 2);
    cnt = buffer.readShort();
    if (cnt > 0) {
      if (!this._actions)
        this._actions = new Array();
      for (i = 0; i < cnt; i++) {
        nextPos = buffer.readShort();
        nextPos += buffer.position;
        var action = createAction(buffer.readByte());
        action.setup(buffer);
        this._actions.push(action);
        buffer.position = nextPos;
      }
    }
    if (this.parent && this._pageIds.length > 0)
      this._selectedIndex = homePageIndex;
    else
      this._selectedIndex = -1;
  }
};
function createAction(type) {
  switch (type) {
    case 0:
      return new PlayTransitionAction();
    case 1:
      return new ChangePageAction();
  }
  return null;
}
var PixelHitTest = class {
  constructor(data, offsetX, offsetY) {
    this._data = data;
    this.offsetX = offsetX == void 0 ? 0 : offsetX;
    this.offsetY = offsetY == void 0 ? 0 : offsetY;
    this.scaleX = 1;
    this.scaleY = 1;
  }
  hitTest(pt) {
    let x = Math.floor((pt.x / this.scaleX - this.offsetX) * this._data.scale);
    let y = Math.floor((pt.y / this.scaleY - this.offsetY) * this._data.scale);
    if (x < 0 || y < 0 || x >= this._data.pixelWidth)
      return false;
    var pos = y * this._data.pixelWidth + x;
    var pos2 = Math.floor(pos / 8);
    var pos3 = pos % 8;
    if (pos2 >= 0 && pos2 < this._data.pixels.length)
      return (this._data.pixels[pos2] >> pos3 & 1) == 1;
    else
      return false;
  }
};
var PixelHitTestData = class _PixelHitTestData {
  constructor(ba) {
    if (!ba) {
      this.pixelWidth = 0;
      this.scale = 1;
      this.pixels = new Uint8Array(0);
      return;
    }
    ba.readInt();
    this.pixelWidth = ba.readInt();
    this.scale = 1 / ba.readByte();
    this.pixels = ba.readBuffer().data;
  }
  static create(pixelWidth, pixels, scale) {
    const data = new _PixelHitTestData();
    data.pixelWidth = Math.max(0, Math.trunc(pixelWidth));
    data.scale = scale && Number.isFinite(scale) && scale > 0 ? scale : 1;
    data.pixels = new Uint8Array(pixels);
    return data;
  }
  static createOpaque(pixelWidth, pixelHeight, scale) {
    const width = Math.max(0, Math.trunc(pixelWidth));
    const height = Math.max(0, Math.trunc(pixelHeight));
    const total = width * height;
    const pixels = new Uint8Array(Math.ceil(total / 8));
    pixels.fill(255);
    const remainder = total % 8;
    if (remainder != 0 && pixels.length > 0)
      pixels[pixels.length - 1] = (1 << remainder) - 1;
    return _PixelHitTestData.create(width, pixels, scale);
  }
  static fromAlphaPixels(pixelWidth, pixelHeight, rgba, bytesPerPixel, alphaOffset, alphaThreshold) {
    const width = Math.max(0, Math.trunc(pixelWidth));
    const height = Math.max(0, Math.trunc(pixelHeight));
    const total = width * height;
    const stride = bytesPerPixel && Number.isFinite(bytesPerPixel) && bytesPerPixel > 0 ? Math.trunc(bytesPerPixel) : 4;
    const channel = alphaOffset != null && Number.isFinite(alphaOffset) ? Math.max(0, Math.trunc(alphaOffset)) : Math.min(3, stride - 1);
    const threshold = alphaThreshold != null && Number.isFinite(alphaThreshold) ? alphaThreshold : 1;
    const pixels = new Uint8Array(Math.ceil(total / 8));
    for (let i = 0; i < total; i++) {
      const valueIndex = i * stride + channel;
      const alpha = valueIndex < rgba.length ? Number(rgba[valueIndex]) : 0;
      if (alpha >= threshold)
        pixels[i >> 3] |= 1 << (i & 7);
    }
    return _PixelHitTestData.create(width, pixels);
  }
};
var ChildHitArea = class {
  constructor(child) {
    this._child = child;
  }
  hitTest(pt, globalPt) {
    return this._child.hitTest(globalPt, false) != null;
  }
};
var Margin = class {
  constructor() {
    this.left = 0;
    this.right = 0;
    this.top = 0;
    this.bottom = 0;
  }
  copy(source) {
    this.top = source.top;
    this.bottom = source.bottom;
    this.left = source.left;
    this.right = source.right;
  }
  isNone() {
    return this.left == 0 && this.right == 0 && this.top == 0 && this.bottom == 0;
  }
};
var ScrollPane = class _ScrollPane extends import_cc.Component {
  constructor() {
    super(...arguments);
    this._aniFlag = 0;
  }
  setup(buffer) {
    const owner = GObject.cast(this.node);
    this.initialize(owner);
    const scrollType = buffer.readByte();
    const scrollBarDisplay = buffer.readByte();
    const flags = buffer.readInt();
    let scrollBarMargin;
    if (buffer.readBool()) {
      scrollBarMargin = new Margin();
      scrollBarMargin.top = buffer.readInt();
      scrollBarMargin.bottom = buffer.readInt();
      scrollBarMargin.left = buffer.readInt();
      scrollBarMargin.right = buffer.readInt();
    }
    const vtScrollBarRes = buffer.readS();
    const hzScrollBarRes = buffer.readS();
    const headerRes = buffer.readS();
    const footerRes = buffer.readS();
    this.applySettings(scrollType, scrollBarDisplay, flags, scrollBarMargin, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes);
  }
  setupFromXML(attrs) {
    const owner = GObject.cast(this.node);
    this.initialize(owner);
    let flags = _ScrollPane.readInt(attrs === null || attrs === void 0 ? void 0 : attrs.scrollBarFlags, 0);
    if ((attrs === null || attrs === void 0 ? void 0 : attrs.layout) === "pagination")
      flags |= 8;
    const scrollBarResources = ((attrs === null || attrs === void 0 ? void 0 : attrs.scrollBarRes) || "").split(",");
    const vtScrollBarRes = scrollBarResources[0] || "";
    const hzScrollBarRes = scrollBarResources.length > 1 ? scrollBarResources[1] || "" : "";
    const ptrResources = ((attrs === null || attrs === void 0 ? void 0 : attrs.ptrRes) || "").split(",");
    const headerRes = ptrResources[0] || "";
    const footerRes = ptrResources.length > 1 ? ptrResources[1] || "" : "";
    this.applySettings(_ScrollPane.parseScrollType(attrs === null || attrs === void 0 ? void 0 : attrs.scroll), _ScrollPane.parseScrollBarDisplay(attrs === null || attrs === void 0 ? void 0 : attrs.scrollBar), flags, _ScrollPane.parseMargin(attrs === null || attrs === void 0 ? void 0 : attrs.scrollBarMargin), vtScrollBarRes, hzScrollBarRes, headerRes, footerRes);
  }
  initialize(owner) {
    const o = this._owner = owner;
    this._maskContainer = new import_cc.Node("ScrollPane");
    this._maskContainer.layer = UIConfig.defaultUILayer;
    this._maskContainerUITrans = this._maskContainer.addComponent(import_cc.UITransform);
    this._maskContainerUITrans.setAnchorPoint(0, 1);
    this._maskContainer.parent = o.node;
    this._container = o._container;
    this._container.parent = this._maskContainer;
    this._scrollBarMargin = new Margin();
    this._mouseWheelEnabled = true;
    this._xPos = 0;
    this._yPos = 0;
    this._aniFlag = 0;
    this._tweening = 0;
    this._footerLockedSize = 0;
    this._headerLockedSize = 0;
    this._viewSize = new import_cc.Vec2();
    this._contentSize = new import_cc.Vec2();
    this._pageSize = new import_cc.Vec2(1, 1);
    this._overlapSize = new import_cc.Vec2();
    this._tweenTime = new import_cc.Vec2();
    this._tweenStart = new import_cc.Vec2();
    this._tweenDuration = new import_cc.Vec2();
    this._tweenChange = new import_cc.Vec2();
    this._velocity = new import_cc.Vec2();
    this._containerPos = new import_cc.Vec2();
    this._beginTouchPos = new import_cc.Vec2();
    this._lastTouchPos = new import_cc.Vec2();
    this._lastTouchGlobalPos = new import_cc.Vec2();
    this._scrollStep = UIConfig.defaultScrollStep;
    this._mouseWheelStep = this._scrollStep * 2;
    this._decelerationRate = UIConfig.defaultScrollDecelerationRate;
    this._snappingPolicy = 0;
    o.on(Event.TOUCH_BEGIN, this.onTouchBegin, this);
    o.on(Event.TOUCH_MOVE, this.onTouchMove, this);
    o.on(Event.TOUCH_END, this.onTouchEnd, this);
    o.on(Event.MOUSE_WHEEL, this.onMouseWheel, this);
  }
  applySettings(scrollType, scrollBarDisplay, flags, scrollBarMargin, vtScrollBarRes, hzScrollBarRes, headerRes, footerRes) {
    this._scrollType = scrollType;
    if (scrollBarMargin) {
      this._scrollBarMargin.top = scrollBarMargin.top;
      this._scrollBarMargin.bottom = scrollBarMargin.bottom;
      this._scrollBarMargin.left = scrollBarMargin.left;
      this._scrollBarMargin.right = scrollBarMargin.right;
    }
    if ((flags & 1) != 0)
      this._displayOnLeft = true;
    if ((flags & 2) != 0)
      this._snapToItem = true;
    if ((flags & 4) != 0)
      this._displayInDemand = true;
    if ((flags & 8) != 0)
      this._pageMode = true;
    if (flags & 16)
      this._touchEffect = true;
    else if (flags & 32)
      this._touchEffect = false;
    else
      this._touchEffect = UIConfig.defaultScrollTouchEffect;
    if (flags & 64)
      this._bouncebackEffect = true;
    else if (flags & 128)
      this._bouncebackEffect = false;
    else
      this._bouncebackEffect = UIConfig.defaultScrollBounceEffect;
    if ((flags & 256) != 0)
      this._inertiaDisabled = true;
    if ((flags & 512) != 0)
      this._dontClip = true;
    if ((flags & 1024) != 0)
      this._floating = true;
    if ((flags & 2048) != 0)
      this._dontClipMargin = true;
    if (!this._dontClip)
      this._maskContainer.addComponent(import_cc.Mask);
    if (scrollBarDisplay == ScrollBarDisplayType.Default)
      scrollBarDisplay = UIConfig.defaultScrollBarDisplay;
    if (scrollBarDisplay != ScrollBarDisplayType.Hidden) {
      if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical) {
        var res = vtScrollBarRes ? vtScrollBarRes : UIConfig.verticalScrollBar;
        if (res) {
          this._vtScrollBar = UIPackage.createObjectFromURL(res);
          if (!this._vtScrollBar)
            throw new Error("cannot create scrollbar from " + res);
          this._vtScrollBar.setScrollPane(this, true);
          this._vtScrollBar.node.parent = this._owner.node;
        }
      }
      if (this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Horizontal) {
        var res = hzScrollBarRes ? hzScrollBarRes : UIConfig.horizontalScrollBar;
        if (res) {
          this._hzScrollBar = UIPackage.createObjectFromURL(res);
          if (!this._hzScrollBar)
            throw new Error("cannot create scrollbar from " + res);
          this._hzScrollBar.setScrollPane(this, false);
          this._hzScrollBar.node.parent = this._owner.node;
        }
      }
      if (scrollBarDisplay == ScrollBarDisplayType.Auto)
        this._scrollBarDisplayAuto = true;
      if (this._scrollBarDisplayAuto) {
        if (this._vtScrollBar)
          this._vtScrollBar.node.active = false;
        if (this._hzScrollBar)
          this._hzScrollBar.node.active = false;
        this._owner.on(Event.ROLL_OVER, this.onRollOver, this);
        this._owner.on(Event.ROLL_OUT, this.onRollOut, this);
      }
    }
    if (headerRes) {
      this._header = UIPackage.createObjectFromURL(headerRes);
      if (this._header == null)
        throw new Error("cannot create scrollPane header from " + headerRes);
      else
        this._maskContainer.insertChild(this._header.node, 0);
    }
    if (footerRes) {
      this._footer = UIPackage.createObjectFromURL(footerRes);
      if (this._footer == null)
        throw new Error("cannot create scrollPane footer from " + footerRes);
      else
        this._maskContainer.insertChild(this._footer.node, 0);
    }
    this._refreshBarAxis = this._scrollType == ScrollType.Both || this._scrollType == ScrollType.Vertical ? "y" : "x";
    this.setSize(this._owner.width, this._owner.height);
  }
  static parseScrollType(value) {
    switch (value) {
      case "horizontal":
        return ScrollType.Horizontal;
      case "both":
        return ScrollType.Both;
      default:
        return ScrollType.Vertical;
    }
  }
  static parseScrollBarDisplay(value) {
    switch (value) {
      case "visible":
        return ScrollBarDisplayType.Visible;
      case "auto":
        return ScrollBarDisplayType.Auto;
      case "hidden":
        return ScrollBarDisplayType.Hidden;
      default:
        return ScrollBarDisplayType.Default;
    }
  }
  static parseMargin(rawValue) {
    if (!rawValue)
      return void 0;
    const values = rawValue.split(",").map((item) => _ScrollPane.readInt(item.trim(), 0));
    if (values.length !== 4)
      return void 0;
    const margin = new Margin();
    margin.top = values[0];
    margin.bottom = values[1];
    margin.left = values[2];
    margin.right = values[3];
    return margin;
  }
  static readInt(rawValue, defaultValue) {
    if (rawValue == null)
      return defaultValue;
    const value = Number.parseInt(rawValue, 10);
    return Number.isNaN(value) ? defaultValue : value;
  }
  onDestroy() {
    delete this._pageController;
    if (this._hzScrollBar)
      this._hzScrollBar.dispose();
    if (this._vtScrollBar)
      this._vtScrollBar.dispose();
    if (this._header)
      this._header.dispose();
    if (this._footer)
      this._footer.dispose();
  }
  hitTest(pt, globalPt) {
    let target;
    if (this._vtScrollBar) {
      target = this._vtScrollBar.hitTest(globalPt);
      if (target)
        return target;
    }
    if (this._hzScrollBar) {
      target = this._hzScrollBar.hitTest(globalPt);
      if (target)
        return target;
    }
    if (this._header && this._header.node.activeInHierarchy) {
      target = this._header.hitTest(globalPt);
      if (target)
        return target;
    }
    if (this._footer && this._footer.node.activeInHierarchy) {
      target = this._footer.hitTest(globalPt);
      if (target)
        return target;
    }
    if (this._dontClip)
      return this._owner;
    else if (this._dontClipMargin) {
      if (pt.x >= 0 && pt.y >= 0 && pt.x < this._owner.width && pt.y < this._owner.height)
        return this._owner;
    } else {
      if (pt.x >= this._owner.margin.left && pt.y >= this._owner.margin.top && pt.x < this._owner.margin.left + this._viewSize.x && pt.y < this._owner.margin.top + this._viewSize.y)
        return this._owner;
    }
    return null;
  }
  get owner() {
    return this._owner;
  }
  get hzScrollBar() {
    return this._hzScrollBar;
  }
  get vtScrollBar() {
    return this._vtScrollBar;
  }
  get header() {
    return this._header;
  }
  get footer() {
    return this._footer;
  }
  get bouncebackEffect() {
    return this._bouncebackEffect;
  }
  set bouncebackEffect(sc) {
    this._bouncebackEffect = sc;
  }
  get touchEffect() {
    return this._touchEffect;
  }
  set touchEffect(sc) {
    this._touchEffect = sc;
  }
  set scrollStep(val) {
    this._scrollStep = val;
    if (this._scrollStep == 0)
      this._scrollStep = UIConfig.defaultScrollStep;
    this._mouseWheelStep = this._scrollStep * 2;
  }
  get decelerationRate() {
    return this._decelerationRate;
  }
  set decelerationRate(val) {
    this._decelerationRate = val;
  }
  get scrollStep() {
    return this._scrollStep;
  }
  get snapToItem() {
    return this._snapToItem;
  }
  set snapToItem(value) {
    this._snapToItem = value;
  }
  get snappingPolicy() {
    return this._snappingPolicy;
  }
  set snappingPolicy(value) {
    this._snappingPolicy = value;
  }
  get mouseWheelEnabled() {
    return this._mouseWheelEnabled;
  }
  set mouseWheelEnabled(value) {
    this._mouseWheelEnabled = value;
  }
  get isDragged() {
    return this._dragged;
  }
  get percX() {
    return this._overlapSize.x == 0 ? 0 : this._xPos / this._overlapSize.x;
  }
  set percX(value) {
    this.setPercX(value, false);
  }
  setPercX(value, ani) {
    this._owner.ensureBoundsCorrect();
    this.setPosX(this._overlapSize.x * import_cc.math.clamp01(value), ani);
  }
  get percY() {
    return this._overlapSize.y == 0 ? 0 : this._yPos / this._overlapSize.y;
  }
  set percY(value) {
    this.setPercY(value, false);
  }
  setPercY(value, ani) {
    this._owner.ensureBoundsCorrect();
    this.setPosY(this._overlapSize.y * import_cc.math.clamp01(value), ani);
  }
  get posX() {
    return this._xPos;
  }
  set posX(value) {
    this.setPosX(value, false);
  }
  setPosX(value, ani) {
    this._owner.ensureBoundsCorrect();
    if (this._loop == 1)
      value = this.loopCheckingNewPos(value, "x");
    value = import_cc.math.clamp(value, 0, this._overlapSize.x);
    if (value != this._xPos) {
      this._xPos = value;
      this.posChanged(ani);
    }
  }
  get posY() {
    return this._yPos;
  }
  set posY(value) {
    this.setPosY(value, false);
  }
  setPosY(value, ani) {
    this._owner.ensureBoundsCorrect();
    if (this._loop == 1)
      value = this.loopCheckingNewPos(value, "y");
    value = import_cc.math.clamp(value, 0, this._overlapSize.y);
    if (value != this._yPos) {
      this._yPos = value;
      this.posChanged(ani);
    }
  }
  get contentWidth() {
    return this._contentSize.x;
  }
  get contentHeight() {
    return this._contentSize.y;
  }
  get viewWidth() {
    return this._viewSize.x;
  }
  set viewWidth(value) {
    value = value + this._owner.margin.left + this._owner.margin.right;
    if (this._vtScrollBar && !this._floating)
      value += this._vtScrollBar.width;
    this._owner.width = value;
  }
  get viewHeight() {
    return this._viewSize.y;
  }
  set viewHeight(value) {
    value = value + this._owner.margin.top + this._owner.margin.bottom;
    if (this._hzScrollBar && !this._floating)
      value += this._hzScrollBar.height;
    this._owner.height = value;
  }
  get currentPageX() {
    if (!this._pageMode)
      return 0;
    var page = Math.floor(this._xPos / this._pageSize.x);
    if (this._xPos - page * this._pageSize.x > this._pageSize.x * 0.5)
      page++;
    return page;
  }
  set currentPageX(value) {
    this.setCurrentPageX(value, false);
  }
  get currentPageY() {
    if (!this._pageMode)
      return 0;
    var page = Math.floor(this._yPos / this._pageSize.y);
    if (this._yPos - page * this._pageSize.y > this._pageSize.y * 0.5)
      page++;
    return page;
  }
  set currentPageY(value) {
    this.setCurrentPageY(value, false);
  }
  setCurrentPageX(value, ani) {
    if (!this._pageMode)
      return;
    this._owner.ensureBoundsCorrect();
    if (this._overlapSize.x > 0)
      this.setPosX(value * this._pageSize.x, ani);
  }
  setCurrentPageY(value, ani) {
    if (!this._pageMode)
      return;
    this._owner.ensureBoundsCorrect();
    if (this._overlapSize.y > 0)
      this.setPosY(value * this._pageSize.y, ani);
  }
  get isBottomMost() {
    return this._yPos == this._overlapSize.y || this._overlapSize.y == 0;
  }
  get isRightMost() {
    return this._xPos == this._overlapSize.x || this._overlapSize.x == 0;
  }
  get pageController() {
    return this._pageController;
  }
  set pageController(value) {
    this._pageController = value;
  }
  get scrollingPosX() {
    return import_cc.math.clamp(-this._container.position.x, 0, this._overlapSize.x);
  }
  get scrollingPosY() {
    return import_cc.math.clamp(- -this._container.position.y, 0, this._overlapSize.y);
  }
  scrollTop(ani) {
    this.setPercY(0, ani);
  }
  scrollBottom(ani) {
    this.setPercY(1, ani);
  }
  scrollUp(ratio, ani) {
    if (ratio == void 0)
      ratio = 1;
    if (this._pageMode)
      this.setPosY(this._yPos - this._pageSize.y * ratio, ani);
    else
      this.setPosY(this._yPos - this._scrollStep * ratio, ani);
  }
  scrollDown(ratio, ani) {
    if (ratio == void 0)
      ratio = 1;
    if (this._pageMode)
      this.setPosY(this._yPos + this._pageSize.y * ratio, ani);
    else
      this.setPosY(this._yPos + this._scrollStep * ratio, ani);
  }
  scrollLeft(ratio, ani) {
    if (ratio == void 0)
      ratio = 1;
    if (this._pageMode)
      this.setPosX(this._xPos - this._pageSize.x * ratio, ani);
    else
      this.setPosX(this._xPos - this._scrollStep * ratio, ani);
  }
  scrollRight(ratio, ani) {
    if (ratio == void 0)
      ratio = 1;
    if (this._pageMode)
      this.setPosX(this._xPos + this._pageSize.x * ratio, ani);
    else
      this.setPosX(this._xPos + this._scrollStep * ratio, ani);
  }
  scrollToView(target, ani, setFirst) {
    this._owner.ensureBoundsCorrect();
    if (this._needRefresh)
      this.refresh();
    var rect;
    if (target instanceof GObject) {
      if (target.parent != this._owner) {
        target.parent.localToGlobalRect(target.x, target.y, target.width, target.height, s_rect);
        rect = this._owner.globalToLocalRect(s_rect.x, s_rect.y, s_rect.width, s_rect.height, s_rect);
      } else {
        rect = s_rect;
        rect.x = target.x;
        rect.y = target.y;
        rect.width = target.width;
        rect.height = target.height;
      }
    } else
      rect = target;
    if (this._overlapSize.y > 0) {
      var bottom = this._yPos + this._viewSize.y;
      if (setFirst || rect.y <= this._yPos || rect.height >= this._viewSize.y) {
        if (this._pageMode)
          this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
        else
          this.setPosY(rect.y, ani);
      } else if (rect.y + rect.height > bottom) {
        if (this._pageMode)
          this.setPosY(Math.floor(rect.y / this._pageSize.y) * this._pageSize.y, ani);
        else if (rect.height <= this._viewSize.y / 2)
          this.setPosY(rect.y + rect.height * 2 - this._viewSize.y, ani);
        else
          this.setPosY(rect.y + rect.height - this._viewSize.y, ani);
      }
    }
    if (this._overlapSize.x > 0) {
      var right = this._xPos + this._viewSize.x;
      if (setFirst || rect.x <= this._xPos || rect.width >= this._viewSize.x) {
        if (this._pageMode)
          this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
        else
          this.setPosX(rect.x, ani);
      } else if (rect.x + rect.width > right) {
        if (this._pageMode)
          this.setPosX(Math.floor(rect.x / this._pageSize.x) * this._pageSize.x, ani);
        else if (rect.width <= this._viewSize.x / 2)
          this.setPosX(rect.x + rect.width * 2 - this._viewSize.x, ani);
        else
          this.setPosX(rect.x + rect.width - this._viewSize.x, ani);
      }
    }
    if (!ani && this._needRefresh)
      this.refresh();
  }
  isChildInView(obj) {
    if (this._overlapSize.y > 0) {
      var dist = obj.y + -this._container.position.y;
      if (dist < -obj.height || dist > this._viewSize.y)
        return false;
    }
    if (this._overlapSize.x > 0) {
      dist = obj.x + this._container.position.x;
      if (dist < -obj.width || dist > this._viewSize.x)
        return false;
    }
    return true;
  }
  cancelDragging() {
    if (_ScrollPane.draggingPane == this)
      _ScrollPane.draggingPane = null;
    _gestureFlag = 0;
    this._dragged = false;
  }
  lockHeader(size) {
    if (this._headerLockedSize == size)
      return;
    let cx = this._container.position.x;
    let cy = -this._container.position.y;
    let cr = this._refreshBarAxis == "x" ? cx : cy;
    this._headerLockedSize = size;
    if (!this._refreshEventDispatching && cr >= 0) {
      this._tweenStart.x = cx;
      this._tweenStart.y = cy;
      this._tweenChange.set(import_cc.Vec2.ZERO);
      this._tweenChange[this._refreshBarAxis] = this._headerLockedSize - this._tweenStart[this._refreshBarAxis];
      this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
      this.startTween(2);
    }
  }
  lockFooter(size) {
    if (this._footerLockedSize == size)
      return;
    let cx = this._container.position.x;
    let cy = -this._container.position.y;
    let cr = this._refreshBarAxis == "x" ? cx : cy;
    this._footerLockedSize = size;
    if (!this._refreshEventDispatching && cr <= -this._overlapSize[this._refreshBarAxis]) {
      this._tweenStart.x = cx;
      this._tweenStart.y = cy;
      this._tweenChange.set(import_cc.Vec2.ZERO);
      var max = this._overlapSize[this._refreshBarAxis];
      if (max == 0)
        max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
      else
        max += this._footerLockedSize;
      this._tweenChange[this._refreshBarAxis] = -max - this._tweenStart[this._refreshBarAxis];
      this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
      this.startTween(2);
    }
  }
  onOwnerSizeChanged() {
    this.setSize(this._owner.width, this._owner.height);
    this.posChanged(false);
  }
  handleControllerChanged(c) {
    if (this._pageController == c) {
      if (this._scrollType == ScrollType.Horizontal)
        this.setCurrentPageX(c.selectedIndex, true);
      else
        this.setCurrentPageY(c.selectedIndex, true);
    }
  }
  updatePageController() {
    if (this._pageController && !this._pageController.changing) {
      var index;
      if (this._scrollType == ScrollType.Horizontal)
        index = this.currentPageX;
      else
        index = this.currentPageY;
      if (index < this._pageController.pageCount) {
        var c = this._pageController;
        this._pageController = null;
        c.selectedIndex = index;
        this._pageController = c;
      }
    }
  }
  adjustMaskContainer() {
    var mx = 0;
    if (this._displayOnLeft && this._vtScrollBar && !this._floating)
      mx = this._vtScrollBar.width;
    const o = this._owner;
    if (this._dontClipMargin)
      this._maskContainerUITrans.setAnchorPoint((o.margin.left + o._alignOffset.x) / o.width, 1 - (o.margin.top + o._alignOffset.y) / o.height);
    else
      this._maskContainerUITrans.setAnchorPoint(o._alignOffset.x / this._viewSize.x, 1 - o._alignOffset.y / this._viewSize.y);
    if (o._customMask)
      this._maskContainer.setPosition(mx + o._alignOffset.x, -o._alignOffset.y);
    else
      this._maskContainer.setPosition(o._pivotCorrectX + mx + o._alignOffset.x, o._pivotCorrectY - o._alignOffset.y);
  }
  setSize(aWidth, aHeight) {
    if (this._hzScrollBar) {
      this._hzScrollBar.y = aHeight - this._hzScrollBar.height;
      if (this._vtScrollBar) {
        this._hzScrollBar.width = aWidth - this._vtScrollBar.width - this._scrollBarMargin.left - this._scrollBarMargin.right;
        if (this._displayOnLeft)
          this._hzScrollBar.x = this._scrollBarMargin.left + this._vtScrollBar.width;
        else
          this._hzScrollBar.x = this._scrollBarMargin.left;
      } else {
        this._hzScrollBar.width = aWidth - this._scrollBarMargin.left - this._scrollBarMargin.right;
        this._hzScrollBar.x = this._scrollBarMargin.left;
      }
    }
    if (this._vtScrollBar) {
      if (!this._displayOnLeft)
        this._vtScrollBar.x = aWidth - this._vtScrollBar.width;
      if (this._hzScrollBar)
        this._vtScrollBar.height = aHeight - this._hzScrollBar.height - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
      else
        this._vtScrollBar.height = aHeight - this._scrollBarMargin.top - this._scrollBarMargin.bottom;
      this._vtScrollBar.y = this._scrollBarMargin.top;
    }
    this._viewSize.x = aWidth;
    this._viewSize.y = aHeight;
    if (this._hzScrollBar && !this._floating)
      this._viewSize.y -= this._hzScrollBar.height;
    if (this._vtScrollBar && !this._floating)
      this._viewSize.x -= this._vtScrollBar.width;
    this._viewSize.x -= this._owner.margin.left + this._owner.margin.right;
    this._viewSize.y -= this._owner.margin.top + this._owner.margin.bottom;
    this._viewSize.x = Math.max(1, this._viewSize.x);
    this._viewSize.y = Math.max(1, this._viewSize.y);
    this._pageSize.x = this._viewSize.x;
    this._pageSize.y = this._viewSize.y;
    this.adjustMaskContainer();
    this.handleSizeChanged();
  }
  setContentSize(aWidth, aHeight) {
    if (this._contentSize.x == aWidth && this._contentSize.y == aHeight)
      return;
    this._contentSize.x = aWidth;
    this._contentSize.y = aHeight;
    this.handleSizeChanged();
    if (this._snapToItem && this._snappingPolicy != 0 && this._xPos == 0 && this._yPos == 0)
      this.posChanged(false);
  }
  changeContentSizeOnScrolling(deltaWidth, deltaHeight, deltaPosX, deltaPosY) {
    var isRightmost = this._xPos == this._overlapSize.x;
    var isBottom = this._yPos == this._overlapSize.y;
    this._contentSize.x += deltaWidth;
    this._contentSize.y += deltaHeight;
    this.handleSizeChanged();
    if (this._tweening == 1) {
      if (deltaWidth != 0 && isRightmost && this._tweenChange.x < 0) {
        this._xPos = this._overlapSize.x;
        this._tweenChange.x = -this._xPos - this._tweenStart.x;
      }
      if (deltaHeight != 0 && isBottom && this._tweenChange.y < 0) {
        this._yPos = this._overlapSize.y;
        this._tweenChange.y = -this._yPos - this._tweenStart.y;
      }
    } else if (this._tweening == 2) {
      if (deltaPosX != 0) {
        this._container.setPosition(this._container.position.x - deltaPosX, this._container.position.y);
        this._tweenStart.x -= deltaPosX;
        this._xPos = -this._container.position.x;
      }
      if (deltaPosY != 0) {
        this._container.setPosition(this._container.position.x, this._container.position.y + deltaPosY);
        this._tweenStart.y -= deltaPosY;
        this._yPos = - -this._container.position.y;
      }
    } else if (this._dragged) {
      if (deltaPosX != 0) {
        this._container.setPosition(this._container.position.x - deltaPosX, this._container.position.y);
        this._containerPos.x -= deltaPosX;
        this._xPos = -this._container.position.x;
      }
      if (deltaPosY != 0) {
        this._container.setPosition(this._container.position.x, this._container.position.y + deltaPosY);
        this._containerPos.y -= deltaPosY;
        this._yPos = - -this._container.position.y;
      }
    } else {
      if (deltaWidth != 0 && isRightmost) {
        this._xPos = this._overlapSize.x;
        this._container.setPosition(-this._xPos, this._container.position.y);
      }
      if (deltaHeight != 0 && isBottom) {
        this._yPos = this._overlapSize.y;
        this._container.setPosition(this._container.position.x, this._yPos);
      }
    }
    if (this._pageMode)
      this.updatePageController();
  }
  handleSizeChanged() {
    if (this._displayInDemand) {
      this._vScrollNone = this._contentSize.y <= this._viewSize.y;
      this._hScrollNone = this._contentSize.x <= this._viewSize.x;
    }
    if (this._vtScrollBar) {
      if (this._contentSize.y == 0)
        this._vtScrollBar.setDisplayPerc(0);
      else
        this._vtScrollBar.setDisplayPerc(Math.min(1, this._viewSize.y / this._contentSize.y));
    }
    if (this._hzScrollBar) {
      if (this._contentSize.x == 0)
        this._hzScrollBar.setDisplayPerc(0);
      else
        this._hzScrollBar.setDisplayPerc(Math.min(1, this._viewSize.x / this._contentSize.x));
    }
    this.updateScrollBarVisible();
    var maskWidth = this._viewSize.x;
    var maskHeight = this._viewSize.y;
    if (this._vScrollNone && this._vtScrollBar)
      maskWidth += this._vtScrollBar.width;
    if (this._hScrollNone && this._hzScrollBar)
      maskHeight += this._hzScrollBar.height;
    if (this._dontClipMargin) {
      maskWidth += this._owner.margin.left + this._owner.margin.right;
      maskHeight += this._owner.margin.top + this._owner.margin.bottom;
    }
    this._maskContainerUITrans.setContentSize(maskWidth, maskHeight);
    if (this._vtScrollBar)
      this._vtScrollBar.handlePositionChanged();
    if (this._hzScrollBar)
      this._hzScrollBar.handlePositionChanged();
    if (this._header)
      this._header.handlePositionChanged();
    if (this._footer)
      this._footer.handlePositionChanged();
    if (this._scrollType == ScrollType.Horizontal || this._scrollType == ScrollType.Both)
      this._overlapSize.x = Math.ceil(Math.max(0, this._contentSize.x - this._viewSize.x));
    else
      this._overlapSize.x = 0;
    if (this._scrollType == ScrollType.Vertical || this._scrollType == ScrollType.Both)
      this._overlapSize.y = Math.ceil(Math.max(0, this._contentSize.y - this._viewSize.y));
    else
      this._overlapSize.y = 0;
    this._xPos = import_cc.math.clamp(this._xPos, 0, this._overlapSize.x);
    this._yPos = import_cc.math.clamp(this._yPos, 0, this._overlapSize.y);
    var max = this._overlapSize[this._refreshBarAxis];
    if (max == 0)
      max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
    else
      max += this._footerLockedSize;
    if (this._refreshBarAxis == "x")
      this._container.setPosition(import_cc.math.clamp(this._container.position.x, -max, this._headerLockedSize), -import_cc.math.clamp(-this._container.position.y, -this._overlapSize.y, 0));
    else
      this._container.setPosition(import_cc.math.clamp(this._container.position.x, -this._overlapSize.x, 0), -import_cc.math.clamp(-this._container.position.y, -max, this._headerLockedSize));
    if (this._header) {
      if (this._refreshBarAxis == "x")
        this._header.height = this._viewSize.y;
      else
        this._header.width = this._viewSize.x;
    }
    if (this._footer) {
      if (this._refreshBarAxis == "y")
        this._footer.height = this._viewSize.y;
      else
        this._footer.width = this._viewSize.x;
    }
    this.updateScrollBarPos();
    if (this._pageMode)
      this.updatePageController();
  }
  posChanged(ani) {
    if (this._aniFlag == 0)
      this._aniFlag = ani ? 1 : -1;
    else if (this._aniFlag == 1 && !ani)
      this._aniFlag = -1;
    this._needRefresh = true;
    if (!import_cc.director.getScheduler().isScheduled(this.refresh, this))
      this.scheduleOnce(this.refresh);
  }
  refresh(dt) {
    this._needRefresh = false;
    this.unschedule(this.refresh);
    if (this._pageMode || this._snapToItem) {
      sEndPos.x = -this._xPos;
      sEndPos.y = -this._yPos;
      this.alignPosition(sEndPos, false);
      this._xPos = -sEndPos.x;
      this._yPos = -sEndPos.y;
    }
    this.refresh2();
    this._owner.node.emit(Event.SCROLL, this._owner);
    if (this._needRefresh) {
      this._needRefresh = false;
      this.unschedule(this.refresh);
      this.refresh2();
    }
    this.updateScrollBarPos();
    this._aniFlag = 0;
  }
  refresh2() {
    if (this._aniFlag == 1 && !this._dragged) {
      var posX;
      var posY;
      if (this._overlapSize.x > 0)
        posX = -Math.floor(this._xPos);
      else {
        if (this._container.position.x != 0)
          this._container.setPosition(0, this._container.position.y);
        posX = 0;
      }
      if (this._overlapSize.y > 0)
        posY = -Math.floor(this._yPos);
      else {
        if (this._container.position.y != 0)
          this._container.setPosition(this._container.position.x, 0);
        posY = 0;
      }
      if (posX != this._container.position.x || posY != -this._container.position.y) {
        this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_GO;
        this._tweenStart.x = this._container.position.x;
        this._tweenStart.y = -this._container.position.y;
        this._tweenChange.x = posX - this._tweenStart.x;
        this._tweenChange.y = posY - this._tweenStart.y;
        this.startTween(1);
      } else if (this._tweening != 0)
        this.killTween();
    } else {
      if (this._tweening != 0)
        this.killTween();
      this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));
      this.loopCheckingCurrent();
    }
    if (this._pageMode)
      this.updatePageController();
  }
  onTouchBegin(evt) {
    if (!this._touchEffect)
      return;
    evt.captureTouch();
    if (this._tweening != 0) {
      this.killTween();
      Decls$1.GRoot.inst.inputProcessor.cancelClick(evt.touchId);
      this._dragged = true;
    } else
      this._dragged = false;
    var pt = this._owner.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$3);
    this._containerPos.x = this._container.position.x;
    this._containerPos.y = -this._container.position.y;
    this._beginTouchPos.set(pt);
    this._lastTouchPos.set(pt);
    this._lastTouchGlobalPos.set(evt.pos);
    this._isHoldAreaDone = false;
    this._velocity.set(import_cc.Vec2.ZERO);
    this._velocityScale = 1;
    this._lastMoveTime = import_cc.game.totalTime / 1e3;
  }
  onTouchMove(evt) {
    if (!(0, import_cc.isValid)(this._owner.node))
      return;
    if (!this._touchEffect)
      return;
    if (GObject.draggingObject && GObject.draggingObject.onStage)
      return;
    if (_ScrollPane.draggingPane && _ScrollPane.draggingPane != this && _ScrollPane.draggingPane._owner.onStage)
      return;
    var pt = this._owner.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$3);
    var sensitivity = UIConfig.touchScrollSensitivity;
    var diff, diff2;
    var sv, sh;
    if (this._scrollType == ScrollType.Vertical) {
      if (!this._isHoldAreaDone) {
        _gestureFlag |= 1;
        diff = Math.abs(this._beginTouchPos.y - pt.y);
        if (diff < sensitivity)
          return;
        if ((_gestureFlag & 2) != 0) {
          diff2 = Math.abs(this._beginTouchPos.x - pt.x);
          if (diff < diff2)
            return;
        }
      }
      sv = true;
    } else if (this._scrollType == ScrollType.Horizontal) {
      if (!this._isHoldAreaDone) {
        _gestureFlag |= 2;
        diff = Math.abs(this._beginTouchPos.x - pt.x);
        if (diff < sensitivity)
          return;
        if ((_gestureFlag & 1) != 0) {
          diff2 = Math.abs(this._beginTouchPos.y - pt.y);
          if (diff < diff2)
            return;
        }
      }
      sh = true;
    } else {
      _gestureFlag = 3;
      if (!this._isHoldAreaDone) {
        diff = Math.abs(this._beginTouchPos.y - pt.y);
        if (diff < sensitivity) {
          diff = Math.abs(this._beginTouchPos.x - pt.x);
          if (diff < sensitivity)
            return;
        }
      }
      sv = sh = true;
    }
    var newPosX = Math.floor(this._containerPos.x + pt.x - this._beginTouchPos.x);
    var newPosY = Math.floor(this._containerPos.y + pt.y - this._beginTouchPos.y);
    if (sv) {
      if (newPosY > 0) {
        if (!this._bouncebackEffect)
          this._container.setPosition(this._container.position.x, 0);
        else if (this._header && this._header.maxHeight != 0)
          this._container.setPosition(this._container.position.x, -Math.floor(Math.min(newPosY * 0.5, this._header.maxHeight)));
        else
          this._container.setPosition(this._container.position.x, -Math.floor(Math.min(newPosY * 0.5, this._viewSize.y * PULL_RATIO)));
      } else if (newPosY < -this._overlapSize.y) {
        if (!this._bouncebackEffect)
          this._container.setPosition(this._container.position.x, this._overlapSize.y);
        else if (this._footer && this._footer.maxHeight > 0)
          this._container.setPosition(this._container.position.x, -Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._footer.maxHeight) - this._overlapSize.y));
        else
          this._container.setPosition(this._container.position.x, -Math.floor(Math.max((newPosY + this._overlapSize.y) * 0.5, -this._viewSize.y * PULL_RATIO) - this._overlapSize.y));
      } else
        this._container.setPosition(this._container.position.x, -newPosY);
    }
    if (sh) {
      if (newPosX > 0) {
        if (!this._bouncebackEffect)
          this._container.setPosition(0, this._container.position.y);
        else if (this._header && this._header.maxWidth != 0)
          this._container.setPosition(Math.floor(Math.min(newPosX * 0.5, this._header.maxWidth)), this._container.position.y);
        else
          this._container.setPosition(Math.floor(Math.min(newPosX * 0.5, this._viewSize.x * PULL_RATIO)), this._container.position.y);
      } else if (newPosX < 0 - this._overlapSize.x) {
        if (!this._bouncebackEffect)
          this._container.setPosition(-this._overlapSize.x, this._container.position.y);
        else if (this._footer && this._footer.maxWidth > 0)
          this._container.setPosition(Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._footer.maxWidth) - this._overlapSize.x), this._container.position.y);
        else
          this._container.setPosition(Math.floor(Math.max((newPosX + this._overlapSize.x) * 0.5, -this._viewSize.x * PULL_RATIO) - this._overlapSize.x), this._container.position.y);
      } else
        this._container.setPosition(newPosX, this._container.position.y);
    }
    var now = import_cc.game.totalTime / 1e3;
    var deltaTime = Math.max(now - this._lastMoveTime, 1 / 60);
    var deltaPositionX = pt.x - this._lastTouchPos.x;
    var deltaPositionY = pt.y - this._lastTouchPos.y;
    if (!sh)
      deltaPositionX = 0;
    if (!sv)
      deltaPositionY = 0;
    if (deltaTime != 0) {
      var frameRate = 60;
      var elapsed = deltaTime * frameRate - 1;
      if (elapsed > 1) {
        var factor = Math.pow(0.833, elapsed);
        this._velocity.x = this._velocity.x * factor;
        this._velocity.y = this._velocity.y * factor;
      }
      this._velocity.x = import_cc.math.lerp(this._velocity.x, deltaPositionX * 60 / frameRate / deltaTime, deltaTime * 10);
      this._velocity.y = import_cc.math.lerp(this._velocity.y, deltaPositionY * 60 / frameRate / deltaTime, deltaTime * 10);
    }
    var deltaGlobalPositionX = this._lastTouchGlobalPos.x - evt.pos.x;
    var deltaGlobalPositionY = this._lastTouchGlobalPos.y - evt.pos.y;
    if (deltaPositionX != 0)
      this._velocityScale = Math.abs(deltaGlobalPositionX / deltaPositionX);
    else if (deltaPositionY != 0)
      this._velocityScale = Math.abs(deltaGlobalPositionY / deltaPositionY);
    this._lastTouchPos.set(pt);
    this._lastTouchGlobalPos.set(evt.pos);
    this._lastMoveTime = now;
    if (this._overlapSize.x > 0)
      this._xPos = import_cc.math.clamp(-this._container.position.x, 0, this._overlapSize.x);
    if (this._overlapSize.y > 0)
      this._yPos = import_cc.math.clamp(- -this._container.position.y, 0, this._overlapSize.y);
    if (this._loop != 0) {
      newPosX = this._container.position.x;
      newPosY = -this._container.position.y;
      if (this.loopCheckingCurrent()) {
        this._containerPos.x += this._container.position.x - newPosX;
        this._containerPos.y += -this._container.position.y - newPosY;
      }
    }
    _ScrollPane.draggingPane = this;
    this._isHoldAreaDone = true;
    this._dragged = true;
    this.updateScrollBarPos();
    this.updateScrollBarVisible();
    if (this._pageMode)
      this.updatePageController();
    this._owner.node.emit(Event.SCROLL);
  }
  onTouchEnd(evt) {
    if (_ScrollPane.draggingPane == this)
      _ScrollPane.draggingPane = null;
    _gestureFlag = 0;
    if (!this._dragged || !this._touchEffect || !this._owner.node.activeInHierarchy) {
      this._dragged = false;
      return;
    }
    this._dragged = false;
    this._tweenStart.x = this._container.position.x;
    this._tweenStart.y = -this._container.position.y;
    sEndPos.set(this._tweenStart);
    var flag = false;
    if (this._container.position.x > 0) {
      sEndPos.x = 0;
      flag = true;
    } else if (this._container.position.x < -this._overlapSize.x) {
      sEndPos.x = -this._overlapSize.x;
      flag = true;
    }
    if (-this._container.position.y > 0) {
      sEndPos.y = 0;
      flag = true;
    } else if (-this._container.position.y < -this._overlapSize.y) {
      sEndPos.y = -this._overlapSize.y;
      flag = true;
    }
    if (flag) {
      this._tweenChange.x = sEndPos.x - this._tweenStart.x;
      this._tweenChange.y = sEndPos.y - this._tweenStart.y;
      if (this._tweenChange.x < -UIConfig.touchDragSensitivity || this._tweenChange.y < -UIConfig.touchDragSensitivity) {
        this._refreshEventDispatching = true;
        this._owner.node.emit(Event.PULL_DOWN_RELEASE), this._owner;
        this._refreshEventDispatching = false;
      } else if (this._tweenChange.x > UIConfig.touchDragSensitivity || this._tweenChange.y > UIConfig.touchDragSensitivity) {
        this._refreshEventDispatching = true;
        this._owner.node.emit(Event.PULL_UP_RELEASE, this._owner);
        this._refreshEventDispatching = false;
      }
      if (this._headerLockedSize > 0 && sEndPos[this._refreshBarAxis] == 0) {
        sEndPos[this._refreshBarAxis] = this._headerLockedSize;
        this._tweenChange.x = sEndPos.x - this._tweenStart.x;
        this._tweenChange.y = sEndPos.y - this._tweenStart.y;
      } else if (this._footerLockedSize > 0 && sEndPos[this._refreshBarAxis] == -this._overlapSize[this._refreshBarAxis]) {
        var max = this._overlapSize[this._refreshBarAxis];
        if (max == 0)
          max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
        else
          max += this._footerLockedSize;
        sEndPos[this._refreshBarAxis] = -max;
        this._tweenChange.x = sEndPos.x - this._tweenStart.x;
        this._tweenChange.y = sEndPos.y - this._tweenStart.y;
      }
      this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
    } else {
      if (!this._inertiaDisabled) {
        var frameRate = 60;
        var elapsed = (import_cc.game.totalTime / 1e3 - this._lastMoveTime) * frameRate - 1;
        if (elapsed > 1) {
          var factor = Math.pow(0.833, elapsed);
          this._velocity.x = this._velocity.x * factor;
          this._velocity.y = this._velocity.y * factor;
        }
        this.updateTargetAndDuration(this._tweenStart, sEndPos);
      } else
        this._tweenDuration.x = this._tweenDuration.y = TWEEN_TIME_DEFAULT;
      sOldChange.x = sEndPos.x - this._tweenStart.x;
      sOldChange.y = sEndPos.y - this._tweenStart.y;
      this.loopCheckingTarget(sEndPos);
      if (this._pageMode || this._snapToItem)
        this.alignPosition(sEndPos, true);
      this._tweenChange.x = sEndPos.x - this._tweenStart.x;
      this._tweenChange.y = sEndPos.y - this._tweenStart.y;
      if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
        this.updateScrollBarVisible();
        return;
      }
      if (this._pageMode || this._snapToItem) {
        this.fixDuration("x", sOldChange.x);
        this.fixDuration("y", sOldChange.y);
      }
    }
    this.startTween(2);
  }
  onRollOver() {
    this._hover = true;
    this.updateScrollBarVisible();
  }
  onRollOut() {
    this._hover = false;
    this.updateScrollBarVisible();
  }
  onMouseWheel(evt) {
    if (!this._mouseWheelEnabled)
      return;
    let delta = evt.mouseWheelDelta > 0 ? -1 : 1;
    if (this._overlapSize.x > 0 && this._overlapSize.y == 0) {
      if (this._pageMode)
        this.setPosX(this._xPos + this._pageSize.x * delta, false);
      else
        this.setPosX(this._xPos + this._mouseWheelStep * delta, false);
    } else {
      if (this._pageMode)
        this.setPosY(this._yPos + this._pageSize.y * delta, false);
      else
        this.setPosY(this._yPos + this._mouseWheelStep * delta, false);
    }
  }
  updateScrollBarPos() {
    if (this._vtScrollBar)
      this._vtScrollBar.setScrollPerc(this._overlapSize.y == 0 ? 0 : import_cc.math.clamp(this._container.position.y, 0, this._overlapSize.y) / this._overlapSize.y);
    if (this._hzScrollBar)
      this._hzScrollBar.setScrollPerc(this._overlapSize.x == 0 ? 0 : import_cc.math.clamp(-this._container.position.x, 0, this._overlapSize.x) / this._overlapSize.x);
    this.checkRefreshBar();
  }
  updateScrollBarVisible() {
    if (this._vtScrollBar) {
      if (this._viewSize.y <= this._vtScrollBar.minSize || this._vScrollNone)
        this._vtScrollBar.node.active = false;
      else
        this.updateScrollBarVisible2(this._vtScrollBar);
    }
    if (this._hzScrollBar) {
      if (this._viewSize.x <= this._hzScrollBar.minSize || this._hScrollNone)
        this._hzScrollBar.node.active = false;
      else
        this.updateScrollBarVisible2(this._hzScrollBar);
    }
  }
  updateScrollBarVisible2(bar) {
    if (this._scrollBarDisplayAuto)
      GTween.kill(bar, false, "alpha");
    if (this._scrollBarDisplayAuto && !this._hover && this._tweening == 0 && !this._dragged && !bar.gripDragging) {
      if (bar.node.active)
        GTween.to(1, 0, 0.5).setDelay(0.5).onComplete(this.__barTweenComplete, this).setTarget(bar, "alpha");
    } else {
      bar.alpha = 1;
      bar.node.active = true;
    }
  }
  __barTweenComplete(tweener) {
    var bar = tweener.target;
    bar.alpha = 1;
    bar.node.active = false;
  }
  getLoopPartSize(division, axis) {
    return (this._contentSize[axis] + (axis == "x" ? this._owner.columnGap : this._owner.lineGap)) / division;
  }
  loopCheckingCurrent() {
    var changed = false;
    if (this._loop == 1 && this._overlapSize.x > 0) {
      if (this._xPos < 1e-3) {
        this._xPos += this.getLoopPartSize(2, "x");
        changed = true;
      } else if (this._xPos >= this._overlapSize.x) {
        this._xPos -= this.getLoopPartSize(2, "x");
        changed = true;
      }
    } else if (this._loop == 2 && this._overlapSize.y > 0) {
      if (this._yPos < 1e-3) {
        this._yPos += this.getLoopPartSize(2, "y");
        changed = true;
      } else if (this._yPos >= this._overlapSize.y) {
        this._yPos -= this.getLoopPartSize(2, "y");
        changed = true;
      }
    }
    if (changed) {
      this._container.setPosition(Math.floor(-this._xPos), -Math.floor(-this._yPos));
    }
    return changed;
  }
  loopCheckingTarget(endPos) {
    if (this._loop == 1)
      this.loopCheckingTarget2(endPos, "x");
    if (this._loop == 2)
      this.loopCheckingTarget2(endPos, "y");
  }
  loopCheckingTarget2(endPos, axis) {
    var halfSize;
    var tmp;
    if (endPos[axis] > 0) {
      halfSize = this.getLoopPartSize(2, axis);
      tmp = this._tweenStart[axis] - halfSize;
      if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
        endPos[axis] -= halfSize;
        this._tweenStart[axis] = tmp;
      }
    } else if (endPos[axis] < -this._overlapSize[axis]) {
      halfSize = this.getLoopPartSize(2, axis);
      tmp = this._tweenStart[axis] + halfSize;
      if (tmp <= 0 && tmp >= -this._overlapSize[axis]) {
        endPos[axis] += halfSize;
        this._tweenStart[axis] = tmp;
      }
    }
  }
  loopCheckingNewPos(value, axis) {
    if (this._overlapSize[axis] == 0)
      return value;
    var pos = axis == "x" ? this._xPos : this._yPos;
    var changed = false;
    var v;
    if (value < 1e-3) {
      value += this.getLoopPartSize(2, axis);
      if (value > pos) {
        v = this.getLoopPartSize(6, axis);
        v = Math.ceil((value - pos) / v) * v;
        pos = import_cc.math.clamp(pos + v, 0, this._overlapSize[axis]);
        changed = true;
      }
    } else if (value >= this._overlapSize[axis]) {
      value -= this.getLoopPartSize(2, axis);
      if (value < pos) {
        v = this.getLoopPartSize(6, axis);
        v = Math.ceil((pos - value) / v) * v;
        pos = import_cc.math.clamp(pos - v, 0, this._overlapSize[axis]);
        changed = true;
      }
    }
    if (changed) {
      if (axis == "x")
        this._container.setPosition(-Math.floor(pos), this._container.position.y);
      else
        this._container.setPosition(this._container.position.x, Math.floor(pos));
    }
    return value;
  }
  alignPosition(pos, inertialScrolling) {
    let ax = 0, ay = 0;
    if (this._snappingPolicy == 1) {
      if (this._owner.numChildren > 0) {
        let obj = this._owner.getChildAt(0);
        ax = Math.floor(this._viewSize.x * 0.5 - obj.width * 0.5);
        ay = Math.floor(this._viewSize.y * 0.5 - obj.height * 0.5);
      }
    } else if (this._snappingPolicy == 2) {
      if (this._owner.numChildren > 0) {
        let obj = this._owner.getChildAt(0);
        ax = Math.floor(this._viewSize.x - obj.width);
        ay = Math.floor(this._viewSize.y - obj.height);
      }
    }
    pos.x -= ax;
    pos.y -= ay;
    if (this._pageMode) {
      pos.x = this.alignByPage(pos.x, "x", inertialScrolling);
      pos.y = this.alignByPage(pos.y, "y", inertialScrolling);
    } else if (this._snapToItem) {
      var pt = this._owner.getSnappingPosition(-pos.x, -pos.y, s_vec2$3);
      if (pos.x < 0 && pos.x > -this._overlapSize.x)
        pos.x = -pt.x;
      if (pos.y < 0 && pos.y > -this._overlapSize.y)
        pos.y = -pt.y;
    }
    pos.x += ax;
    pos.y += ay;
  }
  alignByPage(pos, axis, inertialScrolling) {
    var page;
    if (pos > 0)
      page = 0;
    else if (pos < -this._overlapSize[axis])
      page = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
    else {
      page = Math.floor(-pos / this._pageSize[axis]);
      var change = inertialScrolling ? pos - this._containerPos[axis] : pos - (axis == "x" ? this._container.position.x : -this._container.position.y);
      var testPageSize = Math.min(this._pageSize[axis], this._contentSize[axis] - (page + 1) * this._pageSize[axis]);
      var delta = -pos - page * this._pageSize[axis];
      if (Math.abs(change) > this._pageSize[axis]) {
        if (delta > testPageSize * 0.5)
          page++;
      } else {
        if (delta > testPageSize * (change < 0 ? 0.3 : 0.7))
          page++;
      }
      pos = -page * this._pageSize[axis];
      if (pos < -this._overlapSize[axis])
        pos = -this._overlapSize[axis];
    }
    if (inertialScrolling) {
      var oldPos = this._tweenStart[axis];
      var oldPage;
      if (oldPos > 0)
        oldPage = 0;
      else if (oldPos < -this._overlapSize[axis])
        oldPage = Math.ceil(this._contentSize[axis] / this._pageSize[axis]) - 1;
      else
        oldPage = Math.floor(-oldPos / this._pageSize[axis]);
      var startPage = Math.floor(-this._containerPos[axis] / this._pageSize[axis]);
      if (Math.abs(page - startPage) > 1 && Math.abs(oldPage - startPage) <= 1) {
        if (page > startPage)
          page = startPage + 1;
        else
          page = startPage - 1;
        pos = -page * this._pageSize[axis];
      }
    }
    return pos;
  }
  updateTargetAndDuration(orignPos, resultPos) {
    resultPos.x = this.updateTargetAndDuration2(orignPos.x, "x");
    resultPos.y = this.updateTargetAndDuration2(orignPos.y, "y");
  }
  updateTargetAndDuration2(pos, axis) {
    var v = this._velocity[axis];
    var duration = 0;
    if (pos > 0)
      pos = 0;
    else if (pos < -this._overlapSize[axis])
      pos = -this._overlapSize[axis];
    else {
      var isMobile = import_cc.sys.isMobile;
      var v2 = Math.abs(v) * this._velocityScale;
      const winSize = import_cc.screen.windowSize;
      if (isMobile)
        v2 *= 1136 / Math.max(winSize.width, winSize.height);
      var ratio = 0;
      if (this._pageMode || !isMobile) {
        if (v2 > 500)
          ratio = Math.pow((v2 - 500) / 500, 2);
      } else {
        if (v2 > 1e3)
          ratio = Math.pow((v2 - 1e3) / 1e3, 2);
      }
      if (ratio != 0) {
        if (ratio > 1)
          ratio = 1;
        v2 *= ratio;
        v *= ratio;
        this._velocity[axis] = v;
        duration = Math.log(60 / v2) / Math.log(this._decelerationRate) / 60;
        var change = Math.floor(v * duration * 0.4);
        pos += change;
      }
    }
    if (duration < TWEEN_TIME_DEFAULT)
      duration = TWEEN_TIME_DEFAULT;
    this._tweenDuration[axis] = duration;
    return pos;
  }
  fixDuration(axis, oldChange) {
    if (this._tweenChange[axis] == 0 || Math.abs(this._tweenChange[axis]) >= Math.abs(oldChange))
      return;
    var newDuration = Math.abs(this._tweenChange[axis] / oldChange) * this._tweenDuration[axis];
    if (newDuration < TWEEN_TIME_DEFAULT)
      newDuration = TWEEN_TIME_DEFAULT;
    this._tweenDuration[axis] = newDuration;
  }
  startTween(type) {
    this._tweenTime.set(import_cc.Vec2.ZERO);
    this._tweening = type;
    this.updateScrollBarVisible();
  }
  killTween() {
    if (this._tweening == 1) {
      this._container.setPosition(this._tweenStart.x + this._tweenChange.x, -(this._tweenStart.y + this._tweenChange.y));
      this._owner.node.emit(Event.SCROLL, this._owner);
    }
    this._tweening = 0;
    this.updateScrollBarVisible();
    this._owner.node.emit(Event.SCROLL_END, this._owner);
  }
  checkRefreshBar() {
    if (this._header == null && this._footer == null)
      return;
    var pos = this._refreshBarAxis == "x" ? this._container.position.x : -this._container.position.y;
    if (this._header) {
      if (pos > 0) {
        this._header.node.active = true;
        var pt = s_vec2$3;
        pt.x = this._header.width;
        pt.y = this._header.height;
        pt[this._refreshBarAxis] = pos;
        this._header.setSize(pt.x, pt.y);
      } else {
        this._header.node.active = false;
      }
    }
    if (this._footer) {
      var max = this._overlapSize[this._refreshBarAxis];
      if (pos < -max || max == 0 && this._footerLockedSize > 0) {
        this._footer.node.active = true;
        pt = s_vec2$3;
        pt.x = this._footer.x;
        pt.y = this._footer.y;
        if (max > 0)
          pt[this._refreshBarAxis] = pos + this._contentSize[this._refreshBarAxis];
        else
          pt[this._refreshBarAxis] = Math.max(Math.min(pos + this._viewSize[this._refreshBarAxis], this._viewSize[this._refreshBarAxis] - this._footerLockedSize), this._viewSize[this._refreshBarAxis] - this._contentSize[this._refreshBarAxis]);
        this._footer.setPosition(pt.x, pt.y);
        pt.x = this._footer.width;
        pt.y = this._footer.height;
        if (max > 0)
          pt[this._refreshBarAxis] = -max - pos;
        else
          pt[this._refreshBarAxis] = this._viewSize[this._refreshBarAxis] - this._footer[this._refreshBarAxis];
        this._footer.setSize(pt.x, pt.y);
      } else {
        this._footer.node.active = false;
      }
    }
  }
  update(dt) {
    if (this._tweening == 0)
      return;
    var nx = this.runTween("x", dt);
    var ny = this.runTween("y", dt);
    this._container.setPosition(nx, -ny);
    if (this._tweening == 2) {
      if (this._overlapSize.x > 0)
        this._xPos = import_cc.math.clamp(-nx, 0, this._overlapSize.x);
      if (this._overlapSize.y > 0)
        this._yPos = import_cc.math.clamp(-ny, 0, this._overlapSize.y);
      if (this._pageMode)
        this.updatePageController();
    }
    if (this._tweenChange.x == 0 && this._tweenChange.y == 0) {
      this._tweening = 0;
      this.loopCheckingCurrent();
      this.updateScrollBarPos();
      this.updateScrollBarVisible();
      this._owner.node.emit(Event.SCROLL, this._owner);
      this._owner.node.emit(Event.SCROLL_END, this._owner);
    } else {
      this.updateScrollBarPos();
      this._owner.node.emit(Event.SCROLL, this._owner);
    }
    return true;
  }
  runTween(axis, dt) {
    var newValue;
    if (this._tweenChange[axis] != 0) {
      this._tweenTime[axis] += dt;
      if (this._tweenTime[axis] >= this._tweenDuration[axis]) {
        newValue = this._tweenStart[axis] + this._tweenChange[axis];
        this._tweenChange[axis] = 0;
      } else {
        var ratio = easeFunc(this._tweenTime[axis], this._tweenDuration[axis]);
        newValue = this._tweenStart[axis] + Math.floor(this._tweenChange[axis] * ratio);
      }
      var threshold1 = 0;
      var threshold2 = -this._overlapSize[axis];
      if (this._headerLockedSize > 0 && this._refreshBarAxis == axis)
        threshold1 = this._headerLockedSize;
      if (this._footerLockedSize > 0 && this._refreshBarAxis == axis) {
        var max = this._overlapSize[this._refreshBarAxis];
        if (max == 0)
          max = Math.max(this._contentSize[this._refreshBarAxis] + this._footerLockedSize - this._viewSize[this._refreshBarAxis], 0);
        else
          max += this._footerLockedSize;
        threshold2 = -max;
      }
      if (this._tweening == 2 && this._bouncebackEffect) {
        if (newValue > 20 + threshold1 && this._tweenChange[axis] > 0 || newValue > threshold1 && this._tweenChange[axis] == 0) {
          this._tweenTime[axis] = 0;
          this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
          this._tweenChange[axis] = -newValue + threshold1;
          this._tweenStart[axis] = newValue;
        } else if (newValue < threshold2 - 20 && this._tweenChange[axis] < 0 || newValue < threshold2 && this._tweenChange[axis] == 0) {
          this._tweenTime[axis] = 0;
          this._tweenDuration[axis] = TWEEN_TIME_DEFAULT;
          this._tweenChange[axis] = threshold2 - newValue;
          this._tweenStart[axis] = newValue;
        }
      } else {
        if (newValue > threshold1) {
          newValue = threshold1;
          this._tweenChange[axis] = 0;
        } else if (newValue < threshold2) {
          newValue = threshold2;
          this._tweenChange[axis] = 0;
        }
      }
    } else
      newValue = axis == "x" ? this._container.position.x : -this._container.position.y;
    return newValue;
  }
};
var _gestureFlag = 0;
var TWEEN_TIME_GO = 0.5;
var TWEEN_TIME_DEFAULT = 0.3;
var PULL_RATIO = 0.5;
var s_vec2$3 = new import_cc.Vec2();
var s_rect = new import_cc.Rect();
var sEndPos = new import_cc.Vec2();
var sOldChange = new import_cc.Vec2();
function easeFunc(t, d) {
  return (t = t / d - 1) * t * t + 1;
}
var CurveType;
(function(CurveType2) {
  CurveType2[CurveType2["CRSpline"] = 0] = "CRSpline";
  CurveType2[CurveType2["Bezier"] = 1] = "Bezier";
  CurveType2[CurveType2["CubicBezier"] = 2] = "CubicBezier";
  CurveType2[CurveType2["Straight"] = 3] = "Straight";
})(CurveType || (CurveType = {}));
var GPathPoint = class _GPathPoint {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.control1_x = 0;
    this.control1_y = 0;
    this.control2_x = 0;
    this.control2_y = 0;
    this.curveType = 0;
  }
  static newPoint(x, y, curveType) {
    var pt = new _GPathPoint();
    pt.x = x || 0;
    pt.y = y || 0;
    pt.control1_x = 0;
    pt.control1_y = 0;
    pt.control2_x = 0;
    pt.control2_y = 0;
    pt.curveType = curveType || CurveType.CRSpline;
    return pt;
  }
  static newBezierPoint(x, y, control1_x, control1_y) {
    var pt = new _GPathPoint();
    pt.x = x || 0;
    pt.y = y || 0;
    pt.control1_x = control1_x || 0;
    pt.control1_y = control1_y || 0;
    pt.control2_x = 0;
    pt.control2_y = 0;
    pt.curveType = CurveType.Bezier;
    return pt;
  }
  static newCubicBezierPoint(x, y, control1_x, control1_y, control2_x, control2_y) {
    var pt = new _GPathPoint();
    pt.x = x || 0;
    pt.y = y || 0;
    pt.control1_x = control1_x || 0;
    pt.control1_y = control1_y || 0;
    pt.control2_x = control2_x || 0;
    pt.control2_y = control2_y || 0;
    pt.curveType = CurveType.CubicBezier;
    return pt;
  }
  clone() {
    var ret = new _GPathPoint();
    ret.x = this.x;
    ret.y = this.y;
    ret.control1_x = this.control1_x;
    ret.control1_y = this.control1_y;
    ret.control2_x = this.control2_x;
    ret.control2_y = this.control2_y;
    ret.curveType = this.curveType;
    return ret;
  }
};
var GPath = class {
  constructor() {
    this._segments = new Array();
    this._points = new Array();
  }
  get length() {
    return this._fullLength;
  }
  create2(pt1, pt2, pt3, pt4) {
    var points = new Array();
    points.push(pt1);
    points.push(pt2);
    if (pt3)
      points.push(pt3);
    if (pt4)
      points.push(pt4);
    this.create(points);
  }
  create(points) {
    this._segments.length = 0;
    this._points.length = 0;
    this._fullLength = 0;
    var cnt = points.length;
    if (cnt == 0)
      return;
    var splinePoints = [];
    var prev = points[0];
    if (prev.curveType == CurveType.CRSpline)
      splinePoints.push(new import_cc.Vec2(prev.x, prev.y));
    for (var i = 1; i < cnt; i++) {
      var current = points[i];
      if (prev.curveType != CurveType.CRSpline) {
        var seg = {};
        seg.type = prev.curveType;
        seg.ptStart = this._points.length;
        if (prev.curveType == CurveType.Straight) {
          seg.ptCount = 2;
          this._points.push(new import_cc.Vec2(prev.x, prev.y));
          this._points.push(new import_cc.Vec2(current.x, current.y));
        } else if (prev.curveType == CurveType.Bezier) {
          seg.ptCount = 3;
          this._points.push(new import_cc.Vec2(prev.x, prev.y));
          this._points.push(new import_cc.Vec2(current.x, current.y));
          this._points.push(new import_cc.Vec2(prev.control1_x, prev.control1_y));
        } else if (prev.curveType == CurveType.CubicBezier) {
          seg.ptCount = 4;
          this._points.push(new import_cc.Vec2(prev.x, prev.y));
          this._points.push(new import_cc.Vec2(current.x, current.y));
          this._points.push(new import_cc.Vec2(prev.control1_x, prev.control1_y));
          this._points.push(new import_cc.Vec2(prev.control2_x, prev.control2_y));
        }
        seg.length = distance(prev.x, prev.y, current.x, current.y);
        this._fullLength += seg.length;
        this._segments.push(seg);
      }
      if (current.curveType != CurveType.CRSpline) {
        if (splinePoints.length > 0) {
          splinePoints.push(new import_cc.Vec2(current.x, current.y));
          this.createSplineSegment(splinePoints);
        }
      } else
        splinePoints.push(new import_cc.Vec2(current.x, current.y));
      prev = current;
    }
    if (splinePoints.length > 1)
      this.createSplineSegment(splinePoints);
  }
  createSplineSegment(splinePoints) {
    var cnt = splinePoints.length;
    splinePoints.splice(0, 0, splinePoints[0]);
    splinePoints.push(splinePoints[cnt]);
    splinePoints.push(splinePoints[cnt]);
    cnt += 3;
    var seg = {};
    seg.type = CurveType.CRSpline;
    seg.ptStart = this._points.length;
    seg.ptCount = cnt;
    this._points = this._points.concat(splinePoints);
    seg.length = 0;
    for (var i = 1; i < cnt; i++) {
      seg.length += distance(splinePoints[i - 1].x, splinePoints[i - 1].y, splinePoints[i].x, splinePoints[i].y);
    }
    this._fullLength += seg.length;
    this._segments.push(seg);
    splinePoints.length = 0;
  }
  clear() {
    this._segments.length = 0;
    this._points.length = 0;
  }
  getPointAt(t, result) {
    if (!result)
      result = new import_cc.Vec2();
    else
      result.set(0, 0);
    t = import_cc.math.clamp01(t);
    var cnt = this._segments.length;
    if (cnt == 0) {
      return result;
    }
    var seg;
    if (t == 1) {
      seg = this._segments[cnt - 1];
      if (seg.type == CurveType.Straight) {
        result.x = import_cc.math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t);
        result.y = import_cc.math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t);
        return result;
      } else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
        return this.onBezierCurve(seg.ptStart, seg.ptCount, t, result);
      else
        return this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, result);
    }
    var len = t * this._fullLength;
    for (var i = 0; i < cnt; i++) {
      seg = this._segments[i];
      len -= seg.length;
      if (len < 0) {
        t = 1 + len / seg.length;
        if (seg.type == CurveType.Straight) {
          result.x = import_cc.math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t);
          result.y = import_cc.math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t);
        } else if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
          result = this.onBezierCurve(seg.ptStart, seg.ptCount, t, result);
        else
          result = this.onCRSplineCurve(seg.ptStart, seg.ptCount, t, result);
        break;
      }
    }
    return result;
  }
  get segmentCount() {
    return this._segments.length;
  }
  getAnchorsInSegment(segmentIndex, points) {
    if (points == null)
      points = new Array();
    var seg = this._segments[segmentIndex];
    for (var i = 0; i < seg.ptCount; i++)
      points.push(new import_cc.Vec2(this._points[seg.ptStart + i].x, this._points[seg.ptStart + i].y));
    return points;
  }
  getPointsInSegment(segmentIndex, t0, t1, points, ts, pointDensity) {
    if (points == null)
      points = new Array();
    if (!pointDensity || isNaN(pointDensity))
      pointDensity = 0.1;
    if (ts)
      ts.push(t0);
    var seg = this._segments[segmentIndex];
    if (seg.type == CurveType.Straight) {
      points.push(new import_cc.Vec2(import_cc.math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t0), import_cc.math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t0)));
      points.push(new import_cc.Vec2(import_cc.math.lerp(this._points[seg.ptStart].x, this._points[seg.ptStart + 1].x, t1), import_cc.math.lerp(this._points[seg.ptStart].y, this._points[seg.ptStart + 1].y, t1)));
    } else {
      var func;
      if (seg.type == CurveType.Bezier || seg.type == CurveType.CubicBezier)
        func = this.onBezierCurve;
      else
        func = this.onCRSplineCurve;
      points.push(func.call(this, seg.ptStart, seg.ptCount, t0, new import_cc.Vec2()));
      var SmoothAmount = Math.min(seg.length * pointDensity, 50);
      for (var j = 0; j <= SmoothAmount; j++) {
        var t = j / SmoothAmount;
        if (t > t0 && t < t1) {
          points.push(func.call(this, seg.ptStart, seg.ptCount, t, new import_cc.Vec2()));
          if (ts)
            ts.push(t);
        }
      }
      points.push(func.call(this, seg.ptStart, seg.ptCount, t1, new import_cc.Vec2()));
    }
    if (ts)
      ts.push(t1);
    return points;
  }
  getAllPoints(points, ts, pointDensity) {
    if (points == null)
      points = new Array();
    if (!pointDensity || isNaN(pointDensity))
      pointDensity = 0.1;
    var cnt = this._segments.length;
    for (var i = 0; i < cnt; i++)
      this.getPointsInSegment(i, 0, 1, points, ts, pointDensity);
    return points;
  }
  onCRSplineCurve(ptStart, ptCount, t, result) {
    var adjustedIndex = Math.floor(t * (ptCount - 4)) + ptStart;
    var p0x = this._points[adjustedIndex].x;
    var p0y = this._points[adjustedIndex].y;
    var p1x = this._points[adjustedIndex + 1].x;
    var p1y = this._points[adjustedIndex + 1].y;
    var p2x = this._points[adjustedIndex + 2].x;
    var p2y = this._points[adjustedIndex + 2].y;
    var p3x = this._points[adjustedIndex + 3].x;
    var p3y = this._points[adjustedIndex + 3].y;
    var adjustedT = t == 1 ? 1 : import_cc.math.repeat(t * (ptCount - 4), 1);
    var t0 = ((-adjustedT + 2) * adjustedT - 1) * adjustedT * 0.5;
    var t1 = ((3 * adjustedT - 5) * adjustedT * adjustedT + 2) * 0.5;
    var t2 = ((-3 * adjustedT + 4) * adjustedT + 1) * adjustedT * 0.5;
    var t3 = (adjustedT - 1) * adjustedT * adjustedT * 0.5;
    result.x = p0x * t0 + p1x * t1 + p2x * t2 + p3x * t3;
    result.y = p0y * t0 + p1y * t1 + p2y * t2 + p3y * t3;
    return result;
  }
  onBezierCurve(ptStart, ptCount, t, result) {
    var t2 = 1 - t;
    var p0x = this._points[ptStart].x;
    var p0y = this._points[ptStart].y;
    var p1x = this._points[ptStart + 1].x;
    var p1y = this._points[ptStart + 1].y;
    var cp0x = this._points[ptStart + 2].x;
    var cp0y = this._points[ptStart + 2].y;
    if (ptCount == 4) {
      var cp1x = this._points[ptStart + 3].x;
      var cp1y = this._points[ptStart + 3].y;
      result.x = t2 * t2 * t2 * p0x + 3 * t2 * t2 * t * cp0x + 3 * t2 * t * t * cp1x + t * t * t * p1x;
      result.y = t2 * t2 * t2 * p0y + 3 * t2 * t2 * t * cp0y + 3 * t2 * t * t * cp1y + t * t * t * p1y;
    } else {
      result.x = t2 * t2 * p0x + 2 * t2 * t * cp0x + t * t * p1x;
      result.y = t2 * t2 * p0y + 2 * t2 * t * cp0y + t * t * p1y;
    }
    return result;
  }
};
function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
var XML_TRANSITION_DEFAULT_FRAME_RATE = 24;
var Transition = class _Transition {
  constructor(owner) {
    this._ownerBaseX = 0;
    this._ownerBaseY = 0;
    this._totalTimes = 0;
    this._totalTasks = 0;
    this._options = 0;
    this._totalDuration = 0;
    this._autoPlayTimes = 1;
    this._autoPlayDelay = 0;
    this._timeScale = 1;
    this._startTime = 0;
    this._endTime = 0;
    this._owner = owner;
    this._items = new Array();
  }
  static createFromXML(owner, definition) {
    const transition = new _Transition(owner);
    transition.setupFromXML(definition);
    return transition;
  }
  play(onComplete, times, delay, startTime, endTime) {
    this._play(onComplete, times, delay, startTime, endTime, false);
  }
  playReverse(onComplete, times, delay) {
    this._play(onComplete, times, delay, 0, -1, true);
  }
  changePlayTimes(value) {
    this._totalTimes = value;
  }
  setAutoPlay(value, times, delay) {
    if (times == void 0)
      times = -1;
    if (delay == void 0)
      delay = 0;
    if (this._autoPlay != value) {
      this._autoPlay = value;
      this._autoPlayTimes = times;
      this._autoPlayDelay = delay;
      if (this._autoPlay) {
        if (this._owner.onStage)
          this.play(null, this._autoPlayTimes, this._autoPlayDelay);
      } else {
        if (!this._owner.onStage)
          this.stop(false, true);
      }
    }
  }
  setupFromXML(definition) {
    this.name = definition.name;
    this._items.length = 0;
    this._totalDuration = 0;
    this._options = 0;
    if (readXMLBool(definition.attrs.ignoreDisplayController, false))
      this._options |= OPTION_IGNORE_DISPLAY_CONTROLLER;
    if (readXMLBool(definition.attrs.autoStopDisabled, false))
      this._options |= OPTION_AUTO_STOP_DISABLED;
    if (readXMLBool(definition.attrs.autoStopAtEnd, false))
      this._options |= OPTION_AUTO_STOP_AT_END;
    this._autoPlay = readXMLBool(definition.attrs.autoPlay, false);
    this._autoPlayTimes = readXMLInt(definition.attrs.autoPlayRepeat, 1);
    this._autoPlayDelay = readXMLNumber(definition.attrs.autoPlayDelay, 0);
    const frameRate = Math.max(1, readXMLNumber(definition.attrs.frameRate, XML_TRANSITION_DEFAULT_FRAME_RATE));
    for (const itemDefinition of definition.items) {
      const item = this.createItemFromXML(itemDefinition, frameRate);
      if (!item)
        continue;
      this._items.push(item);
      const itemEndTime = item.tweenConfig ? item.time + item.tweenConfig.duration : item.type == ActionType.Shake ? item.time + (item.value.duration || 0) : item.time;
      if (itemEndTime > this._totalDuration)
        this._totalDuration = itemEndTime;
    }
  }
  createItemFromXML(definition, frameRate) {
    const attrs = definition.attrs;
    const typeName = attrs.type || "";
    const actionType = resolveXMLActionType(typeName);
    if (actionType == null) {
      console.warn(`FairyGUI XML: transition '${this.name}' has unsupported item type '${typeName}'.`);
      return null;
    }
    if (actionType == ActionType.ColorFilter)
      console.warn(`FairyGUI XML: transition '${this.name}' uses ColorFilter, but runtime color filter playback is still limited.`);
    const item = new Item(actionType);
    item.time = xmlFramesToSeconds(attrs.time, frameRate);
    item.targetId = attrs.target || "";
    item.label = attrs.label;
    if (readXMLBool(attrs.tween, false)) {
      if (!supportsTween(actionType)) {
        console.warn(`FairyGUI XML: transition '${this.name}' item '${typeName}' does not support tween runtime, fallback to single value.`);
        parseTransitionValue(actionType, attrs.endValue || attrs.value || attrs.startValue, item.value);
        return item;
      }
      item.tweenConfig = new TweenConfig();
      item.tweenConfig.duration = xmlFramesToSeconds(attrs.duration, frameRate);
      item.tweenConfig.easeType = parseTransitionEase(attrs.ease);
      item.tweenConfig.repeat = readXMLInt(attrs.repeat, 0);
      item.tweenConfig.yoyo = readXMLBool(attrs.yoyo, false);
      item.tweenConfig.endLabel = attrs.label2 || "";
      parseTransitionValue(actionType, attrs.startValue || attrs.value, item.tweenConfig.startValue);
      parseTransitionValue(actionType, attrs.endValue || attrs.value || attrs.startValue, item.tweenConfig.endValue);
      if (attrs.path) {
        if (!supportsPath(actionType)) {
          console.warn(`FairyGUI XML: transition '${this.name}' item '${typeName}' has path data, but this runtime path mapping only supports 2D tweens.`);
        } else {
          const path2 = parseTransitionPath(attrs.path);
          if (path2)
            item.tweenConfig.path = path2;
          else
            console.warn(`FairyGUI XML: transition '${this.name}' item '${typeName}' has invalid path data, fallback to linear tween.`);
        }
      }
    } else {
      parseTransitionValue(actionType, attrs.value || attrs.startValue || attrs.endValue, item.value);
    }
    return item;
  }
  _play(onComplete, times, delay, startTime, endTime, reversed) {
    if (times == void 0)
      times = 1;
    if (delay == void 0)
      delay = 0;
    if (startTime == void 0)
      startTime = 0;
    if (endTime == void 0)
      endTime = -1;
    this.stop(true, true);
    this._totalTimes = times;
    this._reversed = reversed;
    this._startTime = startTime;
    this._endTime = endTime;
    this._playing = true;
    this._paused = false;
    this._onComplete = onComplete;
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.target == null) {
        if (item.targetId)
          item.target = this._owner.getChildById(item.targetId);
        else
          item.target = this._owner;
      } else if (item.target != this._owner && item.target.parent != this._owner)
        item.target = null;
      if (item.target && item.type == ActionType.Transition) {
        var trans = item.target.getTransition(item.value.transName);
        if (trans == this)
          trans = null;
        if (trans) {
          if (item.value.playTimes == 0) {
            var j;
            for (j = i - 1; j >= 0; j--) {
              var item2 = this._items[j];
              if (item2.type == ActionType.Transition) {
                if (item2.value.trans == trans) {
                  item2.value.stopTime = item.time - item2.time;
                  break;
                }
              }
            }
            if (j < 0)
              item.value.stopTime = 0;
            else
              trans = null;
          } else
            item.value.stopTime = -1;
        }
        item.value.trans = trans;
      }
    }
    if (delay == 0)
      this.onDelayedPlay();
    else
      GTween.delayedCall(delay).setTarget(this).onComplete(this.onDelayedPlay, this);
  }
  stop(setToComplete, processCallback) {
    if (setToComplete == void 0)
      setToComplete = true;
    if (!this._playing)
      return;
    this._playing = false;
    this._totalTasks = 0;
    this._totalTimes = 0;
    var func = this._onComplete;
    this._onComplete = null;
    GTween.kill(this);
    var cnt = this._items.length;
    if (this._reversed) {
      for (var i = cnt - 1; i >= 0; i--) {
        var item = this._items[i];
        if (item.target == null)
          continue;
        this.stopItem(item, setToComplete);
      }
    } else {
      for (i = 0; i < cnt; i++) {
        item = this._items[i];
        if (item.target == null)
          continue;
        this.stopItem(item, setToComplete);
      }
    }
    if (processCallback && func != null) {
      func();
    }
  }
  stopItem(item, setToComplete) {
    if (item.displayLockToken != 0) {
      item.target.releaseDisplayLock(item.displayLockToken);
      item.displayLockToken = 0;
    }
    if (item.tweener) {
      item.tweener.kill(setToComplete);
      item.tweener = null;
      if (item.type == ActionType.Shake && !setToComplete) {
        item.target._gearLocked = true;
        item.target.setPosition(item.target.x - item.value.lastOffsetX, item.target.y - item.value.lastOffsetY);
        item.target._gearLocked = false;
      }
    }
    if (item.type == ActionType.Transition) {
      var trans = item.value.trans;
      if (trans)
        trans.stop(setToComplete, false);
    }
  }
  setPaused(paused) {
    if (!this._playing || this._paused == paused)
      return;
    this._paused = paused;
    var tweener = GTween.getTween(this);
    if (tweener)
      tweener.setPaused(paused);
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.target == null)
        continue;
      if (item.type == ActionType.Transition) {
        if (item.value.trans)
          item.value.trans.setPaused(paused);
      } else if (item.type == ActionType.Animation) {
        if (paused) {
          item.value.flag = item.target.getProp(ObjectPropID.Playing);
          item.target.setProp(ObjectPropID.Playing, false);
        } else
          item.target.setProp(ObjectPropID.Playing, item.value.flag);
      }
      if (item.tweener)
        item.tweener.setPaused(paused);
    }
  }
  dispose() {
    if (this._playing)
      GTween.kill(this);
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.tweener) {
        item.tweener.kill();
        item.tweener = null;
      }
      item.target = null;
      item.hook = null;
      if (item.tweenConfig)
        item.tweenConfig.endHook = null;
    }
    this._items.length = 0;
    this._playing = false;
    this._onComplete = null;
  }
  get playing() {
    return this._playing;
  }
  setValue(label, ...args) {
    var cnt = this._items.length;
    var value;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.label == label) {
        if (item.tweenConfig)
          value = item.tweenConfig.startValue;
        else
          value = item.value;
      } else if (item.tweenConfig && item.tweenConfig.endLabel == label) {
        value = item.tweenConfig.endValue;
      } else
        continue;
      switch (item.type) {
        case ActionType.XY:
        case ActionType.Size:
        case ActionType.Pivot:
        case ActionType.Scale:
        case ActionType.Skew:
          value.b1 = true;
          value.b2 = true;
          value.f1 = parseFloat(args[0]);
          value.f2 = parseFloat(args[1]);
          break;
        case ActionType.Alpha:
          value.f1 = parseFloat(args[0]);
          break;
        case ActionType.Rotation:
          value.f1 = parseFloat(args[0]);
          break;
        case ActionType.Color:
          value.f1 = parseFloat(args[0]);
          break;
        case ActionType.Animation:
          value.frame = parseInt(args[0]);
          if (args.length > 1)
            value.playing = args[1];
          break;
        case ActionType.Visible:
          value.visible = args[0];
          break;
        case ActionType.Sound:
          value.sound = args[0];
          if (args.length > 1)
            value.volume = parseFloat(args[1]);
          break;
        case ActionType.Transition:
          value.transName = args[0];
          if (args.length > 1)
            value.playTimes = parseInt(args[1]);
          break;
        case ActionType.Shake:
          value.amplitude = parseFloat(args[0]);
          if (args.length > 1)
            value.duration = parseFloat(args[1]);
          break;
        case ActionType.ColorFilter:
          value.f1 = parseFloat(args[0]);
          value.f2 = parseFloat(args[1]);
          value.f3 = parseFloat(args[2]);
          value.f4 = parseFloat(args[3]);
          break;
        case ActionType.Text:
        case ActionType.Icon:
          value.text = args[0];
          break;
      }
    }
  }
  setHook(label, callback) {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.label == label) {
        item.hook = callback;
        break;
      } else if (item.tweenConfig && item.tweenConfig.endLabel == label) {
        item.tweenConfig.endHook = callback;
        break;
      }
    }
  }
  clearHooks() {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      item.hook = null;
      if (item.tweenConfig)
        item.tweenConfig.endHook = null;
    }
  }
  setTarget(label, newTarget) {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.label == label) {
        item.targetId = newTarget.id;
        item.target = null;
      }
    }
  }
  setDuration(label, value) {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.tweenConfig && item.label == label)
        item.tweenConfig.duration = value;
    }
  }
  getLabelTime(label) {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.label == label)
        return item.time;
      else if (item.tweenConfig && item.tweenConfig.endLabel == label)
        return item.time + item.tweenConfig.duration;
    }
    return Number.NaN;
  }
  get timeScale() {
    return this._timeScale;
  }
  set timeScale(value) {
    if (this._timeScale != value) {
      this._timeScale = value;
      if (this._playing) {
        var cnt = this._items.length;
        for (var i = 0; i < cnt; i++) {
          var item = this._items[i];
          if (item.tweener)
            item.tweener.setTimeScale(value);
          else if (item.type == ActionType.Transition) {
            if (item.value.trans)
              item.value.trans.timeScale = value;
          } else if (item.type == ActionType.Animation) {
            if (item.target)
              item.target.setProp(ObjectPropID.TimeScale, value);
          }
        }
      }
    }
  }
  updateFromRelations(targetId, dx, dy) {
    var cnt = this._items.length;
    if (cnt == 0)
      return;
    for (var i = 0; i < cnt; i++) {
      var item = this._items[i];
      if (item.type == ActionType.XY && item.targetId == targetId) {
        if (item.tweenConfig) {
          item.tweenConfig.startValue.f1 += dx;
          item.tweenConfig.startValue.f2 += dy;
          item.tweenConfig.endValue.f1 += dx;
          item.tweenConfig.endValue.f2 += dy;
        } else {
          item.value.f1 += dx;
          item.value.f2 += dy;
        }
      }
    }
  }
  onEnable() {
    if (this._autoPlay && !this._playing)
      this.play(null, this._autoPlayTimes, this._autoPlayDelay);
  }
  onDisable() {
    if ((this._options & OPTION_AUTO_STOP_DISABLED) == 0)
      this.stop((this._options & OPTION_AUTO_STOP_AT_END) != 0 ? true : false, false);
  }
  onDelayedPlay() {
    this.internalPlay();
    this._playing = this._totalTasks > 0;
    if (this._playing) {
      if ((this._options & OPTION_IGNORE_DISPLAY_CONTROLLER) != 0) {
        var cnt = this._items.length;
        for (var i = 0; i < cnt; i++) {
          var item = this._items[i];
          if (item.target && item.target != this._owner)
            item.displayLockToken = item.target.addDisplayLock();
        }
      }
    } else if (this._onComplete != null) {
      var func = this._onComplete;
      this._onComplete = null;
      func();
    }
  }
  internalPlay() {
    this._ownerBaseX = this._owner.x;
    this._ownerBaseY = this._owner.y;
    this._totalTasks = 1;
    var cnt = this._items.length;
    var item;
    var needSkipAnimations = false;
    var i;
    if (!this._reversed) {
      for (i = 0; i < cnt; i++) {
        item = this._items[i];
        if (item.target == null)
          continue;
        if (item.type == ActionType.Animation && this._startTime != 0 && item.time <= this._startTime) {
          needSkipAnimations = true;
          item.value.flag = false;
        } else
          this.playItem(item);
      }
    } else {
      for (i = cnt - 1; i >= 0; i--) {
        item = this._items[i];
        if (item.target == null)
          continue;
        this.playItem(item);
      }
    }
    if (needSkipAnimations)
      this.skipAnimations();
    this._totalTasks--;
  }
  playItem(item) {
    var time;
    if (item.tweenConfig) {
      if (this._reversed)
        time = this._totalDuration - item.time - item.tweenConfig.duration;
      else
        time = item.time;
      if (this._endTime == -1 || time <= this._endTime) {
        var startValue;
        var endValue;
        if (this._reversed) {
          startValue = item.tweenConfig.endValue;
          endValue = item.tweenConfig.startValue;
        } else {
          startValue = item.tweenConfig.startValue;
          endValue = item.tweenConfig.endValue;
        }
        item.value.b1 = startValue.b1 || endValue.b1;
        item.value.b2 = startValue.b2 || endValue.b2;
        switch (item.type) {
          case ActionType.XY:
          case ActionType.Size:
          case ActionType.Scale:
          case ActionType.Skew:
            item.tweener = GTween.to2(startValue.f1, startValue.f2, endValue.f1, endValue.f2, item.tweenConfig.duration);
            break;
          case ActionType.Alpha:
          case ActionType.Rotation:
            item.tweener = GTween.to(startValue.f1, endValue.f1, item.tweenConfig.duration);
            break;
          case ActionType.Color:
            item.tweener = GTween.toColor(startValue.f1, endValue.f1, item.tweenConfig.duration);
            break;
          case ActionType.ColorFilter:
            item.tweener = GTween.to4(startValue.f1, startValue.f2, startValue.f3, startValue.f4, endValue.f1, endValue.f2, endValue.f3, endValue.f4, item.tweenConfig.duration);
            break;
        }
        item.tweener.setDelay(time).setEase(item.tweenConfig.easeType).setRepeat(item.tweenConfig.repeat, item.tweenConfig.yoyo).setTimeScale(this._timeScale).setTarget(item).onStart(this.onTweenStart, this).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
        if (this._endTime >= 0)
          item.tweener.setBreakpoint(this._endTime - time);
        this._totalTasks++;
      }
    } else if (item.type == ActionType.Shake) {
      if (this._reversed)
        time = this._totalDuration - item.time - item.value.duration;
      else
        time = item.time;
      item.value.offsetX = item.value.offsetY = 0;
      item.value.lastOffsetX = item.value.lastOffsetY = 0;
      item.tweener = GTween.shake(0, 0, item.value.amplitude, item.value.duration).setDelay(time).setTimeScale(this._timeScale).setTarget(item).onUpdate(this.onTweenUpdate, this).onComplete(this.onTweenComplete, this);
      if (this._endTime >= 0)
        item.tweener.setBreakpoint(this._endTime - item.time);
      this._totalTasks++;
    } else {
      if (this._reversed)
        time = this._totalDuration - item.time;
      else
        time = item.time;
      if (time <= this._startTime) {
        this.applyValue(item);
        this.callHook(item, false);
      } else if (this._endTime == -1 || time <= this._endTime) {
        this._totalTasks++;
        item.tweener = GTween.delayedCall(time).setTimeScale(this._timeScale).setTarget(item).onComplete(this.onDelayedPlayItem, this);
      }
    }
    if (item.tweener)
      item.tweener.seek(this._startTime);
  }
  skipAnimations() {
    var frame;
    var playStartTime;
    var playTotalTime;
    var value;
    var target;
    var item;
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      item = this._items[i];
      if (item.type != ActionType.Animation || item.time > this._startTime)
        continue;
      value = item.value;
      if (value.flag)
        continue;
      target = item.target;
      frame = target.getProp(ObjectPropID.Frame);
      playStartTime = target.getProp(ObjectPropID.Playing) ? 0 : -1;
      playTotalTime = 0;
      for (var j = i; j < cnt; j++) {
        item = this._items[j];
        if (item.type != ActionType.Animation || item.target != target || item.time > this._startTime)
          continue;
        value = item.value;
        value.flag = true;
        if (value.frame != -1) {
          frame = value.frame;
          if (value.playing)
            playStartTime = item.time;
          else
            playStartTime = -1;
          playTotalTime = 0;
        } else {
          if (value.playing) {
            if (playStartTime < 0)
              playStartTime = item.time;
          } else {
            if (playStartTime >= 0)
              playTotalTime += item.time - playStartTime;
            playStartTime = -1;
          }
        }
        this.callHook(item, false);
      }
      if (playStartTime >= 0)
        playTotalTime += this._startTime - playStartTime;
      target.setProp(ObjectPropID.Playing, playStartTime >= 0);
      target.setProp(ObjectPropID.Frame, frame);
      if (playTotalTime > 0)
        target.setProp(ObjectPropID.DeltaTime, playTotalTime);
    }
  }
  onDelayedPlayItem(tweener) {
    var item = tweener.target;
    item.tweener = null;
    this._totalTasks--;
    this.applyValue(item);
    this.callHook(item, false);
    this.checkAllComplete();
  }
  onTweenStart(tweener) {
    var item = tweener.target;
    if (item.type == ActionType.XY || item.type == ActionType.Size) {
      var startValue;
      var endValue;
      if (this._reversed) {
        startValue = item.tweenConfig.endValue;
        endValue = item.tweenConfig.startValue;
      } else {
        startValue = item.tweenConfig.startValue;
        endValue = item.tweenConfig.endValue;
      }
      if (item.type == ActionType.XY) {
        if (item.target != this._owner) {
          if (!startValue.b1)
            tweener.startValue.x = item.target.x;
          else if (startValue.b3)
            tweener.startValue.x = startValue.f1 * this._owner.width;
          if (!startValue.b2)
            tweener.startValue.y = item.target.y;
          else if (startValue.b3)
            tweener.startValue.y = startValue.f2 * this._owner.height;
          if (!endValue.b1)
            tweener.endValue.x = tweener.startValue.x;
          else if (endValue.b3)
            tweener.endValue.x = endValue.f1 * this._owner.width;
          if (!endValue.b2)
            tweener.endValue.y = tweener.startValue.y;
          else if (endValue.b3)
            tweener.endValue.y = endValue.f2 * this._owner.height;
        } else {
          if (!startValue.b1)
            tweener.startValue.x = item.target.x - this._ownerBaseX;
          if (!startValue.b2)
            tweener.startValue.y = item.target.y - this._ownerBaseY;
          if (!endValue.b1)
            tweener.endValue.x = tweener.startValue.x;
          if (!endValue.b2)
            tweener.endValue.y = tweener.startValue.y;
        }
      } else {
        if (!startValue.b1)
          tweener.startValue.x = item.target.width;
        if (!startValue.b2)
          tweener.startValue.y = item.target.height;
        if (!endValue.b1)
          tweener.endValue.x = tweener.startValue.x;
        if (!endValue.b2)
          tweener.endValue.y = tweener.startValue.y;
      }
      if (item.tweenConfig.path) {
        item.value.b1 = item.value.b2 = true;
        tweener.setPath(item.tweenConfig.path);
      }
    }
    this.callHook(item, false);
  }
  onTweenUpdate(tweener) {
    var item = tweener.target;
    switch (item.type) {
      case ActionType.XY:
      case ActionType.Size:
      case ActionType.Scale:
      case ActionType.Skew:
        item.value.f1 = tweener.value.x;
        item.value.f2 = tweener.value.y;
        if (item.tweenConfig.path) {
          item.value.f1 += tweener.startValue.x;
          item.value.f2 += tweener.startValue.y;
        }
        break;
      case ActionType.Alpha:
      case ActionType.Rotation:
        item.value.f1 = tweener.value.x;
        break;
      case ActionType.Color:
        item.value.f1 = tweener.value.color;
        break;
      case ActionType.ColorFilter:
        item.value.f1 = tweener.value.x;
        item.value.f2 = tweener.value.y;
        item.value.f3 = tweener.value.z;
        item.value.f4 = tweener.value.w;
        break;
      case ActionType.Shake:
        item.value.offsetX = tweener.deltaValue.x;
        item.value.offsetY = tweener.deltaValue.y;
        break;
    }
    this.applyValue(item);
  }
  onTweenComplete(tweener) {
    var item = tweener.target;
    item.tweener = null;
    this._totalTasks--;
    if (tweener.allCompleted)
      this.callHook(item, true);
    this.checkAllComplete();
  }
  onPlayTransCompleted(item) {
    this._totalTasks--;
    this.checkAllComplete();
  }
  callHook(item, tweenEnd) {
    if (tweenEnd) {
      if (item.tweenConfig && item.tweenConfig.endHook != null)
        item.tweenConfig.endHook(item.label);
    } else {
      if (item.time >= this._startTime && item.hook != null)
        item.hook(item.label);
    }
  }
  checkAllComplete() {
    if (this._playing && this._totalTasks == 0) {
      if (this._totalTimes < 0) {
        this.internalPlay();
        if (this._totalTasks == 0)
          GTween.delayedCall(0).setTarget(this).onComplete(this.checkAllComplete, this);
      } else {
        this._totalTimes--;
        if (this._totalTimes > 0) {
          this.internalPlay();
          if (this._totalTasks == 0)
            GTween.delayedCall(0).setTarget(this).onComplete(this.checkAllComplete, this);
        } else {
          this._playing = false;
          var cnt = this._items.length;
          for (var i = 0; i < cnt; i++) {
            var item = this._items[i];
            if (item.target && item.displayLockToken != 0) {
              item.target.releaseDisplayLock(item.displayLockToken);
              item.displayLockToken = 0;
            }
          }
          if (this._onComplete != null) {
            var func = this._onComplete;
            this._onComplete = null;
            func();
          }
        }
      }
    }
  }
  applyValue(item) {
    item.target._gearLocked = true;
    var value = item.value;
    switch (item.type) {
      case ActionType.XY:
        if (item.target == this._owner) {
          if (value.b1 && value.b2)
            item.target.setPosition(value.f1 + this._ownerBaseX, value.f2 + this._ownerBaseY);
          else if (value.b1)
            item.target.x = value.f1 + this._ownerBaseX;
          else
            item.target.y = value.f2 + this._ownerBaseY;
        } else {
          if (value.b3) {
            if (value.b1 && value.b2)
              item.target.setPosition(value.f1 * this._owner.width, value.f2 * this._owner.height);
            else if (value.b1)
              item.target.x = value.f1 * this._owner.width;
            else if (value.b2)
              item.target.y = value.f2 * this._owner.height;
          } else {
            if (value.b1 && value.b2)
              item.target.setPosition(value.f1, value.f2);
            else if (value.b1)
              item.target.x = value.f1;
            else if (value.b2)
              item.target.y = value.f2;
          }
        }
        break;
      case ActionType.Size:
        if (!value.b1)
          value.f1 = item.target.width;
        if (!value.b2)
          value.f2 = item.target.height;
        item.target.setSize(value.f1, value.f2);
        break;
      case ActionType.Pivot:
        item.target.setPivot(value.f1, value.f2, item.target.pivotAsAnchor);
        break;
      case ActionType.Alpha:
        item.target.alpha = value.f1;
        break;
      case ActionType.Rotation:
        item.target.rotation = value.f1;
        break;
      case ActionType.Scale:
        item.target.setScale(value.f1, value.f2);
        break;
      case ActionType.Skew:
        break;
      case ActionType.Color:
        let color = item.target.getProp(ObjectPropID.Color);
        if (color instanceof import_cc.Color) {
          let i = Math.floor(value.f1);
          color.r = i >> 16 & 255;
          color.g = i >> 8 & 255;
          color.b = i & 255;
          item.target.setProp(ObjectPropID.Color, color);
        }
        break;
      case ActionType.Animation:
        if (value.frame >= 0)
          item.target.setProp(ObjectPropID.Frame, value.frame);
        item.target.setProp(ObjectPropID.Playing, value.playing);
        item.target.setProp(ObjectPropID.TimeScale, this._timeScale);
        break;
      case ActionType.Visible:
        item.target.visible = value.visible;
        break;
      case ActionType.Transition:
        if (this._playing) {
          var trans = value.trans;
          if (trans) {
            this._totalTasks++;
            var startTime = this._startTime > item.time ? this._startTime - item.time : 0;
            var endTime = this._endTime >= 0 ? this._endTime - item.time : -1;
            if (value.stopTime >= 0 && (endTime < 0 || endTime > value.stopTime))
              endTime = value.stopTime;
            trans.timeScale = this._timeScale;
            let localThis = this;
            trans._play(() => {
              localThis.onPlayTransCompleted(item);
            }, value.playTimes, 0, startTime, endTime, this._reversed);
          }
        }
        break;
      case ActionType.Sound:
        if (this._playing && item.time >= this._startTime) {
          if (value.audioClip == null) {
            var pi = UIPackage.getItemByURL(value.sound);
            if (pi)
              value.audioClip = pi.owner.getItemAsset(pi);
          }
          if (value.audioClip)
            Decls$1.GRoot.inst.playOneShotSound(value.audioClip, value.volume);
        }
        break;
      case ActionType.Shake:
        item.target.setPosition(item.target.x - value.lastOffsetX + value.offsetX, item.target.y - value.lastOffsetY + value.offsetY);
        value.lastOffsetX = value.offsetX;
        value.lastOffsetY = value.offsetY;
        break;
      case ActionType.ColorFilter: {
        break;
      }
      case ActionType.Text:
        item.target.text = value.text;
        break;
      case ActionType.Icon:
        item.target.icon = value.text;
        break;
    }
    item.target._gearLocked = false;
  }
  setup(buffer) {
    this.name = buffer.readS();
    this._options = buffer.readInt();
    this._autoPlay = buffer.readBool();
    this._autoPlayTimes = buffer.readInt();
    this._autoPlayDelay = buffer.readFloat();
    var cnt = buffer.readShort();
    for (var i = 0; i < cnt; i++) {
      var dataLen = buffer.readShort();
      var curPos = buffer.position;
      buffer.seek(curPos, 0);
      var item = new Item(buffer.readByte());
      this._items[i] = item;
      item.time = buffer.readFloat();
      var targetId = buffer.readShort();
      if (targetId < 0)
        item.targetId = "";
      else
        item.targetId = this._owner.getChildAt(targetId).id;
      item.label = buffer.readS();
      if (buffer.readBool()) {
        buffer.seek(curPos, 1);
        item.tweenConfig = new TweenConfig();
        item.tweenConfig.duration = buffer.readFloat();
        if (item.time + item.tweenConfig.duration > this._totalDuration)
          this._totalDuration = item.time + item.tweenConfig.duration;
        item.tweenConfig.easeType = buffer.readByte();
        item.tweenConfig.repeat = buffer.readInt();
        item.tweenConfig.yoyo = buffer.readBool();
        item.tweenConfig.endLabel = buffer.readS();
        buffer.seek(curPos, 2);
        this.decodeValue(item, buffer, item.tweenConfig.startValue);
        buffer.seek(curPos, 3);
        this.decodeValue(item, buffer, item.tweenConfig.endValue);
        if (buffer.version >= 2) {
          var pathLen = buffer.readInt();
          if (pathLen > 0) {
            item.tweenConfig.path = new GPath();
            var pts = new Array();
            for (var j = 0; j < pathLen; j++) {
              var curveType = buffer.readByte();
              switch (curveType) {
                case CurveType.Bezier:
                  pts.push(GPathPoint.newBezierPoint(buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()));
                  break;
                case CurveType.CubicBezier:
                  pts.push(GPathPoint.newCubicBezierPoint(buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat(), buffer.readFloat()));
                  break;
                default:
                  pts.push(GPathPoint.newPoint(buffer.readFloat(), buffer.readFloat(), curveType));
                  break;
              }
            }
            item.tweenConfig.path.create(pts);
          }
        }
      } else {
        if (item.time > this._totalDuration)
          this._totalDuration = item.time;
        buffer.seek(curPos, 2);
        this.decodeValue(item, buffer, item.value);
      }
      buffer.position = curPos + dataLen;
    }
  }
  decodeValue(item, buffer, value) {
    switch (item.type) {
      case ActionType.XY:
      case ActionType.Size:
      case ActionType.Pivot:
      case ActionType.Skew:
        value.b1 = buffer.readBool();
        value.b2 = buffer.readBool();
        value.f1 = buffer.readFloat();
        value.f2 = buffer.readFloat();
        if (buffer.version >= 2 && item.type == ActionType.XY)
          value.b3 = buffer.readBool();
        break;
      case ActionType.Alpha:
      case ActionType.Rotation:
        value.f1 = buffer.readFloat();
        break;
      case ActionType.Scale:
        value.f1 = buffer.readFloat();
        value.f2 = buffer.readFloat();
        break;
      case ActionType.Color:
        let color = buffer.readColor();
        value.f1 = (color.r << 16) + (color.g << 8) + color.b;
        break;
      case ActionType.Animation:
        value.playing = buffer.readBool();
        value.frame = buffer.readInt();
        break;
      case ActionType.Visible:
        value.visible = buffer.readBool();
        break;
      case ActionType.Sound:
        value.sound = buffer.readS();
        value.volume = buffer.readFloat();
        break;
      case ActionType.Transition:
        value.transName = buffer.readS();
        value.playTimes = buffer.readInt();
        break;
      case ActionType.Shake:
        value.amplitude = buffer.readFloat();
        value.duration = buffer.readFloat();
        break;
      case ActionType.ColorFilter:
        value.f1 = buffer.readFloat();
        value.f2 = buffer.readFloat();
        value.f3 = buffer.readFloat();
        value.f4 = buffer.readFloat();
        break;
      case ActionType.Text:
      case ActionType.Icon:
        value.text = buffer.readS();
        break;
    }
  }
};
var OPTION_IGNORE_DISPLAY_CONTROLLER = 1;
var OPTION_AUTO_STOP_DISABLED = 2;
var OPTION_AUTO_STOP_AT_END = 4;
var ActionType;
(function(ActionType2) {
  ActionType2[ActionType2["XY"] = 0] = "XY";
  ActionType2[ActionType2["Size"] = 1] = "Size";
  ActionType2[ActionType2["Scale"] = 2] = "Scale";
  ActionType2[ActionType2["Pivot"] = 3] = "Pivot";
  ActionType2[ActionType2["Alpha"] = 4] = "Alpha";
  ActionType2[ActionType2["Rotation"] = 5] = "Rotation";
  ActionType2[ActionType2["Color"] = 6] = "Color";
  ActionType2[ActionType2["Animation"] = 7] = "Animation";
  ActionType2[ActionType2["Visible"] = 8] = "Visible";
  ActionType2[ActionType2["Sound"] = 9] = "Sound";
  ActionType2[ActionType2["Transition"] = 10] = "Transition";
  ActionType2[ActionType2["Shake"] = 11] = "Shake";
  ActionType2[ActionType2["ColorFilter"] = 12] = "ColorFilter";
  ActionType2[ActionType2["Skew"] = 13] = "Skew";
  ActionType2[ActionType2["Text"] = 14] = "Text";
  ActionType2[ActionType2["Icon"] = 15] = "Icon";
  ActionType2[ActionType2["Unknown"] = 16] = "Unknown";
})(ActionType || (ActionType = {}));
var Item = class {
  constructor(type) {
    this.type = type;
    this.value = {};
    this.displayLockToken = 0;
  }
};
var TweenConfig = class {
  constructor() {
    this.easeType = EaseType.QuadOut;
    this.startValue = { b1: true, b2: true };
    this.endValue = { b1: true, b2: true };
  }
};
function supportsTween(type) {
  return type == ActionType.XY || type == ActionType.Size || type == ActionType.Scale || type == ActionType.Skew || type == ActionType.Alpha || type == ActionType.Rotation || type == ActionType.Color || type == ActionType.ColorFilter;
}
function supportsPath(type) {
  return type == ActionType.XY || type == ActionType.Size || type == ActionType.Scale || type == ActionType.Skew;
}
function resolveXMLActionType(typeName) {
  switch ((typeName || "").toLowerCase()) {
    case "xy":
      return ActionType.XY;
    case "size":
      return ActionType.Size;
    case "scale":
      return ActionType.Scale;
    case "pivot":
      return ActionType.Pivot;
    case "alpha":
      return ActionType.Alpha;
    case "rotation":
      return ActionType.Rotation;
    case "color":
      return ActionType.Color;
    case "animation":
      return ActionType.Animation;
    case "visible":
      return ActionType.Visible;
    case "sound":
      return ActionType.Sound;
    case "transition":
      return ActionType.Transition;
    case "shake":
      return ActionType.Shake;
    case "colorfilter":
      return ActionType.ColorFilter;
    case "skew":
      return ActionType.Skew;
    case "text":
      return ActionType.Text;
    case "icon":
      return ActionType.Icon;
    default:
      return null;
  }
}
function parseTransitionEase(rawValue) {
  if (!rawValue)
    return EaseType.QuadOut;
  const normalized = rawValue.replace(/[^a-z0-9]/gi, "").toLowerCase();
  switch (normalized) {
    case "linear":
      return EaseType.Linear;
    case "sinein":
      return EaseType.SineIn;
    case "sineout":
      return EaseType.SineOut;
    case "sineinout":
      return EaseType.SineInOut;
    case "quadin":
      return EaseType.QuadIn;
    case "quadout":
      return EaseType.QuadOut;
    case "quadinout":
      return EaseType.QuadInOut;
    case "cubicin":
      return EaseType.CubicIn;
    case "cubicout":
      return EaseType.CubicOut;
    case "cubicinout":
      return EaseType.CubicInOut;
    case "quartin":
      return EaseType.QuartIn;
    case "quartout":
      return EaseType.QuartOut;
    case "quartinout":
      return EaseType.QuartInOut;
    case "quintin":
      return EaseType.QuintIn;
    case "quintout":
      return EaseType.QuintOut;
    case "quintinout":
      return EaseType.QuintInOut;
    case "expoin":
      return EaseType.ExpoIn;
    case "expoout":
      return EaseType.ExpoOut;
    case "expoinout":
      return EaseType.ExpoInOut;
    case "circin":
      return EaseType.CircIn;
    case "circout":
      return EaseType.CircOut;
    case "circinout":
      return EaseType.CircInOut;
    case "elasticin":
      return EaseType.ElasticIn;
    case "elasticout":
      return EaseType.ElasticOut;
    case "elasticinout":
      return EaseType.ElasticInOut;
    case "backin":
      return EaseType.BackIn;
    case "backout":
      return EaseType.BackOut;
    case "backinout":
      return EaseType.BackInOut;
    case "bouncein":
      return EaseType.BounceIn;
    case "bounceout":
      return EaseType.BounceOut;
    case "bounceinout":
      return EaseType.BounceInOut;
    default:
      console.warn(`FairyGUI XML: unknown transition ease '${rawValue}', fallback to QuadOut.`);
      return EaseType.QuadOut;
  }
}
function parseTransitionValue(type, rawValue, value, frameRate) {
  switch (type) {
    case ActionType.XY:
    case ActionType.Size:
    case ActionType.Pivot:
    case ActionType.Skew:
      assignOptionalPair(rawValue, value);
      break;
    case ActionType.Scale: {
      const pair = parseNumberPair(rawValue, 1, 1);
      value.f1 = pair[0];
      value.f2 = pair[1];
      break;
    }
    case ActionType.Alpha:
    case ActionType.Rotation:
      value.f1 = readXMLNumber(rawValue, 0);
      break;
    case ActionType.Color:
      value.f1 = parseColorValue(rawValue);
      break;
    case ActionType.Animation: {
      const parts = splitCSV(rawValue);
      value.frame = readXMLInt(parts[0], 0);
      value.playing = parseAnimationPlaying(parts[1]);
      break;
    }
    case ActionType.Visible:
      value.visible = readXMLBool(rawValue, false);
      break;
    case ActionType.Sound: {
      const parts = splitCSV(rawValue);
      value.sound = parts[0] || "";
      value.volume = parts.length > 1 ? readXMLNumber(parts[1], 1) : 1;
      break;
    }
    case ActionType.Transition: {
      const parts = splitCSV(rawValue);
      value.transName = parts[0] || "";
      value.playTimes = parts.length > 1 ? readXMLInt(parts[1], 1) : 1;
      break;
    }
    case ActionType.Shake: {
      const parts = splitCSV(rawValue);
      value.amplitude = readXMLNumber(parts[0], 0);
      value.duration = readXMLNumber(parts[1], 0);
      break;
    }
    case ActionType.ColorFilter: {
      const parts = splitCSV(rawValue);
      value.f1 = readXMLNumber(parts[0], 0);
      value.f2 = readXMLNumber(parts[1], 0);
      value.f3 = readXMLNumber(parts[2], 0);
      value.f4 = readXMLNumber(parts[3], 0);
      break;
    }
    case ActionType.Text:
    case ActionType.Icon:
      value.text = rawValue || "";
      break;
  }
}
function assignOptionalPair(rawValue, value) {
  const parts = splitCSV(rawValue);
  const xRaw = parts[0];
  const yRaw = parts[1];
  value.b1 = xRaw != null && xRaw !== "-" && xRaw !== "";
  value.b2 = yRaw != null && yRaw !== "-" && yRaw !== "";
  value.f1 = value.b1 ? readXMLNumber(xRaw, 0) : 0;
  value.f2 = value.b2 ? readXMLNumber(yRaw, 0) : 0;
}
function parseNumberPair(rawValue, defaultX, defaultY) {
  const parts = splitCSV(rawValue);
  return [
    readXMLNumber(parts[0], defaultX),
    readXMLNumber(parts[1], defaultY)
  ];
}
function parseAnimationPlaying(rawValue) {
  if (!rawValue)
    return true;
  return rawValue.toLowerCase() == "p" || readXMLBool(rawValue, false);
}
function parseTransitionPath(rawValue) {
  const parts = splitCSV(rawValue);
  if (parts.length < 3)
    return null;
  const points = [];
  let index = 0;
  while (index < parts.length) {
    if (points.length > 0) {
      index += 1;
      if (index >= parts.length)
        break;
    }
    const curveType = readXMLInt(parts[index], CurveType.CRSpline);
    index += 1;
    const parsed = readTransitionPathPoint(parts, curveType, index);
    if (!parsed)
      return null;
    points.push(parsed.point);
    index = parsed.nextIndex;
  }
  if (points.length < 2)
    return null;
  const path2 = new GPath();
  path2.create(points);
  return path2;
}
function readTransitionPathPoint(parts, curveType, startIndex) {
  switch (curveType) {
    case CurveType.Bezier:
      if (startIndex + 3 >= parts.length)
        return null;
      return {
        point: GPathPoint.newBezierPoint(readXMLNumber(parts[startIndex], 0), readXMLNumber(parts[startIndex + 1], 0), readXMLNumber(parts[startIndex + 2], 0), readXMLNumber(parts[startIndex + 3], 0)),
        nextIndex: startIndex + 4
      };
    case CurveType.CubicBezier:
      if (startIndex + 5 >= parts.length)
        return null;
      return {
        point: GPathPoint.newCubicBezierPoint(readXMLNumber(parts[startIndex], 0), readXMLNumber(parts[startIndex + 1], 0), readXMLNumber(parts[startIndex + 2], 0), readXMLNumber(parts[startIndex + 3], 0), readXMLNumber(parts[startIndex + 4], 0), readXMLNumber(parts[startIndex + 5], 0)),
        nextIndex: startIndex + 6
      };
    case CurveType.CRSpline:
    case CurveType.Straight:
      if (startIndex + 1 >= parts.length)
        return null;
      return {
        point: GPathPoint.newPoint(readXMLNumber(parts[startIndex], 0), readXMLNumber(parts[startIndex + 1], 0), curveType),
        nextIndex: startIndex + 2
      };
    default:
      return null;
  }
}
function parseColorValue(rawValue) {
  if (!rawValue)
    return 0;
  const hex = rawValue.replace(/^#/, "");
  const normalized = hex.length == 8 ? hex.slice(2) : hex;
  const parsed = Number.parseInt(normalized, 16);
  return Number.isFinite(parsed) ? parsed : 0;
}
function splitCSV(rawValue) {
  if (!rawValue)
    return [];
  return rawValue.split(",").map((item) => item.trim());
}
function readXMLBool(rawValue, defaultValue) {
  if (rawValue == null || rawValue === "")
    return defaultValue;
  return rawValue === "true" || rawValue === "1";
}
function readXMLNumber(rawValue, defaultValue) {
  if (rawValue == null || rawValue === "")
    return defaultValue;
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
function readXMLInt(rawValue, defaultValue) {
  if (rawValue == null || rawValue === "")
    return defaultValue;
  const parsed = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
function xmlFramesToSeconds(rawValue, frameRate) {
  return readXMLNumber(rawValue, 0) / frameRate;
}
var TranslationHelper = class _TranslationHelper {
  static loadFromXML(source) {
    _TranslationHelper.strings = {};
    let strings = _TranslationHelper.strings;
    var xml = new DOMParser().parseFromString(source, "text/xml").documentElement;
    var nodes = xml.childNodes;
    var length1 = nodes.length;
    for (var i1 = 0; i1 < length1; i1++) {
      var cxml = nodes[i1];
      if (cxml.tagName == "string") {
        var key = cxml.getAttribute("name");
        var text = cxml.childNodes.length > 0 ? cxml.firstChild.nodeValue : "";
        var i = key.indexOf("-");
        if (i == -1)
          continue;
        var key2 = key.substring(0, i);
        var key3 = key.substring(i + 1);
        var col = strings[key2];
        if (!col) {
          col = {};
          strings[key2] = col;
        }
        col[key3] = text;
      }
    }
  }
  static translateComponent(item) {
    if (_TranslationHelper.strings == null)
      return;
    var compStrings = _TranslationHelper.strings[item.owner.id + item.id];
    if (compStrings == null)
      return;
    var elementId, value;
    var buffer = item.rawData;
    var nextPos;
    var itemCount;
    var i, j, k;
    var dataLen;
    var curPos;
    var valueCnt;
    var page;
    buffer.seek(0, 2);
    var childCount = buffer.readShort();
    for (i = 0; i < childCount; i++) {
      dataLen = buffer.readShort();
      curPos = buffer.position;
      buffer.seek(curPos, 0);
      var baseType = buffer.readByte();
      var type = baseType;
      buffer.skip(4);
      elementId = buffer.readS();
      if (type == ObjectType.Component) {
        if (buffer.seek(curPos, 6))
          type = buffer.readByte();
      }
      buffer.seek(curPos, 1);
      if ((value = compStrings[elementId + "-tips"]) != null)
        buffer.writeS(value);
      buffer.seek(curPos, 2);
      var gearCnt = buffer.readShort();
      for (j = 0; j < gearCnt; j++) {
        nextPos = buffer.readShort();
        nextPos += buffer.position;
        if (buffer.readByte() == 6) {
          buffer.skip(2);
          valueCnt = buffer.readShort();
          for (k = 0; k < valueCnt; k++) {
            page = buffer.readS();
            if (page != null) {
              if ((value = compStrings[elementId + "-texts_" + k]) != null)
                buffer.writeS(value);
              else
                buffer.skip(2);
            }
          }
          if (buffer.readBool() && (value = compStrings[elementId + "-texts_def"]) != null)
            buffer.writeS(value);
        }
        buffer.position = nextPos;
      }
      if (baseType == ObjectType.Component && buffer.version >= 2) {
        buffer.seek(curPos, 4);
        buffer.skip(2);
        buffer.skip(4 * buffer.readShort());
        var cpCount = buffer.readShort();
        for (var k = 0; k < cpCount; k++) {
          var target = buffer.readS();
          var propertyId = buffer.readShort();
          if (propertyId == 0 && (value = compStrings[elementId + "-cp-" + target]) != null)
            buffer.writeS(value);
          else
            buffer.skip(2);
        }
      }
      switch (type) {
        case ObjectType.Text:
        case ObjectType.RichText:
        case ObjectType.InputText: {
          if ((value = compStrings[elementId]) != null) {
            buffer.seek(curPos, 6);
            buffer.writeS(value);
          }
          if ((value = compStrings[elementId + "-prompt"]) != null) {
            buffer.seek(curPos, 4);
            buffer.writeS(value);
          }
          break;
        }
        case ObjectType.List:
        case ObjectType.Tree: {
          buffer.seek(curPos, 8);
          buffer.skip(2);
          itemCount = buffer.readShort();
          for (j = 0; j < itemCount; j++) {
            nextPos = buffer.readShort();
            nextPos += buffer.position;
            buffer.skip(2);
            if (type == ObjectType.Tree)
              buffer.skip(2);
            if ((value = compStrings[elementId + "-" + j]) != null)
              buffer.writeS(value);
            else
              buffer.skip(2);
            if ((value = compStrings[elementId + "-" + j + "-0"]) != null)
              buffer.writeS(value);
            else
              buffer.skip(2);
            if (buffer.version >= 2) {
              buffer.skip(6);
              buffer.skip(buffer.readUshort() * 4);
              var cpCount = buffer.readUshort();
              for (var k = 0; k < cpCount; k++) {
                var target = buffer.readS();
                var propertyId = buffer.readUshort();
                if (propertyId == 0 && (value = compStrings[elementId + "-" + j + "-" + target]) != null)
                  buffer.writeS(value);
                else
                  buffer.skip(2);
              }
            }
            buffer.position = nextPos;
          }
          break;
        }
        case ObjectType.Label: {
          if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
            if ((value = compStrings[elementId]) != null)
              buffer.writeS(value);
            else
              buffer.skip(2);
            buffer.skip(2);
            if (buffer.readBool())
              buffer.skip(4);
            buffer.skip(4);
            if (buffer.readBool() && (value = compStrings[elementId + "-prompt"]) != null)
              buffer.writeS(value);
          }
          break;
        }
        case ObjectType.Button: {
          if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
            if ((value = compStrings[elementId]) != null)
              buffer.writeS(value);
            else
              buffer.skip(2);
            if ((value = compStrings[elementId + "-0"]) != null)
              buffer.writeS(value);
          }
          break;
        }
        case ObjectType.ComboBox: {
          if (buffer.seek(curPos, 6) && buffer.readByte() == type) {
            itemCount = buffer.readShort();
            for (j = 0; j < itemCount; j++) {
              nextPos = buffer.readShort();
              nextPos += buffer.position;
              if ((value = compStrings[elementId + "-" + j]) != null)
                buffer.writeS(value);
              buffer.position = nextPos;
            }
            if ((value = compStrings[elementId]) != null)
              buffer.writeS(value);
          }
          break;
        }
      }
      buffer.position = curPos + dataLen;
    }
  }
};
var UIContentScaler = class {
};
UIContentScaler.scaleFactor = 1;
UIContentScaler.scaleLevel = 0;
UIContentScaler.rootSize = new import_cc.Size();
function updateScaler() {
  let size = import_cc.screen.windowSize;
  size.width /= import_cc.view.getScaleX();
  size.height /= import_cc.view.getScaleY();
  UIContentScaler.rootSize.set(size);
  var ss = Math.max(import_cc.view.getScaleX(), import_cc.view.getScaleY());
  UIContentScaler.scaleFactor = ss;
  if (ss >= 3.5)
    UIContentScaler.scaleLevel = 3;
  else if (ss >= 2.5)
    UIContentScaler.scaleLevel = 2;
  else if (ss >= 1.5)
    UIContentScaler.scaleLevel = 1;
  else
    UIContentScaler.scaleLevel = 0;
}
var GComponent = class _GComponent extends GObject {
  constructor() {
    super();
    this._sortingChildCount = 0;
    this._invertedMask = false;
    this._childrenRenderOrder = ChildrenRenderOrder.Ascent;
    this._apexIndex = 0;
    this._node.name = "GComponent";
    this._children = new Array();
    this._controllers = new Array();
    this._transitions = new Array();
    this._margin = new Margin();
    this._alignOffset = new import_cc.Vec2();
    this._container = new import_cc.Node("Container");
    this._container.layer = UIConfig.defaultUILayer;
    this._containerUITrans = this._container.addComponent(import_cc.UITransform);
    this._containerUITrans.setAnchorPoint(0, 1);
    this._node.addChild(this._container);
  }
  dispose() {
    var i;
    var cnt;
    cnt = this._transitions.length;
    for (i = 0; i < cnt; ++i) {
      var trans = this._transitions[i];
      trans.dispose();
    }
    cnt = this._controllers.length;
    for (i = 0; i < cnt; ++i) {
      var cc = this._controllers[i];
      cc.dispose();
    }
    if (this._scrollPane)
      this._scrollPane.destroy();
    cnt = this._children.length;
    for (i = cnt - 1; i >= 0; --i) {
      var obj = this._children[i];
      obj._parent = null;
      obj.dispose();
    }
    this._boundsChanged = false;
    super.dispose();
  }
  get displayListContainer() {
    return this._container;
  }
  addChild(child) {
    this.addChildAt(child, this._children.length);
    return child;
  }
  addChildAt(child, index) {
    if (!child)
      throw new Error("child is null");
    var numChildren = this._children.length;
    if (index >= 0 && index <= numChildren) {
      if (child.parent == this) {
        this.setChildIndex(child, index);
      } else {
        child.removeFromParent();
        child._parent = this;
        var cnt = this._children.length;
        if (child.sortingOrder != 0) {
          this._sortingChildCount++;
          index = this.getInsertPosForSortingChild(child);
        } else if (this._sortingChildCount > 0) {
          if (index > cnt - this._sortingChildCount)
            index = cnt - this._sortingChildCount;
        }
        if (index == cnt)
          this._children.push(child);
        else
          this._children.splice(index, 0, child);
        this.onChildAdd(child, index);
        this.setBoundsChangedFlag();
      }
      return child;
    } else {
      throw new Error("Invalid child index");
    }
  }
  getInsertPosForSortingChild(target) {
    var cnt = this._children.length;
    var i = 0;
    for (i = 0; i < cnt; i++) {
      var child = this._children[i];
      if (child == target)
        continue;
      if (target.sortingOrder < child.sortingOrder)
        break;
    }
    return i;
  }
  removeChild(child, dispose) {
    var childIndex = this._children.indexOf(child);
    if (childIndex != -1) {
      this.removeChildAt(childIndex, dispose);
    }
    return child;
  }
  removeChildAt(index, dispose) {
    if (index >= 0 && index < this.numChildren) {
      var child = this._children[index];
      child._parent = null;
      if (child.sortingOrder != 0)
        this._sortingChildCount--;
      this._children.splice(index, 1);
      child.group = null;
      this._container.removeChild(child.node);
      if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
        this._partner.callLater(this.buildNativeDisplayList);
      if (dispose)
        child.dispose();
      else
        child.node.parent = null;
      this.setBoundsChangedFlag();
      return child;
    } else {
      throw new Error("Invalid child index");
    }
  }
  removeChildren(beginIndex, endIndex, dispose) {
    if (beginIndex == void 0)
      beginIndex = 0;
    if (endIndex == void 0)
      endIndex = -1;
    if (endIndex < 0 || endIndex >= this.numChildren)
      endIndex = this.numChildren - 1;
    for (var i = beginIndex; i <= endIndex; ++i)
      this.removeChildAt(beginIndex, dispose);
  }
  getChildAt(index, classType) {
    if (index >= 0 && index < this.numChildren)
      return this._children[index];
    else
      throw new Error("Invalid child index");
  }
  getChild(name, classType) {
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      if (this._children[i].name == name)
        return this._children[i];
    }
    return null;
  }
  getChildByPath(path2, classType) {
    var arr = path2.split(".");
    var cnt = arr.length;
    var gcom = this;
    var obj;
    for (var i = 0; i < cnt; ++i) {
      obj = gcom.getChild(arr[i]);
      if (!obj)
        break;
      if (i != cnt - 1) {
        if (!(obj instanceof _GComponent)) {
          obj = null;
          break;
        } else
          gcom = obj;
      }
    }
    return obj;
  }
  getVisibleChild(name) {
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      var child = this._children[i];
      if (child._finalVisible && child.name == name)
        return child;
    }
    return null;
  }
  getChildInGroup(name, group) {
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      var child = this._children[i];
      if (child.group == group && child.name == name)
        return child;
    }
    return null;
  }
  getChildById(id) {
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      if (this._children[i]._id == id)
        return this._children[i];
    }
    return null;
  }
  getChildIndex(child) {
    return this._children.indexOf(child);
  }
  setChildIndex(child, index) {
    var oldIndex = this._children.indexOf(child);
    if (oldIndex == -1)
      throw new Error("Not a child of this container");
    if (child.sortingOrder != 0)
      return;
    var cnt = this._children.length;
    if (this._sortingChildCount > 0) {
      if (index > cnt - this._sortingChildCount - 1)
        index = cnt - this._sortingChildCount - 1;
    }
    this._setChildIndex(child, oldIndex, index);
  }
  setChildIndexBefore(child, index) {
    var oldIndex = this._children.indexOf(child);
    if (oldIndex == -1)
      throw new Error("Not a child of this container");
    if (child.sortingOrder != 0)
      return oldIndex;
    var cnt = this._children.length;
    if (this._sortingChildCount > 0) {
      if (index > cnt - this._sortingChildCount - 1)
        index = cnt - this._sortingChildCount - 1;
    }
    if (oldIndex < index)
      return this._setChildIndex(child, oldIndex, index - 1);
    else
      return this._setChildIndex(child, oldIndex, index);
  }
  _setChildIndex(child, oldIndex, index) {
    var cnt = this._children.length;
    if (index > cnt)
      index = cnt;
    if (oldIndex == index)
      return oldIndex;
    this._children.splice(oldIndex, 1);
    this._children.splice(index, 0, child);
    if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent)
      child.node.setSiblingIndex(index);
    else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent)
      child.node.setSiblingIndex(cnt - index);
    else
      this._partner.callLater(this.buildNativeDisplayList);
    this.setBoundsChangedFlag();
    return index;
  }
  swapChildren(child1, child2) {
    var index1 = this._children.indexOf(child1);
    var index2 = this._children.indexOf(child2);
    if (index1 == -1 || index2 == -1)
      throw new Error("Not a child of this container");
    this.swapChildrenAt(index1, index2);
  }
  swapChildrenAt(index1, index2) {
    var child1 = this._children[index1];
    var child2 = this._children[index2];
    this.setChildIndex(child1, index2);
    this.setChildIndex(child2, index1);
  }
  get numChildren() {
    return this._children.length;
  }
  isAncestorOf(child) {
    if (child == null)
      return false;
    var p = child.parent;
    while (p) {
      if (p == this)
        return true;
      p = p.parent;
    }
    return false;
  }
  addController(controller) {
    this._controllers.push(controller);
    controller.parent = this;
    this.applyController(controller);
  }
  getControllerAt(index) {
    return this._controllers[index];
  }
  getController(name) {
    var cnt = this._controllers.length;
    for (var i = 0; i < cnt; ++i) {
      var c = this._controllers[i];
      if (c.name == name)
        return c;
    }
    return null;
  }
  removeController(c) {
    var index = this._controllers.indexOf(c);
    if (index == -1)
      throw new Error("controller not exists");
    c.parent = null;
    this._controllers.splice(index, 1);
    var length = this._children.length;
    for (var i = 0; i < length; i++) {
      var child = this._children[i];
      child.handleControllerChanged(c);
    }
  }
  get controllers() {
    return this._controllers;
  }
  onChildAdd(child, index) {
    child.node.parent = this._container;
    child.node.active = child._finalVisible;
    if (this._buildingDisplayList)
      return;
    let cnt = this._children.length;
    if (this._childrenRenderOrder == ChildrenRenderOrder.Ascent)
      child.node.setSiblingIndex(index);
    else if (this._childrenRenderOrder == ChildrenRenderOrder.Descent)
      child.node.setSiblingIndex(cnt - index);
    else
      this._partner.callLater(this.buildNativeDisplayList);
  }
  buildNativeDisplayList(dt) {
    if (!isNaN(dt)) {
      let _t = GObject.cast(this.node);
      _t.buildNativeDisplayList();
      return;
    }
    let cnt = this._children.length;
    if (cnt == 0)
      return;
    let child;
    switch (this._childrenRenderOrder) {
      case ChildrenRenderOrder.Ascent:
        {
          let j = 0;
          for (let i = 0; i < cnt; i++) {
            child = this._children[i];
            child.node.setSiblingIndex(j++);
          }
        }
        break;
      case ChildrenRenderOrder.Descent:
        {
          let j = 0;
          for (let i = cnt - 1; i >= 0; i--) {
            child = this._children[i];
            child.node.setSiblingIndex(j++);
          }
        }
        break;
      case ChildrenRenderOrder.Arch:
        {
          let j = 0;
          for (let i = 0; i < this._apexIndex; i++) {
            child = this._children[i];
            child.node.setSiblingIndex(j++);
          }
          for (let i = cnt - 1; i >= this._apexIndex; i--) {
            child = this._children[i];
            child.node.setSiblingIndex(j++);
          }
        }
        break;
    }
  }
  applyController(c) {
    this._applyingController = c;
    var child;
    var length = this._children.length;
    for (var i = 0; i < length; i++) {
      child = this._children[i];
      child.handleControllerChanged(c);
    }
    this._applyingController = null;
    c.runActions();
  }
  applyAllControllers() {
    var cnt = this._controllers.length;
    for (var i = 0; i < cnt; ++i) {
      this.applyController(this._controllers[i]);
    }
  }
  adjustRadioGroupDepth(obj, c) {
    var cnt = this._children.length;
    var i;
    var child;
    var myIndex = -1, maxIndex = -1;
    for (i = 0; i < cnt; i++) {
      child = this._children[i];
      if (child == obj) {
        myIndex = i;
      } else if ("relatedController" in child && child.relatedController == c) {
        if (i > maxIndex)
          maxIndex = i;
      }
    }
    if (myIndex < maxIndex) {
      if (this._applyingController)
        this._children[maxIndex].handleControllerChanged(this._applyingController);
      this.swapChildrenAt(myIndex, maxIndex);
    }
  }
  getTransitionAt(index) {
    return this._transitions[index];
  }
  getTransition(transName) {
    var cnt = this._transitions.length;
    for (var i = 0; i < cnt; ++i) {
      var trans = this._transitions[i];
      if (trans.name == transName)
        return trans;
    }
    return null;
  }
  isChildInView(child) {
    if (this._rectMask) {
      return child.x + child.width >= 0 && child.x <= this.width && child.y + child.height >= 0 && child.y <= this.height;
    } else if (this._scrollPane) {
      return this._scrollPane.isChildInView(child);
    } else
      return true;
  }
  getFirstChildInView() {
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      var child = this._children[i];
      if (this.isChildInView(child))
        return i;
    }
    return -1;
  }
  get scrollPane() {
    return this._scrollPane;
  }
  get opaque() {
    return this._opaque;
  }
  set opaque(value) {
    this._opaque = value;
  }
  get margin() {
    return this._margin;
  }
  set margin(value) {
    this._margin.copy(value);
    this.handleSizeChanged();
  }
  get childrenRenderOrder() {
    return this._childrenRenderOrder;
  }
  set childrenRenderOrder(value) {
    if (this._childrenRenderOrder != value) {
      this._childrenRenderOrder = value;
      this.buildNativeDisplayList();
    }
  }
  get apexIndex() {
    return this._apexIndex;
  }
  set apexIndex(value) {
    if (this._apexIndex != value) {
      this._apexIndex = value;
      if (this._childrenRenderOrder == ChildrenRenderOrder.Arch)
        this.buildNativeDisplayList();
    }
  }
  get mask() {
    return this._maskContent;
  }
  set mask(value) {
    this.setMask(value, false);
  }
  setMask(value, inverted) {
    if (this._maskContent) {
      this._maskContent.node.off(import_cc.Node.EventType.TRANSFORM_CHANGED, this.onMaskContentChanged, this);
      this._maskContent.node.off(import_cc.Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);
      this._maskContent.node.off(import_cc.Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);
      this._maskContent.visible = true;
    }
    this._maskContent = value;
    if (this._maskContent) {
      if (!(value instanceof GImage) && !(value instanceof GGraph))
        return;
      if (!this._customMask) {
        let maskNode = new import_cc.Node("Mask");
        maskNode.layer = UIConfig.defaultUILayer;
        maskNode.addComponent(import_cc.UITransform);
        maskNode.parent = this._node;
        if (this._scrollPane)
          this._container.parent.parent = maskNode;
        else
          this._container.parent = maskNode;
        this._customMask = maskNode.addComponent(import_cc.Mask);
      }
      value.visible = false;
      value.node.on(import_cc.Node.EventType.TRANSFORM_CHANGED, this.onMaskContentChanged, this);
      value.node.on(import_cc.Node.EventType.SIZE_CHANGED, this.onMaskContentChanged, this);
      value.node.on(import_cc.Node.EventType.ANCHOR_CHANGED, this.onMaskContentChanged, this);
      this._invertedMask = inverted;
      if (this._node.activeInHierarchy)
        this.onMaskReady();
      else
        this.on(Event.DISPLAY, this.onMaskReady, this);
      this.onMaskContentChanged();
      if (this._scrollPane)
        this._scrollPane.adjustMaskContainer();
      else
        this._container.setPosition(0, 0);
    } else if (this._customMask) {
      if (this._scrollPane)
        this._container.parent.parent = this._node;
      else
        this._container.parent = this._node;
      this._customMask.node.destroy();
      this._customMask = null;
      if (this._scrollPane)
        this._scrollPane.adjustMaskContainer();
      else
        this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
    }
  }
  onMaskReady() {
    this.off(Event.DISPLAY, this.onMaskReady, this);
    if (this._maskContent instanceof GImage) {
      this._customMask.type = import_cc.Mask.Type.SPRITE_STENCIL;
      this._customMask.alphaThreshold = 1e-4;
      this._customMask.spriteFrame = this._maskContent._content.spriteFrame;
    } else if (this._maskContent instanceof GGraph) {
      if (this._maskContent.type == 2)
        this._customMask.type = import_cc.Mask.Type.GRAPHICS_ELLIPSE;
      else
        this._customMask.type = import_cc.Mask.Type.GRAPHICS_RECT;
    }
    this._customMask.inverted = this._invertedMask;
  }
  onMaskContentChanged() {
    let maskNode = this._customMask.node;
    let maskUITrans = maskNode.getComponent(import_cc.UITransform);
    let contentNode = this._maskContent.node;
    let contentUITrans = this._maskContent._uiTrans;
    let w = this._maskContent.width * this._maskContent.scaleX;
    let h = this._maskContent.height * this._maskContent.scaleY;
    maskUITrans.setContentSize(w, h);
    let left = contentNode.position.x - contentUITrans.anchorX * w;
    let top = contentNode.position.y - contentUITrans.anchorY * h;
    maskUITrans.setAnchorPoint(-left / maskUITrans.width, -top / maskUITrans.height);
    maskNode.setPosition(this._pivotCorrectX, this._pivotCorrectY);
  }
  get _pivotCorrectX() {
    return -this.pivotX * this._width + this._margin.left;
  }
  get _pivotCorrectY() {
    return this.pivotY * this._height - this._margin.top;
  }
  get baseUserData() {
    var buffer = this.packageItem.rawData;
    buffer.seek(0, 4);
    return buffer.readS();
  }
  setupScroll(buffer) {
    this._scrollPane = this._node.addComponent(ScrollPane);
    this._scrollPane.setup(buffer);
  }
  setupOverflow(overflow) {
    if (overflow == OverflowType.Hidden)
      this._rectMask = this._container.addComponent(import_cc.Mask);
    if (!this._margin.isNone)
      this.handleSizeChanged();
  }
  handleAnchorChanged() {
    super.handleAnchorChanged();
    if (this._customMask)
      this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY);
    else if (this._scrollPane)
      this._scrollPane.adjustMaskContainer();
    else
      this._container.setPosition(this._pivotCorrectX + this._alignOffset.x, this._pivotCorrectY - this._alignOffset.y);
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (this._customMask)
      this._customMask.node.setPosition(this._pivotCorrectX, this._pivotCorrectY);
    else if (!this._scrollPane)
      this._container.setPosition(this._pivotCorrectX, this._pivotCorrectY);
    if (this._scrollPane)
      this._scrollPane.onOwnerSizeChanged();
    else
      this._containerUITrans.setContentSize(this.viewWidth, this.viewHeight);
  }
  handleGrayedChanged() {
    var c = this.getController("grayed");
    if (c) {
      c.selectedIndex = this.grayed ? 1 : 0;
      return;
    }
    var v = this.grayed;
    var cnt = this._children.length;
    for (var i = 0; i < cnt; ++i) {
      this._children[i].grayed = v;
    }
  }
  handleControllerChanged(c) {
    super.handleControllerChanged(c);
    if (this._scrollPane)
      this._scrollPane.handleControllerChanged(c);
  }
  _hitTest(pt, globalPt) {
    if (this._customMask) {
      s_vec2$2.set(globalPt);
      s_vec2$2.y = UIContentScaler.rootSize.height - globalPt.y;
      let b = this._customMask.isHit(s_vec2$2) || false;
      if (!b)
        return null;
    }
    if (this.hitArea) {
      if (!this.hitArea.hitTest(pt, globalPt))
        return null;
    } else if (this._rectMask) {
      s_vec2$2.set(pt);
      s_vec2$2.x += this._container.position.x;
      s_vec2$2.y += this._container.position.y;
      let clippingSize = this._containerUITrans.contentSize;
      if (s_vec2$2.x < 0 || s_vec2$2.y < 0 || s_vec2$2.x >= clippingSize.width || s_vec2$2.y >= clippingSize.height)
        return null;
    }
    if (this._scrollPane) {
      let target2 = this._scrollPane.hitTest(pt, globalPt);
      if (!target2)
        return null;
      if (target2 != this)
        return target2;
    }
    let target = null;
    let cnt = this._children.length;
    for (let i = cnt - 1; i >= 0; i--) {
      let child = this._children[i];
      if (this._maskContent == child || child._touchDisabled)
        continue;
      target = child.hitTest(globalPt);
      if (target)
        break;
    }
    if (!target && this._opaque && (this.hitArea || pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height))
      target = this;
    return target;
  }
  setBoundsChangedFlag() {
    if (!this._scrollPane && !this._trackBounds)
      return;
    if (!this._boundsChanged) {
      this._boundsChanged = true;
      this._partner.callLater(this.refresh);
    }
  }
  refresh(dt) {
    if (!isNaN(dt)) {
      let _t = GObject.cast(this.node);
      _t.refresh();
      return;
    }
    if (this._boundsChanged) {
      var len = this._children.length;
      if (len > 0) {
        for (var i = 0; i < len; i++) {
          var child = this._children[i];
          child.ensureSizeCorrect();
        }
      }
      this.updateBounds();
    }
  }
  ensureBoundsCorrect() {
    var len = this._children.length;
    if (len > 0) {
      for (var i = 0; i < len; i++) {
        var child = this._children[i];
        child.ensureSizeCorrect();
      }
    }
    if (this._boundsChanged)
      this.updateBounds();
  }
  updateBounds() {
    var ax = 0, ay = 0, aw = 0, ah = 0;
    var len = this._children.length;
    if (len > 0) {
      ax = Number.POSITIVE_INFINITY, ay = Number.POSITIVE_INFINITY;
      var ar = Number.NEGATIVE_INFINITY, ab = Number.NEGATIVE_INFINITY;
      var tmp = 0;
      var i = 0;
      for (var i = 0; i < len; i++) {
        var child = this._children[i];
        tmp = child.x;
        if (tmp < ax)
          ax = tmp;
        tmp = child.y;
        if (tmp < ay)
          ay = tmp;
        tmp = child.x + child.actualWidth;
        if (tmp > ar)
          ar = tmp;
        tmp = child.y + child.actualHeight;
        if (tmp > ab)
          ab = tmp;
      }
      aw = ar - ax;
      ah = ab - ay;
    }
    this.setBounds(ax, ay, aw, ah);
  }
  setBounds(ax, ay, aw, ah = 0) {
    this._boundsChanged = false;
    if (this._scrollPane)
      this._scrollPane.setContentSize(Math.round(ax + aw), Math.round(ay + ah));
  }
  get viewWidth() {
    if (this._scrollPane)
      return this._scrollPane.viewWidth;
    else
      return this.width - this._margin.left - this._margin.right;
  }
  set viewWidth(value) {
    if (this._scrollPane)
      this._scrollPane.viewWidth = value;
    else
      this.width = value + this._margin.left + this._margin.right;
  }
  get viewHeight() {
    if (this._scrollPane)
      return this._scrollPane.viewHeight;
    else
      return this.height - this._margin.top - this._margin.bottom;
  }
  set viewHeight(value) {
    if (this._scrollPane)
      this._scrollPane.viewHeight = value;
    else
      this.height = value + this._margin.top + this._margin.bottom;
  }
  getSnappingPosition(xValue, yValue, resultPoint) {
    if (!resultPoint)
      resultPoint = new import_cc.Vec2();
    var cnt = this._children.length;
    if (cnt == 0) {
      resultPoint.x = 0;
      resultPoint.y = 0;
      return resultPoint;
    }
    this.ensureBoundsCorrect();
    var obj = null;
    var prev = null;
    var i = 0;
    if (yValue != 0) {
      for (; i < cnt; i++) {
        obj = this._children[i];
        if (yValue < obj.y) {
          if (i == 0) {
            yValue = 0;
            break;
          } else {
            prev = this._children[i - 1];
            if (yValue < prev.y + prev.actualHeight / 2)
              yValue = prev.y;
            else
              yValue = obj.y;
            break;
          }
        }
      }
      if (i == cnt)
        yValue = obj.y;
    }
    if (xValue != 0) {
      if (i > 0)
        i--;
      for (; i < cnt; i++) {
        obj = this._children[i];
        if (xValue < obj.x) {
          if (i == 0) {
            xValue = 0;
            break;
          } else {
            prev = this._children[i - 1];
            if (xValue < prev.x + prev.actualWidth / 2)
              xValue = prev.x;
            else
              xValue = obj.x;
            break;
          }
        }
      }
      if (i == cnt)
        xValue = obj.x;
    }
    resultPoint.x = xValue;
    resultPoint.y = yValue;
    return resultPoint;
  }
  childSortingOrderChanged(child, oldValue, newValue = 0) {
    if (newValue == 0) {
      this._sortingChildCount--;
      this.setChildIndex(child, this._children.length);
    } else {
      if (oldValue == 0)
        this._sortingChildCount++;
      var oldIndex = this._children.indexOf(child);
      var index = this.getInsertPosForSortingChild(child);
      if (oldIndex < index)
        this._setChildIndex(child, oldIndex, index - 1);
      else
        this._setChildIndex(child, oldIndex, index);
    }
  }
  constructFromResource() {
    this.constructFromResource2(null, 0);
  }
  constructFromResource2(objectPool, poolIndex) {
    var contentItem = this.packageItem.getBranch();
    if (!contentItem.decoded) {
      contentItem.decoded = true;
      TranslationHelper.translateComponent(contentItem);
    }
    var i;
    var dataLen;
    var curPos;
    var nextPos;
    var f1;
    var f2;
    var i1;
    var i2;
    var buffer = contentItem.rawData;
    buffer.seek(0, 0);
    this._underConstruct = true;
    this.sourceWidth = buffer.readInt();
    this.sourceHeight = buffer.readInt();
    this.initWidth = this.sourceWidth;
    this.initHeight = this.sourceHeight;
    this.setSize(this.sourceWidth, this.sourceHeight);
    if (buffer.readBool()) {
      this.minWidth = buffer.readInt();
      this.maxWidth = buffer.readInt();
      this.minHeight = buffer.readInt();
      this.maxHeight = buffer.readInt();
    }
    if (buffer.readBool()) {
      f1 = buffer.readFloat();
      f2 = buffer.readFloat();
      this.setPivot(f1, f2, buffer.readBool());
    }
    if (buffer.readBool()) {
      this._margin.top = buffer.readInt();
      this._margin.bottom = buffer.readInt();
      this._margin.left = buffer.readInt();
      this._margin.right = buffer.readInt();
    }
    var overflow = buffer.readByte();
    if (overflow == OverflowType.Scroll) {
      var savedPos = buffer.position;
      buffer.seek(0, 7);
      this.setupScroll(buffer);
      buffer.position = savedPos;
    } else
      this.setupOverflow(overflow);
    if (buffer.readBool())
      buffer.skip(8);
    this._buildingDisplayList = true;
    buffer.seek(0, 1);
    var controllerCount = buffer.readShort();
    for (i = 0; i < controllerCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      var controller = new Controller();
      this._controllers.push(controller);
      controller.parent = this;
      controller.setup(buffer);
      buffer.position = nextPos;
    }
    buffer.seek(0, 2);
    var child;
    var childCount = buffer.readShort();
    for (i = 0; i < childCount; i++) {
      dataLen = buffer.readShort();
      curPos = buffer.position;
      if (objectPool)
        child = objectPool[poolIndex + i];
      else {
        buffer.seek(curPos, 0);
        var type = buffer.readByte();
        var src = buffer.readS();
        var pkgId = buffer.readS();
        var pi = null;
        if (src != null) {
          var pkg;
          if (pkgId != null)
            pkg = UIPackage.getById(pkgId);
          else
            pkg = contentItem.owner;
          pi = pkg ? pkg.getItemById(src) : null;
        }
        if (pi) {
          child = Decls.UIObjectFactory.newObject(pi);
          child.constructFromResource();
        } else
          child = Decls.UIObjectFactory.newObject(type);
      }
      child._underConstruct = true;
      child.setup_beforeAdd(buffer, curPos);
      child._parent = this;
      child.node.parent = this._container;
      this._children.push(child);
      buffer.position = curPos + dataLen;
    }
    buffer.seek(0, 3);
    this.relations.setup(buffer, true);
    buffer.seek(0, 2);
    buffer.skip(2);
    for (i = 0; i < childCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      buffer.seek(buffer.position, 3);
      this._children[i].relations.setup(buffer, false);
      buffer.position = nextPos;
    }
    buffer.seek(0, 2);
    buffer.skip(2);
    for (i = 0; i < childCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      child = this._children[i];
      child.setup_afterAdd(buffer, buffer.position);
      child._underConstruct = false;
      buffer.position = nextPos;
    }
    buffer.seek(0, 4);
    buffer.skip(2);
    this.opaque = buffer.readBool();
    var maskId = buffer.readShort();
    if (maskId != -1) {
      this.setMask(this.getChildAt(maskId), buffer.readBool());
    }
    var hitTestId = buffer.readS();
    i1 = buffer.readInt();
    i2 = buffer.readInt();
    if (hitTestId != null) {
      pi = contentItem.owner.getItemById(hitTestId);
      if (pi && pi.hitTestData)
        this.hitArea = new PixelHitTest(pi.hitTestData, i1, i2);
    } else if (i1 != 0 && i2 != -1) {
      this.hitArea = new ChildHitArea(this.getChildAt(i2));
    }
    buffer.seek(0, 5);
    var transitionCount = buffer.readShort();
    for (i = 0; i < transitionCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      var trans = new Transition(this);
      trans.setup(buffer);
      this._transitions.push(trans);
      buffer.position = nextPos;
    }
    this.applyAllControllers();
    this._buildingDisplayList = false;
    this._underConstruct = false;
    this.buildNativeDisplayList();
    this.setBoundsChangedFlag();
    if (contentItem.objectType != ObjectType.Component)
      this.constructExtension(buffer);
    this.onConstruct();
  }
  constructExtension(buffer) {
  }
  constructExtensionFromXML(attrs, items) {
  }
  applyExtensionFromXML(attrs, items) {
  }
  setMarginFromXML(top, bottom, left, right) {
    this._margin.top = top;
    this._margin.bottom = bottom;
    this._margin.left = left;
    this._margin.right = right;
  }
  applyScrollFromXML(attrs) {
    if (!this._scrollPane) {
      this._scrollPane = this._node.addComponent(ScrollPane);
      this._scrollPane.setupFromXML(attrs);
    }
  }
  applyOverflowFromXML(overflow) {
    this.setupOverflow(overflow);
  }
  finalizeXMLConstruction() {
    this._buildingDisplayList = false;
    this._underConstruct = false;
    this.buildNativeDisplayList();
    this.setBoundsChangedFlag();
    this.onConstruct();
  }
  onConstruct() {
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    buffer.seek(beginPos, 4);
    var pageController = buffer.readShort();
    if (pageController != -1 && this._scrollPane)
      this._scrollPane.pageController = this._parent.getControllerAt(pageController);
    var cnt = buffer.readShort();
    for (var i = 0; i < cnt; i++) {
      var cc = this.getController(buffer.readS());
      var pageId = buffer.readS();
      if (cc)
        cc.selectedPageId = pageId;
    }
    if (buffer.version >= 2) {
      cnt = buffer.readShort();
      for (i = 0; i < cnt; i++) {
        var target = buffer.readS();
        var propertyId = buffer.readShort();
        var value = buffer.readS();
        var obj = this.getChildByPath(target);
        if (obj)
          obj.setProp(propertyId, value);
      }
    }
  }
  onEnable() {
    let cnt = this._transitions.length;
    for (let i = 0; i < cnt; ++i)
      this._transitions[i].onEnable();
  }
  onDisable() {
    let cnt = this._transitions.length;
    for (let i = 0; i < cnt; ++i)
      this._transitions[i].onDisable();
  }
};
var s_vec2$2 = new import_cc.Vec2();
var PackageItem = class {
  constructor() {
    this.width = 0;
    this.height = 0;
  }
  load() {
    return this.owner.getItemAsset(this);
  }
  getBranch() {
    if (this.branches && this.owner._branchIndex != -1) {
      var itemId = this.branches[this.owner._branchIndex];
      if (itemId)
        return this.owner.getItemById(itemId);
    }
    return this;
  }
  getHighResolution() {
    if (this.highResolution && UIContentScaler.scaleLevel > 0) {
      var itemId = this.highResolution[UIContentScaler.scaleLevel - 1];
      if (itemId)
        return this.owner.getItemById(itemId);
    }
    return this;
  }
  toString() {
    return this.name;
  }
};
var ByteBuffer = class _ByteBuffer {
  constructor(buffer, offset, length) {
    this.version = 0;
    offset = offset || 0;
    if (length == null || length == -1)
      length = buffer.byteLength - offset;
    this._bytes = new Uint8Array(buffer, offset, length);
    this._view = new DataView(this._bytes.buffer, offset, length);
    this._pos = 0;
    this._length = length;
  }
  get data() {
    return this._bytes;
  }
  get position() {
    return this._pos;
  }
  set position(value) {
    if (value > this._length)
      throw new Error("Out of bounds");
    this._pos = value;
  }
  skip(count) {
    this._pos += count;
  }
  validate(forward) {
    if (this._pos + forward > this._length)
      throw new Error("Out of bounds");
  }
  readByte() {
    this.validate(1);
    return this._view.getUint8(this._pos++);
  }
  readBool() {
    return this.readByte() == 1;
  }
  readShort() {
    this.validate(2);
    let ret = this._view.getInt16(this._pos, this.littleEndian);
    this._pos += 2;
    return ret;
  }
  readUshort() {
    this.validate(2);
    let ret = this._view.getUint16(this._pos, this.littleEndian);
    this._pos += 2;
    return ret;
  }
  readInt() {
    this.validate(4);
    let ret = this._view.getInt32(this._pos, this.littleEndian);
    this._pos += 4;
    return ret;
  }
  readUint() {
    this.validate(4);
    let ret = this._view.getUint32(this._pos, this.littleEndian);
    this._pos += 4;
    return ret;
  }
  readFloat() {
    this.validate(4);
    let ret = this._view.getFloat32(this._pos, this.littleEndian);
    this._pos += 4;
    return ret;
  }
  readString(len) {
    if (len == void 0)
      len = this.readUshort();
    this.validate(len);
    let v = "", max = this._pos + len, c = 0, c2 = 0, c3 = 0, f = String.fromCharCode;
    let u = this._bytes;
    let pos = this._pos;
    while (pos < max) {
      c = u[pos++];
      if (c < 128) {
        if (c != 0) {
          v += f(c);
        }
      } else if (c < 224) {
        v += f((c & 63) << 6 | u[pos++] & 127);
      } else if (c < 240) {
        c2 = u[pos++];
        v += f((c & 31) << 12 | (c2 & 127) << 6 | u[pos++] & 127);
      } else {
        c2 = u[pos++];
        c3 = u[pos++];
        v += f((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | u[pos++] & 127);
      }
    }
    this._pos += len;
    return v;
  }
  readS() {
    var index = this.readUshort();
    if (index == 65534)
      return null;
    else if (index == 65533)
      return "";
    else
      return this.stringTable[index];
  }
  readSArray(cnt) {
    var ret = new Array(cnt);
    for (var i = 0; i < cnt; i++)
      ret[i] = this.readS();
    return ret;
  }
  writeS(value) {
    var index = this.readUshort();
    if (index != 65534 && index != 65533)
      this.stringTable[index] = value;
  }
  readColor(hasAlpha) {
    var r = this.readByte();
    var g = this.readByte();
    var b = this.readByte();
    var a = this.readByte();
    return new import_cc.Color(r, g, b, hasAlpha ? a : 255);
  }
  readChar() {
    var i = this.readUshort();
    return String.fromCharCode(i);
  }
  readBuffer() {
    var count = this.readUint();
    this.validate(count);
    var ba = new _ByteBuffer(this._bytes.buffer, this._bytes.byteOffset + this._pos, count);
    ba.stringTable = this.stringTable;
    ba.version = this.version;
    this._pos += count;
    return ba;
  }
  seek(indexTablePos, blockIndex) {
    var tmp = this._pos;
    this._pos = indexTablePos;
    var segCount = this.readByte();
    if (blockIndex < segCount) {
      var useShort = this.readByte() == 1;
      var newPos;
      if (useShort) {
        this._pos += 2 * blockIndex;
        newPos = this.readUshort();
      } else {
        this._pos += 4 * blockIndex;
        newPos = this.readUint();
      }
      if (newPos > 0) {
        this._pos = indexTablePos + newPos;
        return true;
      } else {
        this._pos = tmp;
        return false;
      }
    } else {
      this._pos = tmp;
      return false;
    }
  }
};
var UBBParser = class {
  constructor() {
    this._readPos = 0;
    this._handlers = {};
    this._handlers["url"] = this.onTag_URL;
    this._handlers["img"] = this.onTag_IMG;
    this._handlers["b"] = this.onTag_Simple;
    this._handlers["i"] = this.onTag_Simple;
    this._handlers["u"] = this.onTag_Simple;
    this._handlers["color"] = this.onTag_COLOR;
    this._handlers["size"] = this.onTag_SIZE;
  }
  onTag_URL(tagName, end, attr) {
    if (!end) {
      let ret;
      if (attr != null)
        ret = '<on click="onClickLink" param="' + attr + '">';
      else {
        var href = this.getTagText();
        ret = '<on click="onClickLink" param="' + href + '">';
      }
      if (this.linkUnderline)
        ret += "<u>";
      if (this.linkColor)
        ret += "<color=" + this.linkColor + ">";
      return ret;
    } else {
      let ret = "";
      if (this.linkColor)
        ret += "</color>";
      if (this.linkUnderline)
        ret += "</u>";
      ret += "</on>";
      return ret;
    }
  }
  onTag_IMG(tagName, end, attr) {
    if (!end) {
      var src = this.getTagText(true);
      if (!src)
        return null;
      return '<img src="' + src + '"/>';
    } else
      return null;
  }
  onTag_Simple(tagName, end, attr) {
    return end ? "</" + tagName + ">" : "<" + tagName + ">";
  }
  onTag_COLOR(tagName, end, attr) {
    if (!end) {
      this.lastColor = attr;
      return "<color=" + attr + ">";
    } else
      return "</color>";
  }
  onTag_FONT(tagName, end, attr) {
    if (!end)
      return '<font face="' + attr + '">';
    else
      return "</font>";
  }
  onTag_SIZE(tagName, end, attr) {
    if (!end) {
      this.lastSize = attr;
      return "<size=" + attr + ">";
    } else
      return "</size>";
  }
  getTagText(remove) {
    var pos1 = this._readPos;
    var pos2;
    var result = "";
    while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
      if (this._text.charCodeAt(pos2 - 1) == 92) {
        result += this._text.substring(pos1, pos2 - 1);
        result += "[";
        pos1 = pos2 + 1;
      } else {
        result += this._text.substring(pos1, pos2);
        break;
      }
    }
    if (pos2 == -1)
      return null;
    if (remove)
      this._readPos = pos2;
    return result;
  }
  parse(text, remove) {
    this._text = text;
    this.lastColor = null;
    this.lastSize = null;
    var pos1 = 0, pos2, pos3;
    var end;
    var tag, attr;
    var repl;
    var func;
    var result = "";
    while ((pos2 = this._text.indexOf("[", pos1)) != -1) {
      if (pos2 > 0 && this._text.charCodeAt(pos2 - 1) == 92) {
        result += this._text.substring(pos1, pos2 - 1);
        result += "[";
        pos1 = pos2 + 1;
        continue;
      }
      result += this._text.substring(pos1, pos2);
      pos1 = pos2;
      pos2 = this._text.indexOf("]", pos1);
      if (pos2 == -1)
        break;
      end = this._text.charAt(pos1 + 1) == "/";
      tag = this._text.substring(end ? pos1 + 2 : pos1 + 1, pos2);
      this._readPos = pos2 + 1;
      attr = null;
      repl = null;
      pos3 = tag.indexOf("=");
      if (pos3 != -1) {
        attr = tag.substring(pos3 + 1);
        tag = tag.substring(0, pos3);
      }
      tag = tag.toLowerCase();
      func = this._handlers[tag];
      if (func != null) {
        repl = func.call(this, tag, end, attr);
        if (repl != null && !remove)
          result += repl;
      } else
        result += this._text.substring(pos1, this._readPos);
      pos1 = this._readPos;
    }
    if (pos1 < this._text.length)
      result += this._text.substring(pos1);
    this._text = null;
    return result;
  }
};
var defaultParser = new UBBParser();
var GTextInput = class extends GTextField {
  constructor() {
    super();
    this._node.name = "GTextInput";
    this._touchDisabled = false;
  }
  createRenderer() {
    this._editBox = this._node.addComponent(MyEditBox);
    this._editBox.maxLength = -1;
    this._editBox["_updateTextLabel"]();
    this._node.on("text-changed", this.onTextChanged, this);
    this.on(Event.TOUCH_END, this.onTouchEnd1, this);
    this.autoSize = AutoSizeType.None;
  }
  set editable(val) {
    this._editBox.enabled = val;
  }
  get editable() {
    return this._editBox.enabled;
  }
  set maxLength(val) {
    if (val == 0)
      val = -1;
    this._editBox.maxLength = val;
  }
  get maxLength() {
    return this._editBox.maxLength;
  }
  set promptText(val) {
    this._promptText = val;
    let newCreate = !this._editBox.placeholderLabel;
    this._editBox["_updatePlaceholderLabel"]();
    if (newCreate)
      this.assignFont(this._editBox.placeholderLabel, this._realFont);
    this._editBox.placeholderLabel.string = defaultParser.parse(this._promptText, true);
    if (defaultParser.lastColor) {
      let c = this._editBox.placeholderLabel.color;
      if (!c)
        c = new import_cc.Color();
      c.fromHEX(defaultParser.lastColor);
      this.assignFontColor(this._editBox.placeholderLabel, c);
    } else
      this.assignFontColor(this._editBox.placeholderLabel, this._color);
    if (defaultParser.lastSize)
      this._editBox.placeholderLabel.fontSize = parseInt(defaultParser.lastSize);
    else
      this._editBox.placeholderLabel.fontSize = this._fontSize;
  }
  get promptText() {
    return this._promptText;
  }
  set restrict(value) {
  }
  get restrict() {
    return "";
  }
  get password() {
    return this._editBox.inputFlag == import_cc.EditBox.InputFlag.PASSWORD;
  }
  set password(val) {
    this._editBox.inputFlag = val ? import_cc.EditBox.InputFlag.PASSWORD : import_cc.EditBox.InputFlag.DEFAULT;
  }
  get align() {
    return this._editBox.textLabel.horizontalAlign;
  }
  set align(value) {
    this._editBox.textLabel.horizontalAlign = value;
    if (this._editBox.placeholderLabel) {
      this._editBox.placeholderLabel.horizontalAlign = value;
    }
  }
  get verticalAlign() {
    return this._editBox.textLabel.verticalAlign;
  }
  set verticalAlign(value) {
    this._editBox.textLabel.verticalAlign = value;
    if (this._editBox.placeholderLabel) {
      this._editBox.placeholderLabel.verticalAlign = value;
    }
  }
  get singleLine() {
    return this._editBox.inputMode != import_cc.EditBox.InputMode.ANY;
  }
  set singleLine(value) {
    this._editBox.inputMode = value ? import_cc.EditBox.InputMode.SINGLE_LINE : import_cc.EditBox.InputMode.ANY;
  }
  requestFocus() {
    this._editBox.focus();
  }
  markSizeChanged() {
  }
  updateText() {
    var text2 = this._text;
    if (this._templateVars)
      text2 = this.parseTemplate(text2);
    if (this._ubbEnabled)
      text2 = defaultParser.parse(text2, true);
    this._editBox.string = text2;
  }
  updateFont() {
    this.assignFont(this._editBox.textLabel, this._realFont);
    if (this._editBox.placeholderLabel)
      this.assignFont(this._editBox.placeholderLabel, this._realFont);
  }
  updateFontColor() {
    this.assignFontColor(this._editBox.textLabel, this._color);
  }
  updateFontSize() {
    this._editBox.textLabel.fontSize = this._fontSize;
    this._editBox.textLabel.lineHeight = this._fontSize + this._leading;
    if (this._editBox.placeholderLabel)
      this._editBox.placeholderLabel.fontSize = this._editBox.textLabel.fontSize;
  }
  updateOverflow() {
  }
  onTextChanged() {
    this._text = this._editBox.string;
  }
  onTouchEnd1(evt) {
    this._editBox.openKeyboard();
    evt.propagationStopped = true;
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 4);
    var str = buffer.readS();
    if (str != null)
      this.promptText = str;
    else if (this._editBox.placeholderLabel)
      this._editBox.placeholderLabel.string = "";
    str = buffer.readS();
    if (str != null)
      this.restrict = str;
    var iv = buffer.readInt();
    if (iv != 0)
      this.maxLength = iv;
    iv = buffer.readInt();
    if (buffer.readBool())
      this.password = true;
    if (this._editBox.placeholderLabel) {
      let hAlign = this._editBox.textLabel.horizontalAlign;
      this._editBox.placeholderLabel.horizontalAlign = hAlign;
      let vAlign = this._editBox.textLabel.verticalAlign;
      this._editBox.placeholderLabel.verticalAlign = vAlign;
    }
  }
};
var MyEditBox = class extends import_cc.EditBox {
  _init() {
    super._init();
    this.placeholderLabel.getComponent(import_cc.UITransform).setAnchorPoint(0, 1);
    this.textLabel.getComponent(import_cc.UITransform).setAnchorPoint(0, 1);
    this.placeholderLabel.overflow = import_cc.Overflow.CLAMP;
    this.textLabel.overflow = import_cc.Overflow.CLAMP;
  }
  _registerEvent() {
  }
  openKeyboard() {
    let impl = this["_impl"];
    if (impl) {
      impl.beginEditing();
    }
  }
};
var Window = class extends GComponent {
  constructor() {
    super();
    this._requestingCmd = 0;
    this._uiSources = new Array();
    this.bringToFontOnClick = UIConfig.bringWindowToFrontOnClick;
    this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this, true);
  }
  addUISource(source) {
    this._uiSources.push(source);
  }
  set contentPane(val) {
    if (this._contentPane != val) {
      if (this._contentPane)
        this.removeChild(this._contentPane);
      this._contentPane = val;
      if (this._contentPane) {
        this.addChild(this._contentPane);
        this.setSize(this._contentPane.width, this._contentPane.height);
        this._contentPane.addRelation(this, RelationType.Size);
        this._frame = this._contentPane.getChild("frame");
        if (this._frame) {
          this.closeButton = this._frame.getChild("closeButton");
          this.dragArea = this._frame.getChild("dragArea");
          this.contentArea = this._frame.getChild("contentArea");
        }
      }
    }
  }
  get contentPane() {
    return this._contentPane;
  }
  get frame() {
    return this._frame;
  }
  get closeButton() {
    return this._closeButton;
  }
  set closeButton(value) {
    if (this._closeButton)
      this._closeButton.offClick(this.closeEventHandler, this);
    this._closeButton = value;
    if (this._closeButton)
      this._closeButton.onClick(this.closeEventHandler, this);
  }
  get dragArea() {
    return this._dragArea;
  }
  set dragArea(value) {
    if (this._dragArea != value) {
      if (this._dragArea) {
        this._dragArea.draggable = false;
        this._dragArea.off(Event.DRAG_START, this.onDragStart_1, this);
      }
      this._dragArea = value;
      if (this._dragArea) {
        this._dragArea.draggable = true;
        this._dragArea.on(Event.DRAG_START, this.onDragStart_1, this);
      }
    }
  }
  get contentArea() {
    return this._contentArea;
  }
  set contentArea(value) {
    this._contentArea = value;
  }
  show() {
    GRoot.inst.showWindow(this);
  }
  showOn(root) {
    root.showWindow(this);
  }
  hide() {
    if (this.isShowing)
      this.doHideAnimation();
  }
  hideImmediately() {
    var r = this.parent instanceof GRoot ? this.parent : null;
    if (!r)
      r = GRoot.inst;
    r.hideWindowImmediately(this);
  }
  centerOn(r, restraint) {
    this.setPosition(Math.round((r.width - this.width) / 2), Math.round((r.height - this.height) / 2));
    if (restraint) {
      this.addRelation(r, RelationType.Center_Center);
      this.addRelation(r, RelationType.Middle_Middle);
    }
  }
  toggleStatus() {
    if (this.isTop)
      this.hide();
    else
      this.show();
  }
  get isShowing() {
    return this.parent != null;
  }
  get isTop() {
    return this.parent && this.parent.getChildIndex(this) == this.parent.numChildren - 1;
  }
  get modal() {
    return this._modal;
  }
  set modal(val) {
    this._modal = val;
  }
  bringToFront() {
    GRoot.inst.bringToFront(this);
  }
  showModalWait(requestingCmd) {
    if (requestingCmd != null)
      this._requestingCmd = requestingCmd;
    if (UIConfig.windowModalWaiting) {
      if (!this._modalWaitPane)
        this._modalWaitPane = UIPackage.createObjectFromURL(UIConfig.windowModalWaiting);
      this.layoutModalWaitPane();
      this.addChild(this._modalWaitPane);
    }
  }
  layoutModalWaitPane() {
    if (this._contentArea) {
      var pt = this._frame.localToGlobal();
      pt = this.globalToLocal(pt.x, pt.y, pt);
      this._modalWaitPane.setPosition(pt.x + this._contentArea.x, pt.y + this._contentArea.y);
      this._modalWaitPane.setSize(this._contentArea.width, this._contentArea.height);
    } else
      this._modalWaitPane.setSize(this.width, this.height);
  }
  closeModalWait(requestingCmd) {
    if (requestingCmd != null) {
      if (this._requestingCmd != requestingCmd)
        return false;
    }
    this._requestingCmd = 0;
    if (this._modalWaitPane && this._modalWaitPane.parent)
      this.removeChild(this._modalWaitPane);
    return true;
  }
  get modalWaiting() {
    return this._modalWaitPane && this._modalWaitPane.parent != null;
  }
  init() {
    if (this._inited || this._loading)
      return;
    if (this._uiSources.length > 0) {
      this._loading = false;
      var cnt = this._uiSources.length;
      for (var i = 0; i < cnt; i++) {
        var lib = this._uiSources[i];
        if (!lib.loaded) {
          lib.load(this.__uiLoadComplete, this);
          this._loading = true;
        }
      }
      if (!this._loading)
        this._init();
    } else
      this._init();
  }
  onInit() {
  }
  onShown() {
  }
  onHide() {
  }
  doShowAnimation() {
    this.onShown();
  }
  doHideAnimation() {
    this.hideImmediately();
  }
  __uiLoadComplete() {
    var cnt = this._uiSources.length;
    for (var i = 0; i < cnt; i++) {
      var lib = this._uiSources[i];
      if (!lib.loaded)
        return;
    }
    this._loading = false;
    this._init();
  }
  _init() {
    this._inited = true;
    this.onInit();
    if (this.isShowing)
      this.doShowAnimation();
  }
  dispose() {
    if (this.parent)
      this.hideImmediately();
    super.dispose();
  }
  closeEventHandler(evt) {
    this.hide();
  }
  onEnable() {
    super.onEnable();
    if (!this._inited)
      this.init();
    else
      this.doShowAnimation();
  }
  onDisable() {
    super.onDisable();
    this.closeModalWait();
    this.onHide();
  }
  onTouchBegin_1(evt) {
    if (this.isShowing && this.bringToFontOnClick)
      this.bringToFront();
  }
  onDragStart_1(evt) {
    var original = GObject.cast(evt.currentTarget);
    original.stopDrag();
    this.startDrag(evt.touchId);
  }
};
var GButton = class _GButton extends GComponent {
  constructor() {
    super();
    this._node.name = "GButton";
    this._mode = ButtonMode.Common;
    this._title = "";
    this._icon = "";
    this._sound = UIConfig.buttonSound;
    this._soundVolumeScale = UIConfig.buttonSoundVolumeScale;
    this._changeStateOnClick = true;
    this._downEffect = 0;
    this._downEffectValue = 0.8;
  }
  get icon() {
    return this._icon;
  }
  set icon(value) {
    this._icon = value;
    value = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
    if (this._iconObject)
      this._iconObject.icon = value;
    this.updateGear(7);
  }
  get selectedIcon() {
    return this._selectedIcon;
  }
  set selectedIcon(value) {
    this._selectedIcon = value;
    value = this._selected && this._selectedIcon ? this._selectedIcon : this._icon;
    if (this._iconObject)
      this._iconObject.icon = value;
  }
  get title() {
    return this._title;
  }
  set title(value) {
    this._title = value;
    if (this._titleObject)
      this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title;
    this.updateGear(6);
  }
  get text() {
    return this.title;
  }
  set text(value) {
    this.title = value;
  }
  get selectedTitle() {
    return this._selectedTitle;
  }
  set selectedTitle(value) {
    this._selectedTitle = value;
    if (this._titleObject)
      this._titleObject.text = this._selected && this._selectedTitle ? this._selectedTitle : this._title;
  }
  get titleColor() {
    var tf = this.getTextField();
    if (tf)
      return tf.color;
    else
      return import_cc.Color.BLACK;
  }
  set titleColor(value) {
    var tf = this.getTextField();
    if (tf)
      tf.color = value;
  }
  get titleFontSize() {
    var tf = this.getTextField();
    if (tf)
      return tf.fontSize;
    else
      return 0;
  }
  set titleFontSize(value) {
    var tf = this.getTextField();
    if (tf)
      tf.fontSize = value;
  }
  get sound() {
    return this._sound;
  }
  set sound(val) {
    this._sound = val;
  }
  get soundVolumeScale() {
    return this._soundVolumeScale;
  }
  set soundVolumeScale(value) {
    this._soundVolumeScale = value;
  }
  set selected(val) {
    if (this._mode == ButtonMode.Common)
      return;
    if (this._selected != val) {
      this._selected = val;
      this.setCurrentState();
      if (this._selectedTitle && this._titleObject)
        this._titleObject.text = this._selected ? this._selectedTitle : this._title;
      if (this._selectedIcon) {
        var str = this._selected ? this._selectedIcon : this._icon;
        if (this._iconObject)
          this._iconObject.icon = str;
      }
      if (this._relatedController && this._parent && !this._parent._buildingDisplayList) {
        if (this._selected) {
          this._relatedController.selectedPageId = this._relatedPageId;
          if (this._relatedController.autoRadioGroupDepth)
            this._parent.adjustRadioGroupDepth(this, this._relatedController);
        } else if (this._mode == ButtonMode.Check && this._relatedController.selectedPageId == this._relatedPageId)
          this._relatedController.oppositePageId = this._relatedPageId;
      }
    }
  }
  get selected() {
    return this._selected;
  }
  get mode() {
    return this._mode;
  }
  set mode(value) {
    if (this._mode != value) {
      if (value == ButtonMode.Common)
        this.selected = false;
      this._mode = value;
    }
  }
  get relatedController() {
    return this._relatedController;
  }
  set relatedController(val) {
    this._relatedController = val;
  }
  get relatedPageId() {
    return this._relatedPageId;
  }
  set relatedPageId(val) {
    this._relatedPageId = val;
  }
  get changeStateOnClick() {
    return this._changeStateOnClick;
  }
  set changeStateOnClick(value) {
    this._changeStateOnClick = value;
  }
  get linkedPopup() {
    return this._linkedPopup;
  }
  set linkedPopup(value) {
    this._linkedPopup = value;
  }
  getTextField() {
    if (this._titleObject instanceof GTextField)
      return this._titleObject;
    else if ("getTextField" in this._titleObject)
      return this._titleObject.getTextField();
    else
      return null;
  }
  fireClick() {
    GRoot.inst.inputProcessor.simulateClick(this);
  }
  setState(val) {
    if (this._buttonController)
      this._buttonController.selectedPage = val;
    if (this._downEffect == 1) {
      var cnt = this.numChildren;
      if (val == _GButton.DOWN || val == _GButton.SELECTED_OVER || val == _GButton.SELECTED_DISABLED) {
        if (!this._downColor)
          this._downColor = new import_cc.Color();
        var r = this._downEffectValue * 255;
        this._downColor.r = this._downColor.g = this._downColor.b = r;
        for (var i = 0; i < cnt; i++) {
          var obj = this.getChildAt(i);
          if (!(obj instanceof GTextField))
            obj.setProp(ObjectPropID.Color, this._downColor);
        }
      } else {
        for (var i = 0; i < cnt; i++) {
          var obj = this.getChildAt(i);
          if (!(obj instanceof GTextField))
            obj.setProp(ObjectPropID.Color, import_cc.Color.WHITE);
        }
      }
    } else if (this._downEffect == 2) {
      if (val == _GButton.DOWN || val == _GButton.SELECTED_OVER || val == _GButton.SELECTED_DISABLED) {
        if (!this._downScaled) {
          this._downScaled = true;
          this.setScale(this.scaleX * this._downEffectValue, this.scaleY * this._downEffectValue);
        }
      } else {
        if (this._downScaled) {
          this._downScaled = false;
          this.setScale(this.scaleX / this._downEffectValue, this.scaleY / this._downEffectValue);
        }
      }
    }
  }
  setCurrentState() {
    if (this.grayed && this._buttonController && this._buttonController.hasPage(_GButton.DISABLED)) {
      if (this._selected)
        this.setState(_GButton.SELECTED_DISABLED);
      else
        this.setState(_GButton.DISABLED);
    } else {
      if (this._selected)
        this.setState(this._over ? _GButton.SELECTED_OVER : _GButton.DOWN);
      else
        this.setState(this._over ? _GButton.OVER : _GButton.UP);
    }
  }
  handleControllerChanged(c) {
    super.handleControllerChanged(c);
    if (this._relatedController == c)
      this.selected = this._relatedPageId == c.selectedPageId;
  }
  handleGrayedChanged() {
    if (this._buttonController && this._buttonController.hasPage(_GButton.DISABLED)) {
      if (this.grayed) {
        if (this._selected && this._buttonController.hasPage(_GButton.SELECTED_DISABLED))
          this.setState(_GButton.SELECTED_DISABLED);
        else
          this.setState(_GButton.DISABLED);
      } else if (this._selected)
        this.setState(_GButton.DOWN);
      else
        this.setState(_GButton.UP);
    } else
      super.handleGrayedChanged();
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.titleColor;
      case ObjectPropID.OutlineColor: {
        var tf = this.getTextField();
        if (tf)
          return tf.strokeColor;
        else
          return 0;
      }
      case ObjectPropID.FontSize:
        return this.titleFontSize;
      case ObjectPropID.Selected:
        return this.selected;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.titleColor = value;
        break;
      case ObjectPropID.OutlineColor:
        {
          var tf = this.getTextField();
          if (tf)
            tf.strokeColor = value;
        }
        break;
      case ObjectPropID.FontSize:
        this.titleFontSize = value;
        break;
      case ObjectPropID.Selected:
        this.selected = value;
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  constructExtension(buffer) {
    buffer.seek(0, 6);
    this._mode = buffer.readByte();
    var str = buffer.readS();
    if (str)
      this._sound = str;
    this._soundVolumeScale = buffer.readFloat();
    this._downEffect = buffer.readByte();
    this._downEffectValue = buffer.readFloat();
    if (this._downEffect == 2)
      this.setPivot(0.5, 0.5, this.pivotAsAnchor);
    this._buttonController = this.getController("button");
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
    if (this._titleObject)
      this._title = this._titleObject.text;
    if (this._iconObject)
      this._icon = this._iconObject.icon;
    if (this._mode == ButtonMode.Common)
      this.setState(_GButton.UP);
    this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
    this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);
    this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);
    this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);
    this._node.on(Event.CLICK, this.onClick_1, this);
  }
  constructExtensionFromXML(attrs, items) {
    this._buttonController = this.getController("button");
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
    if (this._titleObject)
      this._title = this._titleObject.text || "";
    if (this._iconObject)
      this._icon = this._iconObject.icon || "";
    this.mode = XMLPackageBuilder.parseButtonMode(attrs === null || attrs === void 0 ? void 0 : attrs.mode);
    if (attrs === null || attrs === void 0 ? void 0 : attrs.sound)
      this._sound = attrs.sound;
    if (attrs === null || attrs === void 0 ? void 0 : attrs.downEffect) {
      if (attrs.downEffect === "dark")
        this._downEffect = 1;
      else if (attrs.downEffect === "scale")
        this._downEffect = 2;
    }
    if (attrs === null || attrs === void 0 ? void 0 : attrs.downEffectValue)
      this._downEffectValue = XMLPackageBuilder.readNumber(attrs.downEffectValue, this._downEffectValue);
    if (this._downEffect == 2)
      this.setPivot(0.5, 0.5, this.pivotAsAnchor);
    if (this._mode == ButtonMode.Common)
      this.setState(_GButton.UP);
    this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
    this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);
    this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);
    this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);
    this._node.on(Event.CLICK, this.onClick_1, this);
  }
  applyExtensionFromXML(attrs, items) {
    var _a;
    if (!attrs)
      return;
    if (attrs.title != null)
      this.title = attrs.title;
    if (attrs.selectedTitle != null)
      this.selectedTitle = attrs.selectedTitle;
    if (attrs.icon != null)
      this.icon = attrs.icon;
    if (attrs.selectedIcon != null)
      this.selectedIcon = attrs.selectedIcon;
    if (attrs.titleColor)
      this.titleColor = XMLPackageBuilder.parseColor(attrs.titleColor);
    if (attrs.titleFontSize)
      this.titleFontSize = XMLPackageBuilder.readNumber(attrs.titleFontSize, this.titleFontSize);
    if (attrs.controller && this.parent) {
      const controller = this.parent.getController(attrs.controller);
      if (controller) {
        this.relatedController = controller;
        if (attrs.page != null) {
          const pageId = this.resolveXMLRelatedPageId(controller, attrs.page);
          if (pageId != null)
            this.relatedPageId = pageId;
        }
      }
    }
    const selectedValue = (_a = attrs.checked) !== null && _a !== void 0 ? _a : attrs.selected;
    if (selectedValue != null)
      this.selected = XMLPackageBuilder.readBool(selectedValue, false);
  }
  resolveXMLRelatedPageId(controller, rawPage) {
    if (!rawPage)
      return null;
    if (controller.getPageIndexById(rawPage) >= 0)
      return rawPage;
    const pageIdByName = controller.getPageIdByName(rawPage);
    if (pageIdByName != null)
      return pageIdByName;
    const numericIndex = Number.parseInt(rawPage, 10);
    if (!Number.isNaN(numericIndex) && numericIndex >= 0 && numericIndex < controller.pageCount)
      return controller.getPageId(numericIndex);
    return null;
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!buffer.seek(beginPos, 6))
      return;
    if (buffer.readByte() != this.packageItem.objectType)
      return;
    var str;
    var iv;
    str = buffer.readS();
    if (str != null)
      this.title = str;
    str = buffer.readS();
    if (str != null)
      this.selectedTitle = str;
    str = buffer.readS();
    if (str != null)
      this.icon = str;
    str = buffer.readS();
    if (str != null)
      this.selectedIcon = str;
    if (buffer.readBool())
      this.titleColor = buffer.readColor();
    iv = buffer.readInt();
    if (iv != 0)
      this.titleFontSize = iv;
    iv = buffer.readShort();
    if (iv >= 0)
      this._relatedController = this.parent.getControllerAt(iv);
    this._relatedPageId = buffer.readS();
    str = buffer.readS();
    if (str != null)
      this._sound = str;
    if (buffer.readBool())
      this._soundVolumeScale = buffer.readFloat();
    this.selected = buffer.readBool();
  }
  onRollOver_1() {
    if (!this._buttonController || !this._buttonController.hasPage(_GButton.OVER))
      return;
    this._over = true;
    if (this._down)
      return;
    if (this.grayed && this._buttonController.hasPage(_GButton.DISABLED))
      return;
    this.setState(this._selected ? _GButton.SELECTED_OVER : _GButton.OVER);
  }
  onRollOut_1() {
    if (!this._buttonController || !this._buttonController.hasPage(_GButton.OVER))
      return;
    this._over = false;
    if (this._down)
      return;
    if (this.grayed && this._buttonController.hasPage(_GButton.DISABLED))
      return;
    this.setState(this._selected ? _GButton.DOWN : _GButton.UP);
  }
  onTouchBegin_1(evt) {
    if (evt.button != import_cc.EventMouse.BUTTON_LEFT)
      return;
    this._down = true;
    evt.captureTouch();
    if (this._mode == ButtonMode.Common) {
      if (this.grayed && this._buttonController && this._buttonController.hasPage(_GButton.DISABLED))
        this.setState(_GButton.SELECTED_DISABLED);
      else
        this.setState(_GButton.DOWN);
    }
    if (this._linkedPopup) {
      if (this._linkedPopup instanceof Window)
        this._linkedPopup.toggleStatus();
      else
        GRoot.inst.togglePopup(this._linkedPopup, this);
    }
  }
  onTouchEnd_1(evt) {
    if (evt.button != import_cc.EventMouse.BUTTON_LEFT)
      return;
    if (this._down) {
      this._down = false;
      if (this._node == null)
        return;
      if (this._mode == ButtonMode.Common) {
        if (this.grayed && this._buttonController && this._buttonController.hasPage(_GButton.DISABLED))
          this.setState(_GButton.DISABLED);
        else if (this._over)
          this.setState(_GButton.OVER);
        else
          this.setState(_GButton.UP);
      } else {
        if (!this._over && this._buttonController != null && (this._buttonController.selectedPage == _GButton.OVER || this._buttonController.selectedPage == _GButton.SELECTED_OVER)) {
          this.setCurrentState();
        }
      }
    }
  }
  onClick_1() {
    if (this._sound) {
      var pi = UIPackage.getItemByURL(this._sound);
      if (pi) {
        var sound = pi.owner.getItemAsset(pi);
        if (sound)
          GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
      }
    }
    if (this._mode == ButtonMode.Check) {
      if (this._changeStateOnClick) {
        this.selected = !this._selected;
        this._node.emit(Event.STATUS_CHANGED, this);
      }
    } else if (this._mode == ButtonMode.Radio) {
      if (this._changeStateOnClick && !this._selected) {
        this.selected = true;
        this._node.emit(Event.STATUS_CHANGED, this);
      }
    } else {
      if (this._relatedController)
        this._relatedController.selectedPageId = this._relatedPageId;
    }
  }
};
GButton.UP = "up";
GButton.DOWN = "down";
GButton.OVER = "over";
GButton.SELECTED_OVER = "selectedOver";
GButton.DISABLED = "disabled";
GButton.SELECTED_DISABLED = "selectedDisabled";
var GObjectPool = class {
  constructor() {
    this._count = 0;
    this._pool = {};
  }
  clear() {
    for (var i1 in this._pool) {
      var arr = this._pool[i1];
      var cnt = arr.length;
      for (var i = 0; i < cnt; i++)
        arr[i].dispose();
    }
    this._pool = {};
    this._count = 0;
  }
  get count() {
    return this._count;
  }
  getObject(url) {
    url = UIPackage.normalizeURL(url);
    if (url == null)
      return null;
    var arr = this._pool[url];
    if (arr && arr.length) {
      this._count--;
      return arr.shift();
    }
    var child = UIPackage.createObjectFromURL(url);
    return child;
  }
  returnObject(obj) {
    var url = obj.resourceURL;
    if (!url)
      return;
    var arr = this._pool[url];
    if (arr == null) {
      arr = new Array();
      this._pool[url] = arr;
    }
    this._count++;
    arr.push(obj);
  }
};
var GList = class extends GComponent {
  constructor() {
    super();
    this.scrollItemToViewOnClick = true;
    this.foldInvisibleItems = false;
    this._lineCount = 0;
    this._columnCount = 0;
    this._lineGap = 0;
    this._columnGap = 0;
    this._lastSelectedIndex = 0;
    this._numItems = 0;
    this._realNumItems = 0;
    this._firstIndex = 0;
    this._curLineItemCount = 0;
    this._curLineItemCount2 = 0;
    this._virtualListChanged = 0;
    this.itemInfoVer = 0;
    this._node.name = "GList";
    this._trackBounds = true;
    this._pool = new GObjectPool();
    this._layout = ListLayoutType.SingleColumn;
    this._autoResizeItem = true;
    this._lastSelectedIndex = -1;
    this._selectionMode = ListSelectionMode.Single;
    this.opaque = true;
    this._align = AlignType.Left;
    this._verticalAlign = VertAlignType.Top;
  }
  dispose() {
    this._partner.unschedule(this._refreshVirtualList);
    this._pool.clear();
    super.dispose();
  }
  get layout() {
    return this._layout;
  }
  set layout(value) {
    if (this._layout != value) {
      this._layout = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get lineCount() {
    return this._lineCount;
  }
  set lineCount(value) {
    if (this._lineCount != value) {
      this._lineCount = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get columnCount() {
    return this._columnCount;
  }
  set columnCount(value) {
    if (this._columnCount != value) {
      this._columnCount = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get lineGap() {
    return this._lineGap;
  }
  set lineGap(value) {
    if (this._lineGap != value) {
      this._lineGap = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get columnGap() {
    return this._columnGap;
  }
  set columnGap(value) {
    if (this._columnGap != value) {
      this._columnGap = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get align() {
    return this._align;
  }
  set align(value) {
    if (this._align != value) {
      this._align = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get verticalAlign() {
    return this._verticalAlign;
  }
  set verticalAlign(value) {
    if (this._verticalAlign != value) {
      this._verticalAlign = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get virtualItemSize() {
    return this._itemSize;
  }
  set virtualItemSize(value) {
    if (this._virtual) {
      if (this._itemSize == null)
        this._itemSize = new import_cc.Size(0, 0);
      this._itemSize.width = value.width;
      this._itemSize.height = value.height;
      this.setVirtualListChangedFlag(true);
    }
  }
  get defaultItem() {
    return this._defaultItem;
  }
  set defaultItem(val) {
    this._defaultItem = UIPackage.normalizeURL(val);
  }
  get autoResizeItem() {
    return this._autoResizeItem;
  }
  set autoResizeItem(value) {
    if (this._autoResizeItem != value) {
      this._autoResizeItem = value;
      this.setBoundsChangedFlag();
      if (this._virtual)
        this.setVirtualListChangedFlag(true);
    }
  }
  get selectionMode() {
    return this._selectionMode;
  }
  set selectionMode(value) {
    this._selectionMode = value;
  }
  get selectionController() {
    return this._selectionController;
  }
  set selectionController(value) {
    this._selectionController = value;
  }
  get itemPool() {
    return this._pool;
  }
  getFromPool(url) {
    if (!url)
      url = this._defaultItem;
    var obj = this._pool.getObject(url);
    if (obj)
      obj.visible = true;
    return obj;
  }
  returnToPool(obj) {
    this._pool.returnObject(obj);
  }
  addChildAt(child, index) {
    super.addChildAt(child, index);
    if (child instanceof GButton) {
      child.selected = false;
      child.changeStateOnClick = false;
    }
    child.on(Event.CLICK, this.onClickItem, this);
    return child;
  }
  addItem(url) {
    if (!url)
      url = this._defaultItem;
    return this.addChild(UIPackage.createObjectFromURL(url));
  }
  addItemFromPool(url) {
    return this.addChild(this.getFromPool(url));
  }
  removeChildAt(index, dispose) {
    var child = super.removeChildAt(index, dispose);
    if (!dispose)
      child.off(Event.CLICK, this.onClickItem, this);
    return child;
  }
  removeChildToPoolAt(index) {
    var child = super.removeChildAt(index);
    this.returnToPool(child);
  }
  removeChildToPool(child) {
    super.removeChild(child);
    this.returnToPool(child);
  }
  removeChildrenToPool(beginIndex, endIndex) {
    if (beginIndex == void 0)
      beginIndex = 0;
    if (endIndex == void 0)
      endIndex = -1;
    if (endIndex < 0 || endIndex >= this._children.length)
      endIndex = this._children.length - 1;
    for (var i = beginIndex; i <= endIndex; ++i)
      this.removeChildToPoolAt(beginIndex);
  }
  get selectedIndex() {
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj instanceof GButton && ii.obj.selected || !ii.obj && ii.selected) {
          if (this._loop)
            return i % this._numItems;
          else
            return i;
        }
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton && obj.selected)
          return i;
      }
    }
    return -1;
  }
  set selectedIndex(value) {
    if (value >= 0 && value < this.numItems) {
      if (this._selectionMode != ListSelectionMode.Single)
        this.clearSelection();
      this.addSelection(value);
    } else
      this.clearSelection();
  }
  getSelection(result) {
    if (!result)
      result = new Array();
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj instanceof GButton && ii.obj.selected || !ii.obj && ii.selected) {
          var j = i;
          if (this._loop) {
            j = i % this._numItems;
            if (result.indexOf(j) != -1)
              continue;
          }
          result.push(j);
        }
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton && obj.selected)
          result.push(i);
      }
    }
    return result;
  }
  addSelection(index, scrollItToView) {
    if (this._selectionMode == ListSelectionMode.None)
      return;
    this.checkVirtualList();
    if (this._selectionMode == ListSelectionMode.Single)
      this.clearSelection();
    if (scrollItToView)
      this.scrollToView(index);
    this._lastSelectedIndex = index;
    var obj;
    if (this._virtual) {
      var ii = this._virtualItems[index];
      if (ii.obj)
        obj = ii.obj;
      ii.selected = true;
    } else
      obj = this.getChildAt(index);
    if (obj instanceof GButton && !obj.selected) {
      obj.selected = true;
      this.updateSelectionController(index);
    }
  }
  removeSelection(index) {
    if (this._selectionMode == ListSelectionMode.None)
      return;
    var obj;
    if (this._virtual) {
      var ii = this._virtualItems[index];
      if (ii.obj)
        obj = ii.obj;
      ii.selected = false;
    } else
      obj = this.getChildAt(index);
    if (obj instanceof GButton)
      obj.selected = false;
  }
  clearSelection() {
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj instanceof GButton)
          ii.obj.selected = false;
        ii.selected = false;
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton)
          obj.selected = false;
      }
    }
  }
  clearSelectionExcept(g) {
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj != g) {
          if (ii.obj instanceof GButton)
            ii.obj.selected = false;
          ii.selected = false;
        }
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton && obj != g)
          obj.selected = false;
      }
    }
  }
  selectAll() {
    this.checkVirtualList();
    var last = -1;
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj instanceof GButton && !ii.obj.selected) {
          ii.obj.selected = true;
          last = i;
        }
        ii.selected = true;
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton && !obj.selected) {
          obj.selected = true;
          last = i;
        }
      }
    }
    if (last != -1)
      this.updateSelectionController(last);
  }
  selectNone() {
    this.clearSelection();
  }
  selectReverse() {
    this.checkVirtualList();
    var last = -1;
    var i;
    if (this._virtual) {
      for (i = 0; i < this._realNumItems; i++) {
        var ii = this._virtualItems[i];
        if (ii.obj instanceof GButton) {
          ii.obj.selected = !ii.obj.selected;
          if (ii.obj.selected)
            last = i;
        }
        ii.selected = !ii.selected;
      }
    } else {
      var cnt = this._children.length;
      for (i = 0; i < cnt; i++) {
        var obj = this._children[i];
        if (obj instanceof GButton) {
          obj.selected = !obj.selected;
          if (obj.selected)
            last = i;
        }
      }
    }
    if (last != -1)
      this.updateSelectionController(last);
  }
  handleArrowKey(dir) {
    var index = this.selectedIndex;
    if (index == -1)
      return;
    switch (dir) {
      case 1:
        if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
          index--;
          if (index >= 0) {
            this.clearSelection();
            this.addSelection(index, true);
          }
        } else if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
          var current = this._children[index];
          var k = 0;
          for (var i = index - 1; i >= 0; i--) {
            var obj = this._children[i];
            if (obj.y != current.y) {
              current = obj;
              break;
            }
            k++;
          }
          for (; i >= 0; i--) {
            obj = this._children[i];
            if (obj.y != current.y) {
              this.clearSelection();
              this.addSelection(i + k + 1, true);
              break;
            }
          }
        }
        break;
      case 3:
        if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
          index++;
          if (index < this._children.length) {
            this.clearSelection();
            this.addSelection(index, true);
          }
        } else if (this._layout == ListLayoutType.FlowVertical) {
          current = this._children[index];
          k = 0;
          var cnt = this._children.length;
          for (i = index + 1; i < cnt; i++) {
            obj = this._children[i];
            if (obj.x != current.x) {
              current = obj;
              break;
            }
            k++;
          }
          for (; i < cnt; i++) {
            obj = this._children[i];
            if (obj.x != current.x) {
              this.clearSelection();
              this.addSelection(i - k - 1, true);
              break;
            }
          }
        }
        break;
      case 5:
        if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowVertical) {
          index++;
          if (index < this._children.length) {
            this.clearSelection();
            this.addSelection(index, true);
          }
        } else if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
          current = this._children[index];
          k = 0;
          cnt = this._children.length;
          for (i = index + 1; i < cnt; i++) {
            obj = this._children[i];
            if (obj.y != current.y) {
              current = obj;
              break;
            }
            k++;
          }
          for (; i < cnt; i++) {
            obj = this._children[i];
            if (obj.y != current.y) {
              this.clearSelection();
              this.addSelection(i - k - 1, true);
              break;
            }
          }
        }
        break;
      case 7:
        if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.Pagination) {
          index--;
          if (index >= 0) {
            this.clearSelection();
            this.addSelection(index, true);
          }
        } else if (this._layout == ListLayoutType.FlowVertical) {
          current = this._children[index];
          k = 0;
          for (i = index - 1; i >= 0; i--) {
            obj = this._children[i];
            if (obj.x != current.x) {
              current = obj;
              break;
            }
            k++;
          }
          for (; i >= 0; i--) {
            obj = this._children[i];
            if (obj.x != current.x) {
              this.clearSelection();
              this.addSelection(i + k + 1, true);
              break;
            }
          }
        }
        break;
    }
  }
  onClickItem(evt) {
    if (this._scrollPane && this._scrollPane.isDragged)
      return;
    var item = GObject.cast(evt.currentTarget);
    this.setSelectionOnEvent(item, evt);
    if (this._scrollPane && this.scrollItemToViewOnClick)
      this._scrollPane.scrollToView(item, true);
    this.dispatchItemEvent(item, evt);
  }
  dispatchItemEvent(item, evt) {
    this._node.emit(Event.CLICK_ITEM, item, evt);
  }
  setSelectionOnEvent(item, evt) {
    if (!(item instanceof GButton) || this._selectionMode == ListSelectionMode.None)
      return;
    var dontChangeLastIndex = false;
    var index = this.childIndexToItemIndex(this.getChildIndex(item));
    if (this._selectionMode == ListSelectionMode.Single) {
      if (!item.selected) {
        this.clearSelectionExcept(item);
        item.selected = true;
      }
    } else {
      if (evt.isShiftDown) {
        if (!item.selected) {
          if (this._lastSelectedIndex != -1) {
            var min = Math.min(this._lastSelectedIndex, index);
            var max = Math.max(this._lastSelectedIndex, index);
            max = Math.min(max, this.numItems - 1);
            var i;
            if (this._virtual) {
              for (i = min; i <= max; i++) {
                var ii = this._virtualItems[i];
                if (ii.obj instanceof GButton)
                  ii.obj.selected = true;
                ii.selected = true;
              }
            } else {
              for (i = min; i <= max; i++) {
                var obj = this.getChildAt(i);
                if (obj instanceof GButton)
                  obj.selected = true;
              }
            }
            dontChangeLastIndex = true;
          } else {
            item.selected = true;
          }
        }
      } else if (evt.isCtrlDown || this._selectionMode == ListSelectionMode.Multiple_SingleClick) {
        item.selected = !item.selected;
      } else {
        if (!item.selected) {
          this.clearSelectionExcept(item);
          item.selected = true;
        } else
          this.clearSelectionExcept(item);
      }
    }
    if (!dontChangeLastIndex)
      this._lastSelectedIndex = index;
    if (item.selected)
      this.updateSelectionController(index);
  }
  resizeToFit(itemCount = Number.POSITIVE_INFINITY, minSize = 0) {
    this.ensureBoundsCorrect();
    var curCount = this.numItems;
    if (itemCount > curCount)
      itemCount = curCount;
    if (this._virtual) {
      var lineCount = Math.ceil(itemCount / this._curLineItemCount);
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
        this.viewHeight = lineCount * this._itemSize.height + Math.max(0, lineCount - 1) * this._lineGap;
      else
        this.viewWidth = lineCount * this._itemSize.width + Math.max(0, lineCount - 1) * this._columnGap;
    } else if (itemCount == 0) {
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
        this.viewHeight = minSize;
      else
        this.viewWidth = minSize;
    } else {
      var i = itemCount - 1;
      var obj = null;
      while (i >= 0) {
        obj = this.getChildAt(i);
        if (!this.foldInvisibleItems || obj.visible)
          break;
        i--;
      }
      if (i < 0) {
        if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal)
          this.viewHeight = minSize;
        else
          this.viewWidth = minSize;
      } else {
        var size = 0;
        if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
          size = obj.y + obj.height;
          if (size < minSize)
            size = minSize;
          this.viewHeight = size;
        } else {
          size = obj.x + obj.width;
          if (size < minSize)
            size = minSize;
          this.viewWidth = size;
        }
      }
    }
  }
  getMaxItemWidth() {
    var cnt = this._children.length;
    var max = 0;
    for (var i = 0; i < cnt; i++) {
      var child = this.getChildAt(i);
      if (child.width > max)
        max = child.width;
    }
    return max;
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    this.setBoundsChangedFlag();
    if (this._virtual)
      this.setVirtualListChangedFlag(true);
  }
  handleControllerChanged(c) {
    super.handleControllerChanged(c);
    if (this._selectionController == c)
      this.selectedIndex = c.selectedIndex;
  }
  updateSelectionController(index) {
    if (this._selectionController && !this._selectionController.changing && index < this._selectionController.pageCount) {
      var c = this._selectionController;
      this._selectionController = null;
      c.selectedIndex = index;
      this._selectionController = c;
    }
  }
  getSnappingPosition(xValue, yValue, resultPoint) {
    if (this._virtual) {
      resultPoint = resultPoint || new import_cc.Vec2();
      var saved;
      var index;
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
        saved = yValue;
        s_n = yValue;
        index = this.getIndexOnPos1(false);
        yValue = s_n;
        if (index < this._virtualItems.length && saved - yValue > this._virtualItems[index].height / 2 && index < this._realNumItems)
          yValue += this._virtualItems[index].height + this._lineGap;
      } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
        saved = xValue;
        s_n = xValue;
        index = this.getIndexOnPos2(false);
        xValue = s_n;
        if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
          xValue += this._virtualItems[index].width + this._columnGap;
      } else {
        saved = xValue;
        s_n = xValue;
        index = this.getIndexOnPos3(false);
        xValue = s_n;
        if (index < this._virtualItems.length && saved - xValue > this._virtualItems[index].width / 2 && index < this._realNumItems)
          xValue += this._virtualItems[index].width + this._columnGap;
      }
      resultPoint.x = xValue;
      resultPoint.y = yValue;
      return resultPoint;
    } else {
      return super.getSnappingPosition(xValue, yValue, resultPoint);
    }
  }
  scrollToView(index, ani, setFirst) {
    if (this._virtual) {
      if (this._numItems == 0)
        return;
      this.checkVirtualList();
      if (index >= this._virtualItems.length)
        throw new Error("Invalid child index: " + index + ">" + this._virtualItems.length);
      if (this._loop)
        index = Math.floor(this._firstIndex / this._numItems) * this._numItems + index;
      var rect;
      var ii = this._virtualItems[index];
      var pos = 0;
      var i;
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
        for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount)
          pos += this._virtualItems[i].height + this._lineGap;
        rect = new import_cc.Rect(0, pos, this._itemSize.width, ii.height);
      } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
        for (i = this._curLineItemCount - 1; i < index; i += this._curLineItemCount)
          pos += this._virtualItems[i].width + this._columnGap;
        rect = new import_cc.Rect(pos, 0, ii.width, this._itemSize.height);
      } else {
        var page = index / (this._curLineItemCount * this._curLineItemCount2);
        rect = new import_cc.Rect(page * this.viewWidth + index % this._curLineItemCount * (ii.width + this._columnGap), index / this._curLineItemCount % this._curLineItemCount2 * (ii.height + this._lineGap), ii.width, ii.height);
      }
      if (this._scrollPane)
        this._scrollPane.scrollToView(rect, ani, setFirst);
    } else {
      var obj = this.getChildAt(index);
      if (obj) {
        if (this._scrollPane)
          this._scrollPane.scrollToView(obj, ani, setFirst);
        else if (this.parent && this.parent.scrollPane)
          this.parent.scrollPane.scrollToView(obj, ani, setFirst);
      }
    }
  }
  getFirstChildInView() {
    return this.childIndexToItemIndex(super.getFirstChildInView());
  }
  childIndexToItemIndex(index) {
    if (!this._virtual)
      return index;
    if (this._layout == ListLayoutType.Pagination) {
      for (var i = this._firstIndex; i < this._realNumItems; i++) {
        if (this._virtualItems[i].obj) {
          index--;
          if (index < 0)
            return i;
        }
      }
      return index;
    } else {
      index += this._firstIndex;
      if (this._loop && this._numItems > 0)
        index = index % this._numItems;
      return index;
    }
  }
  itemIndexToChildIndex(index) {
    if (!this._virtual)
      return index;
    if (this._layout == ListLayoutType.Pagination) {
      return this.getChildIndex(this._virtualItems[index].obj);
    } else {
      if (this._loop && this._numItems > 0) {
        var j = this._firstIndex % this._numItems;
        if (index >= j)
          index = index - j;
        else
          index = this._numItems - j + index;
      } else
        index -= this._firstIndex;
      return index;
    }
  }
  setVirtual() {
    this._setVirtual(false);
  }
  /// <summary>
  /// Set the list to be virtual list, and has loop behavior.
  /// </summary>
  setVirtualAndLoop() {
    this._setVirtual(true);
  }
  /// <summary>
  /// Set the list to be virtual list.
  /// </summary>
  _setVirtual(loop) {
    if (!this._virtual) {
      if (!this._scrollPane)
        throw new Error("Virtual list must be scrollable!");
      if (loop) {
        if (this._layout == ListLayoutType.FlowHorizontal || this._layout == ListLayoutType.FlowVertical)
          throw new Error("Loop list is not supported for FlowHorizontal or FlowVertical layout!");
        this._scrollPane.bouncebackEffect = false;
      }
      this._virtual = true;
      this._loop = loop;
      this._virtualItems = new Array();
      this.removeChildrenToPool();
      if (this._itemSize == null) {
        this._itemSize = new import_cc.Size(0, 0);
        var obj = this.getFromPool(null);
        if (!obj) {
          throw new Error("Virtual List must have a default list item resource.");
        } else {
          this._itemSize.width = obj.width;
          this._itemSize.height = obj.height;
        }
        this.returnToPool(obj);
      }
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
        this._scrollPane.scrollStep = this._itemSize.height;
        if (this._loop)
          this._scrollPane._loop = 2;
      } else {
        this._scrollPane.scrollStep = this._itemSize.width;
        if (this._loop)
          this._scrollPane._loop = 1;
      }
      this._node.on(Event.SCROLL, this.__scrolled, this);
      this.setVirtualListChangedFlag(true);
    }
  }
  /// <summary>
  /// Set the list item count. 
  /// If the list is not virtual, specified number of items will be created. 
  /// If the list is virtual, only items in view will be created.
  /// </summary>
  get numItems() {
    if (this._virtual)
      return this._numItems;
    else
      return this._children.length;
  }
  set numItems(value) {
    if (this._virtual) {
      if (this.itemRenderer == null)
        throw new Error("Set itemRenderer first!");
      this._numItems = value;
      if (this._loop)
        this._realNumItems = this._numItems * 6;
      else
        this._realNumItems = this._numItems;
      var oldCount = this._virtualItems.length;
      if (this._realNumItems > oldCount) {
        for (i = oldCount; i < this._realNumItems; i++) {
          var ii = {
            width: this._itemSize.width,
            height: this._itemSize.height,
            updateFlag: 0
          };
          this._virtualItems.push(ii);
        }
      } else {
        for (i = this._realNumItems; i < oldCount; i++)
          this._virtualItems[i].selected = false;
      }
      if (this._virtualListChanged != 0)
        this._partner.unschedule(this._refreshVirtualList);
      this._refreshVirtualList();
    } else {
      var cnt = this._children.length;
      if (value > cnt) {
        for (var i = cnt; i < value; i++) {
          if (this.itemProvider == null)
            this.addItemFromPool();
          else
            this.addItemFromPool(this.itemProvider(i));
        }
      } else {
        this.removeChildrenToPool(value, cnt);
      }
      if (this.itemRenderer != null) {
        for (i = 0; i < value; i++)
          this.itemRenderer(i, this.getChildAt(i));
      }
    }
  }
  refreshVirtualList() {
    this.setVirtualListChangedFlag(false);
  }
  checkVirtualList() {
    if (this._virtualListChanged != 0) {
      this._refreshVirtualList();
      this._partner.unschedule(this._refreshVirtualList);
    }
  }
  setVirtualListChangedFlag(layoutChanged) {
    if (layoutChanged)
      this._virtualListChanged = 2;
    else if (this._virtualListChanged == 0)
      this._virtualListChanged = 1;
    this._partner.callLater(this._refreshVirtualList);
  }
  _refreshVirtualList(dt) {
    if (!isNaN(dt)) {
      let _t = GObject.cast(this.node);
      _t._refreshVirtualList();
      return;
    }
    var layoutChanged = this._virtualListChanged == 2;
    this._virtualListChanged = 0;
    this._eventLocked = true;
    if (layoutChanged) {
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.SingleRow)
        this._curLineItemCount = 1;
      else if (this._layout == ListLayoutType.FlowHorizontal) {
        if (this._columnCount > 0)
          this._curLineItemCount = this._columnCount;
        else {
          this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
          if (this._curLineItemCount <= 0)
            this._curLineItemCount = 1;
        }
      } else if (this._layout == ListLayoutType.FlowVertical) {
        if (this._lineCount > 0)
          this._curLineItemCount = this._lineCount;
        else {
          this._curLineItemCount = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
          if (this._curLineItemCount <= 0)
            this._curLineItemCount = 1;
        }
      } else {
        if (this._columnCount > 0)
          this._curLineItemCount = this._columnCount;
        else {
          this._curLineItemCount = Math.floor((this._scrollPane.viewWidth + this._columnGap) / (this._itemSize.width + this._columnGap));
          if (this._curLineItemCount <= 0)
            this._curLineItemCount = 1;
        }
        if (this._lineCount > 0)
          this._curLineItemCount2 = this._lineCount;
        else {
          this._curLineItemCount2 = Math.floor((this._scrollPane.viewHeight + this._lineGap) / (this._itemSize.height + this._lineGap));
          if (this._curLineItemCount2 <= 0)
            this._curLineItemCount2 = 1;
        }
      }
    }
    var ch = 0, cw = 0;
    if (this._realNumItems > 0) {
      var i;
      var len = Math.ceil(this._realNumItems / this._curLineItemCount) * this._curLineItemCount;
      var len2 = Math.min(this._curLineItemCount, this._realNumItems);
      if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
        for (i = 0; i < len; i += this._curLineItemCount)
          ch += this._virtualItems[i].height + this._lineGap;
        if (ch > 0)
          ch -= this._lineGap;
        if (this._autoResizeItem)
          cw = this._scrollPane.viewWidth;
        else {
          for (i = 0; i < len2; i++)
            cw += this._virtualItems[i].width + this._columnGap;
          if (cw > 0)
            cw -= this._columnGap;
        }
      } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
        for (i = 0; i < len; i += this._curLineItemCount)
          cw += this._virtualItems[i].width + this._columnGap;
        if (cw > 0)
          cw -= this._columnGap;
        if (this._autoResizeItem)
          ch = this._scrollPane.viewHeight;
        else {
          for (i = 0; i < len2; i++)
            ch += this._virtualItems[i].height + this._lineGap;
          if (ch > 0)
            ch -= this._lineGap;
        }
      } else {
        var pageCount = Math.ceil(len / (this._curLineItemCount * this._curLineItemCount2));
        cw = pageCount * this.viewWidth;
        ch = this.viewHeight;
      }
    }
    this.handleAlign(cw, ch);
    this._scrollPane.setContentSize(cw, ch);
    this._eventLocked = false;
    this.handleScroll(true);
  }
  __scrolled(evt) {
    this.handleScroll(false);
  }
  getIndexOnPos1(forceUpdate) {
    if (this._realNumItems < this._curLineItemCount) {
      s_n = 0;
      return 0;
    }
    var i;
    var pos2;
    var pos3;
    if (this.numChildren > 0 && !forceUpdate) {
      pos2 = this.getChildAt(0).y;
      if (pos2 > s_n) {
        for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
          pos2 -= this._virtualItems[i].height + this._lineGap;
          if (pos2 <= s_n) {
            s_n = pos2;
            return i;
          }
        }
        s_n = 0;
        return 0;
      } else {
        for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
          pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
          if (pos3 > s_n) {
            s_n = pos2;
            return i;
          }
          pos2 = pos3;
        }
        s_n = pos2;
        return this._realNumItems - this._curLineItemCount;
      }
    } else {
      pos2 = 0;
      for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
        pos3 = pos2 + this._virtualItems[i].height + this._lineGap;
        if (pos3 > s_n) {
          s_n = pos2;
          return i;
        }
        pos2 = pos3;
      }
      s_n = pos2;
      return this._realNumItems - this._curLineItemCount;
    }
  }
  getIndexOnPos2(forceUpdate) {
    if (this._realNumItems < this._curLineItemCount) {
      s_n = 0;
      return 0;
    }
    var i;
    var pos2;
    var pos3;
    if (this.numChildren > 0 && !forceUpdate) {
      pos2 = this.getChildAt(0).x;
      if (pos2 > s_n) {
        for (i = this._firstIndex - this._curLineItemCount; i >= 0; i -= this._curLineItemCount) {
          pos2 -= this._virtualItems[i].width + this._columnGap;
          if (pos2 <= s_n) {
            s_n = pos2;
            return i;
          }
        }
        s_n = 0;
        return 0;
      } else {
        for (i = this._firstIndex; i < this._realNumItems; i += this._curLineItemCount) {
          pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
          if (pos3 > s_n) {
            s_n = pos2;
            return i;
          }
          pos2 = pos3;
        }
        s_n = pos2;
        return this._realNumItems - this._curLineItemCount;
      }
    } else {
      pos2 = 0;
      for (i = 0; i < this._realNumItems; i += this._curLineItemCount) {
        pos3 = pos2 + this._virtualItems[i].width + this._columnGap;
        if (pos3 > s_n) {
          s_n = pos2;
          return i;
        }
        pos2 = pos3;
      }
      s_n = pos2;
      return this._realNumItems - this._curLineItemCount;
    }
  }
  getIndexOnPos3(forceUpdate) {
    if (this._realNumItems < this._curLineItemCount) {
      s_n = 0;
      return 0;
    }
    var viewWidth = this.viewWidth;
    var page = Math.floor(s_n / viewWidth);
    var startIndex = page * (this._curLineItemCount * this._curLineItemCount2);
    var pos2 = page * viewWidth;
    var i;
    var pos3;
    for (i = 0; i < this._curLineItemCount; i++) {
      pos3 = pos2 + this._virtualItems[startIndex + i].width + this._columnGap;
      if (pos3 > s_n) {
        s_n = pos2;
        return startIndex + i;
      }
      pos2 = pos3;
    }
    s_n = pos2;
    return startIndex + this._curLineItemCount - 1;
  }
  handleScroll(forceUpdate) {
    if (this._eventLocked)
      return;
    if (this._layout == ListLayoutType.SingleColumn || this._layout == ListLayoutType.FlowHorizontal) {
      var enterCounter = 0;
      while (this.handleScroll1(forceUpdate)) {
        enterCounter++;
        forceUpdate = false;
        if (enterCounter > 20) {
          console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
          break;
        }
      }
      this.handleArchOrder1();
    } else if (this._layout == ListLayoutType.SingleRow || this._layout == ListLayoutType.FlowVertical) {
      enterCounter = 0;
      while (this.handleScroll2(forceUpdate)) {
        enterCounter++;
        forceUpdate = false;
        if (enterCounter > 20) {
          console.log("FairyGUI: list will never be filled as the item renderer function always returns a different size.");
          break;
        }
      }
      this.handleArchOrder2();
    } else {
      this.handleScroll3(forceUpdate);
    }
    this._boundsChanged = false;
  }
  handleScroll1(forceUpdate) {
    var pos = this._scrollPane.scrollingPosY;
    var max = pos + this._scrollPane.viewHeight;
    var end = max == this._scrollPane.contentHeight;
    s_n = pos;
    var newFirstIndex = this.getIndexOnPos1(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate) {
      return false;
    }
    var oldFirstIndex = this._firstIndex;
    this._firstIndex = newFirstIndex;
    var curIndex = newFirstIndex;
    var forward = oldFirstIndex > newFirstIndex;
    var childCount = this.numChildren;
    var lastIndex = oldFirstIndex + childCount - 1;
    var reuseIndex = forward ? lastIndex : oldFirstIndex;
    var curX = 0, curY = pos;
    var needRender;
    var deltaSize = 0;
    var firstItemDeltaSize = 0;
    var url = this._defaultItem;
    var ii, ii2;
    var i, j;
    var partSize = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
    this.itemInfoVer++;
    while (curIndex < this._realNumItems && (end || curY < max)) {
      ii = this._virtualItems[curIndex];
      if (!ii.obj || forceUpdate) {
        if (this.itemProvider != null) {
          url = this.itemProvider(curIndex % this._numItems);
          if (url == null)
            url = this._defaultItem;
          url = UIPackage.normalizeURL(url);
        }
        if (ii.obj && ii.obj.resourceURL != url) {
          if (ii.obj instanceof GButton)
            ii.selected = ii.obj.selected;
          this.removeChildToPool(ii.obj);
          ii.obj = null;
        }
      }
      if (!ii.obj) {
        if (forward) {
          for (j = reuseIndex; j >= oldFirstIndex; j--) {
            ii2 = this._virtualItems[j];
            if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
              if (ii2.obj instanceof GButton)
                ii2.selected = ii2.obj.selected;
              ii.obj = ii2.obj;
              ii2.obj = null;
              if (j == reuseIndex)
                reuseIndex--;
              break;
            }
          }
        } else {
          for (j = reuseIndex; j <= lastIndex; j++) {
            ii2 = this._virtualItems[j];
            if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
              if (ii2.obj instanceof GButton)
                ii2.selected = ii2.obj.selected;
              ii.obj = ii2.obj;
              ii2.obj = null;
              if (j == reuseIndex)
                reuseIndex++;
              break;
            }
          }
        }
        if (ii.obj) {
          this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
        } else {
          ii.obj = this._pool.getObject(url);
          if (forward)
            this.addChildAt(ii.obj, curIndex - newFirstIndex);
          else
            this.addChild(ii.obj);
        }
        if (ii.obj instanceof GButton)
          ii.obj.selected = ii.selected;
        needRender = true;
      } else
        needRender = forceUpdate;
      if (needRender) {
        if (this._autoResizeItem && (this._layout == ListLayoutType.SingleColumn || this._columnCount > 0))
          ii.obj.setSize(partSize, ii.obj.height, true);
        this.itemRenderer(curIndex % this._numItems, ii.obj);
        if (curIndex % this._curLineItemCount == 0) {
          deltaSize += Math.ceil(ii.obj.height) - ii.height;
          if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
            firstItemDeltaSize = Math.ceil(ii.obj.height) - ii.height;
          }
        }
        ii.width = Math.ceil(ii.obj.width);
        ii.height = Math.ceil(ii.obj.height);
      }
      ii.updateFlag = this.itemInfoVer;
      ii.obj.setPosition(curX, curY);
      if (curIndex == newFirstIndex)
        max += ii.height;
      curX += ii.width + this._columnGap;
      if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
        curX = 0;
        curY += ii.height + this._lineGap;
      }
      curIndex++;
    }
    for (i = 0; i < childCount; i++) {
      ii = this._virtualItems[oldFirstIndex + i];
      if (ii.updateFlag != this.itemInfoVer && ii.obj) {
        if (ii.obj instanceof GButton)
          ii.selected = ii.obj.selected;
        this.removeChildToPool(ii.obj);
        ii.obj = null;
      }
    }
    childCount = this._children.length;
    for (i = 0; i < childCount; i++) {
      let obj = this._virtualItems[newFirstIndex + i].obj;
      if (this._children[i] != obj)
        this.setChildIndex(obj, i);
    }
    if (deltaSize != 0 || firstItemDeltaSize != 0)
      this._scrollPane.changeContentSizeOnScrolling(0, deltaSize, 0, firstItemDeltaSize);
    if (curIndex > 0 && this.numChildren > 0 && this._container.position.y <= 0 && this.getChildAt(0).y > -this._container.position.y)
      return true;
    else
      return false;
  }
  handleScroll2(forceUpdate) {
    var pos = this._scrollPane.scrollingPosX;
    var max = pos + this._scrollPane.viewWidth;
    var end = pos == this._scrollPane.contentWidth;
    s_n = pos;
    var newFirstIndex = this.getIndexOnPos2(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate) {
      return false;
    }
    var oldFirstIndex = this._firstIndex;
    this._firstIndex = newFirstIndex;
    var curIndex = newFirstIndex;
    var forward = oldFirstIndex > newFirstIndex;
    var childCount = this.numChildren;
    var lastIndex = oldFirstIndex + childCount - 1;
    var reuseIndex = forward ? lastIndex : oldFirstIndex;
    var curX = pos, curY = 0;
    var needRender;
    var deltaSize = 0;
    var firstItemDeltaSize = 0;
    var url = this._defaultItem;
    var ii, ii2;
    var i, j;
    var partSize = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
    this.itemInfoVer++;
    while (curIndex < this._realNumItems && (end || curX < max)) {
      ii = this._virtualItems[curIndex];
      if (!ii.obj || forceUpdate) {
        if (this.itemProvider != null) {
          url = this.itemProvider(curIndex % this._numItems);
          if (url == null)
            url = this._defaultItem;
          url = UIPackage.normalizeURL(url);
        }
        if (ii.obj && ii.obj.resourceURL != url) {
          if (ii.obj instanceof GButton)
            ii.selected = ii.obj.selected;
          this.removeChildToPool(ii.obj);
          ii.obj = null;
        }
      }
      if (!ii.obj) {
        if (forward) {
          for (j = reuseIndex; j >= oldFirstIndex; j--) {
            ii2 = this._virtualItems[j];
            if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
              if (ii2.obj instanceof GButton)
                ii2.selected = ii2.obj.selected;
              ii.obj = ii2.obj;
              ii2.obj = null;
              if (j == reuseIndex)
                reuseIndex--;
              break;
            }
          }
        } else {
          for (j = reuseIndex; j <= lastIndex; j++) {
            ii2 = this._virtualItems[j];
            if (ii2.obj && ii2.updateFlag != this.itemInfoVer && ii2.obj.resourceURL == url) {
              if (ii2.obj instanceof GButton)
                ii2.selected = ii2.obj.selected;
              ii.obj = ii2.obj;
              ii2.obj = null;
              if (j == reuseIndex)
                reuseIndex++;
              break;
            }
          }
        }
        if (ii.obj) {
          this.setChildIndex(ii.obj, forward ? curIndex - newFirstIndex : this.numChildren);
        } else {
          ii.obj = this._pool.getObject(url);
          if (forward)
            this.addChildAt(ii.obj, curIndex - newFirstIndex);
          else
            this.addChild(ii.obj);
        }
        if (ii.obj instanceof GButton)
          ii.obj.selected = ii.selected;
        needRender = true;
      } else
        needRender = forceUpdate;
      if (needRender) {
        if (this._autoResizeItem && (this._layout == ListLayoutType.SingleRow || this._lineCount > 0))
          ii.obj.setSize(ii.obj.width, partSize, true);
        this.itemRenderer(curIndex % this._numItems, ii.obj);
        if (curIndex % this._curLineItemCount == 0) {
          deltaSize += Math.ceil(ii.obj.width) - ii.width;
          if (curIndex == newFirstIndex && oldFirstIndex > newFirstIndex) {
            firstItemDeltaSize = Math.ceil(ii.obj.width) - ii.width;
          }
        }
        ii.width = Math.ceil(ii.obj.width);
        ii.height = Math.ceil(ii.obj.height);
      }
      ii.updateFlag = this.itemInfoVer;
      ii.obj.setPosition(curX, curY);
      if (curIndex == newFirstIndex)
        max += ii.width;
      curY += ii.height + this._lineGap;
      if (curIndex % this._curLineItemCount == this._curLineItemCount - 1) {
        curY = 0;
        curX += ii.width + this._columnGap;
      }
      curIndex++;
    }
    for (i = 0; i < childCount; i++) {
      ii = this._virtualItems[oldFirstIndex + i];
      if (ii.updateFlag != this.itemInfoVer && ii.obj) {
        if (ii.obj instanceof GButton)
          ii.selected = ii.obj.selected;
        this.removeChildToPool(ii.obj);
        ii.obj = null;
      }
    }
    childCount = this._children.length;
    for (i = 0; i < childCount; i++) {
      let obj = this._virtualItems[newFirstIndex + i].obj;
      if (this._children[i] != obj)
        this.setChildIndex(obj, i);
    }
    if (deltaSize != 0 || firstItemDeltaSize != 0)
      this._scrollPane.changeContentSizeOnScrolling(deltaSize, 0, firstItemDeltaSize, 0);
    if (curIndex > 0 && this.numChildren > 0 && this._container.position.x <= 0 && this.getChildAt(0).x > -this._container.position.x)
      return true;
    else
      return false;
  }
  handleScroll3(forceUpdate) {
    var pos = this._scrollPane.scrollingPosX;
    s_n = pos;
    var newFirstIndex = this.getIndexOnPos3(forceUpdate);
    pos = s_n;
    if (newFirstIndex == this._firstIndex && !forceUpdate)
      return;
    var oldFirstIndex = this._firstIndex;
    this._firstIndex = newFirstIndex;
    var reuseIndex = oldFirstIndex;
    var virtualItemCount = this._virtualItems.length;
    var pageSize = this._curLineItemCount * this._curLineItemCount2;
    var startCol = newFirstIndex % this._curLineItemCount;
    var viewWidth = this.viewWidth;
    var page = Math.floor(newFirstIndex / pageSize);
    var startIndex = page * pageSize;
    var lastIndex = startIndex + pageSize * 2;
    var needRender;
    var i;
    var ii, ii2;
    var col;
    var url = this._defaultItem;
    var partWidth = (this._scrollPane.viewWidth - this._columnGap * (this._curLineItemCount - 1)) / this._curLineItemCount;
    var partHeight = (this._scrollPane.viewHeight - this._lineGap * (this._curLineItemCount2 - 1)) / this._curLineItemCount2;
    this.itemInfoVer++;
    for (i = startIndex; i < lastIndex; i++) {
      if (i >= this._realNumItems)
        continue;
      col = i % this._curLineItemCount;
      if (i - startIndex < pageSize) {
        if (col < startCol)
          continue;
      } else {
        if (col > startCol)
          continue;
      }
      ii = this._virtualItems[i];
      ii.updateFlag = this.itemInfoVer;
    }
    var lastObj = null;
    var insertIndex = 0;
    for (i = startIndex; i < lastIndex; i++) {
      if (i >= this._realNumItems)
        continue;
      ii = this._virtualItems[i];
      if (ii.updateFlag != this.itemInfoVer)
        continue;
      if (!ii.obj) {
        while (reuseIndex < virtualItemCount) {
          ii2 = this._virtualItems[reuseIndex];
          if (ii2.obj && ii2.updateFlag != this.itemInfoVer) {
            if (ii2.obj instanceof GButton)
              ii2.selected = ii2.obj.selected;
            ii.obj = ii2.obj;
            ii2.obj = null;
            break;
          }
          reuseIndex++;
        }
        if (insertIndex == -1)
          insertIndex = this.getChildIndex(lastObj) + 1;
        if (!ii.obj) {
          if (this.itemProvider != null) {
            url = this.itemProvider(i % this._numItems);
            if (url == null)
              url = this._defaultItem;
            url = UIPackage.normalizeURL(url);
          }
          ii.obj = this._pool.getObject(url);
          this.addChildAt(ii.obj, insertIndex);
        } else {
          insertIndex = this.setChildIndexBefore(ii.obj, insertIndex);
        }
        insertIndex++;
        if (ii.obj instanceof GButton)
          ii.obj.selected = ii.selected;
        needRender = true;
      } else {
        needRender = forceUpdate;
        insertIndex = -1;
        lastObj = ii.obj;
      }
      if (needRender) {
        if (this._autoResizeItem) {
          if (this._curLineItemCount == this._columnCount && this._curLineItemCount2 == this._lineCount)
            ii.obj.setSize(partWidth, partHeight, true);
          else if (this._curLineItemCount == this._columnCount)
            ii.obj.setSize(partWidth, ii.obj.height, true);
          else if (this._curLineItemCount2 == this._lineCount)
            ii.obj.setSize(ii.obj.width, partHeight, true);
        }
        this.itemRenderer(i % this._numItems, ii.obj);
        ii.width = Math.ceil(ii.obj.width);
        ii.height = Math.ceil(ii.obj.height);
      }
    }
    var borderX = startIndex / pageSize * viewWidth;
    var xx = borderX;
    var yy = 0;
    var lineHeight = 0;
    for (i = startIndex; i < lastIndex; i++) {
      if (i >= this._realNumItems)
        continue;
      ii = this._virtualItems[i];
      if (ii.updateFlag == this.itemInfoVer)
        ii.obj.setPosition(xx, yy);
      if (ii.height > lineHeight)
        lineHeight = ii.height;
      if (i % this._curLineItemCount == this._curLineItemCount - 1) {
        xx = borderX;
        yy += lineHeight + this._lineGap;
        lineHeight = 0;
        if (i == startIndex + pageSize - 1) {
          borderX += viewWidth;
          xx = borderX;
          yy = 0;
        }
      } else
        xx += ii.width + this._columnGap;
    }
    for (i = reuseIndex; i < virtualItemCount; i++) {
      ii = this._virtualItems[i];
      if (ii.updateFlag != this.itemInfoVer && ii.obj) {
        if (ii.obj instanceof GButton)
          ii.selected = ii.obj.selected;
        this.removeChildToPool(ii.obj);
        ii.obj = null;
      }
    }
  }
  handleArchOrder1() {
    if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) {
      var mid = this._scrollPane.posY + this.viewHeight / 2;
      var minDist = Number.POSITIVE_INFINITY;
      var dist = 0;
      var apexIndex = 0;
      var cnt = this.numChildren;
      for (var i = 0; i < cnt; i++) {
        var obj = this.getChildAt(i);
        if (!this.foldInvisibleItems || obj.visible) {
          dist = Math.abs(mid - obj.y - obj.height / 2);
          if (dist < minDist) {
            minDist = dist;
            apexIndex = i;
          }
        }
      }
      this.apexIndex = apexIndex;
    }
  }
  handleArchOrder2() {
    if (this._childrenRenderOrder == ChildrenRenderOrder.Arch) {
      var mid = this._scrollPane.posX + this.viewWidth / 2;
      var minDist = Number.POSITIVE_INFINITY;
      var dist = 0;
      var apexIndex = 0;
      var cnt = this.numChildren;
      for (var i = 0; i < cnt; i++) {
        var obj = this.getChildAt(i);
        if (!this.foldInvisibleItems || obj.visible) {
          dist = Math.abs(mid - obj.x - obj.width / 2);
          if (dist < minDist) {
            minDist = dist;
            apexIndex = i;
          }
        }
      }
      this.apexIndex = apexIndex;
    }
  }
  handleAlign(contentWidth, contentHeight) {
    var newOffsetX = 0;
    var newOffsetY = 0;
    if (contentHeight < this.viewHeight) {
      if (this._verticalAlign == VertAlignType.Middle)
        newOffsetY = Math.floor((this.viewHeight - contentHeight) / 2);
      else if (this._verticalAlign == VertAlignType.Bottom)
        newOffsetY = this.viewHeight - contentHeight;
    }
    if (contentWidth < this.viewWidth) {
      if (this._align == AlignType.Center)
        newOffsetX = Math.floor((this.viewWidth - contentWidth) / 2);
      else if (this._align == AlignType.Right)
        newOffsetX = this.viewWidth - contentWidth;
    }
    if (newOffsetX != this._alignOffset.x || newOffsetY != this._alignOffset.y) {
      this._alignOffset.x = newOffsetX;
      this._alignOffset.y = newOffsetY;
      if (this._scrollPane)
        this._scrollPane.adjustMaskContainer();
      else
        this._container.setPosition(this._pivotCorrectX + this._alignOffset.x, this._pivotCorrectY - this._alignOffset.y);
    }
  }
  updateBounds() {
    if (this._virtual)
      return;
    var i;
    var child;
    var curX = 0;
    var curY = 0;
    var maxWidth = 0;
    var maxHeight = 0;
    var cw = 0, ch = 0;
    var j = 0;
    var page = 0;
    var k = 0;
    var cnt = this._children.length;
    var viewWidth = this.viewWidth;
    var viewHeight = this.viewHeight;
    var lineSize = 0;
    var lineStart = 0;
    var ratio = 0;
    if (this._layout == ListLayoutType.SingleColumn) {
      for (i = 0; i < cnt; i++) {
        child = this.getChildAt(i);
        if (this.foldInvisibleItems && !child.visible)
          continue;
        if (curY != 0)
          curY += this._lineGap;
        child.y = curY;
        if (this._autoResizeItem)
          child.setSize(viewWidth, child.height, true);
        curY += Math.ceil(child.height);
        if (child.width > maxWidth)
          maxWidth = child.width;
      }
      ch = curY;
      if (ch <= viewHeight && this._autoResizeItem && this._scrollPane && this._scrollPane._displayInDemand && this._scrollPane.vtScrollBar) {
        viewWidth += this._scrollPane.vtScrollBar.width;
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          child.setSize(viewWidth, child.height, true);
          if (child.width > maxWidth)
            maxWidth = child.width;
        }
      }
      cw = Math.ceil(maxWidth);
    } else if (this._layout == ListLayoutType.SingleRow) {
      for (i = 0; i < cnt; i++) {
        child = this.getChildAt(i);
        if (this.foldInvisibleItems && !child.visible)
          continue;
        if (curX != 0)
          curX += this._columnGap;
        child.x = curX;
        if (this._autoResizeItem)
          child.setSize(child.width, viewHeight, true);
        curX += Math.ceil(child.width);
        if (child.height > maxHeight)
          maxHeight = child.height;
      }
      cw = curX;
      if (cw <= viewWidth && this._autoResizeItem && this._scrollPane && this._scrollPane._displayInDemand && this._scrollPane.hzScrollBar) {
        viewHeight += this._scrollPane.hzScrollBar.height;
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          child.setSize(child.width, viewHeight, true);
          if (child.height > maxHeight)
            maxHeight = child.height;
        }
      }
      ch = Math.ceil(maxHeight);
    } else if (this._layout == ListLayoutType.FlowHorizontal) {
      if (this._autoResizeItem && this._columnCount > 0) {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          lineSize += child.sourceWidth;
          j++;
          if (j == this._columnCount || i == cnt - 1) {
            ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
            curX = 0;
            for (j = lineStart; j <= i; j++) {
              child = this.getChildAt(j);
              if (this.foldInvisibleItems && !child.visible)
                continue;
              child.setPosition(curX, curY);
              if (j < i) {
                child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), child.height, true);
                curX += Math.ceil(child.width) + this._columnGap;
              } else {
                child.setSize(viewWidth - curX, child.height, true);
              }
              if (child.height > maxHeight)
                maxHeight = child.height;
            }
            curY += Math.ceil(maxHeight) + this._lineGap;
            maxHeight = 0;
            j = 0;
            lineStart = i + 1;
            lineSize = 0;
          }
        }
        ch = curY + Math.ceil(maxHeight);
        cw = viewWidth;
      } else {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          if (curX != 0)
            curX += this._columnGap;
          if (this._columnCount != 0 && j >= this._columnCount || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
            curX = 0;
            curY += Math.ceil(maxHeight) + this._lineGap;
            maxHeight = 0;
            j = 0;
          }
          child.setPosition(curX, curY);
          curX += Math.ceil(child.width);
          if (curX > maxWidth)
            maxWidth = curX;
          if (child.height > maxHeight)
            maxHeight = child.height;
          j++;
        }
        ch = curY + Math.ceil(maxHeight);
        cw = Math.ceil(maxWidth);
      }
    } else if (this._layout == ListLayoutType.FlowVertical) {
      if (this._autoResizeItem && this._lineCount > 0) {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          lineSize += child.sourceHeight;
          j++;
          if (j == this._lineCount || i == cnt - 1) {
            ratio = (viewHeight - lineSize - (j - 1) * this._lineGap) / lineSize;
            curY = 0;
            for (j = lineStart; j <= i; j++) {
              child = this.getChildAt(j);
              if (this.foldInvisibleItems && !child.visible)
                continue;
              child.setPosition(curX, curY);
              if (j < i) {
                child.setSize(child.width, child.sourceHeight + Math.round(child.sourceHeight * ratio), true);
                curY += Math.ceil(child.height) + this._lineGap;
              } else {
                child.setSize(child.width, viewHeight - curY, true);
              }
              if (child.width > maxWidth)
                maxWidth = child.width;
            }
            curX += Math.ceil(maxWidth) + this._columnGap;
            maxWidth = 0;
            j = 0;
            lineStart = i + 1;
            lineSize = 0;
          }
        }
        cw = curX + Math.ceil(maxWidth);
        ch = viewHeight;
      } else {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          if (curY != 0)
            curY += this._lineGap;
          if (this._lineCount != 0 && j >= this._lineCount || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
            curY = 0;
            curX += Math.ceil(maxWidth) + this._columnGap;
            maxWidth = 0;
            j = 0;
          }
          child.setPosition(curX, curY);
          curY += Math.ceil(child.height);
          if (curY > maxHeight)
            maxHeight = curY;
          if (child.width > maxWidth)
            maxWidth = child.width;
          j++;
        }
        cw = curX + Math.ceil(maxWidth);
        ch = Math.ceil(maxHeight);
      }
    } else {
      var eachHeight;
      if (this._autoResizeItem && this._lineCount > 0)
        eachHeight = Math.floor((viewHeight - (this._lineCount - 1) * this._lineGap) / this._lineCount);
      if (this._autoResizeItem && this._columnCount > 0) {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          if (j == 0 && (this._lineCount != 0 && k >= this._lineCount || this._lineCount == 0 && curY + (this._lineCount > 0 ? eachHeight : child.height) > viewHeight)) {
            page++;
            curY = 0;
            k = 0;
          }
          lineSize += child.sourceWidth;
          j++;
          if (j == this._columnCount || i == cnt - 1) {
            ratio = (viewWidth - lineSize - (j - 1) * this._columnGap) / lineSize;
            curX = 0;
            for (j = lineStart; j <= i; j++) {
              child = this.getChildAt(j);
              if (this.foldInvisibleItems && !child.visible)
                continue;
              child.setPosition(page * viewWidth + curX, curY);
              if (j < i) {
                child.setSize(child.sourceWidth + Math.round(child.sourceWidth * ratio), this._lineCount > 0 ? eachHeight : child.height, true);
                curX += Math.ceil(child.width) + this._columnGap;
              } else {
                child.setSize(viewWidth - curX, this._lineCount > 0 ? eachHeight : child.height, true);
              }
              if (child.height > maxHeight)
                maxHeight = child.height;
            }
            curY += Math.ceil(maxHeight) + this._lineGap;
            maxHeight = 0;
            j = 0;
            lineStart = i + 1;
            lineSize = 0;
            k++;
          }
        }
      } else {
        for (i = 0; i < cnt; i++) {
          child = this.getChildAt(i);
          if (this.foldInvisibleItems && !child.visible)
            continue;
          if (curX != 0)
            curX += this._columnGap;
          if (this._autoResizeItem && this._lineCount > 0)
            child.setSize(child.width, eachHeight, true);
          if (this._columnCount != 0 && j >= this._columnCount || this._columnCount == 0 && curX + child.width > viewWidth && maxHeight != 0) {
            curX = 0;
            curY += Math.ceil(maxHeight) + this._lineGap;
            maxHeight = 0;
            j = 0;
            k++;
            if (this._lineCount != 0 && k >= this._lineCount || this._lineCount == 0 && curY + child.height > viewHeight && maxWidth != 0) {
              page++;
              curY = 0;
              k = 0;
            }
          }
          child.setPosition(page * viewWidth + curX, curY);
          curX += Math.ceil(child.width);
          if (curX > maxWidth)
            maxWidth = curX;
          if (child.height > maxHeight)
            maxHeight = child.height;
          j++;
        }
      }
      ch = page > 0 ? viewHeight : curY + Math.ceil(maxHeight);
      cw = (page + 1) * viewWidth;
    }
    this.handleAlign(cw, ch);
    this.setBounds(0, 0, cw, ch);
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this._layout = buffer.readByte();
    this._selectionMode = buffer.readByte();
    this._align = buffer.readByte();
    this._verticalAlign = buffer.readByte();
    this._lineGap = buffer.readShort();
    this._columnGap = buffer.readShort();
    this._lineCount = buffer.readShort();
    this._columnCount = buffer.readShort();
    this._autoResizeItem = buffer.readBool();
    this._childrenRenderOrder = buffer.readByte();
    this._apexIndex = buffer.readShort();
    if (buffer.readBool()) {
      this._margin.top = buffer.readInt();
      this._margin.bottom = buffer.readInt();
      this._margin.left = buffer.readInt();
      this._margin.right = buffer.readInt();
    }
    var overflow = buffer.readByte();
    if (overflow == OverflowType.Scroll) {
      var savedPos = buffer.position;
      buffer.seek(beginPos, 7);
      this.setupScroll(buffer);
      buffer.position = savedPos;
    } else
      this.setupOverflow(overflow);
    if (buffer.readBool())
      buffer.skip(8);
    if (buffer.version >= 2) {
      this.scrollItemToViewOnClick = buffer.readBool();
      this.foldInvisibleItems = buffer.readBool();
    }
    buffer.seek(beginPos, 8);
    this._defaultItem = buffer.readS();
    this.readItems(buffer);
  }
  readItems(buffer) {
    var cnt;
    var i;
    var nextPos;
    var str;
    cnt = buffer.readShort();
    for (i = 0; i < cnt; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      str = buffer.readS();
      if (str == null) {
        str = this._defaultItem;
        if (!str) {
          buffer.position = nextPos;
          continue;
        }
      }
      var obj = this.getFromPool(str);
      if (obj) {
        this.addChild(obj);
        this.setupItem(buffer, obj);
      }
      buffer.position = nextPos;
    }
  }
  setupItem(buffer, obj) {
    var str;
    str = buffer.readS();
    if (str != null)
      obj.text = str;
    str = buffer.readS();
    if (str != null && obj instanceof GButton)
      obj.selectedTitle = str;
    str = buffer.readS();
    if (str != null)
      obj.icon = str;
    str = buffer.readS();
    if (str != null && obj instanceof GButton)
      obj.selectedIcon = str;
    str = buffer.readS();
    if (str != null)
      obj.name = str;
    var cnt;
    var i;
    if (obj instanceof GComponent) {
      cnt = buffer.readShort();
      for (i = 0; i < cnt; i++) {
        var cc = obj.getController(buffer.readS());
        str = buffer.readS();
        if (cc)
          cc.selectedPageId = str;
      }
      if (buffer.version >= 2) {
        cnt = buffer.readShort();
        for (i = 0; i < cnt; i++) {
          var target = buffer.readS();
          var propertyId = buffer.readShort();
          var value = buffer.readS();
          var obj2 = obj.getChildByPath(target);
          if (obj2)
            obj2.setProp(propertyId, value);
        }
      }
    }
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    buffer.seek(beginPos, 6);
    var i = buffer.readShort();
    if (i != -1)
      this._selectionController = this.parent.getControllerAt(i);
  }
};
var s_n = 0;
var GTreeNode = class {
  constructor(hasChild, resURL) {
    this._level = 0;
    this._resURL = resURL;
    if (hasChild)
      this._children = new Array();
  }
  set expanded(value) {
    if (this._children == null)
      return;
    if (this._expanded != value) {
      this._expanded = value;
      if (this._tree) {
        if (this._expanded)
          this._tree._afterExpanded(this);
        else
          this._tree._afterCollapsed(this);
      }
    }
  }
  get expanded() {
    return this._expanded;
  }
  get isFolder() {
    return this._children != null;
  }
  get parent() {
    return this._parent;
  }
  get text() {
    if (this._cell)
      return this._cell.text;
    else
      return null;
  }
  set text(value) {
    if (this._cell)
      this._cell.text = value;
  }
  get icon() {
    if (this._cell)
      return this._cell.icon;
    else
      return null;
  }
  set icon(value) {
    if (this._cell)
      this._cell.icon = value;
  }
  get cell() {
    return this._cell;
  }
  get level() {
    return this._level;
  }
  _setLevel(value) {
    this._level = value;
  }
  addChild(child) {
    this.addChildAt(child, this._children.length);
    return child;
  }
  addChildAt(child, index) {
    if (!child)
      throw new Error("child is null");
    var numChildren = this._children.length;
    if (index >= 0 && index <= numChildren) {
      if (child._parent == this) {
        this.setChildIndex(child, index);
      } else {
        if (child._parent)
          child._parent.removeChild(child);
        var cnt = this._children.length;
        if (index == cnt)
          this._children.push(child);
        else
          this._children.splice(index, 0, child);
        child._parent = this;
        child._level = this._level + 1;
        child._setTree(this._tree);
        if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded)
          this._tree._afterInserted(child);
      }
      return child;
    } else {
      throw new RangeError("Invalid child index");
    }
  }
  removeChild(child) {
    var childIndex = this._children.indexOf(child);
    if (childIndex != -1) {
      this.removeChildAt(childIndex);
    }
    return child;
  }
  removeChildAt(index) {
    if (index >= 0 && index < this.numChildren) {
      var child = this._children[index];
      this._children.splice(index, 1);
      child._parent = null;
      if (this._tree) {
        child._setTree(null);
        this._tree._afterRemoved(child);
      }
      return child;
    } else {
      throw new Error("Invalid child index");
    }
  }
  removeChildren(beginIndex, endIndex) {
    beginIndex = beginIndex || 0;
    if (endIndex == null)
      endIndex = -1;
    if (endIndex < 0 || endIndex >= this.numChildren)
      endIndex = this.numChildren - 1;
    for (var i = beginIndex; i <= endIndex; ++i)
      this.removeChildAt(beginIndex);
  }
  getChildAt(index) {
    if (index >= 0 && index < this.numChildren)
      return this._children[index];
    else
      throw new Error("Invalid child index");
  }
  getChildIndex(child) {
    return this._children.indexOf(child);
  }
  getPrevSibling() {
    if (this._parent == null)
      return null;
    var i = this._parent._children.indexOf(this);
    if (i <= 0)
      return null;
    return this._parent._children[i - 1];
  }
  getNextSibling() {
    if (this._parent == null)
      return null;
    var i = this._parent._children.indexOf(this);
    if (i < 0 || i >= this._parent._children.length - 1)
      return null;
    return this._parent._children[i + 1];
  }
  setChildIndex(child, index) {
    var oldIndex = this._children.indexOf(child);
    if (oldIndex == -1)
      throw new Error("Not a child of this container");
    var cnt = this._children.length;
    if (index < 0)
      index = 0;
    else if (index > cnt)
      index = cnt;
    if (oldIndex == index)
      return;
    this._children.splice(oldIndex, 1);
    this._children.splice(index, 0, child);
    if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded)
      this._tree._afterMoved(child);
  }
  swapChildren(child1, child2) {
    var index1 = this._children.indexOf(child1);
    var index2 = this._children.indexOf(child2);
    if (index1 == -1 || index2 == -1)
      throw new Error("Not a child of this container");
    this.swapChildrenAt(index1, index2);
  }
  swapChildrenAt(index1, index2) {
    var child1 = this._children[index1];
    var child2 = this._children[index2];
    this.setChildIndex(child1, index2);
    this.setChildIndex(child2, index1);
  }
  get numChildren() {
    return this._children.length;
  }
  expandToRoot() {
    var p = this;
    while (p) {
      p.expanded = true;
      p = p.parent;
    }
  }
  get tree() {
    return this._tree;
  }
  _setTree(value) {
    this._tree = value;
    if (this._tree && this._tree.treeNodeWillExpand && this._expanded)
      this._tree.treeNodeWillExpand(this, true);
    if (this._children) {
      var cnt = this._children.length;
      for (var i = 0; i < cnt; i++) {
        var node = this._children[i];
        node._level = this._level + 1;
        node._setTree(value);
      }
    }
  }
};
var GTree = class extends GList {
  constructor() {
    super();
    this._indent = 15;
    this._rootNode = new GTreeNode(true);
    this._rootNode._setTree(this);
    this._rootNode.expanded = true;
  }
  get rootNode() {
    return this._rootNode;
  }
  get indent() {
    return this._indent;
  }
  set indent(value) {
    this._indent = value;
  }
  get clickToExpand() {
    return this._clickToExpand;
  }
  set clickToExpand(value) {
    this._clickToExpand = value;
  }
  getSelectedNode() {
    if (this.selectedIndex != -1)
      return this.getChildAt(this.selectedIndex)._treeNode;
    else
      return null;
  }
  getSelectedNodes(result) {
    if (!result)
      result = new Array();
    s_list.length = 0;
    super.getSelection(s_list);
    var cnt = s_list.length;
    var ret = new Array();
    for (var i = 0; i < cnt; i++) {
      var node = this.getChildAt(s_list[i])._treeNode;
      ret.push(node);
    }
    return ret;
  }
  selectNode(node, scrollItToView) {
    var parentNode = node.parent;
    while (parentNode && parentNode != this._rootNode) {
      parentNode.expanded = true;
      parentNode = parentNode.parent;
    }
    if (!node._cell)
      return;
    this.addSelection(this.getChildIndex(node._cell), scrollItToView);
  }
  unselectNode(node) {
    if (!node._cell)
      return;
    this.removeSelection(this.getChildIndex(node._cell));
  }
  expandAll(folderNode) {
    if (!folderNode)
      folderNode = this._rootNode;
    folderNode.expanded = true;
    var cnt = folderNode.numChildren;
    for (var i = 0; i < cnt; i++) {
      var node = folderNode.getChildAt(i);
      if (node.isFolder)
        this.expandAll(node);
    }
  }
  collapseAll(folderNode) {
    if (!folderNode)
      folderNode = this._rootNode;
    if (folderNode != this._rootNode)
      folderNode.expanded = false;
    var cnt = folderNode.numChildren;
    for (var i = 0; i < cnt; i++) {
      var node = folderNode.getChildAt(i);
      if (node.isFolder)
        this.collapseAll(node);
    }
  }
  createCell(node) {
    var child = this.getFromPool(node._resURL);
    if (!(child instanceof GComponent))
      throw new Error("cannot create tree node object.");
    child._treeNode = node;
    node._cell = child;
    var indentObj = child.getChild("indent");
    if (indentObj)
      indentObj.width = (node.level - 1) * this._indent;
    var cc;
    cc = child.getController("expanded");
    if (cc) {
      cc.on(Event.STATUS_CHANGED, this.__expandedStateChanged, this);
      cc.selectedIndex = node.expanded ? 1 : 0;
    }
    cc = child.getController("leaf");
    if (cc)
      cc.selectedIndex = node.isFolder ? 0 : 1;
    if (node.isFolder)
      node._cell.on(Event.TOUCH_BEGIN, this.__cellMouseDown, this);
    if (this.treeNodeRender)
      this.treeNodeRender(node, child);
  }
  _afterInserted(node) {
    if (!node._cell)
      this.createCell(node);
    var index = this.getInsertIndexForNode(node);
    this.addChildAt(node._cell, index);
    if (this.treeNodeRender)
      this.treeNodeRender(node, node._cell);
    if (node.isFolder && node.expanded)
      this.checkChildren(node, index);
  }
  getInsertIndexForNode(node) {
    var prevNode = node.getPrevSibling();
    if (prevNode == null)
      prevNode = node.parent;
    var insertIndex = this.getChildIndex(prevNode._cell) + 1;
    var myLevel = node.level;
    var cnt = this.numChildren;
    for (var i = insertIndex; i < cnt; i++) {
      var testNode = this.getChildAt(i)._treeNode;
      if (testNode.level <= myLevel)
        break;
      insertIndex++;
    }
    return insertIndex;
  }
  _afterRemoved(node) {
    this.removeNode(node);
  }
  _afterExpanded(node) {
    if (node == this._rootNode) {
      this.checkChildren(this._rootNode, 0);
      return;
    }
    if (this.treeNodeWillExpand != null)
      this.treeNodeWillExpand(node, true);
    if (node._cell == null)
      return;
    if (this.treeNodeRender)
      this.treeNodeRender(node, node._cell);
    var cc = node._cell.getController("expanded");
    if (cc)
      cc.selectedIndex = 1;
    if (node._cell.parent)
      this.checkChildren(node, this.getChildIndex(node._cell));
  }
  _afterCollapsed(node) {
    if (node == this._rootNode) {
      this.checkChildren(this._rootNode, 0);
      return;
    }
    if (this.treeNodeWillExpand)
      this.treeNodeWillExpand(node, false);
    if (node._cell == null)
      return;
    if (this.treeNodeRender)
      this.treeNodeRender(node, node._cell);
    var cc = node._cell.getController("expanded");
    if (cc)
      cc.selectedIndex = 0;
    if (node._cell.parent)
      this.hideFolderNode(node);
  }
  _afterMoved(node) {
    var startIndex = this.getChildIndex(node._cell);
    var endIndex;
    if (node.isFolder)
      endIndex = this.getFolderEndIndex(startIndex, node.level);
    else
      endIndex = startIndex + 1;
    var insertIndex = this.getInsertIndexForNode(node);
    var i;
    var cnt = endIndex - startIndex;
    var obj;
    if (insertIndex < startIndex) {
      for (i = 0; i < cnt; i++) {
        obj = this.getChildAt(startIndex + i);
        this.setChildIndex(obj, insertIndex + i);
      }
    } else {
      for (i = 0; i < cnt; i++) {
        obj = this.getChildAt(startIndex);
        this.setChildIndex(obj, insertIndex);
      }
    }
  }
  getFolderEndIndex(startIndex, level) {
    var cnt = this.numChildren;
    for (var i = startIndex + 1; i < cnt; i++) {
      var node = this.getChildAt(i)._treeNode;
      if (node.level <= level)
        return i;
    }
    return cnt;
  }
  checkChildren(folderNode, index) {
    var cnt = folderNode.numChildren;
    for (var i = 0; i < cnt; i++) {
      index++;
      var node = folderNode.getChildAt(i);
      if (node._cell == null)
        this.createCell(node);
      if (!node._cell.parent)
        this.addChildAt(node._cell, index);
      if (node.isFolder && node.expanded)
        index = this.checkChildren(node, index);
    }
    return index;
  }
  hideFolderNode(folderNode) {
    var cnt = folderNode.numChildren;
    for (var i = 0; i < cnt; i++) {
      var node = folderNode.getChildAt(i);
      if (node._cell)
        this.removeChild(node._cell);
      if (node.isFolder && node.expanded)
        this.hideFolderNode(node);
    }
  }
  removeNode(node) {
    if (node._cell) {
      if (node._cell.parent)
        this.removeChild(node._cell);
      this.returnToPool(node._cell);
      node._cell._treeNode = null;
      node._cell = null;
    }
    if (node.isFolder) {
      var cnt = node.numChildren;
      for (var i = 0; i < cnt; i++) {
        var node2 = node.getChildAt(i);
        this.removeNode(node2);
      }
    }
  }
  __cellMouseDown(evt) {
    var node = GObject.cast(evt.currentTarget)._treeNode;
    this._expandedStatusInEvt = node.expanded;
  }
  __expandedStateChanged(cc) {
    var node = cc.parent._treeNode;
    node.expanded = cc.selectedIndex == 1;
  }
  dispatchItemEvent(item, evt) {
    if (this._clickToExpand != 0) {
      var node = item._treeNode;
      if (node && this._expandedStatusInEvt == node.expanded) {
        if (this._clickToExpand == 2) ;
        else
          node.expanded = !node.expanded;
      }
    }
    super.dispatchItemEvent(item, evt);
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 9);
    this._indent = buffer.readInt();
    this._clickToExpand = buffer.readByte();
  }
  readItems(buffer) {
    var cnt;
    var i;
    var nextPos;
    var str;
    var isFolder;
    var lastNode;
    var level;
    var prevLevel = 0;
    cnt = buffer.readShort();
    for (i = 0; i < cnt; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      str = buffer.readS();
      if (str == null) {
        str = this.defaultItem;
        if (!str) {
          buffer.position = nextPos;
          continue;
        }
      }
      isFolder = buffer.readBool();
      level = buffer.readByte();
      var node = new GTreeNode(isFolder, str);
      node.expanded = true;
      if (i == 0)
        this._rootNode.addChild(node);
      else {
        if (level > prevLevel)
          lastNode.addChild(node);
        else if (level < prevLevel) {
          for (var j = level; j <= prevLevel; j++)
            lastNode = lastNode.parent;
          lastNode.addChild(node);
        } else
          lastNode.parent.addChild(node);
      }
      lastNode = node;
      prevLevel = level;
      this.setupItem(buffer, node.cell);
      buffer.position = nextPos;
    }
  }
};
var s_list = new Array();
var GComboBox = class extends GComponent {
  constructor() {
    super();
    this._visibleItemCount = 0;
    this._selectedIndex = 0;
    this._popupDirection = PopupDirection.Auto;
    this._node.name = "GComboBox";
    this._visibleItemCount = UIConfig.defaultComboBoxVisibleItemCount;
    this._itemsUpdated = true;
    this._selectedIndex = -1;
    this._items = [];
    this._values = [];
  }
  get text() {
    if (this._titleObject)
      return this._titleObject.text;
    else
      return null;
  }
  set text(value) {
    if (this._titleObject)
      this._titleObject.text = value;
    this.updateGear(6);
  }
  get icon() {
    if (this._iconObject)
      return this._iconObject.icon;
    else
      return null;
  }
  set icon(value) {
    if (this._iconObject)
      this._iconObject.icon = value;
    this.updateGear(7);
  }
  get titleColor() {
    var tf = this.getTextField();
    if (tf)
      return tf.color;
    else
      return import_cc.Color.BLACK;
  }
  set titleColor(value) {
    var tf = this.getTextField();
    if (tf)
      tf.color = value;
  }
  get titleFontSize() {
    var tf = this.getTextField();
    if (tf)
      return tf.fontSize;
    else
      return 0;
  }
  set titleFontSize(value) {
    var tf = this.getTextField();
    if (tf)
      tf.fontSize = value;
  }
  get visibleItemCount() {
    return this._visibleItemCount;
  }
  set visibleItemCount(value) {
    this._visibleItemCount = value;
  }
  get popupDirection() {
    return this._popupDirection;
  }
  set popupDirection(value) {
    this._popupDirection = value;
  }
  get items() {
    return this._items;
  }
  set items(value) {
    if (!value)
      this._items.length = 0;
    else
      this._items = value.concat();
    if (this._items.length > 0) {
      if (this._selectedIndex >= this._items.length)
        this._selectedIndex = this._items.length - 1;
      else if (this._selectedIndex == -1)
        this._selectedIndex = 0;
      this.text = this._items[this._selectedIndex];
      if (this._icons && this._selectedIndex < this._icons.length)
        this.icon = this._icons[this._selectedIndex];
    } else {
      this.text = "";
      if (this._icons)
        this.icon = null;
      this._selectedIndex = -1;
    }
    this._itemsUpdated = true;
  }
  get icons() {
    return this._icons;
  }
  set icons(value) {
    this._icons = value;
    if (this._icons && this._selectedIndex != -1 && this._selectedIndex < this._icons.length)
      this.icon = this._icons[this._selectedIndex];
  }
  get values() {
    return this._values;
  }
  set values(value) {
    if (!value)
      this._values.length = 0;
    else
      this._values = value.concat();
  }
  get selectedIndex() {
    return this._selectedIndex;
  }
  set selectedIndex(val) {
    if (this._selectedIndex == val)
      return;
    this._selectedIndex = val;
    if (this._selectedIndex >= 0 && this._selectedIndex < this._items.length) {
      this.text = this._items[this._selectedIndex];
      if (this._icons && this._selectedIndex < this._icons.length)
        this.icon = this._icons[this._selectedIndex];
    } else {
      this.text = "";
      if (this._icons)
        this.icon = null;
    }
    this.updateSelectionController();
  }
  get value() {
    return this._values[this._selectedIndex];
  }
  set value(val) {
    var index = this._values.indexOf(val);
    if (index == -1 && val == null)
      index = this._values.indexOf("");
    this.selectedIndex = index;
  }
  get selectionController() {
    return this._selectionController;
  }
  set selectionController(value) {
    this._selectionController = value;
  }
  getTextField() {
    if (this._titleObject instanceof GTextField)
      return this._titleObject;
    else if ("getTextField" in this._titleObject)
      return this._titleObject.getTextField();
    else
      return null;
  }
  setState(val) {
    if (this._buttonController)
      this._buttonController.selectedPage = val;
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.titleColor;
      case ObjectPropID.OutlineColor: {
        var tf = this.getTextField();
        if (tf)
          return tf.strokeColor;
        else
          return 0;
      }
      case ObjectPropID.FontSize: {
        tf = this.getTextField();
        if (tf)
          return tf.fontSize;
        else
          return 0;
      }
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.titleColor = value;
        break;
      case ObjectPropID.OutlineColor:
        {
          var tf = this.getTextField();
          if (tf)
            tf.strokeColor = value;
        }
        break;
      case ObjectPropID.FontSize:
        {
          tf = this.getTextField();
          if (tf)
            tf.fontSize = value;
        }
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  constructExtension(buffer) {
    var str;
    this._buttonController = this.getController("button");
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
    str = buffer.readS();
    if (str) {
      let obj = UIPackage.createObjectFromURL(str);
      if (!(obj instanceof GComponent)) {
        console.error("\u4E0B\u62C9\u6846\u5FC5\u987B\u4E3A\u5143\u4EF6");
        return;
      }
      this.dropdown = obj;
      this.dropdown.name = "this.dropdown";
      this._list = this.dropdown.getChild("list", GList);
      if (this._list == null) {
        console.error(this.resourceURL + ": \u4E0B\u62C9\u6846\u7684\u5F39\u51FA\u5143\u4EF6\u91CC\u5FC5\u987B\u5305\u542B\u540D\u4E3Alist\u7684\u5217\u8868");
        return;
      }
      this._list.on(Event.CLICK_ITEM, this.onClickItem, this);
      this._list.addRelation(this.dropdown, RelationType.Width);
      this._list.removeRelation(this.dropdown, RelationType.Height);
      this.dropdown.addRelation(this._list, RelationType.Height);
      this.dropdown.removeRelation(this._list, RelationType.Width);
      this.dropdown.on(Event.UNDISPLAY, this.onPopupClosed, this);
    }
    this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
    this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);
    this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);
    this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);
  }
  constructExtensionFromXML(attrs, items) {
    const dropdownUrl = attrs === null || attrs === void 0 ? void 0 : attrs.dropdown;
    this._buttonController = this.getController("button");
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
    if (dropdownUrl) {
      const obj = UIPackage.createObjectFromURL(dropdownUrl);
      if (!(obj instanceof GComponent)) {
        console.error("\u4E0B\u62C9\u6846\u5FC5\u987B\u4E3A\u5143\u4EF6");
        return;
      }
      this.dropdown = obj;
      this.dropdown.name = "this.dropdown";
      this._list = this.dropdown.getChild("list", GList);
      if (this._list == null) {
        console.error(this.resourceURL + ": \u4E0B\u62C9\u6846\u7684\u5F39\u51FA\u5143\u4EF6\u91CC\u5FC5\u987B\u5305\u542B\u540D\u4E3Alist\u7684\u5217\u8868");
        return;
      }
      this._list.on(Event.CLICK_ITEM, this.onClickItem, this);
      this._list.addRelation(this.dropdown, RelationType.Width);
      this._list.removeRelation(this.dropdown, RelationType.Height);
      this.dropdown.addRelation(this._list, RelationType.Height);
      this.dropdown.removeRelation(this._list, RelationType.Width);
      this.dropdown.on(Event.UNDISPLAY, this.onPopupClosed, this);
    }
    this._node.on(Event.TOUCH_BEGIN, this.onTouchBegin_1, this);
    this._node.on(Event.TOUCH_END, this.onTouchEnd_1, this);
    this._node.on(Event.ROLL_OVER, this.onRollOver_1, this);
    this._node.on(Event.ROLL_OUT, this.onRollOut_1, this);
  }
  applyExtensionFromXML(attrs, items) {
    var _a, _b, _c;
    if (items && items.length > 0) {
      const comboItems = [];
      const comboValues = [];
      let comboIcons;
      let selectedIndex = -1;
      for (let i = 0; i < items.length; i++) {
        const itemAttrs = items[i].attrs;
        const title = (_a = itemAttrs.title) !== null && _a !== void 0 ? _a : "";
        const value = (_b = itemAttrs.value) !== null && _b !== void 0 ? _b : title;
        comboItems.push(title);
        comboValues.push(value);
        if (itemAttrs.icon != null) {
          if (!comboIcons)
            comboIcons = new Array(items.length);
          comboIcons[i] = itemAttrs.icon;
        }
        const selectedValue = (_c = itemAttrs.checked) !== null && _c !== void 0 ? _c : itemAttrs.selected;
        if (selectedValue != null && XMLPackageBuilder.readBool(selectedValue, false))
          selectedIndex = i;
      }
      this.items = comboItems;
      this.values = comboValues;
      if (comboIcons)
        this.icons = comboIcons;
      else
        this._icons = void 0;
      if (selectedIndex >= 0)
        this.selectedIndex = selectedIndex;
    }
    if (!attrs)
      return;
    if (attrs.titleColor)
      this.titleColor = XMLPackageBuilder.parseColor(attrs.titleColor);
    if (attrs.titleFontSize)
      this.titleFontSize = XMLPackageBuilder.readNumber(attrs.titleFontSize, this.titleFontSize);
    if (attrs.visibleItemCount != null)
      this._visibleItemCount = Math.trunc(XMLPackageBuilder.readNumber(attrs.visibleItemCount, this._visibleItemCount));
    if (attrs.popupDirection)
      this._popupDirection = XMLPackageBuilder.parsePopupDirection(attrs.popupDirection);
    if (attrs.selectionController && this.parent) {
      const controller = this.parent.getController(attrs.selectionController);
      if (controller)
        this._selectionController = controller;
    }
    if (attrs.value != null)
      this.value = attrs.value;
    else if (attrs.selectedIndex != null)
      this.selectedIndex = Math.trunc(XMLPackageBuilder.readNumber(attrs.selectedIndex, this._selectedIndex));
    else if (attrs.title != null) {
      const matchedIndex = this._items.indexOf(attrs.title);
      if (matchedIndex >= 0)
        this.selectedIndex = matchedIndex;
      else
        this.text = attrs.title;
    }
    if (attrs.icon != null)
      this.icon = attrs.icon;
  }
  handleControllerChanged(c) {
    super.handleControllerChanged(c);
    if (this._selectionController == c)
      this.selectedIndex = c.selectedIndex;
  }
  updateSelectionController() {
    if (this._selectionController && !this._selectionController.changing && this._selectedIndex < this._selectionController.pageCount) {
      var c = this._selectionController;
      this._selectionController = null;
      c.selectedIndex = this._selectedIndex;
      this._selectionController = c;
    }
  }
  dispose() {
    if (this.dropdown) {
      this.dropdown.dispose();
      this.dropdown = null;
    }
    super.dispose();
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!buffer.seek(beginPos, 6))
      return;
    if (buffer.readByte() != this.packageItem.objectType)
      return;
    var i;
    var iv;
    var nextPos;
    var str;
    var itemCount = buffer.readShort();
    for (i = 0; i < itemCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      this._items[i] = buffer.readS();
      this._values[i] = buffer.readS();
      str = buffer.readS();
      if (str != null) {
        if (this._icons == null)
          this._icons = new Array();
        this._icons[i] = str;
      }
      buffer.position = nextPos;
    }
    str = buffer.readS();
    if (str != null) {
      this.text = str;
      this._selectedIndex = this._items.indexOf(str);
    } else if (this._items.length > 0) {
      this._selectedIndex = 0;
      this.text = this._items[0];
    } else
      this._selectedIndex = -1;
    str = buffer.readS();
    if (str != null)
      this.icon = str;
    if (buffer.readBool())
      this.titleColor = buffer.readColor();
    iv = buffer.readInt();
    if (iv > 0)
      this._visibleItemCount = iv;
    this._popupDirection = buffer.readByte();
    iv = buffer.readShort();
    if (iv >= 0)
      this._selectionController = this.parent.getControllerAt(iv);
  }
  showDropdown() {
    if (this._itemsUpdated) {
      this._itemsUpdated = false;
      this._list.removeChildrenToPool();
      let cnt = this._items.length;
      for (let i = 0; i < cnt; i++) {
        let item = this._list.addItemFromPool();
        item.name = i < this._values.length ? this._values[i] : "";
        item.text = this._items[i];
        item.icon = this._icons && i < this._icons.length ? this._icons[i] : null;
      }
      this._list.resizeToFit(this._visibleItemCount);
    }
    this._list.selectedIndex = -1;
    this.dropdown.width = this.width;
    this._list.ensureBoundsCorrect();
    GRoot.inst.togglePopup(this.dropdown, this, this._popupDirection);
    if (this.dropdown.parent)
      this.setState(GButton.DOWN);
  }
  onPopupClosed() {
    if (this._over)
      this.setState(GButton.OVER);
    else
      this.setState(GButton.UP);
  }
  onClickItem(itemObject) {
    let _t = this;
    let index = this._list.getChildIndex(itemObject);
    this._partner.callLater((dt) => {
      _t.onClickItem2(index);
    }, 0.1);
  }
  onClickItem2(index) {
    if (this.dropdown.parent instanceof GRoot)
      this.dropdown.parent.hidePopup();
    this._selectedIndex = -1;
    this.selectedIndex = index;
    this._node.emit(Event.STATUS_CHANGED, this);
  }
  onRollOver_1() {
    this._over = true;
    if (this._down || this.dropdown && this.dropdown.parent)
      return;
    this.setState(GButton.OVER);
  }
  onRollOut_1() {
    this._over = false;
    if (this._down || this.dropdown && this.dropdown.parent)
      return;
    this.setState(GButton.UP);
  }
  onTouchBegin_1(evt) {
    if (evt.button != import_cc.EventMouse.BUTTON_LEFT)
      return;
    if (evt.initiator instanceof GTextInput && evt.initiator.editable)
      return;
    this._down = true;
    evt.captureTouch();
    if (this.dropdown)
      this.showDropdown();
  }
  onTouchEnd_1(evt) {
    if (evt.button != import_cc.EventMouse.BUTTON_LEFT)
      return;
    if (this._down) {
      this._down = false;
      if (this.dropdown && !this.dropdown.parent) {
        if (this._over)
          this.setState(GButton.OVER);
        else
          this.setState(GButton.UP);
      }
    }
  }
};
var GLabel = class extends GComponent {
  constructor() {
    super();
    this._node.name = "GLabel";
  }
  get icon() {
    if (this._iconObject)
      return this._iconObject.icon;
  }
  set icon(value) {
    if (this._iconObject)
      this._iconObject.icon = value;
    this.updateGear(7);
  }
  get title() {
    if (this._titleObject)
      return this._titleObject.text;
    else
      return null;
  }
  set title(value) {
    if (this._titleObject)
      this._titleObject.text = value;
    this.updateGear(6);
  }
  get text() {
    return this.title;
  }
  set text(value) {
    this.title = value;
  }
  get titleColor() {
    var tf = this.getTextField();
    if (tf)
      return tf.color;
    else
      return import_cc.Color.WHITE;
  }
  set titleColor(value) {
    var tf = this.getTextField();
    if (tf)
      tf.color = value;
    this.updateGear(4);
  }
  get titleFontSize() {
    var tf = this.getTextField();
    if (tf)
      return tf.fontSize;
    else
      return 0;
  }
  set titleFontSize(value) {
    var tf = this.getTextField();
    if (tf)
      tf.fontSize = value;
  }
  set editable(val) {
    if (this._titleObject && this._titleObject instanceof GTextInput)
      this._titleObject.editable = val;
  }
  get editable() {
    if (this._titleObject && this._titleObject instanceof GTextInput)
      return this._titleObject.editable;
    else
      return false;
  }
  getTextField() {
    if (this._titleObject instanceof GTextField)
      return this._titleObject;
    else if ("getTextField" in this._titleObject)
      return this._titleObject.getTextField();
    else
      return null;
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.titleColor;
      case ObjectPropID.OutlineColor: {
        var tf = this.getTextField();
        if (tf)
          return tf.strokeColor;
        else
          return 0;
      }
      case ObjectPropID.FontSize:
        return this.titleFontSize;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.titleColor = value;
        break;
      case ObjectPropID.OutlineColor:
        {
          var tf = this.getTextField();
          if (tf)
            tf.strokeColor = value;
        }
        break;
      case ObjectPropID.FontSize:
        this.titleFontSize = value;
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  constructExtension(buffer) {
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
  }
  constructExtensionFromXML(attrs, items) {
    this._titleObject = this.getChild("title");
    this._iconObject = this.getChild("icon");
  }
  applyExtensionFromXML(attrs, items) {
    if (!attrs)
      return;
    if (attrs.title != null)
      this.title = attrs.title;
    if (attrs.icon != null)
      this.icon = attrs.icon;
    if (attrs.titleColor)
      this.titleColor = XMLPackageBuilder.parseColor(attrs.titleColor);
    if (attrs.titleFontSize)
      this.titleFontSize = XMLPackageBuilder.readNumber(attrs.titleFontSize, this.titleFontSize);
    if (this._titleObject instanceof GTextInput) {
      if (attrs.prompt)
        this._titleObject.promptText = attrs.prompt;
      if (attrs.maxLength)
        this._titleObject.maxLength = XMLPackageBuilder.readNumber(attrs.maxLength, this._titleObject.maxLength);
      if (attrs.password)
        this._titleObject.password = XMLPackageBuilder.readBool(attrs.password, false);
    }
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!buffer.seek(beginPos, 6))
      return;
    if (buffer.readByte() != this.packageItem.objectType)
      return;
    var str;
    str = buffer.readS();
    if (str != null)
      this.title = str;
    str = buffer.readS();
    if (str != null)
      this.icon = str;
    if (buffer.readBool())
      this.titleColor = buffer.readColor();
    var iv = buffer.readInt();
    if (iv != 0)
      this.titleFontSize = iv;
    if (buffer.readBool()) {
      var input = this.getTextField();
      if (input instanceof GTextInput) {
        str = buffer.readS();
        if (str != null)
          input.promptText = str;
        str = buffer.readS();
        if (str != null)
          input.restrict = str;
        iv = buffer.readInt();
        if (iv != 0)
          input.maxLength = iv;
        iv = buffer.readInt();
        if (buffer.readBool())
          input.password = true;
      } else
        buffer.skip(13);
    }
    str = buffer.readS();
    if (str != null) {
      this._sound = str;
      if (buffer.readBool()) {
        this._soundVolumeScale = buffer.readFloat();
      }
      this._node.on(Event.CLICK, this.onClick_1, this);
    }
  }
  onClick_1() {
    if (this._sound) {
      var pi = UIPackage.getItemByURL(this._sound);
      if (pi) {
        var sound = pi.owner.getItemAsset(pi);
        if (sound)
          GRoot.inst.playOneShotSound(sound, this._soundVolumeScale);
      }
    }
  }
};
var GLoader = class _GLoader extends GObject {
  constructor() {
    super();
    this._frame = 0;
    this._node.name = "GLoader";
    this._playing = true;
    this._url = "";
    this._fill = LoaderFillType.None;
    this._align = AlignType.Left;
    this._verticalAlign = VertAlignType.Top;
    this._showErrorSign = true;
    this._color = new import_cc.Color(255, 255, 255, 255);
    this._container = new import_cc.Node("Image");
    this._container.layer = UIConfig.defaultUILayer;
    this._containerUITrans = this._container.addComponent(import_cc.UITransform);
    this._containerUITrans.setAnchorPoint(0, 1);
    this._node.addChild(this._container);
    this._content = this._container.addComponent(MovieClip);
    this._content.sizeMode = import_cc.Sprite.SizeMode.CUSTOM;
    this._content.trim = false;
    this._content.setPlaySettings();
  }
  dispose() {
    if (this._contentItem == null) {
      if (this._content.spriteFrame)
        this.freeExternal(this._content.spriteFrame);
    }
    if (this._content2)
      this._content2.dispose();
    super.dispose();
  }
  get url() {
    return this._url;
  }
  set url(value) {
    if (this._url == value)
      return;
    this._url = value;
    this.loadContent();
    this.updateGear(7);
  }
  /**
   * 设置图片
   * @param url
   * @param bundleStr 远程包名称
   */
  setUrlWithBundle(url, bundleStr = "") {
    this.bundle = bundleStr;
    this.url = url;
  }
  set bundle(val) {
    this._assetBundle = val;
  }
  get bundle() {
    if (this._assetBundle) {
      return this._assetBundle;
    }
    return UIConfig.loaderAssetsBundleName;
  }
  get icon() {
    return this._url;
  }
  set icon(value) {
    this.url = value;
  }
  get align() {
    return this._align;
  }
  set align(value) {
    if (this._align != value) {
      this._align = value;
      this.updateLayout();
    }
  }
  get verticalAlign() {
    return this._verticalAlign;
  }
  set verticalAlign(value) {
    if (this._verticalAlign != value) {
      this._verticalAlign = value;
      this.updateLayout();
    }
  }
  get fill() {
    return this._fill;
  }
  set fill(value) {
    if (this._fill != value) {
      this._fill = value;
      this.updateLayout();
    }
  }
  get shrinkOnly() {
    return this._shrinkOnly;
  }
  set shrinkOnly(value) {
    if (this._shrinkOnly != value) {
      this._shrinkOnly = value;
      this.updateLayout();
    }
  }
  get autoSize() {
    return this._autoSize;
  }
  set autoSize(value) {
    if (this._autoSize != value) {
      this._autoSize = value;
      this.updateLayout();
    }
  }
  get playing() {
    return this._playing;
  }
  set playing(value) {
    if (this._playing != value) {
      this._playing = value;
      if (this._content instanceof MovieClip)
        this._content.playing = value;
      this.updateGear(5);
    }
  }
  get frame() {
    return this._frame;
  }
  set frame(value) {
    if (this._frame != value) {
      this._frame = value;
      if (this._content instanceof MovieClip)
        this._content.frame = value;
      this.updateGear(5);
    }
  }
  get color() {
    return this._color;
  }
  set color(value) {
    this._color.set(value);
    this.updateGear(4);
    this._content.color = value;
  }
  get fillMethod() {
    return this._content.fillMethod;
  }
  set fillMethod(value) {
    this._content.fillMethod = value;
  }
  get fillOrigin() {
    return this._content.fillOrigin;
  }
  set fillOrigin(value) {
    this._content.fillOrigin = value;
  }
  get fillClockwise() {
    return this._content.fillClockwise;
  }
  set fillClockwise(value) {
    this._content.fillClockwise = value;
  }
  get fillAmount() {
    return this._content.fillAmount;
  }
  set fillAmount(value) {
    this._content.fillAmount = value;
  }
  get showErrorSign() {
    return this._showErrorSign;
  }
  set showErrorSign(value) {
    this._showErrorSign = value;
  }
  get component() {
    return this._content2;
  }
  get texture() {
    return this._content.spriteFrame;
  }
  set texture(value) {
    this.url = null;
    this._content.spriteFrame = value;
    this._content.type = import_cc.Sprite.Type.SIMPLE;
    if (value != null) {
      this.sourceWidth = value.rect.width;
      this.sourceHeight = value.rect.height;
    } else {
      this.sourceWidth = this.sourceHeight = 0;
    }
    this.updateLayout();
  }
  loadContent() {
    this.clearContent();
    if (!this._url)
      return;
    if (this._url.startsWith("ui://"))
      this.loadFromPackage(this._url);
    else
      this.loadExternal();
  }
  loadFromPackage(itemURL) {
    let contentItem = UIPackage.getItemByURL(itemURL);
    this._contentItem = contentItem;
    if (!contentItem) {
      this.setErrorState();
      return;
    }
    contentItem = contentItem.getBranch();
    this.sourceWidth = contentItem.width;
    this.sourceHeight = contentItem.height;
    contentItem = contentItem.getHighResolution();
    contentItem.load();
    if (this._autoSize)
      this.setSize(this.sourceWidth, this.sourceHeight);
    if (contentItem.type == PackageItemType.Image) {
      if (!contentItem.asset) {
        this.setErrorState();
      } else {
        this._content.spriteFrame = contentItem.asset;
        if (this._content.fillMethod == 0) {
          if (contentItem.scale9Grid)
            this._content.type = import_cc.Sprite.Type.SLICED;
          else if (contentItem.scaleByTile)
            this._content.type = import_cc.Sprite.Type.TILED;
          else
            this._content.type = import_cc.Sprite.Type.SIMPLE;
        } else {
          this._content.type = import_cc.Sprite.Type.FILLED;
        }
        this.updateLayout();
      }
    } else if (contentItem.type == PackageItemType.MovieClip) {
      this._content.interval = contentItem.interval;
      this._content.swing = contentItem.swing;
      this._content.repeatDelay = contentItem.repeatDelay;
      this._content.frames = contentItem.frames;
      this.updateLayout();
    } else if (contentItem.type == PackageItemType.Component) {
      var obj = UIPackage.createObjectFromURL(itemURL);
      if (!obj)
        this.setErrorState();
      else if (!(obj instanceof GComponent)) {
        obj.dispose();
        this.setErrorState();
      } else {
        this._content2 = obj;
        this._container.addChild(this._content2.node);
        this.updateLayout();
      }
    } else
      this.setErrorState();
  }
  loadExternal() {
    let url = this.url;
    let callback = (err, asset) => {
      if (this._url != url || !(0, import_cc.isValid)(this._node))
        return;
      if (err)
        console.warn(err);
      if (asset instanceof import_cc.SpriteFrame)
        this.onExternalLoadSuccess(asset);
      else if (asset instanceof import_cc.Texture2D) {
        let sf = new import_cc.SpriteFrame();
        sf.texture = asset;
        this.onExternalLoadSuccess(sf);
      } else if (asset instanceof import_cc.ImageAsset) {
        let texture = new import_cc.Texture2D();
        texture.image = asset;
        let sf = new import_cc.SpriteFrame();
        sf.texture = texture;
        this.onExternalLoadSuccess(sf);
      } else {
        console.warn("GLoader:cant load", this.url);
      }
    };
    if (this._url.startsWith("http://") || this._url.startsWith("https://") || this._url.startsWith("/"))
      import_cc.assetManager.loadRemote(this._url, callback);
    else if (this._url.startsWith("data:image/")) {
      const img = new Image();
      img.src = this._url;
      img.onload = () => {
        const tex = new import_cc.Texture2D();
        tex.reset({
          width: img.width,
          height: img.height
        });
        tex.uploadData(img, 0, 0);
        callback(null, tex);
      };
    } else {
      let bundle = import_cc.resources;
      if (this.bundle && import_cc.assetManager.bundles.has(this.bundle)) {
        bundle = import_cc.assetManager.getBundle(this.bundle);
      }
      bundle.load(this._url + "/spriteFrame", import_cc.Asset, callback);
    }
  }
  freeExternal(texture) {
  }
  onExternalLoadSuccess(texture) {
    this._content.spriteFrame = texture;
    this._content.type = import_cc.Sprite.Type.SIMPLE;
    this.sourceWidth = texture.originalSize.width;
    this.sourceHeight = texture.originalSize.height;
    if (this._autoSize)
      this.setSize(this.sourceWidth, this.sourceHeight);
    this.updateLayout();
  }
  onExternalLoadFailed() {
    this.setErrorState();
  }
  setErrorState() {
    if (!this._showErrorSign)
      return;
    if (this._errorSign == null) {
      if (UIConfig.loaderErrorSign != null) {
        this._errorSign = _GLoader._errorSignPool.getObject(UIConfig.loaderErrorSign);
      }
    }
    if (this._errorSign) {
      this._errorSign.setSize(this.width, this.height);
      this._container.addChild(this._errorSign.node);
    }
  }
  clearErrorState() {
    if (this._errorSign) {
      this._container.removeChild(this._errorSign.node);
      _GLoader._errorSignPool.returnObject(this._errorSign);
      this._errorSign = null;
    }
  }
  updateLayout() {
    if (this._content2 == null && this._content == null) {
      if (this._autoSize) {
        this._updatingLayout = true;
        this.setSize(50, 30);
        this._updatingLayout = false;
      }
      return;
    }
    let cw = this.sourceWidth;
    let ch = this.sourceHeight;
    let pivotCorrectX = -this.pivotX * this._width;
    let pivotCorrectY = this.pivotY * this._height;
    if (this._autoSize) {
      this._updatingLayout = true;
      if (cw == 0)
        cw = 50;
      if (ch == 0)
        ch = 30;
      this.setSize(cw, ch);
      this._updatingLayout = false;
      this._containerUITrans.setContentSize(this._width, this._height);
      this._container.setPosition(pivotCorrectX, pivotCorrectY);
      if (this._content2) {
        this._content2.setPosition(pivotCorrectX + this._width * this.pivotX, pivotCorrectY - this._height * this.pivotY);
        this._content2.setScale(1, 1);
      }
      if (cw == this._width && ch == this._height)
        return;
    }
    var sx = 1, sy = 1;
    if (this._fill != LoaderFillType.None) {
      sx = this.width / this.sourceWidth;
      sy = this.height / this.sourceHeight;
      if (sx != 1 || sy != 1) {
        if (this._fill == LoaderFillType.ScaleMatchHeight)
          sx = sy;
        else if (this._fill == LoaderFillType.ScaleMatchWidth)
          sy = sx;
        else if (this._fill == LoaderFillType.Scale) {
          if (sx > sy)
            sx = sy;
          else
            sy = sx;
        } else if (this._fill == LoaderFillType.ScaleNoBorder) {
          if (sx > sy)
            sy = sx;
          else
            sx = sy;
        }
        if (this._shrinkOnly) {
          if (sx > 1)
            sx = 1;
          if (sy > 1)
            sy = 1;
        }
        cw = this.sourceWidth * sx;
        ch = this.sourceHeight * sy;
      }
    }
    this._containerUITrans.setContentSize(cw, ch);
    if (this._content2) {
      this._content2.setPosition(pivotCorrectX + this._width * this.pivotX, pivotCorrectY - this._height * this.pivotY);
      this._content2.setScale(sx, sy);
    }
    var nx, ny;
    if (this._align == AlignType.Left)
      nx = 0;
    else if (this._align == AlignType.Center)
      nx = Math.floor((this._width - cw) / 2);
    else
      nx = this._width - cw;
    if (this._verticalAlign == VertAlignType.Top)
      ny = 0;
    else if (this._verticalAlign == VertAlignType.Middle)
      ny = Math.floor((this._height - ch) / 2);
    else
      ny = this._height - ch;
    ny = -ny;
    this._container.setPosition(pivotCorrectX + nx, pivotCorrectY + ny);
  }
  clearContent() {
    this.clearErrorState();
    if (!this._contentItem) {
      var texture = this._content.spriteFrame;
      if (texture)
        this.freeExternal(texture);
    }
    if (this._content2) {
      this._container.removeChild(this._content2.node);
      this._content2.dispose();
      this._content2 = null;
    }
    this._content.frames = null;
    this._content.spriteFrame = null;
    this._contentItem = null;
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (!this._updatingLayout)
      this.updateLayout();
  }
  handleAnchorChanged() {
    super.handleAnchorChanged();
    if (!this._updatingLayout)
      this.updateLayout();
  }
  handleGrayedChanged() {
    this._content.grayscale = this._grayed;
  }
  _hitTest(pt, globalPt) {
    if (this._content2) {
      let obj = this._content2.hitTest(globalPt);
      if (obj)
        return obj;
    }
    if (pt.x >= 0 && pt.y >= 0 && pt.x < this._width && pt.y < this._height)
      return this;
    else
      return null;
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.color;
      case ObjectPropID.Playing:
        return this.playing;
      case ObjectPropID.Frame:
        return this.frame;
      case ObjectPropID.TimeScale:
        return this._content.timeScale;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.color = value;
        break;
      case ObjectPropID.Playing:
        this.playing = value;
        break;
      case ObjectPropID.Frame:
        this.frame = value;
        break;
      case ObjectPropID.TimeScale:
        this._content.timeScale = value;
        break;
      case ObjectPropID.DeltaTime:
        this._content.advance(value);
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this._url = buffer.readS();
    this._align = buffer.readByte();
    this._verticalAlign = buffer.readByte();
    this._fill = buffer.readByte();
    this._shrinkOnly = buffer.readBool();
    this._autoSize = buffer.readBool();
    this._showErrorSign = buffer.readBool();
    this._playing = buffer.readBool();
    this._frame = buffer.readInt();
    if (buffer.readBool())
      this.color = buffer.readColor();
    this._content.fillMethod = buffer.readByte();
    if (this._content.fillMethod != 0) {
      this._content.fillOrigin = buffer.readByte();
      this._content.fillClockwise = buffer.readBool();
      this._content.fillAmount = buffer.readFloat();
    }
    if (this._url)
      this.loadContent();
  }
};
GLoader._errorSignPool = new GObjectPool();
var GLoader3D = class extends GObject {
  constructor() {
    super();
    this._frame = 0;
    this._node.name = "GLoader3D";
    this._playing = true;
    this._url = "";
    this._fill = LoaderFillType.None;
    this._align = AlignType.Left;
    this._verticalAlign = VertAlignType.Top;
    this._color = new import_cc.Color(255, 255, 255, 255);
    this._container = new import_cc.Node("Wrapper");
    this._container.layer = UIConfig.defaultUILayer;
    this._container.addComponent(import_cc.UITransform).setAnchorPoint(0, 1);
    this._node.addChild(this._container);
  }
  dispose() {
    super.dispose();
  }
  get url() {
    return this._url;
  }
  set url(value) {
    if (this._url == value)
      return;
    this._url = value;
    this.loadContent();
    this.updateGear(7);
  }
  get icon() {
    return this._url;
  }
  set icon(value) {
    this.url = value;
  }
  get align() {
    return this._align;
  }
  set align(value) {
    if (this._align != value) {
      this._align = value;
      this.updateLayout();
    }
  }
  get verticalAlign() {
    return this._verticalAlign;
  }
  set verticalAlign(value) {
    if (this._verticalAlign != value) {
      this._verticalAlign = value;
      this.updateLayout();
    }
  }
  get fill() {
    return this._fill;
  }
  set fill(value) {
    if (this._fill != value) {
      this._fill = value;
      this.updateLayout();
    }
  }
  get shrinkOnly() {
    return this._shrinkOnly;
  }
  set shrinkOnly(value) {
    if (this._shrinkOnly != value) {
      this._shrinkOnly = value;
      this.updateLayout();
    }
  }
  get autoSize() {
    return this._autoSize;
  }
  set autoSize(value) {
    if (this._autoSize != value) {
      this._autoSize = value;
      this.updateLayout();
    }
  }
  get playing() {
    return this._playing;
  }
  set playing(value) {
    if (this._playing != value) {
      this._playing = value;
      this.updateGear(5);
      this.onChange();
    }
  }
  get frame() {
    return this._frame;
  }
  set frame(value) {
    if (this._frame != value) {
      this._frame = value;
      this.updateGear(5);
      this.onChange();
    }
  }
  get animationName() {
    return this._animationName;
  }
  set animationName(value) {
    if (this._animationName != value) {
      this._animationName = value;
      this.onChange();
    }
  }
  get skinName() {
    return this._skinName;
  }
  set skinName(value) {
    if (this._skinName != value) {
      this._skinName = value;
      this.onChange();
    }
  }
  get loop() {
    return this._loop;
  }
  set loop(value) {
    if (this._loop != value) {
      this._loop = value;
      this.onChange();
    }
  }
  get color() {
    return this._color;
  }
  set color(value) {
    this._color.set(value);
    this.updateGear(4);
    if (this._content)
      this._content.color = value;
  }
  get content() {
    return this._content;
  }
  loadContent() {
    this.clearContent();
    if (!this._url)
      return;
    if (this._url.startsWith("ui://"))
      this.loadFromPackage(this._url);
    else
      this.loadExternal();
  }
  loadFromPackage(itemURL) {
    this._contentItem = UIPackage.getItemByURL(itemURL);
    if (this._contentItem) {
      this._contentItem = this._contentItem.getBranch();
      this.sourceWidth = this._contentItem.width;
      this.sourceHeight = this._contentItem.height;
      this._contentItem = this._contentItem.getHighResolution();
      if (this._autoSize)
        this.setSize(this.sourceWidth, this.sourceHeight);
      if (this._contentItem.type == PackageItemType.Spine || this._contentItem.type == PackageItemType.DragonBones)
        this._contentItem.owner.getItemAssetAsync(this._contentItem, this.onLoaded.bind(this));
    }
  }
  onLoaded(err, item) {
    if (this._contentItem != item)
      return;
    if (err)
      console.warn(err);
    if (!this._contentItem.asset)
      return;
    if (this._contentItem.type == PackageItemType.Spine)
      this.setSpine(this._contentItem.asset, this._contentItem.skeletonAnchor);
    else if (this._contentItem.type == PackageItemType.DragonBones)
      this.setDragonBones(this._contentItem.asset, this._contentItem.atlasAsset, this._contentItem.skeletonAnchor);
  }
  setSpine(asset, anchor, pma) {
    this.freeSpine();
    let node = new import_cc.Node();
    this._container.addChild(node);
    node.layer = UIConfig.defaultUILayer;
    node.setPosition(anchor.x, -anchor.y);
    this._content = node.addComponent(import_cc.sp.Skeleton);
    this._content.premultipliedAlpha = pma;
    this._content.skeletonData = asset;
    this._content.color = this._color;
    this.onChangeSpine();
    this.updateLayout();
  }
  freeSpine() {
    if (this._content) {
      this._content.destroy();
    }
  }
  setDragonBones(asset, atlasAsset, anchor, pma) {
    this.freeDragonBones();
    let node = new import_cc.Node();
    node.layer = UIConfig.defaultUILayer;
    this._container.addChild(node);
    node.setPosition(anchor.x, -anchor.y);
    this._content = node.addComponent(import_cc.dragonBones.ArmatureDisplay);
    this._content.premultipliedAlpha = pma;
    this._content.dragonAsset = asset;
    this._content.dragonAtlasAsset = atlasAsset;
    this._content.color = this._color;
    let armatureKey = asset["init"](import_cc.dragonBones.CCFactory.getInstance(), atlasAsset["_uuid"]);
    let dragonBonesData = this._content["_factory"].getDragonBonesData(armatureKey);
    this._content.armatureName = dragonBonesData.armatureNames[0];
    this.onChangeDragonBones();
    this.updateLayout();
  }
  freeDragonBones() {
    if (this._content) {
      this._content.destroy();
    }
  }
  onChange() {
    if (this._contentItem == null)
      return;
    if (this._contentItem.type == PackageItemType.Spine) {
      this.onChangeSpine();
    }
    if (this._contentItem.type == PackageItemType.DragonBones) {
      this.onChangeDragonBones();
    }
  }
  onChangeSpine() {
    var _a;
    if (!(this._content instanceof import_cc.sp.Skeleton))
      return;
    if (this._animationName) {
      let trackEntry = this._content.getCurrent(0);
      if (!trackEntry || trackEntry.animation.name != this._animationName || trackEntry.isComplete() && !trackEntry.loop) {
        this._content.animation = this._animationName;
        trackEntry = this._content.setAnimation(0, this._animationName, this._loop);
      }
      if (this._playing)
        this._content.paused = false;
      else {
        this._content.paused = true;
        trackEntry.trackTime = import_cc.math.lerp(0, trackEntry.animationEnd - trackEntry.animationStart, this._frame / 100);
      }
    } else
      this._content.clearTrack(0);
    let skin = this._skinName || this._content.skeletonData.getRuntimeData().skins[0].name;
    if (((_a = this._content["_skeleton"].skin) === null || _a === void 0 ? void 0 : _a.name) != skin)
      this._content.setSkin(skin);
  }
  onChangeDragonBones() {
    if (!(this._content instanceof import_cc.dragonBones.ArmatureDisplay))
      return;
    if (this._animationName) {
      if (this._playing)
        this._content.playAnimation(this._animationName, this._loop ? 0 : 1);
      else
        this._content.armature().animation.gotoAndStopByFrame(this._animationName, this._frame);
    } else
      this._content.armature().animation.reset();
  }
  loadExternal() {
    if (this._url.startsWith("http://") || this._url.startsWith("https://") || this._url.startsWith("/"))
      import_cc.assetManager.loadRemote(this._url, import_cc.sp.SkeletonData, this.onLoaded2.bind(this));
    else
      import_cc.resources.load(this._url, import_cc.sp.SkeletonData, this.onLoaded2.bind(this));
  }
  onLoaded2(err, asset) {
    if (!this._url || !(0, import_cc.isValid)(this._node))
      return;
    if (err)
      console.warn(err);
  }
  updateLayout() {
    let cw = this.sourceWidth;
    let ch = this.sourceHeight;
    let pivotCorrectX = -this.pivotX * this._width;
    let pivotCorrectY = this.pivotY * this._height;
    if (this._autoSize) {
      this._updatingLayout = true;
      if (cw == 0)
        cw = 50;
      if (ch == 0)
        ch = 30;
      this.setSize(cw, ch);
      this._updatingLayout = false;
      if (cw == this._width && ch == this._height) {
        this._container.setScale(1, 1);
        this._container.setPosition(pivotCorrectX, pivotCorrectY);
        return;
      }
    }
    var sx = 1, sy = 1;
    if (this._fill != LoaderFillType.None) {
      sx = this.width / this.sourceWidth;
      sy = this.height / this.sourceHeight;
      if (sx != 1 || sy != 1) {
        if (this._fill == LoaderFillType.ScaleMatchHeight)
          sx = sy;
        else if (this._fill == LoaderFillType.ScaleMatchWidth)
          sy = sx;
        else if (this._fill == LoaderFillType.Scale) {
          if (sx > sy)
            sx = sy;
          else
            sy = sx;
        } else if (this._fill == LoaderFillType.ScaleNoBorder) {
          if (sx > sy)
            sy = sx;
          else
            sx = sy;
        }
        if (this._shrinkOnly) {
          if (sx > 1)
            sx = 1;
          if (sy > 1)
            sy = 1;
        }
        cw = this.sourceWidth * sx;
        ch = this.sourceHeight * sy;
      }
    }
    this._container.setScale(sx, sy);
    var nx, ny;
    if (this._align == AlignType.Left)
      nx = 0;
    else if (this._align == AlignType.Center)
      nx = Math.floor((this._width - cw) / 2);
    else
      nx = this._width - cw;
    if (this._verticalAlign == VertAlignType.Top)
      ny = 0;
    else if (this._verticalAlign == VertAlignType.Middle)
      ny = Math.floor((this._height - ch) / 2);
    else
      ny = this._height - ch;
    ny = -ny;
    this._container.setPosition(pivotCorrectX + nx, pivotCorrectY + ny);
  }
  clearContent() {
    this._contentItem = null;
    if (this._content) {
      this._content.node.destroy();
      this._content = null;
    }
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (!this._updatingLayout)
      this.updateLayout();
  }
  handleAnchorChanged() {
    super.handleAnchorChanged();
    if (!this._updatingLayout)
      this.updateLayout();
  }
  handleGrayedChanged() {
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.color;
      case ObjectPropID.Playing:
        return this.playing;
      case ObjectPropID.Frame:
        return this.frame;
      case ObjectPropID.TimeScale:
        return 1;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.color = value;
        break;
      case ObjectPropID.Playing:
        this.playing = value;
        break;
      case ObjectPropID.Frame:
        this.frame = value;
        break;
      case ObjectPropID.TimeScale:
        break;
      case ObjectPropID.DeltaTime:
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this._url = buffer.readS();
    this._align = buffer.readByte();
    this._verticalAlign = buffer.readByte();
    this._fill = buffer.readByte();
    this._shrinkOnly = buffer.readBool();
    this._autoSize = buffer.readBool();
    this._animationName = buffer.readS();
    this._skinName = buffer.readS();
    this._playing = buffer.readBool();
    this._frame = buffer.readInt();
    this._loop = buffer.readBool();
    if (buffer.readBool())
      this.color = buffer.readColor();
    if (this._url)
      this.loadContent();
  }
};
var GProgressBar = class extends GComponent {
  constructor() {
    super();
    this._min = 0;
    this._max = 0;
    this._value = 0;
    this._barMaxWidth = 0;
    this._barMaxHeight = 0;
    this._barMaxWidthDelta = 0;
    this._barMaxHeightDelta = 0;
    this._barStartX = 0;
    this._barStartY = 0;
    this._node.name = "GProgressBar";
    this._titleType = ProgressTitleType.Percent;
    this._value = 50;
    this._max = 100;
  }
  get titleType() {
    return this._titleType;
  }
  set titleType(value) {
    if (this._titleType != value) {
      this._titleType = value;
      this.update(this._value);
    }
  }
  get min() {
    return this._min;
  }
  set min(value) {
    if (this._min != value) {
      this._min = value;
      this.update(this._value);
    }
  }
  get max() {
    return this._max;
  }
  set max(value) {
    if (this._max != value) {
      this._max = value;
      this.update(this._value);
    }
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (this._value != value) {
      GTween.kill(this, false, this.update);
      this._value = value;
      this.update(value);
    }
  }
  tweenValue(value, duration) {
    var oldValule;
    var tweener = GTween.getTween(this, this.update);
    if (tweener) {
      oldValule = tweener.value.x;
      tweener.kill();
    } else
      oldValule = this._value;
    this._value = value;
    return GTween.to(oldValule, this._value, duration).setTarget(this, this.update).setEase(EaseType.Linear);
  }
  update(newValue) {
    var percent = import_cc.math.clamp01((newValue - this._min) / (this._max - this._min));
    if (this._titleObject) {
      switch (this._titleType) {
        case ProgressTitleType.Percent:
          this._titleObject.text = Math.floor(percent * 100) + "%";
          break;
        case ProgressTitleType.ValueAndMax:
          this._titleObject.text = Math.floor(newValue) + "/" + Math.floor(this._max);
          break;
        case ProgressTitleType.Value:
          this._titleObject.text = "" + Math.floor(newValue);
          break;
        case ProgressTitleType.Max:
          this._titleObject.text = "" + Math.floor(this._max);
          break;
      }
    }
    var fullWidth = this.width - this._barMaxWidthDelta;
    var fullHeight = this.height - this._barMaxHeightDelta;
    if (!this._reverse) {
      if (this._barObjectH) {
        if (!this.setFillAmount(this._barObjectH, percent))
          this._barObjectH.width = Math.round(fullWidth * percent);
      }
      if (this._barObjectV) {
        if (!this.setFillAmount(this._barObjectV, percent))
          this._barObjectV.height = Math.round(fullHeight * percent);
      }
    } else {
      if (this._barObjectH) {
        if (!this.setFillAmount(this._barObjectH, 1 - percent)) {
          this._barObjectH.width = Math.round(fullWidth * percent);
          this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
        }
      }
      if (this._barObjectV) {
        if (!this.setFillAmount(this._barObjectV, 1 - percent)) {
          this._barObjectV.height = Math.round(fullHeight * percent);
          this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
        }
      }
    }
    if (this._aniObject)
      this._aniObject.setProp(ObjectPropID.Frame, Math.floor(percent * 100));
  }
  setFillAmount(bar, percent) {
    if ((bar instanceof GImage || bar instanceof GLoader) && bar.fillMethod != FillMethod.None) {
      bar.fillAmount = percent;
      return true;
    } else
      return false;
  }
  constructExtension(buffer) {
    buffer.seek(0, 6);
    this._titleType = buffer.readByte();
    this._reverse = buffer.readBool();
    this._titleObject = this.getChild("title");
    this._barObjectH = this.getChild("bar");
    this._barObjectV = this.getChild("bar_v");
    this._aniObject = this.getChild("ani");
    if (this._barObjectH) {
      this._barMaxWidth = this._barObjectH.width;
      this._barMaxWidthDelta = this.width - this._barMaxWidth;
      this._barStartX = this._barObjectH.x;
    }
    if (this._barObjectV) {
      this._barMaxHeight = this._barObjectV.height;
      this._barMaxHeightDelta = this.height - this._barMaxHeight;
      this._barStartY = this._barObjectV.y;
    }
  }
  constructExtensionFromXML(attrs, items) {
    this._titleType = XMLPackageBuilder.parseProgressTitleType(attrs === null || attrs === void 0 ? void 0 : attrs.titleType);
    this._reverse = XMLPackageBuilder.readBool(attrs === null || attrs === void 0 ? void 0 : attrs.reverse, false);
    this._titleObject = this.getChild("title");
    this._barObjectH = this.getChild("bar");
    this._barObjectV = this.getChild("bar_v");
    this._aniObject = this.getChild("ani");
    if (this._barObjectH) {
      this._barMaxWidth = this._barObjectH.width;
      this._barMaxWidthDelta = this.width - this._barMaxWidth;
      this._barStartX = this._barObjectH.x;
    }
    if (this._barObjectV) {
      this._barMaxHeight = this._barObjectV.height;
      this._barMaxHeightDelta = this.height - this._barMaxHeight;
      this._barStartY = this._barObjectV.y;
    }
  }
  applyExtensionFromXML(attrs, items) {
    if (!attrs) {
      this.update(this._value);
      return;
    }
    if (attrs.titleType)
      this.titleType = XMLPackageBuilder.parseProgressTitleType(attrs.titleType);
    if (attrs.value)
      this._value = XMLPackageBuilder.readNumber(attrs.value, this._value);
    if (attrs.max)
      this._max = XMLPackageBuilder.readNumber(attrs.max, this._max);
    if (attrs.min)
      this._min = XMLPackageBuilder.readNumber(attrs.min, this._min);
    this.update(this._value);
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (this._barObjectH)
      this._barMaxWidth = this.width - this._barMaxWidthDelta;
    if (this._barObjectV)
      this._barMaxHeight = this.height - this._barMaxHeightDelta;
    if (!this._underConstruct)
      this.update(this._value);
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!buffer.seek(beginPos, 6)) {
      this.update(this._value);
      return;
    }
    if (buffer.readByte() != this.packageItem.objectType) {
      this.update(this._value);
      return;
    }
    this._value = buffer.readInt();
    this._max = buffer.readInt();
    if (buffer.version >= 2)
      this._min = buffer.readInt();
    this.update(this._value);
  }
};
var GScrollBar = class extends GComponent {
  constructor() {
    super();
    this._node.name = "GScrollBar";
    this._dragOffset = new import_cc.Vec2();
    this._scrollPerc = 0;
  }
  setScrollPane(target, vertical) {
    this._target = target;
    this._vertical = vertical;
  }
  setDisplayPerc(value) {
    if (this._vertical) {
      if (!this._fixedGripSize)
        this._grip.height = Math.floor(value * this._bar.height);
      this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
    } else {
      if (!this._fixedGripSize)
        this._grip.width = Math.floor(value * this._bar.width);
      this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
    }
    this._grip.visible = value != 0 && value != 1;
  }
  setScrollPerc(val) {
    this._scrollPerc = val;
    if (this._vertical)
      this._grip.y = this._bar.y + (this._bar.height - this._grip.height) * this._scrollPerc;
    else
      this._grip.x = this._bar.x + (this._bar.width - this._grip.width) * this._scrollPerc;
  }
  get minSize() {
    if (this._vertical)
      return (this._arrowButton1 ? this._arrowButton1.height : 0) + (this._arrowButton2 ? this._arrowButton2.height : 0);
    else
      return (this._arrowButton1 ? this._arrowButton1.width : 0) + (this._arrowButton2 ? this._arrowButton2.width : 0);
  }
  get gripDragging() {
    return this._gripDragging;
  }
  constructExtension(buffer) {
    buffer.seek(0, 6);
    this._fixedGripSize = buffer.readBool();
    this._grip = this.getChild("grip");
    if (!this._grip) {
      console.error("\u9700\u8981\u5B9A\u4E49grip");
      return;
    }
    this._bar = this.getChild("bar");
    if (!this._bar) {
      console.error("\u9700\u8981\u5B9A\u4E49bar");
      return;
    }
    this._arrowButton1 = this.getChild("arrow1");
    this._arrowButton2 = this.getChild("arrow2");
    this._grip.on(Event.TOUCH_BEGIN, this.onGripTouchDown, this);
    this._grip.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);
    this._grip.on(Event.TOUCH_END, this.onGripTouchEnd, this);
    if (this._arrowButton1)
      this._arrowButton1.on(Event.TOUCH_BEGIN, this.onClickArrow1, this);
    if (this._arrowButton2)
      this._arrowButton2.on(Event.TOUCH_BEGIN, this.onClickArrow2, this);
    this.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
  }
  constructExtensionFromXML(attrs, items) {
    this._fixedGripSize = XMLPackageBuilder.readBool(attrs === null || attrs === void 0 ? void 0 : attrs.fixedGripSize, false);
    this._grip = this.getChild("grip");
    if (!this._grip) {
      console.error("\u9700\u8981\u5B9A\u4E49grip");
      return;
    }
    this._bar = this.getChild("bar");
    if (!this._bar) {
      console.error("\u9700\u8981\u5B9A\u4E49bar");
      return;
    }
    this._arrowButton1 = this.getChild("arrow1");
    this._arrowButton2 = this.getChild("arrow2");
    this._grip.on(Event.TOUCH_BEGIN, this.onGripTouchDown, this);
    this._grip.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);
    this._grip.on(Event.TOUCH_END, this.onGripTouchEnd, this);
    if (this._arrowButton1)
      this._arrowButton1.on(Event.TOUCH_BEGIN, this.onClickArrow1, this);
    if (this._arrowButton2)
      this._arrowButton2.on(Event.TOUCH_BEGIN, this.onClickArrow2, this);
    this.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
  }
  applyExtensionFromXML(attrs, items) {
    if ((attrs === null || attrs === void 0 ? void 0 : attrs.fixedGripSize) != null)
      this._fixedGripSize = XMLPackageBuilder.readBool(attrs.fixedGripSize, this._fixedGripSize);
  }
  onGripTouchDown(evt) {
    evt.propagationStopped = true;
    evt.captureTouch();
    this._gripDragging = true;
    this._target.updateScrollBarVisible();
    this.globalToLocal(evt.pos.x, evt.pos.y, this._dragOffset);
    this._dragOffset.x -= this._grip.x;
    this._dragOffset.y -= this._grip.y;
  }
  onGripTouchMove(evt) {
    if (!this.onStage)
      return;
    var pt = this.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$1);
    if (this._vertical) {
      var curY = pt.y - this._dragOffset.y;
      this._target.setPercY((curY - this._bar.y) / (this._bar.height - this._grip.height), false);
    } else {
      var curX = pt.x - this._dragOffset.x;
      this._target.setPercX((curX - this._bar.x) / (this._bar.width - this._grip.width), false);
    }
  }
  onGripTouchEnd(evt) {
    if (!this.onStage)
      return;
    this._gripDragging = false;
    this._target.updateScrollBarVisible();
  }
  onClickArrow1(evt) {
    evt.propagationStopped = true;
    if (this._vertical)
      this._target.scrollUp();
    else
      this._target.scrollLeft();
  }
  onClickArrow2(evt) {
    evt.propagationStopped = true;
    if (this._vertical)
      this._target.scrollDown();
    else
      this._target.scrollRight();
  }
  onBarTouchBegin(evt) {
    evt.propagationStopped = true;
    var pt = this._grip.globalToLocal(evt.pos.x, evt.pos.y, s_vec2$1);
    if (this._vertical) {
      if (pt.y < 0)
        this._target.scrollUp(4);
      else
        this._target.scrollDown(4);
    } else {
      if (pt.x < 0)
        this._target.scrollLeft(4);
      else
        this._target.scrollRight(4);
    }
  }
};
var s_vec2$1 = new import_cc.Vec2();
var GSlider = class extends GComponent {
  constructor() {
    super();
    this._min = 0;
    this._max = 0;
    this._value = 0;
    this._barMaxWidth = 0;
    this._barMaxHeight = 0;
    this._barMaxWidthDelta = 0;
    this._barMaxHeightDelta = 0;
    this._clickPercent = 0;
    this._barStartX = 0;
    this._barStartY = 0;
    this.changeOnClick = true;
    this.canDrag = true;
    this._node.name = "GSlider";
    this._titleType = ProgressTitleType.Percent;
    this._value = 50;
    this._max = 100;
    this._clickPos = new import_cc.Vec2();
  }
  get titleType() {
    return this._titleType;
  }
  set titleType(value) {
    this._titleType = value;
  }
  get wholeNumbers() {
    return this._wholeNumbers;
  }
  set wholeNumbers(value) {
    if (this._wholeNumbers != value) {
      this._wholeNumbers = value;
      this.update();
    }
  }
  get min() {
    return this._min;
  }
  set min(value) {
    if (this._min != value) {
      this._min = value;
      this.update();
    }
  }
  get max() {
    return this._max;
  }
  set max(value) {
    if (this._max != value) {
      this._max = value;
      this.update();
    }
  }
  get value() {
    return this._value;
  }
  set value(value) {
    if (this._value != value) {
      this._value = value;
      this.update();
    }
  }
  update() {
    this.updateWithPercent((this._value - this._min) / (this._max - this._min));
  }
  updateWithPercent(percent, manual) {
    percent = import_cc.math.clamp01(percent);
    if (manual) {
      var newValue = import_cc.math.clamp(this._min + (this._max - this._min) * percent, this._min, this._max);
      if (this._wholeNumbers) {
        newValue = Math.round(newValue);
        percent = import_cc.math.clamp01((newValue - this._min) / (this._max - this._min));
      }
      if (newValue != this._value) {
        this._value = newValue;
        this._node.emit(Event.STATUS_CHANGED, this);
      }
    }
    if (this._titleObject) {
      switch (this._titleType) {
        case ProgressTitleType.Percent:
          this._titleObject.text = Math.floor(percent * 100) + "%";
          break;
        case ProgressTitleType.ValueAndMax:
          this._titleObject.text = this._value + "/" + this._max;
          break;
        case ProgressTitleType.Value:
          this._titleObject.text = "" + this._value;
          break;
        case ProgressTitleType.Max:
          this._titleObject.text = "" + this._max;
          break;
      }
    }
    var fullWidth = this.width - this._barMaxWidthDelta;
    var fullHeight = this.height - this._barMaxHeightDelta;
    if (!this._reverse) {
      if (this._barObjectH)
        this._barObjectH.width = Math.round(fullWidth * percent);
      if (this._barObjectV)
        this._barObjectV.height = Math.round(fullHeight * percent);
    } else {
      if (this._barObjectH) {
        this._barObjectH.width = Math.round(fullWidth * percent);
        this._barObjectH.x = this._barStartX + (fullWidth - this._barObjectH.width);
      }
      if (this._barObjectV) {
        this._barObjectV.height = Math.round(fullHeight * percent);
        this._barObjectV.y = this._barStartY + (fullHeight - this._barObjectV.height);
      }
    }
  }
  constructExtension(buffer) {
    buffer.seek(0, 6);
    this._titleType = buffer.readByte();
    this._reverse = buffer.readBool();
    if (buffer.version >= 2) {
      this._wholeNumbers = buffer.readBool();
      this.changeOnClick = buffer.readBool();
    }
    this._titleObject = this.getChild("title");
    this._barObjectH = this.getChild("bar");
    this._barObjectV = this.getChild("bar_v");
    this._gripObject = this.getChild("grip");
    if (this._barObjectH) {
      this._barMaxWidth = this._barObjectH.width;
      this._barMaxWidthDelta = this.width - this._barMaxWidth;
      this._barStartX = this._barObjectH.x;
    }
    if (this._barObjectV) {
      this._barMaxHeight = this._barObjectV.height;
      this._barMaxHeightDelta = this.height - this._barMaxHeight;
      this._barStartY = this._barObjectV.y;
    }
    if (this._gripObject) {
      this._gripObject.on(Event.TOUCH_BEGIN, this.onGripTouchBegin, this);
      this._gripObject.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);
    }
    this._node.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
  }
  constructExtensionFromXML(attrs, items) {
    this._titleType = XMLPackageBuilder.parseProgressTitleType(attrs === null || attrs === void 0 ? void 0 : attrs.titleType);
    this._reverse = XMLPackageBuilder.readBool(attrs === null || attrs === void 0 ? void 0 : attrs.reverse, false);
    this._wholeNumbers = XMLPackageBuilder.readBool(attrs === null || attrs === void 0 ? void 0 : attrs.wholeNumbers, false);
    this.changeOnClick = XMLPackageBuilder.readBool(attrs === null || attrs === void 0 ? void 0 : attrs.changeOnClick, true);
    this._titleObject = this.getChild("title");
    this._barObjectH = this.getChild("bar");
    this._barObjectV = this.getChild("bar_v");
    this._gripObject = this.getChild("grip");
    if (this._barObjectH) {
      this._barMaxWidth = this._barObjectH.width;
      this._barMaxWidthDelta = this.width - this._barMaxWidth;
      this._barStartX = this._barObjectH.x;
    }
    if (this._barObjectV) {
      this._barMaxHeight = this._barObjectV.height;
      this._barMaxHeightDelta = this.height - this._barMaxHeight;
      this._barStartY = this._barObjectV.y;
    }
    if (this._gripObject) {
      this._gripObject.on(Event.TOUCH_BEGIN, this.onGripTouchBegin, this);
      this._gripObject.on(Event.TOUCH_MOVE, this.onGripTouchMove, this);
    }
    this._node.on(Event.TOUCH_BEGIN, this.onBarTouchBegin, this);
  }
  applyExtensionFromXML(attrs, items) {
    if (!attrs) {
      this.update();
      return;
    }
    if (attrs.titleType)
      this._titleType = XMLPackageBuilder.parseProgressTitleType(attrs.titleType);
    if (attrs.reverse != null)
      this._reverse = XMLPackageBuilder.readBool(attrs.reverse, this._reverse);
    if (attrs.wholeNumbers != null)
      this._wholeNumbers = XMLPackageBuilder.readBool(attrs.wholeNumbers, this._wholeNumbers);
    if (attrs.changeOnClick != null)
      this.changeOnClick = XMLPackageBuilder.readBool(attrs.changeOnClick, this.changeOnClick);
    if (attrs.value != null)
      this._value = XMLPackageBuilder.readNumber(attrs.value, this._value);
    if (attrs.max != null)
      this._max = XMLPackageBuilder.readNumber(attrs.max, this._max);
    if (attrs.min != null)
      this._min = XMLPackageBuilder.readNumber(attrs.min, this._min);
    this.update();
  }
  handleSizeChanged() {
    super.handleSizeChanged();
    if (this._barObjectH)
      this._barMaxWidth = this.width - this._barMaxWidthDelta;
    if (this._barObjectV)
      this._barMaxHeight = this.height - this._barMaxHeightDelta;
    if (!this._underConstruct)
      this.update();
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    if (!buffer.seek(beginPos, 6)) {
      this.update();
      return;
    }
    if (buffer.readByte() != this.packageItem.objectType) {
      this.update();
      return;
    }
    this._value = buffer.readInt();
    this._max = buffer.readInt();
    if (buffer.version >= 2)
      this._min = buffer.readInt();
    this.update();
  }
  onGripTouchBegin(evt) {
    this.canDrag = true;
    evt.propagationStopped = true;
    evt.captureTouch();
    this._clickPos = this.globalToLocal(evt.pos.x, evt.pos.y);
    this._clickPercent = import_cc.math.clamp01((this._value - this._min) / (this._max - this._min));
  }
  onGripTouchMove(evt) {
    if (!this.canDrag) {
      return;
    }
    var pt = this.globalToLocal(evt.pos.x, evt.pos.y, s_vec2);
    var deltaX = pt.x - this._clickPos.x;
    var deltaY = pt.y - this._clickPos.y;
    if (this._reverse) {
      deltaX = -deltaX;
      deltaY = -deltaY;
    }
    var percent;
    if (this._barObjectH)
      percent = this._clickPercent + deltaX / this._barMaxWidth;
    else
      percent = this._clickPercent + deltaY / this._barMaxHeight;
    this.updateWithPercent(percent, true);
  }
  onBarTouchBegin(evt) {
    if (!this.changeOnClick)
      return;
    var pt = this._gripObject.globalToLocal(evt.pos.x, evt.pos.y, s_vec2);
    var percent = import_cc.math.clamp01((this._value - this._min) / (this._max - this._min));
    var delta = 0;
    if (this._barObjectH != null)
      delta = (pt.x - this._gripObject.width / 2) / this._barMaxWidth;
    if (this._barObjectV != null)
      delta = (pt.y - this._gripObject.height / 2) / this._barMaxHeight;
    if (this._reverse)
      percent -= delta;
    else
      percent += delta;
    this.updateWithPercent(percent, true);
  }
};
var s_vec2 = new import_cc.Vec2();
var UIObjectFactory = class _UIObjectFactory {
  constructor() {
  }
  static setExtension(url, type) {
    if (url == null)
      throw new Error("Invaild url: " + url);
    var pi = UIPackage.getItemByURL(url);
    if (pi)
      pi.extensionType = type;
    _UIObjectFactory.extensions[url] = type;
  }
  static setLoaderExtension(type) {
    _UIObjectFactory.loaderType = type;
  }
  static resolveExtension(pi) {
    var extensionType = _UIObjectFactory.extensions["ui://" + pi.owner.id + pi.id];
    if (!extensionType)
      extensionType = _UIObjectFactory.extensions["ui://" + pi.owner.name + "/" + pi.name];
    if (extensionType)
      pi.extensionType = extensionType;
  }
  static newObject(type, userClass) {
    var obj;
    _UIObjectFactory.counter++;
    if (typeof type === "number") {
      switch (type) {
        case ObjectType.Image:
          return new GImage();
        case ObjectType.MovieClip:
          return new GMovieClip();
        case ObjectType.Component:
          return new GComponent();
        case ObjectType.Text:
          return new GTextField();
        case ObjectType.RichText:
          return new GRichTextField();
        case ObjectType.InputText:
          return new GTextInput();
        case ObjectType.Group:
          return new GGroup();
        case ObjectType.List:
          return new GList();
        case ObjectType.Graph:
          return new GGraph();
        case ObjectType.Loader:
          if (_UIObjectFactory.loaderType)
            return new _UIObjectFactory.loaderType();
          else
            return new GLoader();
        case ObjectType.Button:
          return new GButton();
        case ObjectType.Label:
          return new GLabel();
        case ObjectType.ProgressBar:
          return new GProgressBar();
        case ObjectType.Slider:
          return new GSlider();
        case ObjectType.ScrollBar:
          return new GScrollBar();
        case ObjectType.ComboBox:
          return new GComboBox();
        case ObjectType.Tree:
          return new GTree();
        case ObjectType.Loader3D:
          return new GLoader3D();
        default:
          return null;
      }
    } else {
      if (type.type == PackageItemType.Component) {
        if (userClass)
          obj = new userClass();
        else if (type.extensionType)
          obj = new type.extensionType();
        else
          obj = _UIObjectFactory.newObject(type.objectType);
      } else
        obj = _UIObjectFactory.newObject(type.objectType);
      if (obj)
        obj.packageItem = type;
    }
    return obj;
  }
};
UIObjectFactory.counter = 0;
UIObjectFactory.extensions = {};
Decls.UIObjectFactory = UIObjectFactory;
var RELATION_MAP = {
  "left-left": RelationType.Left_Left,
  "left-center": RelationType.Left_Center,
  "left-right": RelationType.Left_Right,
  "center-center": RelationType.Center_Center,
  "right-left": RelationType.Right_Left,
  "right-center": RelationType.Right_Center,
  "right-right": RelationType.Right_Right,
  "top-top": RelationType.Top_Top,
  "top-middle": RelationType.Top_Middle,
  "top-bottom": RelationType.Top_Bottom,
  "middle-middle": RelationType.Middle_Middle,
  "bottom-top": RelationType.Bottom_Top,
  "bottom-middle": RelationType.Bottom_Middle,
  "bottom-bottom": RelationType.Bottom_Bottom,
  "width": RelationType.Width,
  "width-width": RelationType.Width,
  "height": RelationType.Height,
  "height-height": RelationType.Height,
  "leftext-left": RelationType.LeftExt_Left,
  "leftext-right": RelationType.LeftExt_Right,
  "rightext-left": RelationType.RightExt_Left,
  "rightext-right": RelationType.RightExt_Right,
  "topext-top": RelationType.TopExt_Top,
  "topext-bottom": RelationType.TopExt_Bottom,
  "bottomext-top": RelationType.BottomExt_Top,
  "bottomext-bottom": RelationType.BottomExt_Bottom,
  "size": RelationType.Size,
  "size-size": RelationType.Size
};
var GEAR_INDEX_MAP = {
  gearDisplay: 0,
  gearXY: 1,
  gearSize: 2,
  gearLook: 3,
  gearColor: 4,
  gearAni: 5,
  gearAnimation: 5,
  gearText: 6,
  gearIcon: 7,
  gearDisplay2: 8,
  gearFontSize: 9
};
var BLEND_MODE_MAP = {
  normal: BlendMode.Normal,
  none: BlendMode.None,
  add: BlendMode.Add,
  multiply: BlendMode.Multiply,
  screen: BlendMode.Screen,
  erase: BlendMode.Erase,
  mask: BlendMode.Mask,
  below: BlendMode.Below,
  off: BlendMode.Off,
  custom1: BlendMode.Custom1,
  custom2: BlendMode.Custom2,
  custom3: BlendMode.Custom3
};
var EASE_TYPE_MAP = {
  linear: EaseType.Linear,
  sinein: EaseType.SineIn,
  sineout: EaseType.SineOut,
  sineinout: EaseType.SineInOut,
  quadin: EaseType.QuadIn,
  quadout: EaseType.QuadOut,
  quadinout: EaseType.QuadInOut,
  cubicin: EaseType.CubicIn,
  cubicout: EaseType.CubicOut,
  cubicinout: EaseType.CubicInOut,
  quartin: EaseType.QuartIn,
  quartout: EaseType.QuartOut,
  quartinout: EaseType.QuartInOut,
  quintin: EaseType.QuintIn,
  quintout: EaseType.QuintOut,
  quintinout: EaseType.QuintInOut,
  expoin: EaseType.ExpoIn,
  expoout: EaseType.ExpoOut,
  expoinout: EaseType.ExpoInOut,
  circin: EaseType.CircIn,
  circout: EaseType.CircOut,
  circinout: EaseType.CircInOut,
  elasticin: EaseType.ElasticIn,
  elasticout: EaseType.ElasticOut,
  elasticinout: EaseType.ElasticInOut,
  backin: EaseType.BackIn,
  backout: EaseType.BackOut,
  backinout: EaseType.BackInOut,
  bouncein: EaseType.BounceIn,
  bounceout: EaseType.BounceOut,
  bounceinout: EaseType.BounceInOut
};
var XMLPackageBuilder = class _XMLPackageBuilder {
  static constructComponent(ownerPackage, component, definition) {
    var _a, _b, _c, _d;
    component._underConstruct = true;
    component._buildingDisplayList = true;
    const size = _XMLPackageBuilder.parsePair(definition.attrs.size);
    component.sourceWidth = size.x;
    component.sourceHeight = size.y;
    component.initWidth = size.x;
    component.initHeight = size.y;
    component.setSize(size.x, size.y, true);
    component.assignIdFromXML(definition.attrs.id || component.id);
    if (definition.attrs.name)
      component.name = definition.attrs.name;
    _XMLPackageBuilder.applySharedProps(component, definition.attrs, false);
    _XMLPackageBuilder.applyComponentRootProps(component, definition.attrs);
    _XMLPackageBuilder.addControllers(component, definition.controllers);
    const idMap = /* @__PURE__ */ new Map();
    const nameMap = /* @__PURE__ */ new Map();
    const displayEntries = [];
    const groupQueue = [];
    const relationQueue = [];
    for (const childDefinition of definition.displayList) {
      const child = _XMLPackageBuilder.createDisplayObject(ownerPackage, component, childDefinition);
      component.addChild(child);
      displayEntries.push({ child, definition: childDefinition });
      if (childDefinition.extension && child instanceof GComponent)
        child.applyExtensionFromXML(childDefinition.extension.attrs, childDefinition.extension.items);
      _XMLPackageBuilder.applyGears(component, child, childDefinition.gears);
      const childId = childDefinition.attrs.id;
      if (childId)
        idMap.set(childId, child);
      if (child.name)
        nameMap.set(child.name, child);
      const groupId = childDefinition.attrs.group;
      if (groupId)
        groupQueue.push({ child, groupId });
      if (childDefinition.relations.length > 0)
        relationQueue.push({ child, relations: childDefinition.relations });
    }
    _XMLPackageBuilder.applyGroupAssignments(component, idMap, groupQueue);
    _XMLPackageBuilder.applyComponentRootRefs(ownerPackage, component, definition.attrs, idMap, displayEntries);
    _XMLPackageBuilder.applyRelations(component, idMap, nameMap, relationQueue);
    _XMLPackageBuilder.addTransitions(component, definition.transitions);
    component.applyAllControllers();
    component.constructExtensionFromXML((_a = definition.extension) === null || _a === void 0 ? void 0 : _a.attrs, (_b = definition.extension) === null || _b === void 0 ? void 0 : _b.items);
    component.applyExtensionFromXML((_c = definition.extension) === null || _c === void 0 ? void 0 : _c.attrs, (_d = definition.extension) === null || _d === void 0 ? void 0 : _d.items);
    component.finalizeXMLConstruction();
  }
  static addControllers(component, definitions) {
    for (const definition of definitions) {
      const controller = new Controller();
      controller.name = definition.name;
      controller.autoRadioGroupDepth = definition.autoRadioGroupDepth;
      for (const page of definition.pages)
        controller.addPageWithId(page.id, page.name);
      for (const actionDefinition of definition.actions) {
        const action = _XMLPackageBuilder.createControllerAction(actionDefinition);
        if (action)
          controller.addAction(action);
      }
      component.addController(controller);
      if (definition.selectedIndex >= 0 && definition.selectedIndex < controller.pageCount)
        controller.setSelectedIndex(definition.selectedIndex);
    }
  }
  static addTransitions(component, definitions) {
    for (const definition of definitions)
      component._transitions.push(Transition.createFromXML(component, definition));
  }
  static createDisplayObject(ownerPackage, parent, definition) {
    switch (definition.objectType) {
      case ObjectType.Component:
      case ObjectType.Button:
      case ObjectType.Label:
      case ObjectType.ComboBox:
      case ObjectType.ProgressBar:
      case ObjectType.Slider:
      case ObjectType.ScrollBar:
      case ObjectType.Tree:
        return _XMLPackageBuilder.createComponentReference(ownerPackage, definition);
      case ObjectType.Image:
        return _XMLPackageBuilder.createImage(ownerPackage, definition);
      case ObjectType.MovieClip:
        return _XMLPackageBuilder.createMovieClip(ownerPackage, definition);
      case ObjectType.Text:
      case ObjectType.RichText:
      case ObjectType.InputText:
        return _XMLPackageBuilder.createText(definition);
      case ObjectType.Loader:
        return _XMLPackageBuilder.createLoader(definition);
      case ObjectType.Loader3D:
        return _XMLPackageBuilder.createLoader3D(ownerPackage, definition);
      case ObjectType.Group:
        return _XMLPackageBuilder.createGroup(definition);
      case ObjectType.Graph:
        return _XMLPackageBuilder.createGraph(definition);
      case ObjectType.List:
        return _XMLPackageBuilder.createList(parent, definition);
      default:
        throw new Error(`XML tag '${definition.tag}' is not supported yet.`);
    }
  }
  static createComponentReference(ownerPackage, definition) {
    const item = _XMLPackageBuilder.resolveResourceItem(ownerPackage, definition.attrs.src || "");
    if (!item)
      throw new Error(`Referenced component '${definition.attrs.src}' was not found.`);
    const child = item.owner.internalCreateObject(item);
    _XMLPackageBuilder.applySharedProps(child, definition.attrs, true);
    return child;
  }
  static createImage(ownerPackage, definition) {
    const image = UIObjectFactory.newObject(ObjectType.Image);
    const item = _XMLPackageBuilder.resolveResourceItem(ownerPackage, definition.attrs.src || "");
    if (!item)
      throw new Error(`Referenced image '${definition.attrs.src}' was not found.`);
    image.packageItem = item;
    image.constructFromResource();
    _XMLPackageBuilder.applySharedProps(image, definition.attrs, true);
    _XMLPackageBuilder.applyImageProps(image, definition.attrs);
    return image;
  }
  static createMovieClip(ownerPackage, definition) {
    const movieClip = UIObjectFactory.newObject(ObjectType.MovieClip);
    const item = _XMLPackageBuilder.resolveResourceItem(ownerPackage, definition.attrs.src || "");
    if (!item)
      throw new Error(`Referenced movieclip '${definition.attrs.src}' was not found.`);
    movieClip.packageItem = item;
    movieClip.constructFromResource();
    _XMLPackageBuilder.applySharedProps(movieClip, definition.attrs, true);
    _XMLPackageBuilder.applyMovieClipProps(movieClip, definition.attrs);
    return movieClip;
  }
  static createText(definition) {
    const textObject = UIObjectFactory.newObject(definition.objectType);
    _XMLPackageBuilder.applySharedProps(textObject, definition.attrs, true);
    _XMLPackageBuilder.applyTextProps(textObject, definition.attrs);
    return textObject;
  }
  static createLoader(definition) {
    const loader = UIObjectFactory.newObject(ObjectType.Loader);
    _XMLPackageBuilder.applySharedProps(loader, definition.attrs, true);
    _XMLPackageBuilder.applyLoaderProps(loader, definition.attrs);
    return loader;
  }
  static createLoader3D(ownerPackage, definition) {
    const loader = UIObjectFactory.newObject(ObjectType.Loader3D);
    _XMLPackageBuilder.applySharedProps(loader, definition.attrs, true);
    _XMLPackageBuilder.applyLoader3DProps(ownerPackage, loader, definition.attrs);
    return loader;
  }
  static createGroup(definition) {
    const group = UIObjectFactory.newObject(ObjectType.Group);
    _XMLPackageBuilder.applySharedProps(group, definition.attrs, true);
    _XMLPackageBuilder.applyGroupProps(group, definition.attrs);
    return group;
  }
  static createGraph(definition) {
    const graph = UIObjectFactory.newObject(ObjectType.Graph);
    _XMLPackageBuilder.applySharedProps(graph, definition.attrs, true);
    _XMLPackageBuilder.applyGraphProps(graph, definition.attrs);
    return graph;
  }
  static createList(parent, definition) {
    const treeView = _XMLPackageBuilder.isTreeView(definition.attrs);
    const list = UIObjectFactory.newObject(treeView ? ObjectType.Tree : ObjectType.List);
    _XMLPackageBuilder.applySharedProps(list, definition.attrs, true);
    _XMLPackageBuilder.applyComponentRootProps(list, definition.attrs);
    _XMLPackageBuilder.applyListProps(parent, list, definition);
    return list;
  }
  static resolveResourceItem(ownerPackage, rawRef) {
    if (!rawRef)
      return null;
    if (rawRef.startsWith("ui://")) {
      const packageClass = ownerPackage.constructor;
      return packageClass.getItemByURL(rawRef);
    }
    return ownerPackage.getItemById(rawRef) || ownerPackage.getItemByName(rawRef);
  }
  static resolveResourceURL(ownerPackage, rawRef) {
    if (!rawRef || rawRef.startsWith("ui://"))
      return rawRef;
    const item = _XMLPackageBuilder.resolveResourceItem(ownerPackage, rawRef);
    if (!item)
      return rawRef;
    return `ui://${item.owner.id}${item.id}`;
  }
  static applySharedProps(object, attrs, applyPosition) {
    object.assignIdFromXML(attrs.id || object.id);
    if (attrs.name)
      object.name = attrs.name;
    if (applyPosition && attrs.xy) {
      const xy = _XMLPackageBuilder.parsePair(attrs.xy);
      object.setPosition(xy.x, xy.y);
    }
    if (attrs.size) {
      const size = _XMLPackageBuilder.parsePair(attrs.size);
      object.setSize(size.x, size.y, true);
    }
    _XMLPackageBuilder.applyRestrictSize(object, attrs);
    if (attrs.scale) {
      const scale = _XMLPackageBuilder.parsePair(attrs.scale, 1, 1);
      object.setScale(scale.x, scale.y);
    }
    if (attrs.pivot) {
      const pivot = _XMLPackageBuilder.parsePair(attrs.pivot);
      object.setPivot(pivot.x, pivot.y, _XMLPackageBuilder.readBool(attrs.anchor, false));
    }
    if (attrs.alpha)
      object.alpha = _XMLPackageBuilder.readNumber(attrs.alpha, 1);
    if (attrs.rotation)
      object.rotation = _XMLPackageBuilder.readNumber(attrs.rotation, 0);
    if (attrs.visible)
      object.visible = _XMLPackageBuilder.readBool(attrs.visible, true);
    if (attrs.touchable)
      object.touchable = _XMLPackageBuilder.readBool(attrs.touchable, true);
    if (attrs.grayed)
      object.grayed = _XMLPackageBuilder.readBool(attrs.grayed, false);
    if (attrs.blend)
      object.blendMode = _XMLPackageBuilder.parseBlendMode(attrs.blend);
    if (attrs.customData != null)
      object.data = attrs.customData;
    if (attrs.tooltips != null)
      object.tooltips = attrs.tooltips;
  }
  static applyRestrictSize(object, attrs) {
    if (attrs.restrictSize) {
      const values = attrs.restrictSize.split(",").map((value) => _XMLPackageBuilder.readNumber(value, 0));
      object.minWidth = values[0] || 0;
      object.maxWidth = values[1] || 0;
      object.minHeight = values[2] || 0;
      object.maxHeight = values[3] || 0;
      return;
    }
    if (attrs.minWidth)
      object.minWidth = _XMLPackageBuilder.readNumber(attrs.minWidth, 0);
    if (attrs.maxWidth)
      object.maxWidth = _XMLPackageBuilder.readNumber(attrs.maxWidth, 0);
    if (attrs.minHeight)
      object.minHeight = _XMLPackageBuilder.readNumber(attrs.minHeight, 0);
    if (attrs.maxHeight)
      object.maxHeight = _XMLPackageBuilder.readNumber(attrs.maxHeight, 0);
  }
  static applyComponentRootProps(component, attrs) {
    if (attrs.margin) {
      const values = attrs.margin.split(",").map((value) => _XMLPackageBuilder.readNumber(value, 0));
      component.setMarginFromXML(values[0] || 0, values[1] || 0, values[2] || 0, values[3] || 0);
    }
    if (attrs.overflow) {
      const overflow = _XMLPackageBuilder.parseOverflow(attrs.overflow);
      if (overflow === OverflowType.Scroll)
        component.applyScrollFromXML(attrs);
      else if (overflow !== OverflowType.Visible)
        component.applyOverflowFromXML(overflow);
    }
    component.opaque = _XMLPackageBuilder.readBool(attrs.opaque, false);
  }
  static applyComponentRootRefs(ownerPackage, component, attrs, idMap, displayEntries) {
    if (attrs.mask) {
      const maskTarget = _XMLPackageBuilder.resolveChildRef(idMap, attrs.mask);
      if (maskTarget)
        component.setMask(maskTarget, _XMLPackageBuilder.readBool(attrs.reversedMask, false));
      else
        console.warn(`FairyGUI XML: component '${component.name || component.id}' cannot find mask target '${attrs.mask}'.`);
    }
    if (attrs.hitTest) {
      const hitTarget = _XMLPackageBuilder.resolveChildRef(idMap, attrs.hitTest);
      if (hitTarget)
        component.hitArea = new ChildHitArea(hitTarget);
      else if (_XMLPackageBuilder.resolveResourceItem(ownerPackage, attrs.hitTest))
        console.warn(`FairyGUI XML: component '${component.name || component.id}' references hitTest resource '${attrs.hitTest}', but XML runtime currently only supports child-based hitTest refs.`);
      else
        console.warn(`FairyGUI XML: component '${component.name || component.id}' cannot resolve hitTest target '${attrs.hitTest}'.`);
      return;
    }
    _XMLPackageBuilder.applyPixelHitTestFromXML(ownerPackage, component, displayEntries);
  }
  static applyPixelHitTestFromXML(ownerPackage, component, displayEntries) {
    const candidates = displayEntries.filter((entry) => _XMLPackageBuilder.readBool(entry.definition.attrs.forHitTest, false));
    if (candidates.length == 0)
      return;
    if (candidates.length > 1) {
      const ids = candidates.map((candidate2) => candidate2.definition.attrs.id || candidate2.child.id).join(", ");
      console.warn(`FairyGUI XML: component '${component.name || component.id}' has multiple forHitTest targets (${ids}); only the first one will be used.`);
    }
    const candidate = candidates[0];
    if (!(candidate.child instanceof GImage)) {
      console.warn(`FairyGUI XML: component '${component.name || component.id}' forHitTest target '${candidate.definition.attrs.id || candidate.child.id}' is not an image.`);
      return;
    }
    const item = _XMLPackageBuilder.resolveResourceItem(ownerPackage, candidate.definition.attrs.src || "");
    if (!item || item.type != PackageItemType.Image) {
      console.warn(`FairyGUI XML: component '${component.name || component.id}' forHitTest target '${candidate.definition.attrs.id || candidate.child.id}' cannot resolve image resource '${candidate.definition.attrs.src || ""}'.`);
      return;
    }
    const hitTestData = _XMLPackageBuilder.ensureImageHitTestData(item);
    if (!hitTestData) {
      console.warn(`FairyGUI XML: component '${component.name || component.id}' cannot build pixel hit data from image '${item.name || item.id}'.`);
      return;
    }
    const hitArea = new PixelHitTest(hitTestData, candidate.child.x, candidate.child.y);
    if (item.width > 0 && candidate.child.width > 0)
      hitArea.scaleX = candidate.child.width / item.width;
    if (item.height > 0 && candidate.child.height > 0)
      hitArea.scaleY = candidate.child.height / item.height;
    component.hitArea = hitArea;
  }
  static ensureImageHitTestData(item) {
    if (item.hitTestData)
      return item.hitTestData;
    const imageAsset = _XMLPackageBuilder.resolveImageAsset(item);
    if (!imageAsset)
      return null;
    const hitTestData = _XMLPackageBuilder.buildHitTestDataFromImage(imageAsset);
    if (!hitTestData)
      return null;
    item.hitTestData = hitTestData;
    return hitTestData;
  }
  static resolveImageAsset(item) {
    const asset = item.owner.getItemAsset(item);
    if (!asset || typeof asset != "object" || !asset.texture || typeof asset.texture != "object")
      return null;
    const imageAsset = asset.texture.image;
    return _XMLPackageBuilder.isImageAsset(imageAsset) ? imageAsset : null;
  }
  static buildHitTestDataFromImage(imageAsset) {
    const width = Math.max(0, Math.trunc(imageAsset.width));
    const height = Math.max(0, Math.trunc(imageAsset.height));
    if (width == 0 || height == 0)
      return null;
    return _XMLPackageBuilder.buildHitTestDataFromSource(imageAsset.data, width, height) || _XMLPackageBuilder.buildHitTestDataFromSource(imageAsset._nativeAsset, width, height) || null;
  }
  static buildHitTestDataFromSource(source, width, height) {
    if (!source)
      return null;
    const viewHitTest = _XMLPackageBuilder.buildHitTestDataFromArrayBufferView(source, width, height);
    if (viewHitTest)
      return viewHitTest;
    if (typeof source == "object") {
      const nested = source;
      const nestedHitTest = _XMLPackageBuilder.buildHitTestDataFromArrayBufferView(nested._data, width, height) || _XMLPackageBuilder.buildHitTestDataFromArrayBufferView(nested.data, width, height);
      if (nestedHitTest)
        return nestedHitTest;
    }
    const rgba = _XMLPackageBuilder.readPixelsViaCanvas(source, width, height);
    if (rgba)
      return PixelHitTestData.fromAlphaPixels(width, height, rgba, 4, 3);
    return null;
  }
  static buildHitTestDataFromArrayBufferView(source, width, height) {
    const view2 = _XMLPackageBuilder.asArrayBufferView(source);
    if (!view2)
      return null;
    const total = width * height;
    const bytes = new Uint8Array(view2.buffer, view2.byteOffset, view2.byteLength);
    if (bytes.byteLength >= total * 4)
      return PixelHitTestData.fromAlphaPixels(width, height, bytes, 4, 3);
    if (bytes.byteLength >= total * 3)
      return PixelHitTestData.createOpaque(width, height);
    if (bytes.byteLength >= total)
      return PixelHitTestData.fromAlphaPixels(width, height, bytes, 1, 0);
    return null;
  }
  static asArrayBufferView(source) {
    if (!source)
      return null;
    return ArrayBuffer.isView(source) ? source : null;
  }
  static readPixelsViaCanvas(source, width, height) {
    if (typeof document == "undefined")
      return null;
    const imageSource = _XMLPackageBuilder.asCanvasImageSource(source);
    if (!imageSource)
      return null;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context)
      return null;
    try {
      context.clearRect(0, 0, width, height);
      context.drawImage(imageSource, 0, 0, width, height);
      return context.getImageData(0, 0, width, height).data;
    } catch (error) {
      console.warn("FairyGUI XML: failed to read image pixels for forHitTest via canvas.", error);
      return null;
    }
  }
  static asCanvasImageSource(source) {
    if (!source || typeof source != "object")
      return null;
    const candidate = source;
    if (typeof candidate.getContext == "function" || typeof candidate.complete == "boolean")
      return source;
    if (typeof ImageBitmap != "undefined" && source instanceof ImageBitmap)
      return source;
    return null;
  }
  static isImageAsset(value) {
    const candidate = value;
    return !!candidate && typeof candidate == "object" && typeof candidate.width == "number" && typeof candidate.height == "number";
  }
  static applyImageProps(image, attrs) {
    if (attrs.color)
      image.color = _XMLPackageBuilder.parseColor(attrs.color);
    if (attrs.flip)
      image.flip = _XMLPackageBuilder.parseFlip(attrs.flip);
    if (attrs.fillMethod) {
      image.fillMethod = _XMLPackageBuilder.parseFillMethod(attrs.fillMethod);
      image.fillOrigin = _XMLPackageBuilder.parseFillOrigin(attrs.fillOrigin);
      image.fillClockwise = _XMLPackageBuilder.readBool(attrs.fillClockwise, true);
      image.fillAmount = _XMLPackageBuilder.readNumber(attrs.fillAmount, 1);
    }
  }
  static applyTextProps(textObject, attrs) {
    if (attrs.font)
      textObject.font = attrs.font;
    if (attrs.fontSize)
      textObject.fontSize = _XMLPackageBuilder.readNumber(attrs.fontSize, textObject.fontSize);
    if (attrs.color)
      textObject.color = _XMLPackageBuilder.parseColor(attrs.color);
    if (attrs.align)
      textObject.align = _XMLPackageBuilder.parseTextAlign(attrs.align);
    if (attrs.vAlign)
      textObject.verticalAlign = _XMLPackageBuilder.parseTextVerticalAlign(attrs.vAlign);
    if (attrs.leading)
      textObject.leading = _XMLPackageBuilder.readNumber(attrs.leading, 0);
    if (attrs.letterSpacing)
      textObject.letterSpacing = _XMLPackageBuilder.readNumber(attrs.letterSpacing, 0);
    if (attrs.ubb)
      textObject.ubbEnabled = _XMLPackageBuilder.readBool(attrs.ubb, false);
    if (attrs.autoSize)
      textObject.autoSize = _XMLPackageBuilder.parseAutoSize(attrs.autoSize);
    if (attrs.underline)
      textObject.underline = _XMLPackageBuilder.readBool(attrs.underline, false);
    if (attrs.italic)
      textObject.italic = _XMLPackageBuilder.readBool(attrs.italic, false);
    if (attrs.bold)
      textObject.bold = _XMLPackageBuilder.readBool(attrs.bold, false);
    if (attrs.singleLine)
      textObject.singleLine = _XMLPackageBuilder.readBool(attrs.singleLine, false);
    if (attrs.strokeColor) {
      textObject.strokeColor = _XMLPackageBuilder.parseColor(attrs.strokeColor);
      textObject.stroke = 1;
    }
    if (attrs.shadowColor) {
      textObject.shadowColor = _XMLPackageBuilder.parseColor(attrs.shadowColor);
      textObject.shadowOffset = _XMLPackageBuilder.toVec2(attrs.shadowOffset);
    }
    textObject.text = attrs.text || "";
    if (textObject instanceof GTextInput) {
      if (attrs.prompt)
        textObject.promptText = attrs.prompt;
      if (attrs.maxLength)
        textObject.maxLength = _XMLPackageBuilder.readNumber(attrs.maxLength, 0);
      if (attrs.password)
        textObject.password = _XMLPackageBuilder.readBool(attrs.password, false);
    }
  }
  static applyLoaderProps(loader, attrs) {
    if (attrs.align)
      loader.align = _XMLPackageBuilder.parseAlign(attrs.align);
    if (attrs.vAlign)
      loader.verticalAlign = _XMLPackageBuilder.parseVerticalAlign(attrs.vAlign);
    if (attrs.fill)
      loader.fill = _XMLPackageBuilder.parseLoaderFill(attrs.fill);
    if (attrs.autoSize)
      loader.autoSize = _XMLPackageBuilder.readBool(attrs.autoSize, false);
    if (attrs.url)
      loader.url = attrs.url;
    if (attrs.color)
      loader.color = _XMLPackageBuilder.parseColor(attrs.color);
    if (attrs.playing)
      loader.playing = _XMLPackageBuilder.readBool(attrs.playing, true);
    if (attrs.frame)
      loader.frame = _XMLPackageBuilder.readNumber(attrs.frame, 0);
    if (attrs.fillMethod) {
      loader.fillMethod = _XMLPackageBuilder.parseFillMethod(attrs.fillMethod);
      loader.fillOrigin = _XMLPackageBuilder.parseFillOrigin(attrs.fillOrigin);
      loader.fillClockwise = _XMLPackageBuilder.readBool(attrs.fillClockwise, true);
      loader.fillAmount = _XMLPackageBuilder.readNumber(attrs.fillAmount, 1);
    }
  }
  static applyLoader3DProps(ownerPackage, loader, attrs) {
    if (attrs.align)
      loader.align = _XMLPackageBuilder.parseAlign(attrs.align);
    if (attrs.vAlign)
      loader.verticalAlign = _XMLPackageBuilder.parseVerticalAlign(attrs.vAlign);
    if (attrs.fill)
      loader.fill = _XMLPackageBuilder.parseLoaderFill(attrs.fill);
    if (attrs.shrinkOnly)
      loader.shrinkOnly = _XMLPackageBuilder.readBool(attrs.shrinkOnly, false);
    if (attrs.autoSize)
      loader.autoSize = _XMLPackageBuilder.readBool(attrs.autoSize, false);
    const rawUrl = attrs.url || attrs.src;
    if (rawUrl)
      loader.url = _XMLPackageBuilder.resolveResourceURL(ownerPackage, rawUrl);
    if (attrs.animationName != null || attrs.animation != null)
      loader.animationName = attrs.animationName || attrs.animation;
    if (attrs.skinName != null || attrs.skin != null)
      loader.skinName = attrs.skinName || attrs.skin;
    if (attrs.playing)
      loader.playing = _XMLPackageBuilder.readBool(attrs.playing, true);
    if (attrs.frame)
      loader.frame = _XMLPackageBuilder.readNumber(attrs.frame, 0);
    if (attrs.loop)
      loader.loop = _XMLPackageBuilder.readBool(attrs.loop, false);
    if (attrs.color)
      loader.color = _XMLPackageBuilder.parseColor(attrs.color);
  }
  static applyMovieClipProps(movieClip, attrs) {
    if (attrs.color)
      movieClip.color = _XMLPackageBuilder.parseColor(attrs.color);
    if (attrs.frame)
      movieClip.frame = _XMLPackageBuilder.readNumber(attrs.frame, 0);
    if (attrs.playing)
      movieClip.playing = _XMLPackageBuilder.readBool(attrs.playing, true);
  }
  static applyGroupProps(group, attrs) {
    if (attrs.layout) {
      group.layout = attrs.layout === "horizontal" ? GroupLayoutType.Horizontal : attrs.layout === "vertical" ? GroupLayoutType.Vertical : GroupLayoutType.None;
    }
    if (attrs.lineGap)
      group.lineGap = _XMLPackageBuilder.readNumber(attrs.lineGap, 0);
    if (attrs.colGap)
      group.columnGap = _XMLPackageBuilder.readNumber(attrs.colGap, 0);
    if (attrs.advanced)
      group.autoSizeDisabled = !_XMLPackageBuilder.readBool(attrs.advanced, false);
  }
  static applyGraphProps(graph, attrs) {
    const lineSize = _XMLPackageBuilder.readNumber(attrs.lineSize, 0);
    const lineColor = _XMLPackageBuilder.parseColor(attrs.lineColor || "#00000000");
    const fillColor = _XMLPackageBuilder.parseColor(attrs.fillColor || "#00000000");
    const graphType = _XMLPackageBuilder.parseGraphType(attrs.type);
    if (graphType === "ellipse")
      graph.drawEllipse(lineSize, lineColor, fillColor);
    else if (graphType === "polygon")
      graph.drawPolygon(lineSize, lineColor, fillColor, _XMLPackageBuilder.parseNumberList(attrs.points));
    else if (graphType === "regularPolygon")
      graph.drawRegularPolygon(lineSize, lineColor, fillColor, _XMLPackageBuilder.readNumber(attrs.sides, 3), _XMLPackageBuilder.readNumber(attrs.startAngle, 0), _XMLPackageBuilder.parseNumberList(attrs.distances));
    else
      graph.drawRect(lineSize, lineColor, fillColor, _XMLPackageBuilder.parseCornerRadii(attrs.corner));
  }
  static applyListProps(parent, list, definition) {
    var _a;
    const attrs = definition.attrs;
    if (attrs.defaultItem)
      list.defaultItem = attrs.defaultItem;
    if (attrs.layout)
      list.layout = _XMLPackageBuilder.parseListLayout(attrs.layout);
    if (attrs.selectionMode)
      list.selectionMode = _XMLPackageBuilder.parseListSelectionMode(attrs.selectionMode);
    if (attrs.align)
      list.align = _XMLPackageBuilder.parseAlign(attrs.align);
    if (attrs.vAlign)
      list.verticalAlign = _XMLPackageBuilder.parseVerticalAlign(attrs.vAlign);
    if (attrs.lineGap)
      list.lineGap = _XMLPackageBuilder.readNumber(attrs.lineGap, 0);
    if (attrs.colGap)
      list.columnGap = _XMLPackageBuilder.readNumber(attrs.colGap, 0);
    if (attrs.lineCount)
      list.lineCount = _XMLPackageBuilder.readNumber(attrs.lineCount, 0);
    const columnCount = (_a = attrs.columnCount) !== null && _a !== void 0 ? _a : attrs.colCount;
    if (columnCount)
      list.columnCount = _XMLPackageBuilder.readNumber(columnCount, 0);
    if (attrs.autoItemSize)
      list.autoResizeItem = _XMLPackageBuilder.readBool(attrs.autoItemSize, true);
    if (list instanceof GTree) {
      if (attrs.indent)
        list.indent = _XMLPackageBuilder.readNumber(attrs.indent, list.indent);
      if (attrs.clickToExpand)
        list.clickToExpand = Math.trunc(_XMLPackageBuilder.readNumber(attrs.clickToExpand, list.clickToExpand));
    }
    _XMLPackageBuilder.applyListItems(list, definition);
    if (attrs.pageController && list.scrollPane) {
      const controller = parent.getController(attrs.pageController);
      if (controller)
        list.scrollPane.pageController = controller;
    }
    if (attrs.selectionController) {
      const controller = parent.getController(attrs.selectionController);
      if (controller)
        list.selectionController = controller;
    }
  }
  static applyListItems(list, definition) {
    if (list instanceof GTree) {
      _XMLPackageBuilder.applyTreeItems(list, definition.items);
      return;
    }
    for (const itemDefinition of definition.items) {
      const rawUrl = itemDefinition.attrs.url || itemDefinition.attrs.src;
      const item = list.getFromPool(rawUrl || void 0);
      if (!item) {
        console.warn(`FairyGUI XML: list item '${list.name}' cannot resolve default item '${rawUrl || list.defaultItem || ""}'.`);
        continue;
      }
      list.addChild(item);
      _XMLPackageBuilder.applyListItemProps(item, itemDefinition.attrs);
    }
  }
  static applyTreeItems(tree, definitions) {
    if (definitions.length === 0)
      return;
    const previousRender = tree.treeNodeRender;
    tree.treeNodeRender = (node, obj) => {
      _XMLPackageBuilder.applyTreeNodeRender(node, obj);
      if (previousRender)
        previousRender(node, obj);
    };
    let lastNode = null;
    let previousLevel = 0;
    for (let i = 0; i < definitions.length; i++) {
      const attrs = definitions[i].attrs;
      const level = _XMLPackageBuilder.readTreeItemLevel(attrs);
      const nextLevel = i + 1 < definitions.length ? _XMLPackageBuilder.readTreeItemLevel(definitions[i + 1].attrs) : level;
      const isFolder = _XMLPackageBuilder.isTreeFolder(attrs, level, nextLevel);
      const resourceURL = attrs.url || attrs.src || tree.defaultItem || "";
      if (!resourceURL) {
        console.warn(`FairyGUI XML: tree item '${attrs.title || attrs.name || tree.name}' is missing url/defaultItem.`);
        continue;
      }
      if (!_XMLPackageBuilder.canCreateTreeNodeCell(tree, resourceURL)) {
        console.warn(`FairyGUI XML: tree item '${attrs.title || attrs.name || tree.name}' cannot resolve default item '${resourceURL}'.`);
        continue;
      }
      const node = new GTreeNode(isFolder, resourceURL);
      node.__xmlTreeItemAttrs = attrs;
      node.expanded = attrs.expanded == null ? true : _XMLPackageBuilder.readBool(attrs.expanded, true);
      if (!lastNode)
        tree.rootNode.addChild(node);
      else if (level > previousLevel) {
        if (lastNode.isFolder)
          lastNode.addChild(node);
        else {
          console.warn(`FairyGUI XML: tree item '${attrs.title || attrs.name || tree.name}' jumps under a non-folder sibling, fallback to current level.`);
          (lastNode.parent || tree.rootNode).addChild(node);
        }
      } else if (level < previousLevel) {
        let parent = lastNode;
        for (let cursor = level; cursor <= previousLevel && parent.parent; cursor++)
          parent = parent.parent;
        parent.addChild(node);
      } else {
        (lastNode.parent || tree.rootNode).addChild(node);
      }
      _XMLPackageBuilder.applyTreeNodeCellProps(node);
      lastNode = node;
      previousLevel = level;
    }
  }
  static applyTreeNodeRender(node, obj) {
    const attrs = node.__xmlTreeItemAttrs;
    if (attrs)
      _XMLPackageBuilder.applyListItemProps(obj, attrs);
  }
  static applyTreeNodeCellProps(node) {
    const runtimeNode = node;
    if (!runtimeNode._cell || !runtimeNode.__xmlTreeItemAttrs)
      return;
    _XMLPackageBuilder.applyListItemProps(runtimeNode._cell, runtimeNode.__xmlTreeItemAttrs);
  }
  static canCreateTreeNodeCell(tree, resourceURL) {
    const preview = tree.getFromPool(resourceURL);
    if (!preview)
      return false;
    const valid = preview instanceof GComponent;
    tree.returnToPool(preview);
    return valid;
  }
  static readTreeItemLevel(attrs) {
    return Math.max(0, Math.trunc(_XMLPackageBuilder.readNumber(attrs.level, 0)));
  }
  static isTreeFolder(attrs, level, nextLevel) {
    var _a;
    const explicitFolder = (_a = attrs.isFolder) !== null && _a !== void 0 ? _a : attrs.folder;
    if (explicitFolder != null)
      return _XMLPackageBuilder.readBool(explicitFolder, false);
    return nextLevel > level;
  }
  static applyListItemProps(item, attrs) {
    var _a;
    const statefulItem = item;
    if (attrs.title != null)
      item.text = attrs.title;
    if (attrs.selectedTitle != null && "selectedTitle" in item)
      statefulItem.selectedTitle = attrs.selectedTitle;
    if (attrs.icon != null)
      item.icon = attrs.icon;
    if (attrs.selectedIcon != null && "selectedIcon" in item)
      statefulItem.selectedIcon = attrs.selectedIcon;
    if (attrs.name)
      item.name = attrs.name;
    const selectedValue = (_a = attrs.checked) !== null && _a !== void 0 ? _a : attrs.selected;
    if (selectedValue != null && "selected" in item)
      statefulItem.selected = _XMLPackageBuilder.readBool(selectedValue, false);
  }
  static isTreeView(attrs) {
    return attrs.treeView != null && _XMLPackageBuilder.readBool(attrs.treeView, false);
  }
  static applyGears(parent, object, definitions) {
    for (const definition of definitions) {
      const gearIndex = GEAR_INDEX_MAP[definition.type];
      if (gearIndex == null) {
        console.warn(`FairyGUI XML: unsupported gear '${definition.type}' on '${object.name || object.id}'.`);
        continue;
      }
      const controllerName = definition.attrs.controller;
      if (!controllerName) {
        console.warn(`FairyGUI XML: gear '${definition.type}' on '${object.name || object.id}' is missing controller.`);
        continue;
      }
      const controller = parent.getController(controllerName);
      if (!controller) {
        console.warn(`FairyGUI XML: gear '${definition.type}' on '${object.name || object.id}' cannot find controller '${controllerName}'.`);
        continue;
      }
      const gear = object.getGear(gearIndex);
      gear.controller = controller;
      switch (definition.type) {
        case "gearDisplay":
          _XMLPackageBuilder.applyGearDisplay(object, gear, definition);
          break;
        case "gearDisplay2":
          _XMLPackageBuilder.applyGearDisplay2(gear, definition);
          break;
        case "gearXY":
          _XMLPackageBuilder.applyGearXY(object, gear, definition, controller);
          break;
        case "gearSize":
          _XMLPackageBuilder.applyGearSize(object, gear, definition, controller);
          break;
        case "gearLook":
          _XMLPackageBuilder.applyGearLook(gear, definition, controller);
          break;
        case "gearColor":
          _XMLPackageBuilder.applyGearColor(gear, definition, controller);
          break;
        case "gearAni":
        case "gearAnimation":
          _XMLPackageBuilder.applyGearAnimation(gear, definition, controller);
          break;
        case "gearText":
          _XMLPackageBuilder.applyGearText(gear, definition, controller);
          break;
        case "gearIcon":
          _XMLPackageBuilder.applyGearIcon(gear, definition, controller);
          break;
        case "gearFontSize":
          _XMLPackageBuilder.applyGearFontSize(gear, definition, controller);
          break;
      }
    }
  }
  static applyGearDisplay(object, gear, definition) {
    const runtime = gear;
    runtime.pages = _XMLPackageBuilder.parseGearPages(definition.attrs.pages);
    if (runtime.pages.length === 0)
      console.warn(`FairyGUI XML: gearDisplay on '${object.name || object.id}' has no pages.`);
  }
  static applyGearDisplay2(gear, definition) {
    const runtime = gear;
    runtime.pages = _XMLPackageBuilder.parseGearPages(definition.attrs.pages);
    runtime.condition = Math.trunc(_XMLPackageBuilder.readNumber(definition.attrs.condition, 0));
  }
  static applyGearXY(object, gear, definition, controller) {
    const runtime = gear;
    const fallback = _XMLPackageBuilder.cloneGearXYValue(runtime._default);
    const defaultValue = _XMLPackageBuilder.parseGearXYValue(definition.attrs.default, fallback);
    if (defaultValue)
      runtime._default = defaultValue;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses) {
      const parsed = _XMLPackageBuilder.parseGearXYValue(status.value, runtime._default);
      if (parsed)
        runtime._storage[status.pageId] = parsed;
    }
    _XMLPackageBuilder.applyGearTweenConfig(gear, definition.attrs);
    if (definition.attrs.positionsInPercent)
      runtime.positionsInPercent = _XMLPackageBuilder.readBool(definition.attrs.positionsInPercent, false);
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearXY on '${object.name || object.id}' targets empty controller '${controller.name}'.`);
  }
  static applyGearSize(object, gear, definition, controller) {
    const runtime = gear;
    const fallback = _XMLPackageBuilder.cloneGearSizeValue(runtime._default);
    const defaultValue = _XMLPackageBuilder.parseGearSizeValue(definition.attrs.default, fallback);
    if (defaultValue)
      runtime._default = defaultValue;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses) {
      const parsed = _XMLPackageBuilder.parseGearSizeValue(status.value, runtime._default);
      if (parsed)
        runtime._storage[status.pageId] = parsed;
    }
    _XMLPackageBuilder.applyGearTweenConfig(gear, definition.attrs);
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearSize on '${object.name || object.id}' targets empty controller '${controller.name}'.`);
  }
  static applyGearLook(gear, definition, controller) {
    const runtime = gear;
    const fallback = _XMLPackageBuilder.cloneGearLookValue(runtime._default);
    const defaultValue = _XMLPackageBuilder.parseGearLookValue(definition.attrs.default, fallback);
    if (defaultValue)
      runtime._default = defaultValue;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses) {
      const parsed = _XMLPackageBuilder.parseGearLookValue(status.value, runtime._default);
      if (parsed)
        runtime._storage[status.pageId] = parsed;
    }
    _XMLPackageBuilder.applyGearTweenConfig(gear, definition.attrs);
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearLook targets empty controller '${controller.name}'.`);
  }
  static applyGearColor(gear, definition, controller) {
    const runtime = gear;
    const fallback = _XMLPackageBuilder.cloneGearColorValue(runtime._default);
    const defaultValue = _XMLPackageBuilder.parseGearColorValue(definition.attrs.default, fallback);
    if (defaultValue)
      runtime._default = defaultValue;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses) {
      const parsed = _XMLPackageBuilder.parseGearColorValue(status.value, runtime._default);
      if (parsed)
        runtime._storage[status.pageId] = parsed;
    }
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearColor targets empty controller '${controller.name}'.`);
  }
  static applyGearAnimation(gear, definition, controller) {
    const runtime = gear;
    const fallback = _XMLPackageBuilder.cloneGearAnimationValue(runtime._default);
    const defaultValue = _XMLPackageBuilder.parseGearAnimationValue(definition.attrs.default, fallback);
    if (defaultValue)
      runtime._default = defaultValue;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses) {
      const parsed = _XMLPackageBuilder.parseGearAnimationValue(status.value, runtime._default);
      if (parsed)
        runtime._storage[status.pageId] = parsed;
    }
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearAnimation targets empty controller '${controller.name}'.`);
  }
  static applyGearText(gear, definition, controller) {
    const runtime = gear;
    if (definition.attrs.default != null && definition.attrs.default !== "-")
      runtime._default = definition.attrs.default;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses)
      runtime._storage[status.pageId] = status.value;
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearText targets empty controller '${controller.name}'.`);
  }
  static applyGearIcon(gear, definition, controller) {
    const runtime = gear;
    if (definition.attrs.default != null && definition.attrs.default !== "-")
      runtime._default = definition.attrs.default;
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses)
      runtime._storage[status.pageId] = status.value;
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearIcon targets empty controller '${controller.name}'.`);
  }
  static applyGearFontSize(gear, definition, controller) {
    const runtime = gear;
    if (definition.attrs.default != null && definition.attrs.default !== "-")
      runtime._default = Math.trunc(_XMLPackageBuilder.readNumber(definition.attrs.default, runtime._default));
    const statuses = _XMLPackageBuilder.parseGearStatuses(definition.attrs.pages, definition.attrs.values);
    for (const status of statuses)
      runtime._storage[status.pageId] = Math.trunc(_XMLPackageBuilder.readNumber(status.value, runtime._default));
    if (controller.pageCount === 0)
      console.warn(`FairyGUI XML: gearFontSize targets empty controller '${controller.name}'.`);
  }
  static parseGearPages(rawValue) {
    if (!rawValue)
      return [];
    return rawValue.split(",").map((value) => value.trim()).filter((value) => value.length > 0);
  }
  static parseBlendMode(rawValue) {
    var _a;
    return (_a = BLEND_MODE_MAP[rawValue.toLowerCase()]) !== null && _a !== void 0 ? _a : BlendMode.Normal;
  }
  static createControllerAction(definition) {
    switch (definition.type) {
      case "play_transition": {
        const action = new PlayTransitionAction();
        action.transitionName = definition.attrs.transitionName || "";
        action.playTimes = Math.trunc(_XMLPackageBuilder.readNumber(definition.attrs.playTimes, 1));
        action.delay = _XMLPackageBuilder.readNumber(definition.attrs.delay, 0);
        action.stopOnExit = _XMLPackageBuilder.readBool(definition.attrs.stopOnExit, false);
        _XMLPackageBuilder.applyControllerActionPages(action, definition.attrs);
        return action;
      }
      case "change_page": {
        const action = new ChangePageAction();
        action.objectId = definition.attrs.objectId || "";
        action.controllerName = definition.attrs.controller || "";
        action.targetPage = definition.attrs.targetPage || "";
        _XMLPackageBuilder.applyControllerActionPages(action, definition.attrs);
        return action;
      }
      default:
        console.warn(`FairyGUI XML: controller action '${definition.type}' is not supported yet.`);
        return null;
    }
  }
  static applyControllerActionPages(action, attrs) {
    action.fromPage = _XMLPackageBuilder.parseGearPages(attrs.fromPage);
    action.toPage = _XMLPackageBuilder.parseGearPages(attrs.toPage);
  }
  static resolveChildRef(idMap, rawRef) {
    if (!rawRef)
      return null;
    return idMap.get(rawRef) || null;
  }
  static parseGearStatuses(rawPages, rawValues, skipDash = true) {
    const pageIds = _XMLPackageBuilder.parseGearPages(rawPages);
    const values = rawValues != null ? rawValues.split("|") : [];
    const statuses = [];
    for (let i = 0; i < pageIds.length; i++) {
      const value = values[i];
      if (value == null)
        continue;
      if (skipDash && value.trim() === "-")
        continue;
      statuses.push({ pageId: pageIds[i], value });
    }
    return statuses;
  }
  static applyGearTweenConfig(gear, attrs) {
    if (attrs.tween == null && attrs.ease == null && attrs.duration == null && attrs.delay == null)
      return;
    const runtime = gear;
    runtime._tweenConfig = {
      tween: _XMLPackageBuilder.readBool(attrs.tween, true),
      easeType: _XMLPackageBuilder.parseEaseType(attrs.ease),
      duration: _XMLPackageBuilder.readNumber(attrs.duration, 0.3),
      delay: _XMLPackageBuilder.readNumber(attrs.delay, 0)
    };
  }
  static parseGearXYValue(rawValue, fallback) {
    var _a, _b;
    if (!rawValue || rawValue.trim() === "-")
      return null;
    const parsed = _XMLPackageBuilder.parseNumberList(rawValue);
    return {
      x: (_a = parsed[0]) !== null && _a !== void 0 ? _a : fallback.x,
      y: (_b = parsed[1]) !== null && _b !== void 0 ? _b : fallback.y,
      px: fallback.px,
      py: fallback.py
    };
  }
  static parseGearSizeValue(rawValue, fallback) {
    var _a, _b, _c, _d;
    if (!rawValue || rawValue.trim() === "-")
      return null;
    const parsed = _XMLPackageBuilder.parseNumberList(rawValue);
    return {
      width: (_a = parsed[0]) !== null && _a !== void 0 ? _a : fallback.width,
      height: (_b = parsed[1]) !== null && _b !== void 0 ? _b : fallback.height,
      scaleX: (_c = parsed[2]) !== null && _c !== void 0 ? _c : fallback.scaleX,
      scaleY: (_d = parsed[3]) !== null && _d !== void 0 ? _d : fallback.scaleY
    };
  }
  static parseGearLookValue(rawValue, fallback) {
    if (!rawValue || rawValue.trim() === "-")
      return null;
    const values = rawValue.split(",").map((value) => value.trim());
    return {
      alpha: _XMLPackageBuilder.readNumber(values[0], fallback.alpha),
      rotation: _XMLPackageBuilder.readNumber(values[1], fallback.rotation),
      grayed: _XMLPackageBuilder.readBool(values[2], fallback.grayed),
      touchable: _XMLPackageBuilder.readBool(values[3], fallback.touchable)
    };
  }
  static parseGearColorValue(rawValue, fallback) {
    if (!rawValue || rawValue.trim() === "-")
      return null;
    const values = rawValue.split(",").map((value) => value.trim());
    return {
      color: values[0] ? _XMLPackageBuilder.parseColor(values[0]) : fallback.color,
      strokeColor: values[1] ? _XMLPackageBuilder.parseColor(values[1]) : fallback.strokeColor
    };
  }
  static parseGearAnimationValue(rawValue, fallback) {
    if (!rawValue || rawValue.trim() === "-")
      return null;
    const values = rawValue.split(",").map((value) => value.trim());
    return {
      frame: Math.trunc(_XMLPackageBuilder.readNumber(values[0], fallback.frame)),
      playing: _XMLPackageBuilder.parseAnimationPlaying(values[1], fallback.playing)
    };
  }
  static cloneGearXYValue(value) {
    return { x: value.x, y: value.y, px: value.px, py: value.py };
  }
  static cloneGearSizeValue(value) {
    return { width: value.width, height: value.height, scaleX: value.scaleX, scaleY: value.scaleY };
  }
  static cloneGearLookValue(value) {
    return { alpha: value.alpha, rotation: value.rotation, grayed: value.grayed, touchable: value.touchable };
  }
  static cloneGearColorValue(value) {
    return {
      color: value.color ? new import_cc.Color(value.color.r, value.color.g, value.color.b, value.color.a) : null,
      strokeColor: value.strokeColor ? new import_cc.Color(value.strokeColor.r, value.strokeColor.g, value.strokeColor.b, value.strokeColor.a) : null
    };
  }
  static cloneGearAnimationValue(value) {
    return { playing: value.playing, frame: value.frame };
  }
  static applyGroupAssignments(parent, idMap, queue) {
    for (const entry of queue) {
      const group = idMap.get(entry.groupId);
      if (group instanceof GGroup)
        entry.child.group = group;
      else
        console.warn(`FairyGUI XML: group '${entry.groupId}' not found in component '${parent.name}'.`);
    }
  }
  static applyRelations(parent, idMap, nameMap, queue) {
    for (const entry of queue) {
      for (const relation of entry.relations) {
        const target = relation.target ? idMap.get(relation.target) || nameMap.get(relation.target) : parent;
        if (!target) {
          console.warn(`FairyGUI XML: relation target '${relation.target}' not found in component '${parent.name}'.`);
          continue;
        }
        for (const sidePair of relation.sidePairs) {
          const relationType = RELATION_MAP[sidePair.toLowerCase()];
          if (relationType != null)
            entry.child.addRelation(target, relationType);
          else
            console.warn(`FairyGUI XML: unsupported relation sidePair '${sidePair}' on '${entry.child.name || entry.child.id}'.`);
        }
      }
    }
  }
  static parseOverflow(value) {
    switch (value) {
      case "hidden":
        return OverflowType.Hidden;
      case "scroll":
        return OverflowType.Scroll;
      default:
        return OverflowType.Visible;
    }
  }
  static parseListLayout(value) {
    switch (value) {
      case "row":
        return ListLayoutType.SingleRow;
      case "flow_hz":
        return ListLayoutType.FlowHorizontal;
      case "flow_vt":
        return ListLayoutType.FlowVertical;
      case "pagination":
        return ListLayoutType.Pagination;
      default:
        return ListLayoutType.SingleColumn;
    }
  }
  static parseListSelectionMode(value) {
    switch (value) {
      case "multiple":
        return ListSelectionMode.Multiple;
      case "multipleSingleClick":
        return ListSelectionMode.Multiple_SingleClick;
      case "none":
        return ListSelectionMode.None;
      default:
        return ListSelectionMode.Single;
    }
  }
  static parseAlign(value) {
    switch (value) {
      case "center":
        return AlignType.Center;
      case "right":
        return AlignType.Right;
      default:
        return AlignType.Left;
    }
  }
  static parseVerticalAlign(value) {
    switch (value) {
      case "middle":
        return VertAlignType.Middle;
      case "bottom":
        return VertAlignType.Bottom;
      default:
        return VertAlignType.Top;
    }
  }
  static parseTextAlign(value) {
    switch (value) {
      case "center":
        return import_cc.HorizontalTextAlignment.CENTER;
      case "right":
        return import_cc.HorizontalTextAlignment.RIGHT;
      default:
        return import_cc.HorizontalTextAlignment.LEFT;
    }
  }
  static parseTextVerticalAlign(value) {
    switch (value) {
      case "middle":
        return import_cc.VerticalTextAlignment.CENTER;
      case "bottom":
        return import_cc.VerticalTextAlignment.BOTTOM;
      default:
        return import_cc.VerticalTextAlignment.TOP;
    }
  }
  static parseAutoSize(value) {
    switch (value) {
      case "none":
        return AutoSizeType.None;
      case "height":
        return AutoSizeType.Height;
      case "shrink":
        return AutoSizeType.Shrink;
      default:
        return AutoSizeType.Both;
    }
  }
  static parseLoaderFill(value) {
    switch (value) {
      case "scale":
        return LoaderFillType.Scale;
      case "scaleMatchHeight":
        return LoaderFillType.ScaleMatchHeight;
      case "scaleMatchWidth":
        return LoaderFillType.ScaleMatchWidth;
      case "scaleFree":
        return LoaderFillType.ScaleFree;
      case "scaleNoBorder":
        return LoaderFillType.ScaleNoBorder;
      default:
        return LoaderFillType.None;
    }
  }
  static parseFillMethod(value) {
    switch (value) {
      case "horizontal":
        return FillMethod.Horizontal;
      case "vertical":
        return FillMethod.Vertical;
      case "radial90":
        return FillMethod.Radial90;
      case "radial180":
        return FillMethod.Radial180;
      case "radial360":
        return FillMethod.Radial360;
      default:
        return FillMethod.None;
    }
  }
  static parseFillOrigin(value) {
    switch (value) {
      case "bottom":
        return FillOrigin.Bottom;
      case "left":
        return FillOrigin.Left;
      case "right":
        return FillOrigin.Right;
      default:
        return FillOrigin.Top;
    }
  }
  static parseFlip(value) {
    switch (value) {
      case "hz":
      case "horizontal":
        return 1;
      case "vt":
      case "vertical":
        return 2;
      case "both":
        return 3;
      default:
        return 0;
    }
  }
  static parseButtonMode(value) {
    switch (value) {
      case "Check":
      case "check":
        return ButtonMode.Check;
      case "Radio":
      case "radio":
        return ButtonMode.Radio;
      default:
        return ButtonMode.Common;
    }
  }
  static parseProgressTitleType(value) {
    switch (value) {
      case "valueAndMax":
        return ProgressTitleType.ValueAndMax;
      case "value":
        return ProgressTitleType.Value;
      case "max":
        return ProgressTitleType.Max;
      default:
        return ProgressTitleType.Percent;
    }
  }
  static parsePopupDirection(value) {
    switch (value) {
      case "up":
      case "Up":
        return PopupDirection.Up;
      case "down":
      case "Down":
        return PopupDirection.Down;
      default:
        return PopupDirection.Auto;
    }
  }
  static parseColor(rawValue) {
    const color = new import_cc.Color();
    color.fromHEX(rawValue);
    return color;
  }
  static parseGraphType(rawValue) {
    if (!rawValue)
      return "rect";
    const normalized = rawValue.trim().toLowerCase();
    switch (normalized) {
      case "ellipse":
      case "eclipse":
        return "ellipse";
      case "regularpolygon":
      case "regular_polygon":
      case "regular-polygon":
        return "regularPolygon";
      default:
        return normalized;
    }
  }
  static parseCornerRadii(rawValue) {
    const values = _XMLPackageBuilder.parseNumberList(rawValue);
    if (values.length === 0)
      return void 0;
    if (values.length === 1)
      return [values[0], values[0], values[0], values[0]];
    return values;
  }
  static parseRect(rawValue) {
    if (!rawValue)
      return null;
    const pair = _XMLPackageBuilder.parseNumberList(rawValue);
    if (pair.length < 4)
      return null;
    return new import_cc.Rect(pair[0], pair[1], pair[2], pair[3]);
  }
  static toVec2(rawValue) {
    const pair = _XMLPackageBuilder.parsePair(rawValue, 0, 0);
    return new import_cc.Vec2(pair.x, pair.y);
  }
  static parsePair(rawValue, defaultX = 0, defaultY = 0) {
    var _a, _b;
    const values = _XMLPackageBuilder.parseNumberList(rawValue);
    return {
      x: (_a = values[0]) !== null && _a !== void 0 ? _a : defaultX,
      y: (_b = values[1]) !== null && _b !== void 0 ? _b : defaultY
    };
  }
  static parseNumberList(rawValue) {
    if (!rawValue)
      return [];
    return rawValue.split(",").map((value) => Number.parseFloat(value.trim())).filter((value) => !Number.isNaN(value));
  }
  static readNumber(rawValue, defaultValue) {
    if (rawValue == null)
      return defaultValue;
    const value = Number.parseFloat(rawValue);
    return Number.isNaN(value) ? defaultValue : value;
  }
  static readBool(rawValue, defaultValue) {
    if (rawValue == null)
      return defaultValue;
    return rawValue === "true" || rawValue === "1";
  }
  static parseAnimationPlaying(rawValue, defaultValue) {
    if (rawValue == null || rawValue === "")
      return defaultValue;
    const normalized = rawValue.trim().toLowerCase();
    if (normalized === "p")
      return true;
    if (normalized === "s")
      return false;
    return _XMLPackageBuilder.readBool(rawValue, defaultValue);
  }
  static parseEaseType(rawValue) {
    var _a;
    if (!rawValue)
      return EaseType.QuadOut;
    const normalized = rawValue.replace(/[^a-zA-Z]/g, "").toLowerCase();
    return (_a = EASE_TYPE_MAP[normalized]) !== null && _a !== void 0 ? _a : EaseType.QuadOut;
  }
};
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}
var DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  "hasOwnProperty",
  "toString",
  "valueOf",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
];
var criticalProperties = ["__proto__", "constructor", "prototype"];
var defaultOptions$1 = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions$1, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err) return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid2 = validateAttributeString(attrStr, options);
          if (isValid2 === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid2.err.code, isValid2.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid2.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid2 = validateAttributeString(attrStr, options);
          if (isValid2 !== true) {
            return getErrorObject(isValid2.err.code, isValid2.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid2.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) ;
          else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) ;
      else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}
var defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
var defaultOptions = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  jPath: true,
  // if true, pass jPath string to callbacks; if false, pass matcher instance
  onDangerousProperty: defaultOnDangerousProperty
};
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== "string") {
    return;
  }
  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
  if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}
function normalizeProcessEntities(value) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      // true or false
      maxEntitySize: 1e4,
      maxExpansionDepth: 10,
      maxTotalExpansions: 1e3,
      maxExpandedLength: 1e5,
      maxEntityCount: 100,
      allowedTags: null,
      tagFilter: null
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions, options);
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
    { value: built.attributesGroupName, name: "attributesGroupName" },
    { value: built.textNodeName, name: "textNodeName" },
    { value: built.cdataPropName, name: "cdataPropName" },
    { value: built.commentPropName, name: "commentPropName" }
  ];
  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }
  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }
  built.processEntities = normalizeProcessEntities(built.processEntities);
  built.unpairedTagsSet = new Set(built.unpairedTags);
  if (built.stopNodes && Array.isArray(built.stopNodes)) {
    built.stopNodes = built.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  return built;
};
var METADATA_SYMBOL$1;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL$1 = "@@xmlMetadata";
} else {
  METADATA_SYMBOL$1 = /* @__PURE__ */ Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__") key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__") node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL$1] = { startIndex };
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL$1;
  }
};
var DocTypeReader = class {
  constructor(options) {
    this.suppressValidationErr = !options;
    this.options = options;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                throw new Error(
                  `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                );
              }
              const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              entities[entityName] = {
                regx: RegExp(`&${escaped};`, "g"),
                val
              };
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i)) comment = true;
          else throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      i++;
    }
    let entityName = xmlData.substring(startIndex, i);
    validateEntityName(entityName);
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
      throw new Error(
        `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
      );
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let notationName = xmlData.substring(startIndex, i);
    !this.suppressValidationErr && validateEntityName(notationName);
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    const startIndex = i;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      i++;
    }
    identifierVal = xmlData.substring(startIndex, i);
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    if (!this.suppressValidationErr && !isName(elementName)) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
    else if (xmlData[i] === "(") {
      i++;
      const startIndex2 = i;
      while (i < xmlData.length && xmlData[i] !== ")") {
        i++;
      }
      contentModel = xmlData.substring(startIndex2, i);
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    validateEntityName(elementName);
    i = skipWhitespace(xmlData, i);
    startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let attributeName = xmlData.substring(startIndex, i);
    if (!validateEntityName(attributeName)) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        const startIndex2 = i;
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          i++;
        }
        let notation = xmlData.substring(startIndex2, i);
        notation = notation.trim();
        if (!validateEntityName(notation)) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      const startIndex2 = i;
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        i++;
      }
      attributeType += xmlData.substring(startIndex2, i);
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1]) return false;
  }
  return true;
}
function validateEntityName(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  // oct: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  //skipLike: /regex/,
  infinity: "original"
  // "null", "infinity" (Infinity type), "string" ("Infinity" (the string literal))
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string") return str;
  let trimmedStr = str.trim();
  if (trimmedStr.length === 0) return str;
  else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
  else if (trimmedStr === "0") return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0) return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation) return num;
          else return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0") return num;
          else if (parsedStr === numTrimmedByZeros) return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
          else return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation) return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (leadingZeros.length > 0) {
      if (options.leadingZeros && !eAdjacentToLeadingZeros) {
        trimmedStr = (notation[1] || "") + notation[3];
        return Number(trimmedStr);
      } else return str;
    } else {
      return Number(trimmedStr);
    }
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".") numStr = "0";
    else if (numStr[0] === ".") numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  if (parseInt) return parseInt(numStr, base);
  else if (Number.parseInt) return Number.parseInt(numStr, base);
  else if (window && window.parseInt) return window.parseInt(numStr, base);
  else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    // Return Infinity or -Infinity
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}
var Expression = class {
  /**
   * Create a new Expression
   * @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
   * @param {Object} options - Configuration options
   * @param {string} options.separator - Path separator (default: '.')
   */
  constructor(pattern, options = {}, data) {
    this.pattern = pattern;
    this.separator = options.separator || ".";
    this.segments = this._parse(pattern);
    this.data = data;
    this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
    this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
    this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
  }
  /**
   * Parse pattern string into segments
   * @private
   * @param {string} pattern - Pattern to parse
   * @returns {Array} Array of segment objects
   */
  _parse(pattern) {
    const segments = [];
    let i = 0;
    let currentPart = "";
    while (i < pattern.length) {
      if (pattern[i] === this.separator) {
        if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
            currentPart = "";
          }
          segments.push({ type: "deep-wildcard" });
          i += 2;
        } else {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
          }
          currentPart = "";
          i++;
        }
      } else {
        currentPart += pattern[i];
        i++;
      }
    }
    if (currentPart.trim()) {
      segments.push(this._parseSegment(currentPart.trim()));
    }
    return segments;
  }
  /**
   * Parse a single segment
   * @private
   * @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
   * @returns {Object} Segment object
   */
  _parseSegment(part) {
    const segment = { type: "tag" };
    let bracketContent = null;
    let withoutBrackets = part;
    const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
    if (bracketMatch) {
      withoutBrackets = bracketMatch[1] + bracketMatch[3];
      if (bracketMatch[2]) {
        const content = bracketMatch[2].slice(1, -1);
        if (content) {
          bracketContent = content;
        }
      }
    }
    let namespace = void 0;
    let tagAndPosition = withoutBrackets;
    if (withoutBrackets.includes("::")) {
      const nsIndex = withoutBrackets.indexOf("::");
      namespace = withoutBrackets.substring(0, nsIndex).trim();
      tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
      if (!namespace) {
        throw new Error(`Invalid namespace in pattern: ${part}`);
      }
    }
    let tag = void 0;
    let positionMatch = null;
    if (tagAndPosition.includes(":")) {
      const colonIndex = tagAndPosition.lastIndexOf(":");
      const tagPart = tagAndPosition.substring(0, colonIndex).trim();
      const posPart = tagAndPosition.substring(colonIndex + 1).trim();
      const isPositionKeyword = ["first", "last", "odd", "even"].includes(posPart) || /^nth\(\d+\)$/.test(posPart);
      if (isPositionKeyword) {
        tag = tagPart;
        positionMatch = posPart;
      } else {
        tag = tagAndPosition;
      }
    } else {
      tag = tagAndPosition;
    }
    if (!tag) {
      throw new Error(`Invalid segment pattern: ${part}`);
    }
    segment.tag = tag;
    if (namespace) {
      segment.namespace = namespace;
    }
    if (bracketContent) {
      if (bracketContent.includes("=")) {
        const eqIndex = bracketContent.indexOf("=");
        segment.attrName = bracketContent.substring(0, eqIndex).trim();
        segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
      } else {
        segment.attrName = bracketContent.trim();
      }
    }
    if (positionMatch) {
      const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
      if (nthMatch) {
        segment.position = "nth";
        segment.positionValue = parseInt(nthMatch[1], 10);
      } else {
        segment.position = positionMatch;
      }
    }
    return segment;
  }
  /**
   * Get the number of segments
   * @returns {number}
   */
  get length() {
    return this.segments.length;
  }
  /**
   * Check if expression contains deep wildcard
   * @returns {boolean}
   */
  hasDeepWildcard() {
    return this._hasDeepWildcard;
  }
  /**
   * Check if expression has attribute conditions
   * @returns {boolean}
   */
  hasAttributeCondition() {
    return this._hasAttributeCondition;
  }
  /**
   * Check if expression has position selectors
   * @returns {boolean}
   */
  hasPositionSelector() {
    return this._hasPositionSelector;
  }
  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.pattern;
  }
};
var ExpressionSet = class {
  constructor() {
    this._byDepthAndTag = /* @__PURE__ */ new Map();
    this._wildcardByDepth = /* @__PURE__ */ new Map();
    this._deepWildcards = [];
    this._patterns = /* @__PURE__ */ new Set();
    this._sealed = false;
  }
  /**
   * Add an Expression to the set.
   * Duplicate patterns (same pattern string) are silently ignored.
   *
   * @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
   * @returns {this} for chaining
   * @throws {TypeError} if called after seal()
   *
   * @example
   * set.add(new Expression('root.users.user'));
   * set.add(new Expression('..script'));
   */
  add(expression) {
    if (this._sealed) {
      throw new TypeError(
        "ExpressionSet is sealed. Create a new ExpressionSet to add more expressions."
      );
    }
    if (this._patterns.has(expression.pattern)) return this;
    this._patterns.add(expression.pattern);
    if (expression.hasDeepWildcard()) {
      this._deepWildcards.push(expression);
      return this;
    }
    const depth = expression.length;
    const lastSeg = expression.segments[expression.segments.length - 1];
    const tag = lastSeg?.tag;
    if (!tag || tag === "*") {
      if (!this._wildcardByDepth.has(depth)) this._wildcardByDepth.set(depth, []);
      this._wildcardByDepth.get(depth).push(expression);
    } else {
      const key = `${depth}:${tag}`;
      if (!this._byDepthAndTag.has(key)) this._byDepthAndTag.set(key, []);
      this._byDepthAndTag.get(key).push(expression);
    }
    return this;
  }
  /**
   * Add multiple expressions at once.
   *
   * @param {import('./Expression.js').default[]} expressions - Array of Expression instances
   * @returns {this} for chaining
   *
   * @example
   * set.addAll([
   *   new Expression('root.users.user'),
   *   new Expression('root.config.setting'),
   * ]);
   */
  addAll(expressions) {
    for (const expr of expressions) this.add(expr);
    return this;
  }
  /**
   * Check whether a pattern string is already present in the set.
   *
   * @param {import('./Expression.js').default} expression
   * @returns {boolean}
   */
  has(expression) {
    return this._patterns.has(expression.pattern);
  }
  /**
   * Number of expressions in the set.
   * @type {number}
   */
  get size() {
    return this._patterns.size;
  }
  /**
   * Seal the set against further modifications.
   * Useful to prevent accidental mutations after config is built.
   * Calling add() or addAll() on a sealed set throws a TypeError.
   *
   * @returns {this}
   */
  seal() {
    this._sealed = true;
    return this;
  }
  /**
   * Whether the set has been sealed.
   * @type {boolean}
   */
  get isSealed() {
    return this._sealed;
  }
  /**
   * Test whether the matcher's current path matches any expression in the set.
   *
   * Evaluation order (cheapest → most expensive):
   *  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
   *  2. Depth-only wildcard bucket — O(1) lookup, rare
   *  3. Deep-wildcard list         — always checked, but usually small
   *
   * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
   * @returns {boolean} true if any expression matches the current path
   *
   * @example
   * if (stopNodes.matchesAny(matcher)) {
   *   // handle stop node
   * }
   */
  matchesAny(matcher) {
    return this.findMatch(matcher) !== null;
  }
  /**
  * Find and return the first Expression that matches the matcher's current path.
  *
  * Uses the same evaluation order as matchesAny (cheapest → most expensive):
  *  1. Exact depth + tag bucket
  *  2. Depth-only wildcard bucket
  *  3. Deep-wildcard list
  *
  * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
  * @returns {import('./Expression.js').default | null} the first matching Expression, or null
  *
  * @example
  * const expr = stopNodes.findMatch(matcher);
  * if (expr) {
  *   // access expr.config, expr.pattern, etc.
  * }
  */
  findMatch(matcher) {
    const depth = matcher.getDepth();
    const tag = matcher.getCurrentTag();
    const exactKey = `${depth}:${tag}`;
    const exactBucket = this._byDepthAndTag.get(exactKey);
    if (exactBucket) {
      for (let i = 0; i < exactBucket.length; i++) {
        if (matcher.matches(exactBucket[i])) return exactBucket[i];
      }
    }
    const wildcardBucket = this._wildcardByDepth.get(depth);
    if (wildcardBucket) {
      for (let i = 0; i < wildcardBucket.length; i++) {
        if (matcher.matches(wildcardBucket[i])) return wildcardBucket[i];
      }
    }
    for (let i = 0; i < this._deepWildcards.length; i++) {
      if (matcher.matches(this._deepWildcards[i])) return this._deepWildcards[i];
    }
    return null;
  }
};
var MatcherView = class {
  /**
   * @param {Matcher} matcher - The parent Matcher instance to read from.
   */
  constructor(matcher) {
    this._matcher = matcher;
  }
  /**
   * Get the path separator used by the parent matcher.
   * @returns {string}
   */
  get separator() {
    return this._matcher.separator;
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    const path2 = this._matcher.path;
    return path2.length > 0 ? path2[path2.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    const path2 = this._matcher.path;
    return path2.length > 0 ? path2[path2.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    const path2 = this._matcher.path;
    if (path2.length === 0) return void 0;
    return path2[path2.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    const path2 = this._matcher.path;
    if (path2.length === 0) return false;
    const current = path2[path2.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    const path2 = this._matcher.path;
    if (path2.length === 0) return -1;
    return path2[path2.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    const path2 = this._matcher.path;
    if (path2.length === 0) return -1;
    return path2[path2.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this._matcher.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    return this._matcher.toString(separator, includeNamespace);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this._matcher.path.map((n) => n.tag);
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    return this._matcher.matches(expression);
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this._matcher);
  }
};
var Matcher = class {
  /**
   * Create a new Matcher.
   * @param {Object} [options={}]
   * @param {string} [options.separator='.'] - Default path separator
   */
  constructor(options = {}) {
    this.separator = options.separator || ".";
    this.path = [];
    this.siblingStacks = [];
    this._pathStringCache = null;
    this._view = new MatcherView(this);
  }
  /**
   * Push a new tag onto the path.
   * @param {string} tagName
   * @param {Object|null} [attrValues=null]
   * @param {string|null} [namespace=null]
   */
  push(tagName, attrValues = null, namespace = null) {
    this._pathStringCache = null;
    if (this.path.length > 0) {
      this.path[this.path.length - 1].values = void 0;
    }
    const currentLevel = this.path.length;
    if (!this.siblingStacks[currentLevel]) {
      this.siblingStacks[currentLevel] = /* @__PURE__ */ new Map();
    }
    const siblings = this.siblingStacks[currentLevel];
    const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
    const counter = siblings.get(siblingKey) || 0;
    let position = 0;
    for (const count of siblings.values()) {
      position += count;
    }
    siblings.set(siblingKey, counter + 1);
    const node = {
      tag: tagName,
      position,
      counter
    };
    if (namespace !== null && namespace !== void 0) {
      node.namespace = namespace;
    }
    if (attrValues !== null && attrValues !== void 0) {
      node.values = attrValues;
    }
    this.path.push(node);
  }
  /**
   * Pop the last tag from the path.
   * @returns {Object|undefined} The popped node
   */
  pop() {
    if (this.path.length === 0) return void 0;
    this._pathStringCache = null;
    const node = this.path.pop();
    if (this.siblingStacks.length > this.path.length + 1) {
      this.siblingStacks.length = this.path.length + 1;
    }
    return node;
  }
  /**
   * Update current node's attribute values.
   * Useful when attributes are parsed after push.
   * @param {Object} attrValues
   */
  updateCurrent(attrValues) {
    if (this.path.length > 0) {
      const current = this.path[this.path.length - 1];
      if (attrValues !== null && attrValues !== void 0) {
        current.values = attrValues;
      }
    }
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    if (this.path.length === 0) return void 0;
    return this.path[this.path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    if (this.path.length === 0) return false;
    const current = this.path[this.path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    const sep = separator || this.separator;
    const isDefault = sep === this.separator && includeNamespace === true;
    if (isDefault) {
      if (this._pathStringCache !== null) {
        return this._pathStringCache;
      }
      const result = this.path.map(
        (n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag
      ).join(sep);
      this._pathStringCache = result;
      return result;
    }
    return this.path.map(
      (n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag
    ).join(sep);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this.path.map((n) => n.tag);
  }
  /**
   * Reset the path to empty.
   */
  reset() {
    this._pathStringCache = null;
    this.path = [];
    this.siblingStacks = [];
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    const segments = expression.segments;
    if (segments.length === 0) {
      return false;
    }
    if (expression.hasDeepWildcard()) {
      return this._matchWithDeepWildcard(segments);
    }
    return this._matchSimple(segments);
  }
  /**
   * @private
   */
  _matchSimple(segments) {
    if (this.path.length !== segments.length) {
      return false;
    }
    for (let i = 0; i < segments.length; i++) {
      if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) {
        return false;
      }
    }
    return true;
  }
  /**
   * @private
   */
  _matchWithDeepWildcard(segments) {
    let pathIdx = this.path.length - 1;
    let segIdx = segments.length - 1;
    while (segIdx >= 0 && pathIdx >= 0) {
      const segment = segments[segIdx];
      if (segment.type === "deep-wildcard") {
        segIdx--;
        if (segIdx < 0) {
          return true;
        }
        const nextSeg = segments[segIdx];
        let found = false;
        for (let i = pathIdx; i >= 0; i--) {
          if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
            pathIdx = i - 1;
            segIdx--;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      } else {
        if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) {
          return false;
        }
        pathIdx--;
        segIdx--;
      }
    }
    return segIdx < 0;
  }
  /**
   * @private
   */
  _matchSegment(segment, node, isCurrentNode) {
    if (segment.tag !== "*" && segment.tag !== node.tag) {
      return false;
    }
    if (segment.namespace !== void 0) {
      if (segment.namespace !== "*" && segment.namespace !== node.namespace) {
        return false;
      }
    }
    if (segment.attrName !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      if (!node.values || !(segment.attrName in node.values)) {
        return false;
      }
      if (segment.attrValue !== void 0) {
        if (String(node.values[segment.attrName]) !== String(segment.attrValue)) {
          return false;
        }
      }
    }
    if (segment.position !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      const counter = node.counter ?? 0;
      if (segment.position === "first" && counter !== 0) {
        return false;
      } else if (segment.position === "odd" && counter % 2 !== 1) {
        return false;
      } else if (segment.position === "even" && counter % 2 !== 0) {
        return false;
      } else if (segment.position === "nth" && counter !== segment.positionValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this);
  }
  /**
   * Create a snapshot of current state.
   * @returns {Object}
   */
  snapshot() {
    return {
      path: this.path.map((node) => ({ ...node })),
      siblingStacks: this.siblingStacks.map((map) => new Map(map))
    };
  }
  /**
   * Restore state from snapshot.
   * @param {Object} snapshot
   */
  restore(snapshot) {
    this._pathStringCache = null;
    this.path = snapshot.path.map((node) => ({ ...node }));
    this.siblingStacks = snapshot.siblingStacks.map((map) => new Map(map));
  }
  /**
   * Return the read-only {@link MatcherView} for this matcher.
   *
   * The same instance is returned on every call — no allocation occurs.
   * It always reflects the current parser state and is safe to pass to
   * user callbacks without risk of accidental mutation.
   *
   * @returns {MatcherView}
   *
   * @example
   * const view = matcher.readOnly();
   * // pass view to callbacks — it stays in sync automatically
   * view.matches(expr);       // ✓
   * view.getCurrentTag();     // ✓
   * // view.push(...)         // ✗ method does not exist — caught by TypeScript
   */
  readOnly() {
    return this._view;
  }
};
function extractRawAttributes(prefixedAttrs, options) {
  if (!prefixedAttrs) return {};
  const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
  if (!attrs) return {};
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(options.attributeNamePrefix)) {
      const rawName = key.substring(options.attributeNamePrefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function extractNamespace(rawTagName) {
  if (!rawTagName || typeof rawTagName !== "string") return void 0;
  const colonIndex = rawTagName.indexOf(":");
  if (colonIndex !== -1 && colonIndex > 0) {
    const ns = rawTagName.substring(0, colonIndex);
    if (ns !== "xmlns") {
      return ns;
    }
  }
  return void 0;
}
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: '"' }
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "\xA2" },
      "pound": { regex: /&(pound|#163);/g, val: "\xA3" },
      "yen": { regex: /&(yen|#165);/g, val: "\xA5" },
      "euro": { regex: /&(euro|#8364);/g, val: "\u20AC" },
      "copyright": { regex: /&(copy|#169);/g, val: "\xA9" },
      "reg": { regex: /&(reg|#174);/g, val: "\xAE" },
      "inr": { regex: /&(inr|#8377);/g, val: "\u20B9" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => fromCodePoint(str, 10, "&#") },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => fromCodePoint(str, 16, "&#x") }
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    this.matcher = new Matcher();
    this.readonlyMatcher = this.matcher.readOnly();
    this.isCurrentNodeStopNode = false;
    this.stopNodeExpressionsSet = new ExpressionSet();
    const stopNodesOpts = this.options.stopNodes;
    if (stopNodesOpts && stopNodesOpts.length > 0) {
      for (let i = 0; i < stopNodesOpts.length; i++) {
        const stopNodeExp = stopNodesOpts[i];
        if (typeof stopNodeExp === "string") {
          this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
        } else if (stopNodeExp instanceof Expression) {
          this.stopNodeExpressionsSet.add(stopNodeExp);
        }
      }
      this.stopNodeExpressionsSet.seal();
    }
  }
};
function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    const escaped = ent.replace(/[.\-+*:]/g, "\\.");
    this.lastEntities[ent] = {
      regex: new RegExp("&" + escaped + ";", "g"),
      val: externalEntities[ent]
    };
  }
}
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  const options = this.options;
  if (val !== void 0) {
    if (options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
      const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
      const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (options.trimValues) {
        return parseValue(val, options.parseTagValue, options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, options.parseTagValue, options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName) {
  const options = this.options;
  if (options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    const processedVals = new Array(len);
    let hasRawAttrs = false;
    const rawAttrsForMatcher = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      const oldVal = matches[i][4];
      if (attrName.length && oldVal !== void 0) {
        let val = oldVal;
        if (options.trimValues) val = val.trim();
        val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
        processedVals[i] = val;
        rawAttrsForMatcher[attrName] = val;
        hasRawAttrs = true;
      }
    }
    if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) {
      jPath.updateCurrent(rawAttrsForMatcher);
    }
    const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
    let hasAttrs = false;
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPathStr)) continue;
      let aName = options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (options.transformAttributeName) {
          aName = options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, options);
        if (matches[i][4] !== void 0) {
          const oldVal = processedVals[i];
          const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(oldVal, options.parseAttributeValue, options.numberParseOptions);
          }
          hasAttrs = true;
        } else if (options.allowBooleanAttributes) {
          attrs[aName] = true;
          hasAttrs = true;
        }
      }
    }
    if (!hasAttrs) return;
    if (options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  this.matcher.reset();
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  this.docTypeEntitiesKeys = [];
  this.lastEntitiesKeys = Object.keys(this.lastEntities);
  this.htmlEntitiesKeys = this.options.htmlEntities ? Object.keys(this.htmlEntities) : [];
  const options = this.options;
  const docTypeReader = new DocTypeReader(options.processEntities);
  const xmlLen = xmlData.length;
  for (let i = 0; i < xmlLen; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        }
        const lastTagName = this.matcher.getCurrentTag();
        if (tagName && options.unpairedTagsSet.has(tagName)) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
          this.matcher.pop();
          this.tagsNodeStack.pop();
        }
        this.matcher.pop();
        this.isCurrentNodeStopNode = false;
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (c1 === 63) {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) ;
        else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName);
          }
          this.addChild(currentNode, childNode, this.readonlyMatcher, i);
        }
        i = tagData.closeIndex + 1;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
          currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
        const result = docTypeReader.readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        this.docTypeEntitiesKeys = Object.keys(this.docTypeEntities) || [];
        i = result.i;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
        if (val == void 0) val = "";
        if (options.cdataPropName) {
          currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, options.removeNSPrefix);
        if (!result) {
          const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
          throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
        }
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
        if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
          currentNode = this.tagsNodeStack.pop();
          this.matcher.pop();
        }
        let isSelfClosing = false;
        if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
          isSelfClosing = true;
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          } else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }
          attrExpPresent = tagName !== tagExp;
        }
        let prefixedAttrs = null;
        let namespace = void 0;
        namespace = extractNamespace(rawTagName);
        if (tagName !== xmlObj.tagname) {
          this.matcher.push(tagName, {}, namespace);
        }
        if (tagName !== tagExp && attrExpPresent) {
          prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
          if (prefixedAttrs) {
            extractRawAttributes(prefixedAttrs, options);
          }
        }
        if (tagName !== xmlObj.tagname) {
          this.isCurrentNodeStopNode = this.isItStopNode();
        }
        const startIndex = i;
        if (this.isCurrentNodeStopNode) {
          let tagContent = "";
          if (isSelfClosing) {
            i = result.closeIndex;
          } else if (options.unpairedTagsSet.has(tagName)) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (prefixedAttrs) {
            childNode[":@"] = prefixedAttrs;
          }
          childNode.add(options.textNodeName, tagContent);
          this.matcher.pop();
          this.isCurrentNodeStopNode = false;
          this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
        } else {
          if (isSelfClosing) {
            ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
          } else if (options.unpairedTagsSet.has(tagName)) {
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
  if (!this.options.captureMetaData) startIndex = void 0;
  const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
  const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
  if (result === false) ;
  else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
function replaceEntitiesValue(val, tagName, jPath) {
  const entityConfig = this.options.processEntities;
  if (!entityConfig || !entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    const allowed = Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher);
    if (!allowed) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) {
      return val;
    }
  }
  for (const entityName of this.docTypeEntitiesKeys) {
    const entity = this.docTypeEntities[entityName];
    const matches = val.match(entity.regx);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
      const lengthBefore = val.length;
      val = val.replace(entity.regx, entity.val);
      if (entityConfig.maxExpandedLength) {
        this.currentExpandedLength += val.length - lengthBefore;
        if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
          throw new Error(
            `Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`
          );
        }
      }
    }
  }
  if (val.indexOf("&") === -1) return val;
  for (const entityName of this.lastEntitiesKeys) {
    const entity = this.lastEntities[entityName];
    const matches = val.match(entity.regex);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
    }
    val = val.replace(entity.regex, entity.val);
  }
  if (val.indexOf("&") === -1) return val;
  for (const entityName of this.htmlEntitiesKeys) {
    const entity = this.htmlEntities[entityName];
    const matches = val.match(entity.regex);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions && this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
    }
    val = val.replace(entity.regex, entity.val);
  }
  val = val.replace(this.ampEntity.regex, this.ampEntity.val);
  return val;
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      parentNode.tagname,
      matcher,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode() {
  if (this.stopNodeExpressionsSet.size === 0) return false;
  return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary = 0;
  const chars = [];
  const len = xmlData.length;
  const closeCode0 = closingChar.charCodeAt(0);
  const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
  for (let index = i; index < len; index++) {
    const code = xmlData.charCodeAt(index);
    if (attrBoundary) {
      if (code === attrBoundary) attrBoundary = 0;
    } else if (code === 34 || code === 39) {
      attrBoundary = code;
    } else if (code === closeCode0) {
      if (closeCode1 !== -1) {
        if (xmlData.charCodeAt(index + 1) === closeCode1) {
          return { data: String.fromCharCode(...chars), index };
        }
      } else {
        return { data: String.fromCharCode(...chars), index };
      }
    } else if (code === 9) {
      chars.push(32);
      continue;
    }
    chars.push(code);
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function findClosingChar(xmlData, char, i, errMsg) {
  const closingIndex = xmlData.indexOf(char, i);
  if (closingIndex === -1) throw new Error(errMsg);
  return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  const xmllen = xmlData.length;
  for (; i < xmllen; i++) {
    if (xmlData[i] === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (c1 === 63) {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true") return true;
    else if (newval === "false") return false;
    else return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function fromCodePoint(str, base, prefix) {
  const codePoint = Number.parseInt(str, base);
  if (codePoint >= 0 && codePoint <= 1114111) {
    return String.fromCodePoint(codePoint);
  } else {
    return prefix + str + ";";
  }
}
function transformTagName(fn, tagName, tagExp, options) {
  if (fn) {
    const newTagName = fn(tagName);
    if (tagExp === tagName) {
      tagExp = newTagName;
    }
    tagName = newTagName;
  }
  tagName = sanitizeName(tagName, options);
  return { tagName, tagExp };
}
function sanitizeName(name, options) {
  if (criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}
var METADATA_SYMBOL = XmlNode.getMetaDataSymbol();
function stripAttributePrefix(attrs, prefix) {
  if (!attrs || typeof attrs !== "object") return {};
  if (!prefix) return attrs;
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(prefix)) {
      const rawName = key.substring(prefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function prettify(node, options, matcher, readonlyMatcher) {
  return compress(node, options, matcher, readonlyMatcher);
}
function compress(arr, options, matcher, readonlyMatcher) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    if (property !== void 0 && property !== options.textNodeName) {
      const rawAttrs = stripAttributePrefix(
        tagObj[":@"] || {},
        options.attributeNamePrefix
      );
      matcher.push(property, rawAttrs);
    }
    if (property === options.textNodeName) {
      if (text === void 0) text = tagObj[property];
      else text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, matcher, readonlyMatcher);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }
      if (tagObj[METADATA_SYMBOL] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL] = tagObj[METADATA_SYMBOL];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
        if (options.isArray(property, jPathOrMatcher, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
      if (property !== void 0 && property !== options.textNodeName) {
        matcher.pop();
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0) compressedObj[options.textNodeName] = text;
  } else if (text !== void 0) compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@") return key;
  }
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
      const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
      if (options.isArray(atrrName, jPathOrMatcher, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true) validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.addExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
    else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};
var parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  allowBooleanAttributes: true,
  trimValues: false,
  parseTagValue: false,
  parseAttributeValue: false
});
var COMPONENT_EXTENSION_MAP = {
  Button: ObjectType.Button,
  Label: ObjectType.Label,
  ComboBox: ObjectType.ComboBox,
  ProgressBar: ObjectType.ProgressBar,
  Slider: ObjectType.Slider,
  ScrollBar: ObjectType.ScrollBar,
  Tree: ObjectType.Tree
};
var DISPLAY_OBJECT_MAP = {
  image: ObjectType.Image,
  movieclip: ObjectType.MovieClip,
  jta: ObjectType.MovieClip,
  graph: ObjectType.Graph,
  loader: ObjectType.Loader,
  loader3D: ObjectType.Loader3D,
  loader3d: ObjectType.Loader3D,
  Loader3D: ObjectType.Loader3D,
  group: ObjectType.Group,
  text: ObjectType.Text,
  richtext: ObjectType.RichText,
  component: ObjectType.Component,
  list: ObjectType.List
};
var DEFAULT_MOVIECLIP_FPS = 24;
var XMLPackageReader = class _XMLPackageReader {
  static readPackage(xmlString, resourcesPath, bundle) {
    const manifest = _XMLPackageReader.readPackageManifest(xmlString, resourcesPath);
    const activeBundle = bundle || import_cc.resources;
    const resourceDefinitions = [];
    for (const definition of manifest.resources)
      resourceDefinitions.push(_XMLPackageReader.resolveResource(definition, activeBundle));
    return {
      id: manifest.id,
      name: manifest.name,
      resourcesPath: manifest.resourcesPath,
      resources: resourceDefinitions
    };
  }
  static readPackageManifest(xmlString, resourcesPath) {
    const root = _XMLPackageReader.parseDocument(xmlString, "packageDescription");
    const resourcesNode = _XMLPackageReader.asNode(root.resources, "package resources");
    const publishNode = _XMLPackageReader.asNode(root.publish, "package publish");
    const packageId = _XMLPackageReader.readAttribute(root, "id");
    const packageName = _XMLPackageReader.readOptionalAttribute(publishNode, "name") || _XMLPackageReader.readOptionalAttribute(root, "name") || import_cc.path.basename(resourcesPath || packageId);
    const resourceDefinitions = [];
    for (const tagName in resourcesNode) {
      if (_XMLPackageReader.isIgnoredKey(tagName))
        continue;
      const rawValue = resourcesNode[tagName];
      const values = _XMLPackageReader.toArray(rawValue);
      for (const value of values) {
        const node = _XMLPackageReader.asNode(value, `resource '${tagName}'`);
        const definition = _XMLPackageReader.readResourceManifest(tagName, node, resourcesPath);
        if (definition)
          resourceDefinitions.push(definition);
      }
    }
    return {
      id: packageId,
      name: packageName,
      resourcesPath,
      resources: resourceDefinitions
    };
  }
  static readResourceManifest(tagName, node, resourcesPath) {
    const id = _XMLPackageReader.readAttribute(node, "id");
    const originalName = _XMLPackageReader.readAttribute(node, "name");
    const resourcePath = _XMLPackageReader.readOptionalAttribute(node, "path") || "/";
    const exported = _XMLPackageReader.readBool(_XMLPackageReader.readOptionalAttribute(node, "exported"), false);
    const normalizedName = _XMLPackageReader.stripExtension(import_cc.path.basename(originalName));
    const assetPath = _XMLPackageReader.joinAssetPath(resourcesPath, resourcePath, originalName);
    switch (tagName) {
      case "component":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.Component,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "image":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.Image,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "font":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.Font,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "movieclip":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.MovieClip,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "sound":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.Sound,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "spine":
      case "Spine":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.Spine,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      case "dragonbones":
      case "dragonBones":
      case "DragonBones":
        return {
          id,
          name: normalizedName,
          originalName,
          path: resourcePath,
          exported,
          type: PackageItemType.DragonBones,
          assetPath,
          attrs: _XMLPackageReader.readAttributes(node)
        };
      default:
        console.warn(`FairyGUI XML: package resource '${tagName}' is not supported yet, '${originalName}' will be skipped.`);
        return null;
    }
  }
  static resolveResource(definition, bundle) {
    var _a, _b;
    const baseDefinition = {
      id: definition.id,
      name: definition.name,
      originalName: definition.originalName,
      path: definition.path,
      exported: definition.exported,
      type: definition.type,
      assetPath: definition.assetPath
    };
    switch (definition.type) {
      case PackageItemType.Component: {
        const xmlText = _XMLPackageReader.loadTextAsset(bundle, definition.assetPath, definition.originalName);
        const component = _XMLPackageReader.readComponent(xmlText, `${definition.assetPath}.xml`);
        const size = _XMLPackageReader.parseResourceSize(component.attrs);
        return Object.assign(Object.assign({}, baseDefinition), { type: PackageItemType.Component, objectType: component.objectType, width: size.width, height: size.height, scaleByTile: false, smoothing: true, component });
      }
      case PackageItemType.Image: {
        const imageAsset = _XMLPackageReader.loadImageAsset(bundle, definition.assetPath, definition.originalName);
        return Object.assign(Object.assign({}, baseDefinition), { type: PackageItemType.Image, objectType: ObjectType.Image, width: imageAsset.width, height: imageAsset.height, scale9Grid: _XMLPackageReader.parseScale9Grid(definition.attrs.scale9grid), scaleByTile: definition.attrs.scale === "tile", smoothing: true });
      }
      case PackageItemType.Font:
        return Object.assign(Object.assign({}, baseDefinition), { type: PackageItemType.Font, width: 0, height: 0, scaleByTile: false, smoothing: true });
      case PackageItemType.MovieClip: {
        const movieClip = _XMLPackageReader.loadMovieClipDefinition(bundle, definition.assetPath, definition.originalName);
        return Object.assign(Object.assign({}, baseDefinition), { type: PackageItemType.MovieClip, objectType: ObjectType.MovieClip, width: (_a = movieClip === null || movieClip === void 0 ? void 0 : movieClip.width) !== null && _a !== void 0 ? _a : 0, height: (_b = movieClip === null || movieClip === void 0 ? void 0 : movieClip.height) !== null && _b !== void 0 ? _b : 0, scaleByTile: false, smoothing: true, movieClip });
      }
      case PackageItemType.Sound:
        return Object.assign(Object.assign({}, baseDefinition), { type: PackageItemType.Sound, width: 0, height: 0, scaleByTile: false, smoothing: true });
      case PackageItemType.Spine:
      case PackageItemType.DragonBones: {
        const size = _XMLPackageReader.parseResourceSize(definition.attrs);
        return Object.assign(Object.assign({}, baseDefinition), { type: definition.type, width: size.width, height: size.height, scaleByTile: false, smoothing: true, skeletonAnchor: _XMLPackageReader.parsePoint(definition.attrs.skeletonAnchor || definition.attrs.anchor) });
      }
      default:
        throw new Error(`Unsupported XML package resource type '${definition.type}'.`);
    }
  }
  static readComponent(xmlString, sourcePath) {
    const root = _XMLPackageReader.parseDocument(xmlString, "component");
    const attrs = _XMLPackageReader.readAttributes(root);
    const displayList = _XMLPackageReader.readDisplayList(root.displayList);
    const controllers = _XMLPackageReader.readControllers(root.controller);
    const transitions = _XMLPackageReader.readTransitions(root.transition);
    const extension = _XMLPackageReader.readExtension(root, attrs.extention || attrs.extension);
    return {
      sourcePath,
      objectType: _XMLPackageReader.resolveComponentObjectType(attrs.extention || attrs.extension),
      attrs,
      controllers,
      displayList,
      transitions,
      extension
    };
  }
  static readDisplayList(rawValue) {
    const displayListNode = rawValue ? _XMLPackageReader.asNode(rawValue, "displayList") : {};
    const displayList = [];
    for (const tagName in displayListNode) {
      if (_XMLPackageReader.isIgnoredKey(tagName))
        continue;
      const value = displayListNode[tagName];
      const nodes = _XMLPackageReader.toArray(value);
      for (const node of nodes) {
        displayList.push(_XMLPackageReader.readDisplayObject(tagName, _XMLPackageReader.asNode(node, `display object '${tagName}'`)));
      }
    }
    return displayList;
  }
  static readDisplayObject(tagName, node) {
    const attrs = _XMLPackageReader.readAttributes(node);
    const relations = _XMLPackageReader.readRelations(node.relation);
    const gears = _XMLPackageReader.readGearDefinitions(node);
    const extension = _XMLPackageReader.readExtension(node, _XMLPackageReader.findNestedExtensionName(node));
    const items = tagName === "list" ? _XMLPackageReader.readListItems(node.item) : [];
    return {
      tag: tagName,
      objectType: _XMLPackageReader.resolveDisplayObjectType(tagName, attrs),
      attrs,
      relations,
      gears,
      extension,
      items
    };
  }
  static readGearDefinitions(node) {
    const definitions = [];
    for (const key of Object.keys(node)) {
      if (!key.startsWith("gear"))
        continue;
      for (const value of _XMLPackageReader.toArray(node[key])) {
        const gearNode = _XMLPackageReader.asNode(value, `gear '${key}'`);
        definitions.push({
          type: key,
          attrs: _XMLPackageReader.readAttributes(gearNode)
        });
      }
    }
    return definitions;
  }
  static readListItems(rawValue) {
    return _XMLPackageReader.toArray(rawValue).map((value) => {
      const node = _XMLPackageReader.asNode(value, "list item");
      return {
        attrs: _XMLPackageReader.readAttributes(node)
      };
    });
  }
  static readControllers(rawValue) {
    return _XMLPackageReader.toArray(rawValue).map((value) => {
      const node = _XMLPackageReader.asNode(value, "controller");
      const attrs = _XMLPackageReader.readAttributes(node);
      const pages = _XMLPackageReader.parseControllerPages(attrs.pages || "");
      const selectedValue = attrs.selected || "";
      const selectedIndex = _XMLPackageReader.resolveSelectedIndex(selectedValue, pages);
      return {
        name: attrs.name || "",
        autoRadioGroupDepth: _XMLPackageReader.readBool(attrs.autoRadioGroupDepth, false),
        pages,
        selectedIndex,
        actions: _XMLPackageReader.readControllerActions(node.action)
      };
    });
  }
  static readControllerActions(rawValue) {
    return _XMLPackageReader.toArray(rawValue).map((value) => {
      const node = _XMLPackageReader.asNode(value, "controller action");
      const attrs = _XMLPackageReader.readAttributes(node);
      return {
        type: attrs.type || "",
        attrs
      };
    });
  }
  static readTransitions(rawValue) {
    return _XMLPackageReader.toArray(rawValue).map((value) => {
      const node = _XMLPackageReader.asNode(value, "transition");
      const attrs = _XMLPackageReader.readAttributes(node);
      const items = _XMLPackageReader.toArray(node.item).map((itemValue) => _XMLPackageReader.readTransitionItem(itemValue));
      return {
        name: attrs.name || "",
        attrs,
        items
      };
    });
  }
  static readTransitionItem(value) {
    const node = _XMLPackageReader.asNode(value, "transition item");
    return {
      attrs: _XMLPackageReader.readAttributes(node)
    };
  }
  static parseControllerPages(rawValue) {
    const values = rawValue.split(",").map((value) => value.trim());
    const pages = [];
    for (let i = 0; i + 1 < values.length; i += 2) {
      pages.push({
        id: values[i],
        name: values[i + 1]
      });
    }
    return pages;
  }
  static resolveSelectedIndex(selectedValue, pages) {
    if (!selectedValue)
      return 0;
    const numeric = Number.parseInt(selectedValue, 10);
    if (!Number.isNaN(numeric))
      return numeric;
    const pageById = pages.findIndex((page) => page.id === selectedValue);
    if (pageById >= 0)
      return pageById;
    const pageByName = pages.findIndex((page) => page.name === selectedValue);
    return pageByName >= 0 ? pageByName : 0;
  }
  static readRelations(rawValue) {
    return _XMLPackageReader.toArray(rawValue).map((value) => {
      const node = _XMLPackageReader.asNode(value, "relation");
      const sidePair = _XMLPackageReader.readOptionalAttribute(node, "sidePair") || "";
      return {
        target: _XMLPackageReader.readOptionalAttribute(node, "target"),
        sidePairs: sidePair.split(",").map((item) => item.trim()).filter((item) => item.length > 0)
      };
    });
  }
  static readExtension(node, extensionName) {
    if (!extensionName)
      return void 0;
    const rawValue = node[extensionName];
    if (rawValue == null)
      return void 0;
    if (typeof rawValue === "string" || typeof rawValue === "number" || typeof rawValue === "boolean") {
      return {
        type: extensionName,
        attrs: {},
        items: []
      };
    }
    const extensionNode = _XMLPackageReader.asNode(rawValue, `extension '${extensionName}'`);
    return {
      type: extensionName,
      attrs: _XMLPackageReader.readAttributes(extensionNode),
      items: _XMLPackageReader.readListItems(extensionNode.item)
    };
  }
  static findNestedExtensionName(node) {
    for (const key of Object.keys(node)) {
      if (COMPONENT_EXTENSION_MAP[key] != null)
        return key;
    }
    return void 0;
  }
  static parseDocument(xmlString, expectedRoot) {
    const document2 = parser.parse(xmlString);
    const root = document2[expectedRoot];
    if (!root || typeof root === "string")
      throw new Error(`XML root '${expectedRoot}' not found.`);
    return _XMLPackageReader.asNode(root, expectedRoot);
  }
  static readAttributes(node) {
    const attrs = {};
    for (const key in node) {
      if (_XMLPackageReader.isIgnoredKey(key))
        continue;
      const value = node[key];
      if (typeof value === "string")
        attrs[key] = value;
      else if (typeof value === "number" || typeof value === "boolean")
        attrs[key] = String(value);
    }
    return attrs;
  }
  static readAttribute(node, key) {
    const value = _XMLPackageReader.readOptionalAttribute(node, key);
    if (!value)
      throw new Error(`Missing XML attribute '${key}'.`);
    return value;
  }
  static readOptionalAttribute(node, key) {
    const value = node[key];
    if (typeof value === "string")
      return value;
    if (typeof value === "number" || typeof value === "boolean")
      return String(value);
    return void 0;
  }
  static resolveComponentObjectType(extensionName) {
    var _a;
    if (!extensionName)
      return ObjectType.Component;
    return (_a = COMPONENT_EXTENSION_MAP[extensionName]) !== null && _a !== void 0 ? _a : ObjectType.Component;
  }
  static resolveDisplayObjectType(tagName, attrs) {
    var _a;
    if (tagName === "text" && _XMLPackageReader.readBool(attrs.input, false))
      return ObjectType.InputText;
    return (_a = DISPLAY_OBJECT_MAP[tagName]) !== null && _a !== void 0 ? _a : ObjectType.Component;
  }
  static loadTextAsset(bundle, assetPath, originalName) {
    const asset = bundle.get(assetPath, import_cc.TextAsset) || bundle.get(assetPath);
    const textAsset = asset;
    if (!textAsset || typeof textAsset.text !== "string")
      throw new Error(`XML asset '${originalName}' at '${assetPath}' is not preloaded as TextAsset.`);
    return textAsset.text;
  }
  static loadImageAsset(bundle, assetPath, originalName) {
    const imageAsset = bundle.get(assetPath, import_cc.ImageAsset);
    if (!imageAsset)
      throw new Error(`Image asset '${originalName}' at '${assetPath}' is not preloaded as ImageAsset.`);
    return imageAsset;
  }
  static loadMovieClipDefinition(bundle, assetPath, originalName) {
    const bufferAsset = _XMLPackageReader.loadBufferAsset(bundle, assetPath);
    if (!bufferAsset) {
      console.warn(`FairyGUI XML: movieclip '${originalName}' at '${assetPath}' is not preloaded as BufferAsset. It will fallback to an empty placeholder.`);
      return void 0;
    }
    try {
      return _XMLPackageReader.parseMovieClip(bufferAsset.buffer(), assetPath);
    } catch (error) {
      console.warn(`FairyGUI XML: movieclip '${originalName}' at '${assetPath}' has unsupported .jta data and will fallback to an empty placeholder.`, error);
      return void 0;
    }
  }
  static loadBufferAsset(bundle, assetPath) {
    const asset = bundle.get(assetPath, import_cc.BufferAsset) || bundle.get(assetPath);
    if (!asset)
      return null;
    if (typeof asset.buffer === "function")
      return asset;
    const nativeAsset = asset._nativeAsset;
    if (nativeAsset instanceof ArrayBuffer || ArrayBuffer.isView(nativeAsset)) {
      const bufferAsset = new import_cc.BufferAsset();
      bufferAsset._nativeAsset = nativeAsset;
      return bufferAsset;
    }
    return null;
  }
  static parseMovieClip(buffer, sourcePath) {
    const view2 = new DataView(buffer);
    if (view2.byteLength < 28)
      throw new Error("MovieClip header is too short.");
    const magicLength = view2.getUint16(0, false);
    const magicEnd = 2 + magicLength;
    if (magicEnd + 21 > view2.byteLength)
      throw new Error("MovieClip header is truncated.");
    const magic = _XMLPackageReader.decodeAscii(buffer, 2, magicLength);
    if (magic !== "yytou")
      throw new Error(`Unexpected movieclip magic '${magic}'.`);
    const bodyOffset = magicEnd;
    const frameRate = _XMLPackageReader.resolveMovieClipFrameRate(view2.getUint8(bodyOffset + 4));
    const width = view2.getUint16(bodyOffset + 12, false);
    const height = view2.getUint16(bodyOffset + 14, false);
    const frameCount = view2.getUint16(bodyOffset + 19, false);
    const interval = frameCount > 0 ? _XMLPackageReader.framesToSeconds(view2.getUint8(bodyOffset + 16), frameRate, true) : 0;
    const repeatDelay = _XMLPackageReader.framesToSeconds(view2.getUint8(bodyOffset + 17), frameRate, false);
    const swing = view2.getUint8(bodyOffset + 18) != 0;
    const framesOffset = bodyOffset + 21;
    const frameBytes = frameCount * 12;
    if (framesOffset + frameBytes > view2.byteLength)
      throw new Error("MovieClip frame table is truncated.");
    const frames = new Array(frameCount);
    let cursor = framesOffset;
    for (let i = 0; i < frameCount; i++, cursor += 12) {
      frames[i] = {
        rect: {
          x: view2.getUint16(cursor + 2, false),
          y: view2.getUint16(cursor + 4, false),
          width: view2.getUint16(cursor + 6, false),
          height: view2.getUint16(cursor + 8, false)
        },
        addDelay: _XMLPackageReader.framesToSeconds(view2.getUint16(cursor, false), frameRate, false),
        textureIndex: view2.getUint16(cursor + 10, false)
      };
    }
    cursor = framesOffset + frameBytes;
    if (cursor + 2 > view2.byteLength)
      throw new Error("MovieClip texture table is truncated.");
    const textureCount = view2.getUint16(cursor, false);
    cursor += 2;
    const textures = new Array(textureCount);
    for (let i = 0; i < textureCount; i++) {
      if (cursor + 4 > view2.byteLength)
        throw new Error(`MovieClip texture length #${i} is truncated.`);
      const textureByteLength = view2.getUint32(cursor, false);
      cursor += 4;
      if (cursor + textureByteLength > view2.byteLength)
        throw new Error(`MovieClip texture data #${i} is truncated.`);
      const bytes = new Uint8Array(textureByteLength);
      bytes.set(new Uint8Array(buffer, cursor, textureByteLength));
      textures[i] = {
        mimeType: _XMLPackageReader.resolveEmbeddedImageMimeType(bytes),
        bytes
      };
      cursor += textureByteLength;
    }
    if (cursor != view2.byteLength)
      throw new Error("MovieClip has unexpected trailing bytes.");
    return {
      sourcePath,
      width,
      height,
      interval: Number.isFinite(interval) && interval >= 0 ? interval : 0,
      repeatDelay,
      swing,
      frames,
      textures,
      frameCount: frameCount > 0 ? frameCount : 0
    };
  }
  static resolveMovieClipFrameRate(rawValue) {
    const value = Number.isFinite(rawValue) ? Math.trunc(rawValue) : 0;
    return value > 0 ? value : DEFAULT_MOVIECLIP_FPS;
  }
  static framesToSeconds(frameUnits, frameRate, ensurePositive) {
    const units = Number.isFinite(frameUnits) ? Math.trunc(frameUnits) : 0;
    const rate = frameRate > 0 ? frameRate : DEFAULT_MOVIECLIP_FPS;
    if (units > 0)
      return units / rate;
    return ensurePositive ? 1 / rate : 0;
  }
  static resolveEmbeddedImageMimeType(bytes) {
    if (bytes.length >= 8 && bytes[0] == 137 && bytes[1] == 80 && bytes[2] == 78 && bytes[3] == 71 && bytes[4] == 13 && bytes[5] == 10 && bytes[6] == 26 && bytes[7] == 10)
      return "image/png";
    if (bytes.length >= 2 && bytes[0] == 255 && bytes[1] == 216)
      return "image/jpeg";
    if (bytes.length >= 12 && bytes[0] == 82 && bytes[1] == 73 && bytes[2] == 70 && bytes[3] == 70 && bytes[8] == 87 && bytes[9] == 69 && bytes[10] == 66 && bytes[11] == 80)
      return "image/webp";
    return "image/png";
  }
  static decodeAscii(buffer, offset, length) {
    const bytes = new Uint8Array(buffer, offset, length);
    let result = "";
    for (let i = 0; i < bytes.length; i++)
      result += String.fromCharCode(bytes[i]);
    return result;
  }
  static parseScale9Grid(rawValue) {
    if (!rawValue)
      return void 0;
    const values = rawValue.split(",").map((item) => Number.parseFloat(item.trim()));
    if (values.length !== 4 || values.some((value) => Number.isNaN(value)))
      return void 0;
    return {
      x: values[0],
      y: values[1],
      width: values[2],
      height: values[3]
    };
  }
  static parseSize(rawValue) {
    if (!rawValue)
      return { width: 0, height: 0 };
    const [width, height] = rawValue.split(",").map((value) => Number.parseFloat(value.trim()));
    return {
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0
    };
  }
  static parseResourceSize(attrs) {
    const size = _XMLPackageReader.parseSize(attrs.size);
    if (size.width > 0 || size.height > 0)
      return size;
    const width = Number.parseFloat(attrs.width || "");
    const height = Number.parseFloat(attrs.height || "");
    return {
      width: Number.isFinite(width) ? width : 0,
      height: Number.isFinite(height) ? height : 0
    };
  }
  static parsePoint(rawValue) {
    if (!rawValue)
      return void 0;
    const [x, y] = rawValue.split(",").map((value) => Number.parseFloat(value.trim()));
    if (!Number.isFinite(x) || !Number.isFinite(y))
      return void 0;
    return { x, y };
  }
  static joinAssetPath(resourcesPath, itemPath, name) {
    const basePath = (resourcesPath || "").replace(/^\/+|\/+$/g, "");
    const relativePath = (itemPath || "").replace(/^\/+|\/+$/g, "");
    const normalizedName = _XMLPackageReader.stripExtension(name);
    const joinedPath = import_cc.path.join(basePath, relativePath, normalizedName);
    return joinedPath.replace(/\\/g, "/");
  }
  static stripExtension(name) {
    const ext = import_cc.path.extname(name);
    return ext ? name.slice(0, -ext.length) : name;
  }
  static readBool(value, defaultValue) {
    if (value == null)
      return defaultValue;
    return value === "true" || value === "1";
  }
  static toArray(value) {
    if (value == null)
      return [];
    return Array.isArray(value) ? value : [value];
  }
  static asNode(value, context) {
    if (!value || Array.isArray(value) || typeof value !== "object")
      throw new Error(`Invalid XML node for ${context}.`);
    return value;
  }
  static isIgnoredKey(key) {
    return key === "?xml" || key === "#text";
  }
};
var PathUtils = import_cc.path;
var UIPackage = class _UIPackage {
  constructor() {
    this._items = [];
    this._itemsById = {};
    this._itemsByName = {};
    this._sprites = {};
    this._dependencies = [];
    this._branches = [];
    this._branchIndex = -1;
  }
  static get branch() {
    return _branch;
  }
  static set branch(value) {
    _branch = value;
    for (var pkgId in _instById) {
      var pkg = _instById[pkgId];
      if (pkg._branches) {
        pkg._branchIndex = pkg._branches.indexOf(value);
      }
    }
  }
  static getVar(key) {
    return _vars[key];
  }
  static setVar(key, value) {
    _vars[key] = value;
  }
  static getById(id) {
    return _instById[id];
  }
  static getByName(name) {
    return _instByName[name];
  }
  /**
   * 注册一个包。包的所有资源必须放在resources下，且已经预加载。
   * @param path 相对 resources 的路径。
   */
  static addPackage(path2) {
    let pkg = _instById[path2];
    if (pkg)
      return pkg;
    let asset = import_cc.resources.get(path2, import_cc.BufferAsset);
    if (!asset)
      throw new Error("Resource '" + path2 + "' not ready");
    const buffer = asset.buffer();
    if (!buffer)
      throw new Error("Missing asset data.");
    pkg = new _UIPackage();
    pkg._bundle = import_cc.resources;
    pkg.loadPackage(new ByteBuffer(buffer), path2);
    _instById[pkg.id] = pkg;
    _instByName[pkg.name] = pkg;
    _instById[pkg._path] = pkg;
    return pkg;
  }
  static addPackageFromXML(xmlString, resourcesPath, bundle) {
    let pkg = _instById[resourcesPath];
    if (pkg)
      return pkg;
    const activeBundle = bundle || import_cc.resources;
    const definition = XMLPackageReader.readPackage(xmlString, resourcesPath, activeBundle);
    pkg = new _UIPackage();
    pkg._bundle = activeBundle;
    pkg._path = resourcesPath;
    pkg._id = definition.id;
    pkg._name = definition.name;
    for (const resource of definition.resources) {
      const pi = new PackageItem();
      pi.owner = pkg;
      pi.type = resource.type;
      pi.objectType = resource.objectType;
      pi.id = resource.id;
      pi.name = resource.name;
      pi.file = resource.assetPath;
      pi.width = resource.width;
      pi.height = resource.height;
      pi.smoothing = resource.smoothing;
      pi.scaleByTile = resource.scaleByTile;
      pi.xmlAssetPath = resource.assetPath;
      pi.xmlComponent = resource.component;
      pi.xmlMovieClip = resource.movieClip;
      pi.xmlIsImage = resource.type == PackageItemType.Image;
      if (resource.type == PackageItemType.Spine || resource.type == PackageItemType.DragonBones) {
        const anchor = resource.skeletonAnchor || { x: 0, y: 0 };
        pi.skeletonAnchor = new import_cc.Vec2(anchor.x, anchor.y);
      }
      if (resource.scale9Grid) {
        pi.scale9Grid = new import_cc.Rect(resource.scale9Grid.x, resource.scale9Grid.y, resource.scale9Grid.width, resource.scale9Grid.height);
      }
      if (pi.type == PackageItemType.Component)
        Decls.UIObjectFactory.resolveExtension(pi);
      pkg._items.push(pi);
      pkg._itemsById[pi.id] = pi;
      if (pi.name != null)
        pkg._itemsByName[pi.name] = pi;
    }
    _instById[pkg.id] = pkg;
    _instByName[pkg.name] = pkg;
    _instById[pkg._path] = pkg;
    return pkg;
  }
  static loadPackageFromXML(...args) {
    let path2;
    let onProgress;
    let onComplete;
    let bundle;
    if (args[0] instanceof import_cc.AssetManager.Bundle) {
      bundle = args[0];
      path2 = args[1];
      if (args.length > 3) {
        onProgress = args[2];
        onComplete = args[3];
      } else
        onComplete = args[2];
    } else {
      path2 = args[0];
      if (args.length > 2) {
        onProgress = args[1];
        onComplete = args[2];
      } else
        onComplete = args[1];
    }
    bundle = bundle || import_cc.resources;
    let pkg = _instById[path2];
    if (pkg) {
      if (onComplete != null)
        onComplete(null, pkg);
      return;
    }
    const packageAssetPath = PathUtils.join(path2, "package");
    bundle.load(packageAssetPath, import_cc.TextAsset, onProgress, (err, packageAsset) => {
      if (err) {
        if (onComplete != null)
          onComplete(err, null);
        return;
      }
      let requests;
      try {
        const manifest = XMLPackageReader.readPackageManifest(packageAsset.text, path2);
        requests = _UIPackage.buildXMLPreloadRequests(manifest.resources);
      } catch (error) {
        if (onComplete != null)
          onComplete(_UIPackage.asError(error), null);
        return;
      }
      let total = requests.length;
      let lastErr;
      let taskComplete = (loadErr) => {
        total--;
        if (loadErr)
          lastErr = loadErr;
        if (total > 0)
          return;
        if (lastErr) {
          if (onComplete != null)
            onComplete(lastErr, null);
          return;
        }
        try {
          pkg = _UIPackage.addPackageFromXML(packageAsset.text, path2, bundle);
          if (onComplete != null)
            onComplete(null, pkg);
        } catch (error) {
          if (onComplete != null)
            onComplete(_UIPackage.asError(error), null);
        }
      };
      if (total == 0) {
        try {
          pkg = _UIPackage.addPackageFromXML(packageAsset.text, path2, bundle);
          if (onComplete != null)
            onComplete(null, pkg);
        } catch (error) {
          if (onComplete != null)
            onComplete(_UIPackage.asError(error), null);
        }
        return;
      }
      requests.forEach((request) => {
        bundle.load(request.path, request.assetType, onProgress, taskComplete);
      });
    });
  }
  static buildXMLPreloadRequests(resources2) {
    const requests = [];
    const seen = /* @__PURE__ */ new Set();
    for (const resource of resources2) {
      if (!resource.assetPath || seen.has(resource.assetPath))
        continue;
      seen.add(resource.assetPath);
      requests.push({
        path: resource.assetPath,
        assetType: _UIPackage.resolveXMLPreloadAssetType(resource.type)
      });
    }
    return requests;
  }
  static resolveXMLPreloadAssetType(type) {
    switch (type) {
      case PackageItemType.Component:
        return import_cc.TextAsset;
      case PackageItemType.Image:
        return import_cc.ImageAsset;
      case PackageItemType.Sound:
        return import_cc.AudioClip;
      case PackageItemType.Spine:
        return import_cc.sp.SkeletonData;
      case PackageItemType.DragonBones:
        return import_cc.dragonBones.DragonBonesAsset;
      default:
        return import_cc.Asset;
    }
  }
  static loadPackage(...args) {
    let path2;
    let onProgress;
    let onComplete;
    let bundle;
    if (args[0] instanceof import_cc.AssetManager.Bundle) {
      bundle = args[0];
      path2 = args[1];
      if (args.length > 3) {
        onProgress = args[2];
        onComplete = args[3];
      } else
        onComplete = args[2];
    } else {
      path2 = args[0];
      if (args.length > 2) {
        onProgress = args[1];
        onComplete = args[2];
      } else
        onComplete = args[1];
    }
    bundle = bundle || import_cc.resources;
    bundle.load(path2, import_cc.Asset, onProgress, (err, asset) => {
      if (err) {
        if (onComplete != null)
          onComplete(err, null);
        return;
      }
      let pkg = new _UIPackage();
      pkg._bundle = bundle;
      let buffer = asset.buffer ? asset.buffer() : asset._nativeAsset;
      pkg.loadPackage(new ByteBuffer(buffer), path2);
      let cnt = pkg._items.length;
      let urls = [];
      for (var i = 0; i < cnt; i++) {
        var pi = pkg._items[i];
        if (pi.type == PackageItemType.Atlas || pi.type == PackageItemType.Sound) {
          ItemTypeToAssetType[pi.type];
          urls.push(pi.file);
        }
      }
      let total = urls.length;
      let lastErr;
      let taskComplete = (err2, asset2) => {
        total--;
        if (err2)
          lastErr = err2;
        if (total <= 0) {
          _instById[pkg.id] = pkg;
          _instByName[pkg.name] = pkg;
          if (pkg._path)
            _instById[pkg._path] = pkg;
          if (onComplete != null)
            onComplete(lastErr, pkg);
        }
      };
      if (total > 0) {
        urls.forEach((url, index) => {
          bundle.load(url, import_cc.Asset, onProgress, taskComplete);
        });
      } else
        taskComplete(null);
    });
  }
  static asError(error) {
    if (error instanceof Error)
      return error;
    return new Error(String(error));
  }
  static removePackage(packageIdOrName) {
    var pkg = _instById[packageIdOrName];
    if (!pkg)
      pkg = _instByName[packageIdOrName];
    if (!pkg)
      throw new Error("No package found: " + packageIdOrName);
    pkg.dispose();
    delete _instById[pkg.id];
    delete _instByName[pkg.name];
    if (pkg._path)
      delete _instById[pkg._path];
  }
  static createObject(pkgName, resName, userClass) {
    var pkg = _UIPackage.getByName(pkgName);
    if (pkg)
      return pkg.createObject(resName, userClass);
    else
      return null;
  }
  static createObjectFromURL(url, userClass) {
    var pi = _UIPackage.getItemByURL(url);
    if (pi)
      return pi.owner.internalCreateObject(pi, userClass);
    else
      return null;
  }
  static getItemURL(pkgName, resName) {
    var pkg = _UIPackage.getByName(pkgName);
    if (!pkg)
      return null;
    var pi = pkg._itemsByName[resName];
    if (!pi)
      return null;
    return "ui://" + pkg.id + pi.id;
  }
  static getItemByURL(url) {
    var pos1 = url.indexOf("//");
    if (pos1 == -1)
      return null;
    var pos2 = url.indexOf("/", pos1 + 2);
    if (pos2 == -1) {
      if (url.length > 13) {
        var pkgId = url.substring(5, 13);
        var pkg = _UIPackage.getById(pkgId);
        if (pkg != null) {
          var srcId = url.substring(13);
          return pkg.getItemById(srcId);
        }
      }
    } else {
      var pkgName = url.substring(pos1 + 2, pos2);
      pkg = _UIPackage.getByName(pkgName);
      if (pkg != null) {
        var srcName = url.substring(pos2 + 1);
        return pkg.getItemByName(srcName);
      }
    }
    return null;
  }
  static normalizeURL(url) {
    if (url == null)
      return null;
    var pos1 = url.indexOf("//");
    if (pos1 == -1)
      return null;
    var pos2 = url.indexOf("/", pos1 + 2);
    if (pos2 == -1)
      return url;
    var pkgName = url.substring(pos1 + 2, pos2);
    var srcName = url.substring(pos2 + 1);
    return _UIPackage.getItemURL(pkgName, srcName);
  }
  static setStringsSource(source) {
    TranslationHelper.loadFromXML(source);
  }
  loadPackage(buffer, path2) {
    if (buffer.readUint() != 1179080009)
      throw new Error("FairyGUI: old package format found in '" + path2 + "'");
    this._path = path2;
    buffer.version = buffer.readInt();
    var ver2 = buffer.version >= 2;
    buffer.readBool();
    this._id = buffer.readString();
    this._name = buffer.readString();
    buffer.skip(20);
    var indexTablePos = buffer.position;
    var cnt;
    var i;
    var nextPos;
    var str;
    var branchIncluded;
    buffer.seek(indexTablePos, 4);
    cnt = buffer.readInt();
    var stringTable = new Array(cnt);
    buffer.stringTable = stringTable;
    for (i = 0; i < cnt; i++)
      stringTable[i] = buffer.readString();
    if (buffer.seek(indexTablePos, 5)) {
      cnt = buffer.readInt();
      for (i = 0; i < cnt; i++) {
        let index = buffer.readUshort();
        let len = buffer.readInt();
        stringTable[index] = buffer.readString(len);
      }
    }
    buffer.seek(indexTablePos, 0);
    cnt = buffer.readShort();
    for (i = 0; i < cnt; i++)
      this._dependencies.push({ id: buffer.readS(), name: buffer.readS() });
    if (ver2) {
      cnt = buffer.readShort();
      if (cnt > 0) {
        this._branches = buffer.readSArray(cnt);
        if (_branch)
          this._branchIndex = this._branches.indexOf(_branch);
      }
      branchIncluded = cnt > 0;
    }
    buffer.seek(indexTablePos, 1);
    var pi;
    let pos = path2.lastIndexOf("/");
    let shortPath = pos == -1 ? "" : path2.substring(0, pos + 1);
    path2 = path2 + "_";
    cnt = buffer.readShort();
    for (i = 0; i < cnt; i++) {
      nextPos = buffer.readInt();
      nextPos += buffer.position;
      pi = new PackageItem();
      pi.owner = this;
      pi.type = buffer.readByte();
      pi.id = buffer.readS();
      pi.name = buffer.readS();
      buffer.readS();
      pi.file = buffer.readS();
      buffer.readBool();
      pi.width = buffer.readInt();
      pi.height = buffer.readInt();
      switch (pi.type) {
        case PackageItemType.Image: {
          pi.objectType = ObjectType.Image;
          var scaleOption = buffer.readByte();
          if (scaleOption == 1) {
            pi.scale9Grid = new import_cc.Rect();
            pi.scale9Grid.x = buffer.readInt();
            pi.scale9Grid.y = buffer.readInt();
            pi.scale9Grid.width = buffer.readInt();
            pi.scale9Grid.height = buffer.readInt();
            pi.tileGridIndice = buffer.readInt();
          } else if (scaleOption == 2)
            pi.scaleByTile = true;
          pi.smoothing = buffer.readBool();
          break;
        }
        case PackageItemType.MovieClip: {
          pi.smoothing = buffer.readBool();
          pi.objectType = ObjectType.MovieClip;
          pi.rawData = buffer.readBuffer();
          break;
        }
        case PackageItemType.Font: {
          pi.rawData = buffer.readBuffer();
          break;
        }
        case PackageItemType.Component: {
          var extension = buffer.readByte();
          if (extension > 0)
            pi.objectType = extension;
          else
            pi.objectType = ObjectType.Component;
          pi.rawData = buffer.readBuffer();
          Decls.UIObjectFactory.resolveExtension(pi);
          break;
        }
        case PackageItemType.Atlas:
        case PackageItemType.Sound:
        case PackageItemType.Misc: {
          pi.file = path2 + PathUtils.mainFileName(pi.file);
          break;
        }
        case PackageItemType.Spine:
        case PackageItemType.DragonBones: {
          pi.file = shortPath + PathUtils.mainFileName(pi.file);
          pi.skeletonAnchor = new import_cc.Vec2();
          pi.skeletonAnchor.x = buffer.readFloat();
          pi.skeletonAnchor.y = buffer.readFloat();
          break;
        }
      }
      if (ver2) {
        str = buffer.readS();
        if (str)
          pi.name = str + "/" + pi.name;
        var branchCnt = buffer.readByte();
        if (branchCnt > 0) {
          if (branchIncluded)
            pi.branches = buffer.readSArray(branchCnt);
          else
            this._itemsById[buffer.readS()] = pi;
        }
        var highResCnt = buffer.readByte();
        if (highResCnt > 0)
          pi.highResolution = buffer.readSArray(highResCnt);
      }
      this._items.push(pi);
      this._itemsById[pi.id] = pi;
      if (pi.name != null)
        this._itemsByName[pi.name] = pi;
      buffer.position = nextPos;
    }
    buffer.seek(indexTablePos, 2);
    cnt = buffer.readShort();
    for (i = 0; i < cnt; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      var itemId = buffer.readS();
      pi = this._itemsById[buffer.readS()];
      let rect = new import_cc.Rect();
      rect.x = buffer.readInt();
      rect.y = buffer.readInt();
      rect.width = buffer.readInt();
      rect.height = buffer.readInt();
      var sprite = { atlas: pi, rect, offset: new import_cc.Vec2(), originalSize: new import_cc.Size(0, 0) };
      sprite.rotated = buffer.readBool();
      if (ver2 && buffer.readBool()) {
        sprite.offset.x = buffer.readInt();
        sprite.offset.y = buffer.readInt();
        sprite.originalSize.width = buffer.readInt();
        sprite.originalSize.height = buffer.readInt();
      } else {
        sprite.originalSize.width = sprite.rect.width;
        sprite.originalSize.height = sprite.rect.height;
      }
      this._sprites[itemId] = sprite;
      buffer.position = nextPos;
    }
    if (buffer.seek(indexTablePos, 3)) {
      cnt = buffer.readShort();
      for (i = 0; i < cnt; i++) {
        nextPos = buffer.readInt();
        nextPos += buffer.position;
        pi = this._itemsById[buffer.readS()];
        if (pi && pi.type == PackageItemType.Image)
          pi.hitTestData = new PixelHitTestData(buffer);
        buffer.position = nextPos;
      }
    }
  }
  dispose() {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var pi = this._items[i];
      if (pi.asset)
        import_cc.assetManager.releaseAsset(pi.asset);
    }
  }
  get id() {
    return this._id;
  }
  get name() {
    return this._name;
  }
  get path() {
    return this._path;
  }
  get dependencies() {
    return this._dependencies;
  }
  createObject(resName, userClass) {
    var pi = this._itemsByName[resName];
    if (pi)
      return this.internalCreateObject(pi, userClass);
    else
      return null;
  }
  internalCreateObject(item, userClass) {
    var g = Decls.UIObjectFactory.newObject(item, userClass);
    if (g == null)
      return null;
    constructingDepth.n++;
    if (item.type == PackageItemType.Component && item.xmlComponent && g instanceof GComponent)
      XMLPackageBuilder.constructComponent(this, g, item.xmlComponent);
    else
      g.constructFromResource();
    constructingDepth.n--;
    return g;
  }
  getItemById(itemId) {
    return this._itemsById[itemId];
  }
  getItemByName(resName) {
    return this._itemsByName[resName];
  }
  getItemAssetByName(resName) {
    var pi = this._itemsByName[resName];
    if (pi == null) {
      throw new Error("Resource not found -" + resName);
    }
    return this.getItemAsset(pi);
  }
  getItemAsset(item) {
    switch (item.type) {
      case PackageItemType.Image:
        if (!item.decoded) {
          item.decoded = true;
          if (item.xmlIsImage) {
            const imageAsset = this._bundle.get(item.file, import_cc.ImageAsset);
            if (!imageAsset)
              console.log("Resource '" + item.file + "' not found");
            else {
              let tex = imageAsset["_texture"];
              if (!tex) {
                tex = new import_cc.Texture2D();
                tex.name = imageAsset.nativeUrl || item.file;
                tex.image = imageAsset;
              }
              const sf = new import_cc.SpriteFrame();
              sf.texture = tex;
              sf.originalSize = new import_cc.Size(item.width, item.height);
              if (item.scale9Grid) {
                sf.insetLeft = item.scale9Grid.x;
                sf.insetTop = item.scale9Grid.y;
                sf.insetRight = item.width - item.scale9Grid.xMax;
                sf.insetBottom = item.height - item.scale9Grid.yMax;
              }
              item.asset = sf;
            }
          } else {
            var sprite = this._sprites[item.id];
            if (sprite) {
              let atlasTexture = this.getItemAsset(sprite.atlas);
              if (atlasTexture) {
                let sf = new import_cc.SpriteFrame();
                sf.texture = atlasTexture;
                sf.rect = sprite.rect;
                sf.rotated = sprite.rotated;
                sf.offset = new import_cc.Vec2(sprite.offset.x - (sprite.originalSize.width - sprite.rect.width) / 2, -(sprite.offset.y - (sprite.originalSize.height - sprite.rect.height) / 2));
                sf.originalSize = sprite.originalSize;
                if (item.scale9Grid) {
                  sf.insetLeft = item.scale9Grid.x;
                  sf.insetTop = item.scale9Grid.y;
                  sf.insetRight = item.width - item.scale9Grid.xMax;
                  sf.insetBottom = item.height - item.scale9Grid.yMax;
                }
                item.asset = sf;
              }
            }
          }
        }
        break;
      case PackageItemType.Atlas:
      case PackageItemType.Sound:
        if (!item.decoded) {
          item.decoded = true;
          item.asset = this._bundle.get(item.file, ItemTypeToAssetType[item.type]);
          if (!item.asset)
            console.log("Resource '" + item.file + "' not found");
          else if (item.type == PackageItemType.Atlas) {
            const asset = item.asset;
            let tex = asset["_texture"];
            if (!tex) {
              tex = new import_cc.Texture2D();
              tex.name = asset.nativeUrl;
              tex.image = asset;
            }
            item.asset = tex;
          } else {
            item.asset = item.asset;
          }
        }
        break;
      case PackageItemType.Font:
        if (!item.decoded) {
          item.decoded = true;
          if (item.rawData)
            this.loadFont(item);
          else
            this.loadFontFromXML(item);
        }
        break;
      case PackageItemType.MovieClip:
        if (!item.decoded) {
          item.decoded = true;
          if (item.rawData)
            this.loadMovieClip(item);
          else
            this.loadMovieClipFromXML(item);
        }
        break;
    }
    return item.asset;
  }
  getItemAssetAsync(item, onComplete) {
    if (item.decoded) {
      onComplete(null, item);
      return;
    }
    if (item.loading) {
      item.loading.push(onComplete);
      return;
    }
    switch (item.type) {
      case PackageItemType.Spine:
        item.loading = [onComplete];
        this.loadSpine(item);
        break;
      case PackageItemType.DragonBones:
        item.loading = [onComplete];
        this.loadDragonBones(item);
        break;
      default:
        this.getItemAsset(item);
        onComplete(null, item);
        break;
    }
  }
  loadAllAssets() {
    var cnt = this._items.length;
    for (var i = 0; i < cnt; i++) {
      var pi = this._items[i];
      this.getItemAsset(pi);
    }
  }
  loadMovieClip(item) {
    var buffer = item.rawData;
    buffer.seek(0, 0);
    item.interval = buffer.readInt() / 1e3;
    item.swing = buffer.readBool();
    item.repeatDelay = buffer.readInt() / 1e3;
    buffer.seek(0, 1);
    var frameCount = buffer.readShort();
    item.frames = Array(frameCount);
    var spriteId;
    var sprite;
    for (var i = 0; i < frameCount; i++) {
      var nextPos = buffer.readShort();
      nextPos += buffer.position;
      let rect = new import_cc.Rect();
      rect.x = buffer.readInt();
      rect.y = buffer.readInt();
      rect.width = buffer.readInt();
      rect.height = buffer.readInt();
      let addDelay = buffer.readInt() / 1e3;
      let frame = { rect, addDelay, texture: null };
      spriteId = buffer.readS();
      if (spriteId != null && (sprite = this._sprites[spriteId]) != null) {
        let atlasTexture = this.getItemAsset(sprite.atlas);
        if (atlasTexture) {
          item.width / frame.rect.width;
          let sf = new import_cc.SpriteFrame();
          sf.texture = atlasTexture;
          sf.rect = sprite.rect;
          sf.rotated = sprite.rotated;
          sf.offset = new import_cc.Vec2(frame.rect.x - (item.width - frame.rect.width) / 2, -(frame.rect.y - (item.height - frame.rect.height) / 2));
          sf.originalSize = new import_cc.Size(item.width, item.height);
          frame.texture = sf;
        }
      }
      item.frames[i] = frame;
      buffer.position = nextPos;
    }
  }
  loadMovieClipFromXML(item) {
    var _a, _b, _c;
    const definition = item.xmlMovieClip;
    item.interval = (_a = definition === null || definition === void 0 ? void 0 : definition.interval) !== null && _a !== void 0 ? _a : 0;
    item.repeatDelay = (_b = definition === null || definition === void 0 ? void 0 : definition.repeatDelay) !== null && _b !== void 0 ? _b : 0;
    item.swing = (_c = definition === null || definition === void 0 ? void 0 : definition.swing) !== null && _c !== void 0 ? _c : false;
    item.frames = [];
    if (!definition || definition.frames.length == 0)
      return;
    const textures = new Array(definition.textures.length);
    item.frames = definition.frames.map((frameDefinition) => {
      const rect = new import_cc.Rect(frameDefinition.rect.x, frameDefinition.rect.y, frameDefinition.rect.width, frameDefinition.rect.height);
      return {
        rect,
        addDelay: frameDefinition.addDelay,
        texture: this.buildXMLMovieClipFrameTexture(item, definition, frameDefinition.textureIndex, rect, textures)
      };
    });
  }
  buildXMLMovieClipFrameTexture(item, definition, textureIndex, rect, textures) {
    const texture = this.getOrCreateXMLMovieClipTexture(item, definition, textureIndex, textures);
    if (!texture)
      return null;
    const spriteFrame = new import_cc.SpriteFrame();
    spriteFrame.texture = texture;
    spriteFrame.rect = new import_cc.Rect(0, 0, rect.width, rect.height);
    spriteFrame.offset = new import_cc.Vec2(rect.x - (item.width - rect.width) / 2, -(rect.y - (item.height - rect.height) / 2));
    spriteFrame.originalSize = new import_cc.Size(item.width, item.height);
    return spriteFrame;
  }
  getOrCreateXMLMovieClipTexture(item, definition, textureIndex, textures) {
    if (textureIndex < 0 || textureIndex >= definition.textures.length) {
      console.warn(`FairyGUI XML: movieclip '${item.name}' frame references missing texture index '${textureIndex}'.`);
      return null;
    }
    if (textures[textureIndex] !== void 0)
      return textures[textureIndex];
    const textureDefinition = definition.textures[textureIndex];
    const texture = new import_cc.Texture2D();
    texture.name = `${item.name || item.id}@${textureIndex}`;
    textures[textureIndex] = texture;
    if (typeof createImageBitmap == "function" && typeof Blob != "undefined") {
      createImageBitmap(new Blob([textureDefinition.bytes], { type: textureDefinition.mimeType })).then((bitmap) => {
        if (!(0, import_cc.isValid)(texture, true))
          return;
        texture.reset({
          width: bitmap.width,
          height: bitmap.height
        });
        texture.uploadData(bitmap, 0, 0);
      }).catch((error) => {
        console.warn(`FairyGUI XML: movieclip '${item.name}' failed to decode embedded texture #${textureIndex} via createImageBitmap.`, error);
      });
      return texture;
    }
    if (typeof Image != "undefined") {
      const source = new Image();
      source.onload = () => {
        if (!(0, import_cc.isValid)(texture, true))
          return;
        texture.reset({
          width: source.width,
          height: source.height
        });
        texture.uploadData(source, 0, 0);
      };
      source.onerror = (event) => {
        console.warn(`FairyGUI XML: movieclip '${item.name}' failed to decode embedded texture #${textureIndex} via data URL.`, event);
      };
      const dataUrl = _UIPackage.createDataUrl(textureDefinition.mimeType, textureDefinition.bytes);
      if (dataUrl) {
        source.src = dataUrl;
        return texture;
      }
    }
    console.warn(`FairyGUI XML: movieclip '${item.name}' cannot decode embedded texture #${textureIndex} in the current runtime.`);
    textures[textureIndex] = null;
    return null;
  }
  static createDataUrl(mimeType, bytes) {
    const base64 = _UIPackage.encodeBase64(bytes);
    if (!base64)
      return null;
    return `data:${mimeType};base64,${base64}`;
  }
  static encodeBase64(bytes) {
    const globalBuffer = globalThis.Buffer;
    if (globalBuffer)
      return globalBuffer.from(bytes).toString("base64");
    if (typeof btoa != "function")
      return null;
    let binary = "";
    const chunkSize = 32768;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      const chunk = bytes.subarray(offset, offset + chunkSize);
      for (let i = 0; i < chunk.length; i++)
        binary += String.fromCharCode(chunk[i]);
    }
    return btoa(binary);
  }
  loadFont(item) {
    var font = new import_cc.BitmapFont();
    item.asset = font;
    font.fntConfig = {
      commonHeight: 0,
      fontSize: 0,
      kerningDict: {},
      fontDefDictionary: {}
    };
    let dict = font.fntConfig.fontDefDictionary;
    var buffer = item.rawData;
    buffer.seek(0, 0);
    let ttf = buffer.readBool();
    let canTint = buffer.readBool();
    let resizable = buffer.readBool();
    buffer.readBool();
    let fontSize = buffer.readInt();
    var xadvance = buffer.readInt();
    var lineHeight = buffer.readInt();
    let mainTexture;
    var mainSprite = this._sprites[item.id];
    if (mainSprite)
      mainTexture = this.getItemAsset(mainSprite.atlas);
    buffer.seek(0, 1);
    var bg;
    var cnt = buffer.readInt();
    for (var i = 0; i < cnt; i++) {
      var nextPos = buffer.readShort();
      nextPos += buffer.position;
      bg = {};
      var ch = buffer.readUshort();
      dict[ch] = bg;
      let rect = new import_cc.Rect();
      bg.rect = rect;
      var img = buffer.readS();
      rect.x = buffer.readInt();
      rect.y = buffer.readInt();
      bg.xOffset = buffer.readInt();
      bg.yOffset = buffer.readInt();
      rect.width = buffer.readInt();
      rect.height = buffer.readInt();
      bg.xAdvance = buffer.readInt();
      bg.channel = buffer.readByte();
      if (bg.channel == 1)
        bg.channel = 3;
      else if (bg.channel == 2)
        bg.channel = 2;
      else if (bg.channel == 3)
        bg.channel = 1;
      if (ttf) {
        rect.x += mainSprite.rect.x;
        rect.y += mainSprite.rect.y;
      } else {
        let sprite = this._sprites[img];
        if (sprite) {
          rect.set(sprite.rect);
          bg.xOffset += sprite.offset.x;
          bg.yOffset += sprite.offset.y;
          if (fontSize == 0)
            fontSize = sprite.originalSize.height;
          if (!mainTexture) {
            sprite.atlas.load();
            mainTexture = sprite.atlas.asset;
          }
        }
        if (bg.xAdvance == 0) {
          if (xadvance == 0)
            bg.xAdvance = bg.xOffset + bg.rect.width;
          else
            bg.xAdvance = xadvance;
        }
      }
      buffer.position = nextPos;
    }
    font.fontSize = fontSize;
    font.fntConfig.fontSize = fontSize;
    font.fntConfig.commonHeight = lineHeight == 0 ? fontSize : lineHeight;
    font.fntConfig.resizable = resizable;
    font.fntConfig.canTint = canTint;
    let spriteFrame = new import_cc.SpriteFrame();
    spriteFrame.texture = mainTexture;
    font.spriteFrame = spriteFrame;
    font.onLoaded();
  }
  loadFontFromXML(item) {
    const fontAsset = this._bundle.get(item.file, import_cc.BitmapFont) || this._bundle.get(item.file);
    if (_UIPackage.isBitmapFontAsset(fontAsset)) {
      item.asset = fontAsset;
      return;
    }
    const textAsset = this._bundle.get(item.file, import_cc.TextAsset) || this._bundle.get(item.file);
    if (_UIPackage.isTextAsset(textAsset) && _UIPackage.isImageGlyphFont(textAsset.text)) {
      console.warn(`FairyGUI XML: font '${item.name}' uses image glyph ids and still requires atlas-style font support.`);
      return;
    }
    if (_UIPackage.isTextAsset(textAsset))
      console.warn(`FairyGUI XML: font '${item.name}' is not imported as BitmapFont. Preload it as BitmapFont to use runtime XML fonts.`);
    else
      console.log("Resource '" + item.file + "' not found");
  }
  static isBitmapFontAsset(asset) {
    const candidate = asset;
    return !!candidate && typeof candidate == "object" && candidate.fntConfig != null && candidate.spriteFrame != null;
  }
  static isTextAsset(asset) {
    return !!asset && typeof asset.text === "string";
  }
  static isImageGlyphFont(text) {
    return /\bimg\s*=/.test(text);
  }
  loadSpine(item) {
    this._bundle.load(item.file, import_cc.sp.SkeletonData, (err, asset) => {
      item.decoded = true;
      item.asset = asset;
      let arr = item.loading;
      delete item.loading;
      arr.forEach((e) => e(err, item));
    });
  }
  loadDragonBones(item) {
    this._bundle.load(item.file, import_cc.dragonBones.DragonBonesAsset, (err, asset) => {
      if (err) {
        item.decoded = true;
        let arr = item.loading;
        delete item.loading;
        arr.forEach((e) => e(err, item));
        return;
      }
      item.asset = asset;
      let atlasFile = item.file.replace("_ske", "_tex");
      let pos = atlasFile.lastIndexOf(".");
      if (pos != -1)
        atlasFile = atlasFile.substring(0, pos + 1) + "json";
      this._bundle.load(atlasFile, import_cc.dragonBones.DragonBonesAtlasAsset, (err2, asset2) => {
        item.decoded = true;
        item.atlasAsset = asset2;
        let arr = item.loading;
        delete item.loading;
        arr.forEach((e) => e(err2, item));
      });
    });
  }
};
var ItemTypeToAssetType = {
  [PackageItemType.Atlas]: import_cc.ImageAsset,
  [PackageItemType.Sound]: import_cc.AudioClip
};
var _instById = {};
var _instByName = {};
var _branch = "";
var _vars = {};
var Decls = {};
function toGrayedColor(c) {
  let v = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
  return new import_cc.Color(v, v, v, c.a);
}
var GTextField = class extends GObject {
  constructor() {
    super();
    this._fontSize = 0;
    this._leading = 0;
    this._node.name = "GTextField";
    this._touchDisabled = true;
    this._text = "";
    this._color = new import_cc.Color(255, 255, 255, 255);
    this.createRenderer();
    this.fontSize = 12;
    this.leading = 3;
    this.singleLine = false;
    this._sizeDirty = false;
    this._node.on(import_cc.Node.EventType.SIZE_CHANGED, this.onLabelSizeChanged, this);
  }
  createRenderer() {
    this._label = this._node.addComponent(import_cc.Label);
    this._label.string = "";
    this.autoSize = AutoSizeType.Both;
  }
  set text(value) {
    this._text = value;
    if (this._text == null)
      this._text = "";
    this.updateGear(6);
    this.markSizeChanged();
    this.updateText();
  }
  get text() {
    return this._text;
  }
  get font() {
    return this._font;
  }
  set font(value) {
    if (this._font != value || !value) {
      this._font = value;
      this.markSizeChanged();
      let newFont = value ? value : UIConfig.defaultFont;
      if (newFont.startsWith("ui://")) {
        var pi = UIPackage.getItemByURL(newFont);
        if (pi) {
          const loadedFont = pi.owner.getItemAsset(pi);
          newFont = loadedFont || UIConfig.defaultFont;
        } else
          newFont = UIConfig.defaultFont;
      }
      this._realFont = newFont;
      this.updateFont();
    }
  }
  get fontSize() {
    return this._fontSize;
  }
  set fontSize(value) {
    if (value < 0)
      return;
    if (this._fontSize != value) {
      this._fontSize = value;
      this.markSizeChanged();
      this.updateFontSize();
    }
  }
  get color() {
    return this._color;
  }
  set color(value) {
    this._color.set(value);
    this.updateGear(4);
    this.updateFontColor();
  }
  get align() {
    return this._label ? this._label.horizontalAlign : 0;
  }
  set align(value) {
    if (this._label)
      this._label.horizontalAlign = value;
  }
  get verticalAlign() {
    return this._label ? this._label.verticalAlign : 0;
  }
  set verticalAlign(value) {
    if (this._label)
      this._label.verticalAlign = value;
  }
  get leading() {
    return this._leading;
  }
  set leading(value) {
    if (this._leading != value) {
      this._leading = value;
      this.markSizeChanged();
      this.updateFontSize();
    }
  }
  get letterSpacing() {
    return this._label ? this._label.spacingX : 0;
  }
  set letterSpacing(value) {
    if (this._label && this._label.spacingX != value) {
      this.markSizeChanged();
      this._label.spacingX = value;
    }
  }
  get underline() {
    return this._label ? this._label.isUnderline : false;
  }
  set underline(value) {
    if (this._label)
      this._label.isUnderline = value;
  }
  get bold() {
    return this._label ? this._label.isBold : false;
  }
  set bold(value) {
    if (this._label)
      this._label.isBold = value;
  }
  get italic() {
    return this._label ? this._label.isItalic : false;
  }
  set italic(value) {
    if (this._label)
      this._label.isItalic = value;
  }
  get singleLine() {
    return this._label ? !this._label.enableWrapText : false;
  }
  set singleLine(value) {
    if (this._label)
      this._label.enableWrapText = !value;
  }
  get stroke() {
    return this._label ? this._label.outlineWidth : 0;
  }
  set stroke(value) {
    if (!this._label)
      return;
    this._label.outlineWidth = value;
    this._label.enableOutline = value > 0;
    if (value > 0)
      this.updateStrokeColor();
  }
  get strokeColor() {
    return this._strokeColor;
  }
  set strokeColor(value) {
    if (!this._strokeColor)
      this._strokeColor = new import_cc.Color();
    this._strokeColor.set(value);
    this.updateGear(4);
    this.updateStrokeColor();
  }
  get shadowOffset() {
    return this._shadowOffset;
  }
  set shadowOffset(value) {
    if (!this._shadowOffset)
      this._shadowOffset = new import_cc.Vec2();
    this._shadowOffset.set(value);
    if (!this._label)
      return;
    this._label.shadowOffset = new import_cc.Vec2(this._shadowOffset.x, -this._shadowOffset.y);
    this._label.enableShadow = value.x != 0 || value.y != 0;
    if (this._label.enableShadow)
      this.updateShadowColor();
  }
  get shadowColor() {
    return this._shadowColor;
  }
  set shadowColor(value) {
    if (!this._shadowColor)
      this._shadowColor = new import_cc.Color();
    this._shadowColor.set(value);
    this.updateShadowColor();
  }
  set ubbEnabled(value) {
    if (this._ubbEnabled != value) {
      this._ubbEnabled = value;
      this.markSizeChanged();
      this.updateText();
    }
  }
  get ubbEnabled() {
    return this._ubbEnabled;
  }
  set autoSize(value) {
    if (this._autoSize != value) {
      this._autoSize = value;
      this.markSizeChanged();
      this.updateOverflow();
    }
  }
  get autoSize() {
    return this._autoSize;
  }
  parseTemplate(template) {
    var pos1 = 0, pos2, pos3;
    var tag;
    var value;
    var result = "";
    while ((pos2 = template.indexOf("{", pos1)) != -1) {
      if (pos2 > 0 && template.charCodeAt(pos2 - 1) == 92) {
        result += template.substring(pos1, pos2 - 1);
        result += "{";
        pos1 = pos2 + 1;
        continue;
      }
      result += template.substring(pos1, pos2);
      pos1 = pos2;
      pos2 = template.indexOf("}", pos1);
      if (pos2 == -1)
        break;
      if (pos2 == pos1 + 1) {
        result += template.substring(pos1, pos1 + 2);
        pos1 = pos2 + 1;
        continue;
      }
      tag = template.substring(pos1 + 1, pos2);
      pos3 = tag.indexOf("=");
      if (pos3 != -1) {
        value = this._templateVars[tag.substring(0, pos3)];
        if (value == null)
          result += tag.substring(pos3 + 1);
        else
          result += value;
      } else {
        value = this._templateVars[tag];
        if (value != null)
          result += value;
      }
      pos1 = pos2 + 1;
    }
    if (pos1 < template.length)
      result += template.substring(pos1);
    return result;
  }
  get templateVars() {
    return this._templateVars;
  }
  set templateVars(value) {
    if (this._templateVars == null && value == null)
      return;
    this._templateVars = value;
    this.flushVars();
  }
  setVar(name, value) {
    if (!this._templateVars)
      this._templateVars = {};
    this._templateVars[name] = value;
    return this;
  }
  flushVars() {
    this.markSizeChanged();
    this.updateText();
  }
  get textWidth() {
    this.ensureSizeCorrect();
    return this._uiTrans.width;
  }
  ensureSizeCorrect() {
    if (this._sizeDirty) {
      this._label.updateRenderData(true);
      this._sizeDirty = false;
    }
  }
  updateText() {
    var text2 = this._text;
    if (this._templateVars)
      text2 = this.parseTemplate(text2);
    if (this._ubbEnabled)
      text2 = defaultParser.parse(text2, true);
    this._label.string = text2;
  }
  assignFont(label, value) {
    if (value instanceof import_cc.Font)
      label.font = value;
    else {
      let font = getFontByName(value);
      if (!font) {
        label.fontFamily = value;
        label.useSystemFont = true;
      } else
        label.font = font;
    }
  }
  assignFontColor(label, value) {
    let font = label.font;
    if (font instanceof import_cc.BitmapFont && !font.fntConfig.canTint)
      value = import_cc.Color.WHITE;
    if (this._grayed)
      value = toGrayedColor(value);
    label.color = value;
  }
  updateFont() {
    this.assignFont(this._label, this._realFont);
  }
  updateFontColor() {
    this.assignFontColor(this._label, this._color);
  }
  updateStrokeColor() {
    if (!this._label || !this._label.enableOutline)
      return;
    if (!this._strokeColor)
      this._strokeColor = new import_cc.Color();
    if (this._grayed)
      this._label.outlineColor = toGrayedColor(this._strokeColor);
    else
      this._label.outlineColor = this._strokeColor;
  }
  updateShadowColor() {
    if (!this._label || !this._label.enableShadow)
      return;
    if (!this._shadowColor)
      this._shadowColor = new import_cc.Color();
    if (this._grayed)
      this._label.shadowColor = toGrayedColor(this._shadowColor);
    else
      this._label.shadowColor = this._shadowColor;
  }
  updateFontSize() {
    let font = this._label.font;
    if (font instanceof import_cc.BitmapFont) {
      let fntConfig = font.fntConfig;
      if (fntConfig.resizable)
        this._label.fontSize = this._fontSize;
      else
        this._label.fontSize = fntConfig.fontSize;
      this._label.lineHeight = fntConfig.fontSize + (this._leading + 4) * fntConfig.fontSize / this._label.fontSize;
    } else {
      this._label.fontSize = this._fontSize;
      this._label.lineHeight = this._fontSize + this._leading;
    }
  }
  updateOverflow() {
    if (this._autoSize == AutoSizeType.Both)
      this._label.overflow = import_cc.Label.Overflow.NONE;
    else if (this._autoSize == AutoSizeType.Height) {
      this._label.overflow = import_cc.Label.Overflow.RESIZE_HEIGHT;
      this._uiTrans.width = this._width;
    } else if (this._autoSize == AutoSizeType.Shrink) {
      this._label.overflow = import_cc.Label.Overflow.SHRINK;
      this._uiTrans.setContentSize(this._width, this._height);
    } else {
      this._label.overflow = import_cc.Label.Overflow.CLAMP;
      this._uiTrans.setContentSize(this._width, this._height);
    }
  }
  markSizeChanged() {
    if (this._underConstruct)
      return;
    if (this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height) {
      if (!this._sizeDirty) {
        this._node.emit(Event.SIZE_DELAY_CHANGE);
        this._sizeDirty = true;
      }
    }
  }
  onLabelSizeChanged() {
    this._sizeDirty = false;
    if (this._underConstruct)
      return;
    if (this._autoSize == AutoSizeType.Both || this._autoSize == AutoSizeType.Height) {
      this._updatingSize = true;
      this.setSize(this._uiTrans.width, this._uiTrans.height);
      this._updatingSize = false;
    }
  }
  handleSizeChanged() {
    if (this._updatingSize)
      return;
    if (this._autoSize == AutoSizeType.None || this._autoSize == AutoSizeType.Shrink) {
      this._uiTrans.setContentSize(this._width, this._height);
    } else if (this._autoSize == AutoSizeType.Height)
      this._uiTrans.width = this._width;
  }
  handleGrayedChanged() {
    this.updateFontColor();
    this.updateStrokeColor();
  }
  getProp(index) {
    switch (index) {
      case ObjectPropID.Color:
        return this.color;
      case ObjectPropID.OutlineColor:
        return this.strokeColor;
      case ObjectPropID.FontSize:
        return this.fontSize;
      default:
        return super.getProp(index);
    }
  }
  setProp(index, value) {
    switch (index) {
      case ObjectPropID.Color:
        this.color = value;
        break;
      case ObjectPropID.OutlineColor:
        this.strokeColor = value;
        break;
      case ObjectPropID.FontSize:
        this.fontSize = value;
        break;
      default:
        super.setProp(index, value);
        break;
    }
  }
  setup_beforeAdd(buffer, beginPos) {
    super.setup_beforeAdd(buffer, beginPos);
    buffer.seek(beginPos, 5);
    this.font = buffer.readS();
    this.fontSize = buffer.readShort();
    this.color = buffer.readColor();
    this.align = buffer.readByte();
    this.verticalAlign = buffer.readByte();
    this.leading = buffer.readShort();
    this.letterSpacing = buffer.readShort();
    this._ubbEnabled = buffer.readBool();
    this.autoSize = buffer.readByte();
    this.underline = buffer.readBool();
    this.italic = buffer.readBool();
    this.bold = buffer.readBool();
    this.singleLine = buffer.readBool();
    if (buffer.readBool()) {
      this.strokeColor = buffer.readColor();
      this.stroke = buffer.readFloat();
    }
    if (buffer.readBool()) {
      this.shadowColor = buffer.readColor();
      let f1 = buffer.readFloat();
      let f2 = buffer.readFloat();
      this.shadowOffset = new import_cc.Vec2(f1, f2);
    }
    if (buffer.readBool())
      this._templateVars = {};
  }
  setup_afterAdd(buffer, beginPos) {
    super.setup_afterAdd(buffer, beginPos);
    buffer.seek(beginPos, 6);
    var str = buffer.readS();
    if (str != null) {
      this.text = str;
    } else {
      this.text = "";
    }
  }
};
var RichTextImageAtlas = class extends import_cc.SpriteAtlas {
  getSpriteFrame(key) {
    let pi = UIPackage.getItemByURL(key);
    if (pi) {
      pi.load();
      if (pi.type == PackageItemType.Image)
        return pi.asset;
      else if (pi.type == PackageItemType.MovieClip && pi.frames && pi.frames.length > 0)
        return pi.frames[0].texture;
    }
    return super.getSpriteFrame(key);
  }
};
var imageAtlas = new RichTextImageAtlas();
var GRichTextField = class extends GTextField {
  constructor() {
    super();
    this._node.name = "GRichTextField";
    this._touchDisabled = false;
    this.linkUnderline = UIConfig.linkUnderline;
  }
  createRenderer() {
    this._richText = this._node.addComponent(import_cc.RichText);
    this._richText.handleTouchEvent = false;
    this.autoSize = AutoSizeType.None;
    this._richText.imageAtlas = imageAtlas;
  }
  get align() {
    return this._richText.horizontalAlign;
  }
  set align(value) {
    this._richText.horizontalAlign = value;
  }
  get underline() {
    return this._underline;
  }
  set underline(value) {
    if (this._underline != value) {
      this._underline = value;
      this.updateText();
    }
  }
  get bold() {
    return this._bold;
  }
  set bold(value) {
    if (this._bold != value) {
      this._bold = value;
      this.updateText();
    }
  }
  get italic() {
    return this._italics;
  }
  set italic(value) {
    if (this._italics != value) {
      this._italics = value;
      this.updateText();
    }
  }
  markSizeChanged() {
  }
  updateText() {
    var text2 = this._text;
    if (this._templateVars)
      text2 = this.parseTemplate(text2);
    if (this._ubbEnabled) {
      defaultParser.linkUnderline = this.linkUnderline;
      defaultParser.linkColor = this.linkColor;
      text2 = defaultParser.parse(text2);
    }
    if (this._bold)
      text2 = "<b>" + text2 + "</b>";
    if (this._italics)
      text2 = "<i>" + text2 + "</i>";
    if (this._underline)
      text2 = "<u>" + text2 + "</u>";
    let c = this._color;
    if (this._grayed)
      c = toGrayedColor(c);
    text2 = "<color=" + c.toHEX("#rrggbb") + ">" + text2 + "</color>";
    if (this._autoSize == AutoSizeType.Both) {
      if (this._richText.maxWidth != 0)
        this._richText["_maxWidth"] = 0;
      this._richText.string = text2;
      if (this.maxWidth != 0 && this._uiTrans.contentSize.width > this.maxWidth)
        this._richText.maxWidth = this.maxWidth;
    } else
      this._richText.string = text2;
  }
  updateFont() {
    this.assignFont(this._richText, this._realFont);
  }
  updateFontColor() {
    this.assignFontColor(this._richText, this._color);
  }
  updateFontSize() {
    let fontSize = this._fontSize;
    let font = this._richText.font;
    if (font instanceof import_cc.BitmapFont) {
      if (!font.fntConfig.resizable)
        fontSize = font.fntConfig.fontSize;
    }
    this._richText.fontSize = fontSize;
    this._richText.lineHeight = fontSize + this._leading * 2;
  }
  updateOverflow() {
    if (this._autoSize == AutoSizeType.Both)
      this._richText.maxWidth = 0;
    else
      this._richText.maxWidth = this._width;
  }
  handleSizeChanged() {
    if (this._updatingSize)
      return;
    if (this._autoSize != AutoSizeType.Both)
      this._richText.maxWidth = this._width;
  }
};
var InputProcessor = class extends import_cc.Component {
  constructor() {
    super();
    this._touches = new Array();
    this._rollOutChain = new Array();
    this._rollOverChain = new Array();
    this._touchPos = new import_cc.Vec2();
  }
  onLoad() {
    this._owner = GObject.cast(this.node);
  }
  onEnable() {
    let node = this.node;
    node.on(import_cc.Node.EventType.TOUCH_START, this.touchBeginHandler, this);
    node.on(import_cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
    node.on(import_cc.Node.EventType.TOUCH_END, this.touchEndHandler, this);
    node.on(import_cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    node.on(import_cc.Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
    node.on(import_cc.Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
    node.on(import_cc.Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
    node.on(import_cc.Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
    this._touchListener = this.node.eventProcessor.touchListener;
  }
  onDisable() {
    let node = this.node;
    node.off(import_cc.Node.EventType.TOUCH_START, this.touchBeginHandler, this);
    node.off(import_cc.Node.EventType.TOUCH_MOVE, this.touchMoveHandler, this);
    node.off(import_cc.Node.EventType.TOUCH_END, this.touchEndHandler, this);
    node.off(import_cc.Node.EventType.TOUCH_CANCEL, this.touchCancelHandler, this);
    node.off(import_cc.Node.EventType.MOUSE_DOWN, this.mouseDownHandler, this);
    node.off(import_cc.Node.EventType.MOUSE_MOVE, this.mouseMoveHandler, this);
    node.off(import_cc.Node.EventType.MOUSE_UP, this.mouseUpHandler, this);
    node.off(import_cc.Node.EventType.MOUSE_WHEEL, this.mouseWheelHandler, this);
    this._touchListener = null;
  }
  getAllTouches(touchIds) {
    touchIds = touchIds || new Array();
    let cnt = this._touches.length;
    for (let i = 0; i < cnt; i++) {
      let ti = this._touches[i];
      if (ti.touchId != -1)
        touchIds.push(ti.touchId);
    }
    return touchIds;
  }
  getTouchPosition(touchId) {
    if (touchId === void 0)
      touchId = -1;
    let cnt = this._touches.length;
    for (let i = 0; i < cnt; i++) {
      let ti = this._touches[i];
      if (ti.touchId != -1 && (touchId == -1 || ti.touchId == touchId))
        return ti.pos;
    }
    return import_cc.Vec2.ZERO;
  }
  getTouchTarget() {
    let cnt = this._touches.length;
    for (let i = 0; i < cnt; i++) {
      let ti = this._touches[i];
      if (ti.touchId != -1)
        return ti.target;
    }
    return null;
  }
  addTouchMonitor(touchId, target) {
    let ti = this.getInfo(touchId, false);
    if (!ti)
      return;
    let index = ti.touchMonitors.indexOf(target);
    if (index == -1)
      ti.touchMonitors.push(target);
  }
  removeTouchMonitor(target) {
    let cnt = this._touches.length;
    for (let i = 0; i < cnt; i++) {
      let ti = this._touches[i];
      let index = ti.touchMonitors.indexOf(target);
      if (index != -1)
        ti.touchMonitors.splice(index, 1);
    }
  }
  cancelClick(touchId) {
    let ti = this.getInfo(touchId, false);
    if (ti)
      ti.clickCancelled = true;
  }
  simulateClick(target) {
    let evt;
    evt = borrowEvent(Event.TOUCH_BEGIN, true);
    evt.initiator = target;
    evt.pos.set(target.localToGlobal());
    evt.touchId = 0;
    evt.clickCount = 1;
    evt.button = 0;
    evt._processor = this;
    if (this._captureCallback)
      this._captureCallback.call(this._owner, evt);
    target.node.dispatchEvent(evt);
    evt.unuse();
    evt.type = Event.TOUCH_END;
    evt.bubbles = true;
    target.node.dispatchEvent(evt);
    evt.unuse();
    evt.type = Event.CLICK;
    evt.bubbles = true;
    target.node.dispatchEvent(evt);
    returnEvent(evt);
  }
  touchBeginHandler(evt) {
    let ti = this.updateInfo(evt.getID(), evt.getLocation());
    this.setBegin(ti);
    if (this._touchListener) {
      this._touchListener.setSwallowTouches(ti.target != this._owner);
    } else {
      let e = evt;
      e.preventSwallow = ti.target == this._owner;
    }
    let evt2 = this.getEvent(ti, ti.target, Event.TOUCH_BEGIN, true);
    if (this._captureCallback)
      this._captureCallback.call(this._owner, evt2);
    ti.target.node.dispatchEvent(evt2);
    this.handleRollOver(ti, ti.target);
    return true;
  }
  touchMoveHandler(evt) {
    let ti = this.updateInfo(evt.getID(), evt.getLocation());
    if (!this._touchListener) {
      let e = evt;
      e.preventSwallow = ti.target == this._owner;
    }
    this.handleRollOver(ti, ti.target);
    if (ti.began) {
      let evt2 = this.getEvent(ti, ti.target, Event.TOUCH_MOVE, false);
      let done = false;
      let cnt = ti.touchMonitors.length;
      for (let i = 0; i < cnt; i++) {
        let mm = ti.touchMonitors[i];
        if (mm.node == null || !mm.node.activeInHierarchy)
          continue;
        evt2.unuse();
        evt2.type = Event.TOUCH_MOVE;
        mm.node.dispatchEvent(evt2);
        if (mm == this._owner)
          done = true;
      }
      if (!done && this.node) {
        evt2.unuse();
        evt2.type = Event.TOUCH_MOVE;
        this.node.dispatchEvent(evt2);
      }
      returnEvent(evt2);
    }
  }
  touchEndHandler(evt) {
    let ti = this.updateInfo(evt.getID(), evt.getLocation());
    if (!this._touchListener) {
      let e = evt;
      e.preventSwallow = ti.target == this._owner;
    }
    this.setEnd(ti);
    let evt2 = this.getEvent(ti, ti.target, Event.TOUCH_END, false);
    let cnt = ti.touchMonitors.length;
    for (let i = 0; i < cnt; i++) {
      let mm = ti.touchMonitors[i];
      if (mm == ti.target || mm.node == null || !mm.node.activeInHierarchy || "isAncestorOf" in mm && mm.isAncestorOf(ti.target))
        continue;
      evt2.unuse();
      evt2.type = Event.TOUCH_END;
      mm.node.dispatchEvent(evt2);
    }
    ti.touchMonitors.length = 0;
    if (ti.target && ti.target.node) {
      if (ti.target instanceof GRichTextField)
        ti.target.node.getComponent(import_cc.RichText)["_onTouchEnded"](evt);
      evt2.unuse();
      evt2.type = Event.TOUCH_END;
      evt2.bubbles = true;
      ti.target.node.dispatchEvent(evt2);
    }
    returnEvent(evt2);
    ti.target = this.clickTest(ti);
    if (ti.target) {
      evt2 = this.getEvent(ti, ti.target, Event.CLICK, true);
      ti.target.node.dispatchEvent(evt2);
      returnEvent(evt2);
    }
    if (import_cc.sys.isMobile)
      this.handleRollOver(ti, null);
    else
      this.handleRollOver(ti, ti.target);
    ti.target = null;
    ti.touchId = -1;
    ti.button = -1;
  }
  touchCancelHandler(evt) {
    let ti = this.updateInfo(evt.getID(), evt.getLocation());
    if (!this._touchListener) {
      let e = evt;
      e.preventSwallow = ti.target == this._owner;
    }
    let evt2 = this.getEvent(ti, ti.target, Event.TOUCH_END, false);
    let cnt = ti.touchMonitors.length;
    for (let i = 0; i < cnt; i++) {
      let mm = ti.touchMonitors[i];
      if (mm == ti.target || mm.node == null || !mm.node.activeInHierarchy || "isAncestorOf" in mm && mm.isAncestorOf(ti.target))
        continue;
      evt2.initiator = mm;
      mm.node.dispatchEvent(evt2);
    }
    ti.touchMonitors.length = 0;
    if (ti.target && ti.target.node) {
      evt2.bubbles = true;
      ti.target.node.dispatchEvent(evt2);
    }
    returnEvent(evt2);
    this.handleRollOver(ti, null);
    ti.target = null;
    ti.touchId = -1;
    ti.button = -1;
  }
  mouseDownHandler(evt) {
    let ti = this.getInfo(0, true);
    ti.button = evt.getButton();
  }
  mouseUpHandler(evt) {
    let ti = this.getInfo(0, true);
    ti.button = evt.getButton();
  }
  mouseMoveHandler(evt) {
    let ti = this.getInfo(0, false);
    if (ti && Math.abs(ti.pos.x - evt.getLocationX()) < 1 && Math.abs(ti.pos.y - (UIContentScaler.rootSize.height - evt.getLocationY())) < 1)
      return;
    ti = this.updateInfo(0, evt.getLocation());
    this.handleRollOver(ti, ti.target);
    if (ti.began) {
      let evt2 = this.getEvent(ti, ti.target, Event.TOUCH_MOVE, false);
      let done = false;
      let cnt = ti.touchMonitors.length;
      for (let i = 0; i < cnt; i++) {
        let mm = ti.touchMonitors[i];
        if (mm.node == null || !mm.node.activeInHierarchy)
          continue;
        evt2.initiator = mm;
        mm.node.dispatchEvent(evt2);
        if (mm == this._owner)
          done = true;
      }
      if (!done && this.node) {
        evt2.initiator = this._owner;
        this.node.dispatchEvent(evt2);
        returnEvent(evt2);
      }
      returnEvent(evt2);
    }
  }
  mouseWheelHandler(evt) {
    let ti = this.updateInfo(0, evt.getLocation());
    ti.mouseWheelDelta = Math.max(evt.getScrollX(), evt.getScrollY());
    let evt2 = this.getEvent(ti, ti.target, Event.MOUSE_WHEEL, true);
    ti.target.node.dispatchEvent(evt2);
    returnEvent(evt2);
  }
  updateInfo(touchId, pos) {
    const camera = import_cc.director.root.batcher2D.getFirstRenderCamera(this.node);
    if (camera) {
      s_vec3.set(pos.x, pos.y);
      camera.screenToWorld(s_vec3_2, s_vec3);
      this._touchPos.set(s_vec3_2.x, s_vec3_2.y);
    } else
      this._touchPos.set(pos);
    this._touchPos.y = UIContentScaler.rootSize.height - this._touchPos.y;
    let target = this._owner.hitTest(this._touchPos);
    if (!target)
      target = this._owner;
    let ti = this.getInfo(touchId);
    ti.target = target;
    ti.pos.set(this._touchPos);
    ti.button = import_cc.EventMouse.BUTTON_LEFT;
    ti.touchId = touchId;
    return ti;
  }
  getInfo(touchId, createIfNotExisits) {
    if (createIfNotExisits === void 0)
      createIfNotExisits = true;
    let ret = null;
    let cnt = this._touches.length;
    for (let i = 0; i < cnt; i++) {
      let ti = this._touches[i];
      if (ti.touchId == touchId)
        return ti;
      else if (ti.touchId == -1)
        ret = ti;
    }
    if (!ret) {
      if (!createIfNotExisits)
        return null;
      ret = new TouchInfo();
      this._touches.push(ret);
    }
    ret.touchId = touchId;
    return ret;
  }
  setBegin(ti) {
    ti.began = true;
    ti.clickCancelled = false;
    ti.downPos.set(ti.pos);
    ti.downTargets.length = 0;
    let obj = ti.target;
    while (obj) {
      ti.downTargets.push(obj);
      obj = obj.findParent();
    }
  }
  setEnd(ti) {
    ti.began = false;
    let now = import_cc.game.totalTime / 1e3;
    let elapsed = now - ti.lastClickTime;
    if (elapsed < 0.45) {
      if (ti.clickCount == 2)
        ti.clickCount = 1;
      else
        ti.clickCount++;
    } else
      ti.clickCount = 1;
    ti.lastClickTime = now;
  }
  clickTest(ti) {
    if (ti.downTargets.length == 0 || ti.clickCancelled || Math.abs(ti.pos.x - ti.downPos.x) > 50 || Math.abs(ti.pos.y - ti.downPos.y) > 50)
      return null;
    let obj = ti.downTargets[0];
    if (obj && obj.node && obj.node.activeInHierarchy)
      return obj;
    obj = ti.target;
    while (obj) {
      let index = ti.downTargets.indexOf(obj);
      if (index != -1 && obj.node && obj.node.activeInHierarchy)
        break;
      obj = obj.findParent();
    }
    return obj;
  }
  handleRollOver(ti, target) {
    if (ti.lastRollOver == target)
      return;
    let element = ti.lastRollOver;
    while (element && element.node) {
      this._rollOutChain.push(element);
      element = element.findParent();
    }
    element = target;
    while (element && element.node) {
      let i = this._rollOutChain.indexOf(element);
      if (i != -1) {
        this._rollOutChain.length = i;
        break;
      }
      this._rollOverChain.push(element);
      element = element.findParent();
    }
    ti.lastRollOver = target;
    let cnt = this._rollOutChain.length;
    for (let i = 0; i < cnt; i++) {
      element = this._rollOutChain[i];
      if (element.node && element.node.activeInHierarchy) {
        let evt = this.getEvent(ti, element, Event.ROLL_OUT, false);
        element.node.dispatchEvent(evt);
        returnEvent(evt);
      }
    }
    cnt = this._rollOverChain.length;
    for (let i = 0; i < cnt; i++) {
      element = this._rollOverChain[i];
      if (element.node && element.node.activeInHierarchy) {
        let evt = this.getEvent(ti, element, Event.ROLL_OVER, false);
        element.node.dispatchEvent(evt);
        returnEvent(evt);
      }
    }
    this._rollOutChain.length = 0;
    this._rollOverChain.length = 0;
  }
  getEvent(ti, target, type, bubbles) {
    let evt = borrowEvent(type, bubbles);
    evt.initiator = target;
    evt.pos.set(ti.pos);
    evt.touchId = ti.touchId;
    evt.clickCount = ti.clickCount;
    evt.button = ti.button;
    evt.mouseWheelDelta = ti.mouseWheelDelta;
    evt._processor = this;
    return evt;
  }
};
var TouchInfo = class {
  constructor() {
    this.pos = new import_cc.Vec2();
    this.touchId = 0;
    this.clickCount = 0;
    this.mouseWheelDelta = 0;
    this.button = -1;
    this.downPos = new import_cc.Vec2();
    this.began = false;
    this.clickCancelled = false;
    this.lastClickTime = 0;
    this.downTargets = new Array();
    this.touchMonitors = new Array();
  }
};
var s_vec3 = new import_cc.Vec3();
var s_vec3_2 = new import_cc.Vec3();
var GRoot = class _GRoot extends GComponent {
  static get inst() {
    if (!_GRoot._inst)
      throw "Call GRoot.create first!";
    return _GRoot._inst;
  }
  static create() {
    _GRoot._inst = new _GRoot();
    import_cc.director.getScene().getChildByName("Canvas").addChild(_GRoot._inst.node);
    _GRoot._inst.onWinResize();
    return _GRoot._inst;
  }
  constructor() {
    super();
    this._node.name = "GRoot";
    this.opaque = false;
    this._volumeScale = 1;
    this._popupStack = new Array();
    this._justClosedPopups = new Array();
    this._modalLayer = new GGraph();
    this._modalLayer.setSize(this.width, this.height);
    this._modalLayer.drawRect(0, import_cc.Color.TRANSPARENT, UIConfig.modalLayerColor);
    this._modalLayer.addRelation(this, RelationType.Size);
    this._thisOnResized = this.onWinResize.bind(this);
    this._inputProcessor = this.node.addComponent(InputProcessor);
    this._inputProcessor._captureCallback = this.onTouchBegin_1;
    import_cc.View.instance.on("design-resolution-changed", this.onWinResize, this);
    if (!import_env.EDITOR) {
      import_cc.View.instance.on("canvas-resize", this._thisOnResized);
      window.addEventListener("orientationchange", this._thisOnResized);
    }
  }
  onDestroy() {
    import_cc.View.instance.off("design-resolution-changed", this.onWinResize, this);
    if (!import_env.EDITOR) {
      import_cc.View.instance.off("canvas-resize", this._thisOnResized);
      window.removeEventListener("orientationchange", this._thisOnResized);
    }
    if (this == _GRoot._inst)
      _GRoot._inst = null;
  }
  getTouchPosition(touchId) {
    return this._inputProcessor.getTouchPosition(touchId);
  }
  get touchTarget() {
    return this._inputProcessor.getTouchTarget();
  }
  get inputProcessor() {
    return this._inputProcessor;
  }
  showWindow(win) {
    this.addChild(win);
    win.requestFocus();
    if (win.x > this.width)
      win.x = this.width - win.width;
    else if (win.x + win.width < 0)
      win.x = 0;
    if (win.y > this.height)
      win.y = this.height - win.height;
    else if (win.y + win.height < 0)
      win.y = 0;
    this.adjustModalLayer();
  }
  hideWindow(win) {
    win.hide();
  }
  hideWindowImmediately(win) {
    if (win.parent == this)
      this.removeChild(win);
    this.adjustModalLayer();
  }
  bringToFront(win) {
    var cnt = this.numChildren;
    var i;
    if (this._modalLayer.parent && !win.modal)
      i = this.getChildIndex(this._modalLayer) - 1;
    else
      i = cnt - 1;
    for (; i >= 0; i--) {
      var g = this.getChildAt(i);
      if (g == win)
        return;
      if (g instanceof Window)
        break;
    }
    if (i >= 0)
      this.setChildIndex(win, i);
  }
  showModalWait(msg) {
    if (UIConfig.globalModalWaiting != null) {
      if (this._modalWaitPane == null)
        this._modalWaitPane = UIPackage.createObjectFromURL(UIConfig.globalModalWaiting);
      this._modalWaitPane.setSize(this.width, this.height);
      this._modalWaitPane.addRelation(this, RelationType.Size);
      this.addChild(this._modalWaitPane);
      this._modalWaitPane.text = msg;
    }
  }
  closeModalWait() {
    if (this._modalWaitPane && this._modalWaitPane.parent)
      this.removeChild(this._modalWaitPane);
  }
  closeAllExceptModals() {
    var arr = this._children.slice();
    var cnt = arr.length;
    for (var i = 0; i < cnt; i++) {
      var g = arr[i];
      if (g instanceof Window && !g.modal)
        g.hide();
    }
  }
  closeAllWindows() {
    var arr = this._children.slice();
    var cnt = arr.length;
    for (var i = 0; i < cnt; i++) {
      var g = arr[i];
      if (g instanceof Window)
        g.hide();
    }
  }
  getTopWindow() {
    var cnt = this.numChildren;
    for (var i = cnt - 1; i >= 0; i--) {
      var g = this.getChildAt(i);
      if (g instanceof Window) {
        return g;
      }
    }
    return null;
  }
  get modalLayer() {
    return this._modalLayer;
  }
  get hasModalWindow() {
    return this._modalLayer.parent != null;
  }
  get modalWaiting() {
    return this._modalWaitPane && this._modalWaitPane.node.activeInHierarchy;
  }
  getPopupPosition(popup, target, dir, result) {
    let pos = result || new import_cc.Vec2();
    var sizeW = 0, sizeH = 0;
    if (target) {
      pos = target.localToGlobal();
      this.globalToLocal(pos.x, pos.y, pos);
      let pos2 = target.localToGlobal(target.width, target.height);
      this.globalToLocal(pos2.x, pos2.y, pos2);
      sizeW = pos2.x - pos.x;
      sizeH = pos2.y - pos.y;
    } else {
      pos = this.getTouchPosition();
      pos = this.globalToLocal(pos.x, pos.y);
    }
    if (pos.x + popup.width > this.width)
      pos.x = pos.x + sizeW - popup.width;
    pos.y += sizeH;
    if ((dir === void 0 || dir === PopupDirection.Auto) && pos.y + popup.height > this.height || dir === false || dir === PopupDirection.Up) {
      pos.y = pos.y - sizeH - popup.height - 1;
      if (pos.y < 0) {
        pos.y = 0;
        pos.x += sizeW / 2;
      }
    }
    return pos;
  }
  showPopup(popup, target, dir) {
    if (this._popupStack.length > 0) {
      var k = this._popupStack.indexOf(popup);
      if (k != -1) {
        for (var i = this._popupStack.length - 1; i >= k; i--)
          this.removeChild(this._popupStack.pop());
      }
    }
    this._popupStack.push(popup);
    if (target) {
      var p = target;
      while (p) {
        if (p.parent == this) {
          if (popup.sortingOrder < p.sortingOrder) {
            popup.sortingOrder = p.sortingOrder;
          }
          break;
        }
        p = p.parent;
      }
    }
    this.addChild(popup);
    this.adjustModalLayer();
    let pt = this.getPopupPosition(popup, target, dir);
    popup.setPosition(pt.x, pt.y);
  }
  togglePopup(popup, target, dir) {
    if (this._justClosedPopups.indexOf(popup) != -1)
      return;
    this.showPopup(popup, target, dir);
  }
  hidePopup(popup) {
    if (popup) {
      var k = this._popupStack.indexOf(popup);
      if (k != -1) {
        for (var i = this._popupStack.length - 1; i >= k; i--)
          this.closePopup(this._popupStack.pop());
      }
    } else {
      var cnt = this._popupStack.length;
      for (i = cnt - 1; i >= 0; i--)
        this.closePopup(this._popupStack[i]);
      this._popupStack.length = 0;
    }
  }
  get hasAnyPopup() {
    return this._popupStack.length != 0;
  }
  closePopup(target) {
    if (target.parent) {
      if (target instanceof Window)
        target.hide();
      else
        this.removeChild(target);
    }
  }
  showTooltips(msg) {
    if (this._defaultTooltipWin == null) {
      var resourceURL = UIConfig.tooltipsWin;
      if (!resourceURL) {
        console.error("UIConfig.tooltipsWin not defined");
        return;
      }
      this._defaultTooltipWin = UIPackage.createObjectFromURL(resourceURL);
    }
    this._defaultTooltipWin.text = msg;
    this.showTooltipsWin(this._defaultTooltipWin);
  }
  showTooltipsWin(tooltipWin) {
    this.hideTooltips();
    this._tooltipWin = tooltipWin;
    let pt = this.getTouchPosition();
    pt.x += 10;
    pt.y += 20;
    this.globalToLocal(pt.x, pt.y, pt);
    if (pt.x + this._tooltipWin.width > this.width) {
      pt.x = pt.x - this._tooltipWin.width - 1;
      if (pt.x < 0)
        pt.x = 10;
    }
    if (pt.y + this._tooltipWin.height > this.height) {
      pt.y = pt.y - this._tooltipWin.height - 1;
      if (pt.y < 0)
        pt.y = 10;
    }
    this._tooltipWin.setPosition(pt.x, pt.y);
    this.addChild(this._tooltipWin);
  }
  hideTooltips() {
    if (this._tooltipWin) {
      if (this._tooltipWin.parent)
        this.removeChild(this._tooltipWin);
      this._tooltipWin = null;
    }
  }
  get volumeScale() {
    return this._volumeScale;
  }
  set volumeScale(value) {
    this._volumeScale = value;
  }
  playOneShotSound(clip, volumeScale) {
    if (!this.audioEngine) {
      this.audioEngine = this.node.addComponent(import_cc.AudioSourceComponent);
    }
    if (volumeScale === void 0)
      volumeScale = 1;
    if (this.audioEngine.isValid) {
      this.audioEngine.clip = clip;
      this.audioEngine.volume = this._volumeScale * volumeScale;
      this.audioEngine.loop = false;
      this.audioEngine.play();
    }
  }
  adjustModalLayer() {
    var cnt = this.numChildren;
    if (this._modalWaitPane && this._modalWaitPane.parent)
      this.setChildIndex(this._modalWaitPane, cnt - 1);
    for (var i = cnt - 1; i >= 0; i--) {
      var g = this.getChildAt(i);
      if (g instanceof Window && g.modal) {
        if (this._modalLayer.parent == null)
          this.addChildAt(this._modalLayer, i);
        else
          this.setChildIndexBefore(this._modalLayer, i);
        return;
      }
    }
    if (this._modalLayer.parent)
      this.removeChild(this._modalLayer);
  }
  onTouchBegin_1(evt) {
    if (this._tooltipWin)
      this.hideTooltips();
    this._justClosedPopups.length = 0;
    if (this._popupStack.length > 0) {
      let mc = evt.initiator;
      while (mc && mc != this) {
        let pindex = this._popupStack.indexOf(mc);
        if (pindex != -1) {
          for (let i = this._popupStack.length - 1; i > pindex; i--) {
            var popup = this._popupStack.pop();
            this.closePopup(popup);
            this._justClosedPopups.push(popup);
          }
          return;
        }
        mc = mc.findParent();
      }
      let cnt = this._popupStack.length;
      for (let i = cnt - 1; i >= 0; i--) {
        popup = this._popupStack[i];
        this.closePopup(popup);
        this._justClosedPopups.push(popup);
      }
      this._popupStack.length = 0;
    }
  }
  onWinResize() {
    updateScaler();
    this.setSize(UIContentScaler.rootSize.width, UIContentScaler.rootSize.height);
    let anchorPoint = this.node.getParent().getComponent(import_cc.UITransform).anchorPoint;
    this.node.setPosition(-this._width * anchorPoint.x, this._height * (1 - anchorPoint.y));
  }
  handlePositionChanged() {
  }
};
Decls$1.GRoot = GRoot;
var PopupMenu = class {
  constructor(url) {
    if (!url) {
      url = UIConfig.popupMenu;
      if (!url)
        throw new Error("UIConfig.popupMenu not defined");
    }
    this._contentPane = UIPackage.createObjectFromURL(url);
    this._contentPane.on(Event.DISPLAY, this.onDisplay, this);
    this._list = this._contentPane.getChild("list");
    this._list.removeChildrenToPool();
    this._list.addRelation(this._contentPane, RelationType.Width);
    this._list.removeRelation(this._contentPane, RelationType.Height);
    this._contentPane.addRelation(this._list, RelationType.Height);
    this._list.on(Event.CLICK_ITEM, this.onClickItem, this);
  }
  dispose() {
    this._contentPane.dispose();
  }
  addItem(caption, callback) {
    var item = this._list.addItemFromPool();
    item.title = caption;
    item.data = callback;
    item.grayed = false;
    var c = item.getController("checked");
    if (c)
      c.selectedIndex = 0;
    return item;
  }
  addItemAt(caption, index, callback) {
    var item = this._list.getFromPool();
    this._list.addChildAt(item, index);
    item.title = caption;
    item.data = callback;
    item.grayed = false;
    var c = item.getController("checked");
    if (c)
      c.selectedIndex = 0;
    return item;
  }
  addSeperator() {
    if (UIConfig.popupMenu_seperator == null)
      throw new Error("UIConfig.popupMenu_seperator not defined");
    this.list.addItemFromPool(UIConfig.popupMenu_seperator);
  }
  getItemName(index) {
    var item = this._list.getChildAt(index);
    return item.name;
  }
  setItemText(name, caption) {
    var item = this._list.getChild(name);
    item.title = caption;
  }
  setItemVisible(name, visible) {
    var item = this._list.getChild(name);
    if (item.visible != visible) {
      item.visible = visible;
      this._list.setBoundsChangedFlag();
    }
  }
  setItemGrayed(name, grayed) {
    var item = this._list.getChild(name);
    item.grayed = grayed;
  }
  setItemCheckable(name, checkable) {
    var item = this._list.getChild(name);
    var c = item.getController("checked");
    if (c) {
      if (checkable) {
        if (c.selectedIndex == 0)
          c.selectedIndex = 1;
      } else
        c.selectedIndex = 0;
    }
  }
  setItemChecked(name, checked) {
    var item = this._list.getChild(name);
    var c = item.getController("checked");
    if (c)
      c.selectedIndex = checked ? 2 : 1;
  }
  isItemChecked(name) {
    var item = this._list.getChild(name);
    var c = item.getController("checked");
    if (c)
      return c.selectedIndex == 2;
    else
      return false;
  }
  removeItem(name) {
    var item = this._list.getChild(name);
    if (item) {
      var index = this._list.getChildIndex(item);
      this._list.removeChildToPoolAt(index);
      return true;
    } else
      return false;
  }
  clearItems() {
    this._list.removeChildrenToPool();
  }
  get itemCount() {
    return this._list.numChildren;
  }
  get contentPane() {
    return this._contentPane;
  }
  get list() {
    return this._list;
  }
  show(target, dir) {
    GRoot.inst.showPopup(this.contentPane, target instanceof GRoot ? null : target, dir);
  }
  onClickItem(item, evt) {
    this._list._partner.callLater((dt) => {
      this.onClickItem2(item, evt);
    }, 0.1);
  }
  onClickItem2(item, evt) {
    if (!(item instanceof GButton))
      return;
    if (item.grayed) {
      this._list.selectedIndex = -1;
      return;
    }
    var c = item.getController("checked");
    if (c && c.selectedIndex != 0) {
      if (c.selectedIndex == 1)
        c.selectedIndex = 2;
      else
        c.selectedIndex = 1;
    }
    var r = this._contentPane.parent;
    r.hidePopup(this.contentPane);
    if (item.data instanceof Function)
      item.data(item, evt);
  }
  onDisplay() {
    this._list.selectedIndex = -1;
    this._list.resizeToFit(1e5, 10);
  }
};
var DragDropManager = class _DragDropManager {
  static get inst() {
    if (!_DragDropManager._inst)
      _DragDropManager._inst = new _DragDropManager();
    return _DragDropManager._inst;
  }
  constructor() {
    this._agent = new GLoader();
    this._agent.draggable = true;
    this._agent.touchable = false;
    this._agent.setSize(100, 100);
    this._agent.setPivot(0.5, 0.5, true);
    this._agent.align = AlignType.Center;
    this._agent.verticalAlign = VertAlignType.Middle;
    this._agent.sortingOrder = 1e6;
    this._agent.on(Event.DRAG_END, this.onDragEnd, this);
  }
  get dragAgent() {
    return this._agent;
  }
  get dragging() {
    return this._agent.parent != null;
  }
  startDrag(source, icon, sourceData, touchId) {
    if (this._agent.parent)
      return;
    this._sourceData = sourceData;
    this._agent.url = icon;
    GRoot.inst.addChild(this._agent);
    let pt = GRoot.inst.getTouchPosition(touchId);
    pt = GRoot.inst.globalToLocal(pt.x, pt.y);
    this._agent.setPosition(pt.x, pt.y);
    this._agent.startDrag(touchId);
  }
  cancel() {
    if (this._agent.parent) {
      this._agent.stopDrag();
      GRoot.inst.removeChild(this._agent);
      this._sourceData = null;
    }
  }
  onDragEnd() {
    if (!this._agent.parent)
      return;
    GRoot.inst.removeChild(this._agent);
    var sourceData = this._sourceData;
    this._sourceData = null;
    var obj = GRoot.inst.touchTarget;
    while (obj) {
      if (obj.node.hasEventListener(Event.DROP)) {
        obj.requestFocus();
        obj.node.emit(Event.DROP, obj, sourceData);
        return;
      }
      obj = obj.parent;
    }
  }
};
var AsyncOperation = class {
  createObject(pkgName, resName) {
    if (this._node)
      throw "Already running";
    var pkg = UIPackage.getByName(pkgName);
    if (pkg) {
      var pi = pkg.getItemByName(resName);
      if (!pi)
        throw new Error("resource not found: " + resName);
      this.internalCreateObject(pi);
    } else
      throw new Error("package not found: " + pkgName);
  }
  createObjectFromURL(url) {
    if (this._node)
      throw "Already running";
    var pi = UIPackage.getItemByURL(url);
    if (pi)
      this.internalCreateObject(pi);
    else
      throw new Error("resource not found: " + url);
  }
  cancel() {
    if (this._node) {
      this._node.destroy();
      this._node = null;
    }
  }
  internalCreateObject(item) {
    this._node = new import_cc.Node("[AsyncCreating:" + item.name + "]");
    import_cc.game.addPersistRootNode(this._node);
    this._node.on("#", this.completed, this);
    this._node.addComponent(AsyncOperationRunner).init(item);
  }
  completed(result) {
    this.cancel();
    if (this.callback)
      this.callback(result);
  }
};
var AsyncOperationRunner = class extends import_cc.Component {
  constructor() {
    super();
    this._itemList = new Array();
    this._objectPool = new Array();
  }
  init(item) {
    this._itemList.length = 0;
    this._objectPool.length = 0;
    var di = { pi: item, type: item.objectType };
    di.childCount = this.collectComponentChildren(item);
    this._itemList.push(di);
    this._index = 0;
  }
  onDestroy() {
    this._itemList.length = 0;
    var cnt = this._objectPool.length;
    if (cnt > 0) {
      for (var i = 0; i < cnt; i++)
        this._objectPool[i].dispose();
      this._objectPool.length = 0;
    }
  }
  collectComponentChildren(item) {
    if (item.xmlComponent)
      return 0;
    var buffer = item.rawData;
    buffer.seek(0, 2);
    var di;
    var pi;
    var i;
    var dataLen;
    var curPos;
    var pkg;
    var dcnt = buffer.readShort();
    for (i = 0; i < dcnt; i++) {
      dataLen = buffer.readShort();
      curPos = buffer.position;
      buffer.seek(curPos, 0);
      var type = buffer.readByte();
      var src = buffer.readS();
      var pkgId = buffer.readS();
      buffer.position = curPos;
      if (src != null) {
        if (pkgId != null)
          pkg = UIPackage.getById(pkgId);
        else
          pkg = item.owner;
        pi = pkg != null ? pkg.getItemById(src) : null;
        di = { pi, type };
        if (pi && pi.type == PackageItemType.Component)
          di.childCount = this.collectComponentChildren(pi);
      } else {
        di = { type };
        if (type == ObjectType.List)
          di.listItemCount = this.collectListChildren(buffer);
      }
      this._itemList.push(di);
      buffer.position = curPos + dataLen;
    }
    return dcnt;
  }
  collectListChildren(buffer) {
    buffer.seek(buffer.position, 8);
    var listItemCount = 0;
    var i;
    var nextPos;
    var url;
    var pi;
    var di;
    var defaultItem = buffer.readS();
    var itemCount = buffer.readShort();
    for (i = 0; i < itemCount; i++) {
      nextPos = buffer.readShort();
      nextPos += buffer.position;
      url = buffer.readS();
      if (url == null)
        url = defaultItem;
      if (url) {
        pi = UIPackage.getItemByURL(url);
        if (pi) {
          di = { pi, type: pi.objectType };
          if (pi.type == PackageItemType.Component)
            di.childCount = this.collectComponentChildren(pi);
          this._itemList.push(di);
          listItemCount++;
        }
      }
      buffer.position = nextPos;
    }
    return listItemCount;
  }
  update() {
    var obj;
    var di;
    var poolStart;
    var k;
    var t = import_cc.game.totalTime / 1e3;
    var frameTime = UIConfig.frameTimeForAsyncUIConstruction;
    var totalItems = this._itemList.length;
    while (this._index < totalItems) {
      di = this._itemList[this._index];
      if (di.pi) {
        obj = UIObjectFactory.newObject(di.pi);
        this._objectPool.push(obj);
        constructingDepth.n++;
        if (di.pi.type == PackageItemType.Component) {
          if (di.pi.xmlComponent && obj instanceof GComponent) {
            XMLPackageBuilder.constructComponent(di.pi.owner, obj, di.pi.xmlComponent);
          } else {
            poolStart = this._objectPool.length - di.childCount - 1;
            obj.constructFromResource2(this._objectPool, poolStart);
            this._objectPool.splice(poolStart, di.childCount);
          }
        } else {
          obj.constructFromResource();
        }
        constructingDepth.n--;
      } else {
        obj = UIObjectFactory.newObject(di.type);
        this._objectPool.push(obj);
        if (di.type == ObjectType.List && di.listItemCount > 0) {
          poolStart = this._objectPool.length - di.listItemCount - 1;
          for (k = 0; k < di.listItemCount; k++)
            obj.itemPool.returnObject(this._objectPool[k + poolStart]);
          this._objectPool.splice(poolStart, di.listItemCount);
        }
      }
      this._index++;
      if (this._index % 5 == 0 && import_cc.game.totalTime / 1e3 - t >= frameTime)
        return;
    }
    var result = this._objectPool[0];
    this._itemList.length = 0;
    this._objectPool.length = 0;
    this.node.emit("#", result);
  }
};
