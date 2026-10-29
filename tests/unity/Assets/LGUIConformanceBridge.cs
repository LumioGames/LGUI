// Native input and result plumbing for the development-only Unity conformance project.
// This file is never copied into the LGUI runtime package.
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Text;
using FairyGUI;
using UnityEngine;
using UnityEngine.Scripting;
#if UNITY_EDITOR
using UnityEditor;
#endif

namespace LGUI.Tests
{
    [Preserve]
    public static class ConformanceBridge
    {
        static readonly List<string> errors = new List<string>();
        static readonly List<string> trace = new List<string>();
        static bool traceEnabled;
        static bool pointerActive;
        static bool pointerDown;
        static Vector2 pointer;
        static bool pointerTouch;
        static bool completed;
        static string resultPath;
        static Event pendingWheel;
        static int pendingWheelFrame;
        static Stage observedStage;
        static int updates;
        static int lateUpdates;
        static int pointerSequence;
        static readonly FieldInfo stageInstance = typeof(Stage).GetField("_inst", BindingFlags.NonPublic | BindingFlags.Static);
        static readonly FieldInfo touchTarget = typeof(Stage).GetField("_touchTarget", BindingFlags.NonPublic | BindingFlags.Instance);
        static readonly Encoding utf8 = new UTF8Encoding(false);
        static readonly MethodInfo handleGuiEvents = typeof(Stage).GetMethod("HandleGUIEvents", BindingFlags.NonPublic | BindingFlags.Instance);

        [Preserve]
        public static int RenderedFrame { get; private set; } = -1;

        [Preserve]
        public static int ConsumedPointerDown { get; private set; }

        [Preserve]
        public static int ConsumedPointerUp { get; private set; }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Initialize()
        {
            errors.Clear();
            trace.Clear();
            traceEnabled = Array.IndexOf(Environment.GetCommandLineArgs(), "-lguiTrace") >= 0;
            pointerActive = pointerDown = completed = false;
            pendingWheel = null;
            observedStage = null;
            updates = lateUpdates = 0;
            pointerSequence = ConsumedPointerDown = ConsumedPointerUp = 0;
            RenderedFrame = -1;
            resultPath = Argument("-lguiResult");
            Application.logMessageReceived -= CaptureError;
            if (string.IsNullOrEmpty(resultPath)) return;
            Application.logMessageReceived += CaptureError;
            var driver = new GameObject("LGUI Conformance Input");
            driver.AddComponent<LGUIConformanceBridge>();
            UnityEngine.Object.DontDestroyOnLoad(driver);
            Trace("initialize", "screen=" + Screen.width + "x" + Screen.height);
        }

        internal static string Argument(string name)
        {
            var arguments = Environment.GetCommandLineArgs();
            for (int index = 0; index + 1 < arguments.Length; index++)
                if (arguments[index] == name) return arguments[index + 1];
            return null;
        }

        static InvalidOperationException Unsupported(string message)
        {
            return new InvalidOperationException("LGUI-RT-001 LGUIConformanceBridge.cs: " + message +
                " → Check the Unity 6000.6 test bridge and run this test in the development Unity project.");
        }

        static void CaptureError(string message, string stack, LogType type)
        {
            if (type != LogType.Error && type != LogType.Assert && type != LogType.Exception) return;
            errors.Add(type + ": " + message + "\n" + stack);
            Trace("native-error", message);
            WriteErrorFile();
            WriteTrace();
        }

        static string F(double value) { return value.ToString("F3", CultureInfo.InvariantCulture); }

        static void Trace(string kind, string detail)
        {
            if (!traceEnabled || string.IsNullOrEmpty(resultPath) || trace.Count >= 12000) return;
            trace.Add("frame=" + Time.frameCount + " realtimeMs=" + F(Time.realtimeSinceStartupAsDouble * 1000) +
                " unscaledMs=" + F(Time.unscaledTimeAsDouble * 1000) + " deltaMs=" + F(Time.unscaledDeltaTime * 1000) +
                " rendered=" + RenderedFrame + " focus=" + Application.isFocused + " kind=" + kind + " " + detail);
        }

