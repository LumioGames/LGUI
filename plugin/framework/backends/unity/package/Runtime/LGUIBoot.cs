using System;
using FairyGUI;
using Puerts;
using UnityEngine;
using UnityEngine.Scripting;

namespace LGUI
{
    /// <summary>Owns the PuerTS environment and forwards Unity lifecycle events to TypeScript.</summary>
    [Preserve]
    [DisallowMultipleComponent]
    public sealed class LGUIBoot : MonoBehaviour
    {
        // Inspector access is disabled by default; native verification may explicitly enable a port.
        [SerializeField] int debugPort = -1;
        static LGUIBoot owner;
#pragma warning disable CS0618 // The execution plan uses the PuerTS 3.0.3 JsEnv compatibility entry.
        JsEnv environment;
#pragma warning restore CS0618
        Action<double> frame;
        Action<bool> visibility;
        Action dispose;
        bool stopped;

        void Start()
        {
            if (owner != null && owner != this)
            {
                Fail(new InvalidOperationException("Only one LGUIBoot may own the LGUI runtime."));
                return;
            }
            owner = this;
            try
            {
                Platform.Initialize(this);
                UIObjectFactory.SetLoaderExtension(() => new LGUIResourceLoader());
                var script = Resources.Load<TextAsset>("Game/game");
                if (script == null)
                    throw new InvalidOperationException("Game/game.js.txt is missing. Run lgui unity export again.");
#pragma warning disable CS0618
                environment = new JsEnv(new DefaultLoader(), debugPort, BackendType.V8, IntPtr.Zero, IntPtr.Zero);
#pragma warning restore CS0618
                environment.Eval(script.text, "game.js");
                if (!environment.Eval<bool>("typeof globalThis.__lguiStart === 'function'"))
                    throw new InvalidOperationException("The generated game script does not define __lguiStart. Export the project again.");
                frame = environment.Eval<Action<double>>("deltaMs => globalThis.__lguiFrame?.(deltaMs)");
                visibility = environment.Eval<Action<bool>>("visible => globalThis.__lguiVisibility?.(visible)");
                dispose = environment.Eval<Action>("() => globalThis.__lguiDispose?.()");
                environment.Eval("globalThis.__lguiStart()", "lgui-start");
            }
            catch (Exception error) { Fail(error); }
        }

        void Update()
        {
            if (environment == null || stopped) return;
            try
            {
                environment.Tick();
                frame?.Invoke(Time.unscaledDeltaTime * 1000.0);
            }
            catch (Exception error) { Fail(error); }
        }

        void OnApplicationFocus(bool focused) { NotifyVisibility(focused && !paused); }
        bool paused;
        void OnApplicationPause(bool value)
        {
            paused = value;
            NotifyVisibility(!paused && Application.isFocused);
        }

        void NotifyVisibility(bool visible)
        {
            if (environment == null || stopped) return;
            try { visibility?.Invoke(visible); }
            catch (Exception error) { Fail(error); }
        }

        void Fail(Exception error)
        {
            Debug.LogError("LGUI-RT-160 LGUIBoot.cs: Unity runtime failed: " + error +
                " → Run lgui unity export, check the generated resources and PuerTS 3.0.3 local packages, then restart the scene.");
            StopRuntime();
            enabled = false;
        }

        void OnDestroy() { StopRuntime(); }

        void StopRuntime()
        {
            if (stopped) return;
            stopped = true;
            try { dispose?.Invoke(); }
            catch (Exception error)
            {
                Debug.LogError("LGUI-RT-160 LGUIBoot.cs: TypeScript disposal failed: " + error +
                    " → Check backend disposal before destroying the scene.");
            }
            finally
            {
                // Pending HTTP/image/audio callbacks must stop before the JS environment is disposed.
                Platform.Shutdown(this);
                frame = null;
                visibility = null;
                dispose = null;
                if (environment != null) environment.Dispose();
                environment = null;
                if (owner == this) owner = null;
            }
        }
    }
}
