using System;
using System.IO;
using System.Text;
using UnityEngine;
using UnityEngine.Scripting;
using Puerts;

namespace LGUI.Tests
{
    [Preserve]
    public sealed class LGUIPuerTSBaseline : MonoBehaviour
    {
#pragma warning disable CS0618
        JsEnv environment;
#pragma warning restore CS0618
        [Serializable] sealed class Result {public bool ok; public bool v8Eval; public bool disposed; public int ticks; public string error;}
        readonly Result result = new Result();
        string resultPath;
        bool canWrite;
        void Start()
        {
            string[] args = Environment.GetCommandLineArgs();
            for (int i = 0; i + 1 < args.Length; i++) if (args[i] == "-lguiBaselineResult") resultPath = args[i + 1];
            try
            {
                if (resultPath != null && (!Path.IsPathRooted(resultPath) || File.Exists(resultPath))) throw new InvalidOperationException("Use a fresh absolute -lguiBaselineResult path.");
                canWrite = resultPath != null;
#pragma warning disable CS0618
                environment = new JsEnv(new DefaultLoader(), -1, BackendType.V8, IntPtr.Zero, IntPtr.Zero);
#pragma warning restore CS0618
                result.v8Eval = environment.Eval<int>("[6,7].reduce((a,b)=>a*b,1)") == 42;
                if (!result.v8Eval) throw new InvalidOperationException("The real V8 Eval probe did not return 42.");
                Debug.Log("LGUI_PUERTS_BASELINE_V8_EVAL_OK");
            }
            catch (Exception error) {Fail(error);}
        }
        void Update()
        {
            if (environment == null) return;
            try
            {
                environment.Tick(); result.ticks++;
                if (resultPath != null && result.ticks >= 2) {Dispose(); result.ok = result.v8Eval && result.disposed; Write(); Application.Quit(result.ok ? 0 : 1);}
            }
            catch (Exception error) {Fail(error);}
        }
        void Dispose() {if (environment != null) {environment.Dispose(); environment = null; result.disposed = true; Debug.Log("LGUI_PUERTS_BASELINE_DISPOSED");}}
        void OnDestroy() {Dispose();}
        void Write() {if (canWrite) {Directory.CreateDirectory(Path.GetDirectoryName(resultPath)); File.WriteAllText(resultPath, JsonUtility.ToJson(result, true), new UTF8Encoding(false));}}
        void Fail(Exception error)
        {
            result.ok = false; result.error = "LGUI-RT-001 LGUIPuerTSBaseline.cs: " + error + " → Inspect the explicit B baseline Player and official PuerTS packages.";
            Debug.LogError(result.error); Dispose(); Write(); if (resultPath != null) Application.Quit(1); enabled = false;
        }
    }
}