        static string HitTarget()
        {
            var target = observedStage == null || touchTarget == null ? null : touchTarget.GetValue(observedStage) as DisplayObject;
            // Read the already selected target; do not call Stage.touchTarget because its
            // getter can force an earlier hit test and would change the timing under study.
            for (var node = target; node != null; node = node.parent)
                if (node.gOwner != null) return node.gOwner.name + "[" + node.gOwner.id + "]";
            return target == null ? "<none>" : target.name;
        }

        static void AttachTrace()
        {
            var stage = stageInstance == null ? null : stageInstance.GetValue(null) as Stage;
            if (stage == null || stage == observedStage) return;
            observedStage = stage;
            // Consumption acknowledgements are part of the test input contract,
            // independent of optional tracing.
            observedStage.onTouchBegin.AddCapture(StageBegin);
            observedStage.onTouchEnd.AddCapture(StageEnd);
            if (traceEnabled)
            {
                observedStage.onTouchMove.AddCapture(StageMove);
            }
            observedStage.afterUpdate += StageRendered;
            Trace("stage-attached", "target=" + HitTarget());
        }

        static void StageInput(string kind, EventContext context)
        {
            if (!traceEnabled) return;
            var input = context.inputEvent;
            Trace(kind, input == null ? "input=<none>" :
                "x=" + F(input.x) + " y=" + F(input.y) + " id=" + input.touchId +
                " button=" + input.button + " holdMs=" + F(input.holdTime * 1000) +
                " clicks=" + input.clickCount + " target=" + HitTarget());
        }

        static bool MatchesPointer(EventContext context, bool down)
        {
            var input = context.inputEvent;
            return pointerActive && pointerDown == down && input != null && input.touchId == 0 && input.button == 0 &&
                Stage.touchScreen == pointerTouch && Math.Abs(input.x - pointer.x) <= 0.5f && Math.Abs(input.y - pointer.y) <= 0.5f;
        }

        static void StageBegin(EventContext context)
        {
            if (MatchesPointer(context, true))
            {
                ConsumedPointerDown = pointerSequence;
                Trace("pointer-consumed-down", "seq=" + pointerSequence);
            }
            StageInput("stage-down", context);
        }

        static void StageEnd(EventContext context)
        {
            if (MatchesPointer(context, false))
            {
                ConsumedPointerUp = pointerSequence;
                Trace("pointer-consumed-up", "seq=" + pointerSequence);
            }
            StageInput("stage-up", context);
        }
        static void StageMove(EventContext context) { StageInput("stage-move", context); }
        static void StageRendered()
        {
            RenderedFrame = Time.frameCount;
            if (traceEnabled) Trace("stage-after-update", "target=" + HitTarget());
        }

        static void WriteTrace()
        {
            if (traceEnabled && !string.IsNullOrEmpty(resultPath)) WriteAtomically(resultPath + ".trace.log", string.Join("\n", trace) + "\n");
        }

        internal static void LateTick()
        {
            lateUpdates++;
            if (traceEnabled) Trace("driver-late", "count=" + lateUpdates);
        }

        internal static void Focus(bool focused) { Trace("application-focus", "value=" + focused); }
        internal static void Pause(bool paused) { Trace("application-pause", "value=" + paused); }
        internal static void FinishTrace()
        {
            Trace("driver-destroy", "");
            WriteTrace();
            if (observedStage == null) return;
            observedStage.onTouchBegin.RemoveCapture(StageBegin);
            observedStage.onTouchEnd.RemoveCapture(StageEnd);
            observedStage.onTouchMove.RemoveCapture(StageMove);
            observedStage.afterUpdate -= StageRendered;
            observedStage = null;
        }

        static string RequiredResultPath()
        {
            resultPath ??= Argument("-lguiResult");
            if (string.IsNullOrEmpty(resultPath) || !Path.IsPathRooted(resultPath))
                throw Unsupported("-lguiResult must name an absolute result file.");
            return resultPath;
        }

        static void WriteAtomically(string path, string content)
        {
            var parent = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(parent)) Directory.CreateDirectory(parent);
            var pending = path + ".pending";
            File.WriteAllText(pending, content, utf8);
            if (File.Exists(path)) File.Delete(path);
            File.Move(pending, path);
        }

        [Serializable]
        sealed class ErrorReport
        {
            public string code = "LGUI-RT-001";
            public string message;
            public string[] errors;
        }

        static void WriteErrorFile()
        {
            if (string.IsNullOrEmpty(resultPath)) return;
            WriteAtomically(resultPath + ".errors.json", JsonUtility.ToJson(new ErrorReport
            {
                message = "The native conformance run logged errors.",
                errors = errors.ToArray()
            }, true));
        }

        internal static void Tick()
        {
            updates++;
            AttachTrace();
            if (traceEnabled) Trace("driver-update", "count=" + updates + " pointer=" + pointerActive + " down=" + pointerDown);
            if (pointerActive) ApplyPointer();
            // Stage resolves the hit target in LateUpdate. Dispatch the wheel only after
            // the preceding frame has consumed its pointer coordinates.
            if (pendingWheel != null && Time.frameCount > pendingWheelFrame)
            {
                var value = pendingWheel;
                pendingWheel = null;
                GuiEvent(value);
            }
#if !UNITY_EDITOR
            if (!completed && errors.Count > 0)
            {
                completed = true;
                WriteAtomically(RequiredResultPath() + ".failure.json", JsonUtility.ToJson(new ErrorReport
                {
                    message = "Native errors prevent accepting the conformance result.",
                    errors = errors.ToArray()
                }, true));
                Application.Quit(1);
            }
#endif
        }

        [Preserve]
        public static void Complete(string resultJson)
        {
            if (completed) throw Unsupported("Complete was called more than once.");
            if (string.IsNullOrWhiteSpace(resultJson)) throw Unsupported("The conformance result is empty.");
            if (errors.Count > 0) throw Unsupported("Native errors prevent accepting the conformance result.");
            var path = RequiredResultPath();
            if (File.Exists(path)) throw Unsupported("The result file already exists; select a fresh result path.");
            Trace("complete", "jsonLength=" + resultJson.Length);
            WriteTrace();
            WriteAtomically(path, resultJson);
            completed = true;
#if !UNITY_EDITOR
            Application.Quit(0);
#endif
        }

        [Preserve]
        public static int Pointer(float x, float y, bool down, bool touch)
        {
            AttachTrace();
            pointerSequence++;
            Trace("pointer-request", "seq=" + pointerSequence + " x=" + F(x) + " y=" + F(y) + " down=" + down + " touch=" + touch + " priorTarget=" + HitTarget());
            pointer = new Vector2(x, y);
            pointerDown = down;
            pointerTouch = touch;
            pointerActive = true;
            ApplyPointer();
            return pointerSequence;
        }

        static void ApplyPointer()
        {
            // Assigning false resets FairyGUI's pointer state, so only change the mode once.
            if (Stage.touchScreen != pointerTouch) Stage.touchScreen = pointerTouch;
            Stage.inst.SetCustomInput(new Vector2(pointer.x, Screen.height - pointer.y), pointerDown);
        }

        static void GuiEvent(Event value)
        {
            if (handleGuiEvents == null) throw Unsupported("FairyGUI Stage.HandleGUIEvents is unavailable.");
            try { handleGuiEvents.Invoke(Stage.inst, new object[] { value }); }
            catch (TargetInvocationException error)
            {
                throw Unsupported("The native GUI event failed: " + (error.InnerException ?? error));
            }
        }

        [Preserve]
        public static void Key(string name)
        {
            KeyCode code;
            switch (name)
            {
                case "Enter": code = KeyCode.Return; break;
                case "Escape": case "Back": code = KeyCode.Escape; break;
                case "ArrowUp": code = KeyCode.UpArrow; break;
                case "ArrowDown": code = KeyCode.DownArrow; break;
                case "ArrowLeft": code = KeyCode.LeftArrow; break;
                case "ArrowRight": code = KeyCode.RightArrow; break;
                case " ": case "Space": code = KeyCode.Space; break;
                default:
                    if (!Enum.TryParse(name, true, out code)) throw Unsupported("Unsupported conformance key: " + name);
                    break;
            }
            char character = name.Length == 1 ? name[0] : '\0';
            GuiEvent(new Event { type = EventType.KeyDown, keyCode = code, character = character });
            GuiEvent(new Event { type = EventType.KeyUp, keyCode = code, character = character });
        }

        [Preserve]
        public static void Wheel(float x, float y, float dx, float dy)
        {
            if (Math.Abs(dx) > 0.0001f) throw Unsupported("FairyGUI-unity exposes vertical wheel input only.");
            if (pendingWheel != null) throw Unsupported("A native wheel event is already queued; wait a frame before the next wheel event.");
            Pointer(x, y, false, false);
            pendingWheelFrame = Time.frameCount;
            pendingWheel = new Event { type = EventType.ScrollWheel, mousePosition = new Vector2(x, y), delta = new Vector2(0, dy / Stage.mouseWheelScale) };
        }

        [Preserve]
        public static void SetScreen(int width, int height)
        {
            if (width <= 0 || height <= 0) throw Unsupported("A screen size must be positive.");
#if UNITY_EDITOR
            SetEditorScreen(width, height);
#else
            Screen.SetResolution(width, height, FullScreenMode.Windowed);
#endif
        }

        [Preserve]
        public static bool SizeMatches(int width, int height)
        {
            return Screen.width == width && Screen.height == height;
        }

#if UNITY_EDITOR
        const BindingFlags Members = BindingFlags.Instance | BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic;

        static Type EditorType(string name)
        {
            var type = typeof(EditorWindow).Assembly.GetType("UnityEditor." + name);
            if (type == null) throw Unsupported("UnityEditor." + name + " is unavailable in this editor.");
            return type;
        }

        static object Property(object owner, string name)
        {
            var property = owner.GetType().GetProperty(name, Members);
            if (property == null) throw Unsupported(owner.GetType().Name + "." + name + " is unavailable.");
            return property.GetValue(owner);
        }

        static object Call(object owner, string method, params object[] arguments)
        {
            var info = owner.GetType().GetMethod(method, Members);
            if (info == null) throw Unsupported(owner.GetType().Name + "." + method + " is unavailable.");
            return info.Invoke(owner, arguments);
        }

        static void SetEditorScreen(int width, int height)
        {
            var sizesType = EditorType("GameViewSizes");
            var singleton = typeof(ScriptableSingleton<>).MakeGenericType(sizesType);
            var instanceProperty = singleton.GetProperty("instance", BindingFlags.Static | BindingFlags.Public);
            if (instanceProperty == null) throw Unsupported("GameViewSizes.instance is unavailable.");
            var sizes = instanceProperty.GetValue(null);
            var groupType = EditorType("GameViewSizeGroupType");
            var group = Call(sizes, "GetGroup", Enum.Parse(groupType, "Standalone"));
            var count = (int)Call(group, "GetTotalCount");
            int selected = -1;
            for (int index = 0; index < count; index++)
            {
                var size = Call(group, "GetGameViewSize", index);
                if ((int)Property(size, "width") == width && (int)Property(size, "height") == height && Property(size, "sizeType").ToString() == "FixedResolution")
                {
                    selected = index;
                    break;
                }
            }
            if (selected < 0)
            {
                var size = Activator.CreateInstance(EditorType("GameViewSize"), new object[]
                {
                    Enum.Parse(EditorType("GameViewSizeType"), "FixedResolution"), width, height, "LGUI " + width + "x" + height
                });
                Call(group, "AddCustomSize", size);
                selected = count;
            }
            var view = EditorWindow.GetWindow(EditorType("GameView"));
            var selection = view.GetType().GetProperty("selectedSizeIndex", Members);
            if (selection == null) throw Unsupported("GameView.selectedSizeIndex is unavailable.");
            selection.SetValue(view, selected);
            view.Repaint();
            EditorApplication.QueuePlayerLoopUpdate();
        }
#endif
    }

    // Refresh custom input before StageEngine.LateUpdate, including while a key or timer waits.
    [DefaultExecutionOrder(-32000)]
    public sealed class LGUIConformanceBridge : MonoBehaviour
    {
        void Update() { ConformanceBridge.Tick(); }
        void LateUpdate() { ConformanceBridge.LateTick(); }
        void OnApplicationFocus(bool focused) { ConformanceBridge.Focus(focused); }
        void OnApplicationPause(bool paused) { ConformanceBridge.Pause(paused); }
        void OnDestroy() { ConformanceBridge.FinishTrace(); }
    }
}
