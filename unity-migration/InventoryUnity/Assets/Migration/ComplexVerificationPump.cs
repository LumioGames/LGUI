using System;
using System.Collections;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using UnityEngine;

// Instrumentation only: file commands call the same host on Unity's main thread.
// They are not real operating-system input or a UI event simulation.
public sealed class ComplexVerificationPump : MonoBehaviour
{
    [Serializable] public sealed class Command { public string id, op, argsJson; }
    [Serializable] public sealed class PumpError { public string code, message, details; }
    [Serializable] public sealed class Response
    {
        public string id, op, argsJson, startedAt, completedAt, screenshotPath;
        public bool ok, executed, instrumented = true;
        public string inputMethod = "file command on Unity main thread; not OS input";
        public int startFrame, endFrame;
        public PumpError error;
        public ComplexInventoryHost.HostSnapshot snapshot;
    }
    bool busy;
    float nextPoll;
    static readonly UTF8Encoding Utf8 = new UTF8Encoding(false);

    [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
    static void Install()
    {
        if (ComplexInventoryHost.Instance == null) return;
        if (FindAnyObjectByType<ComplexVerificationPump>() != null) return;
        var pump = new GameObject("InventoryComplexVerificationPump");
        DontDestroyOnLoad(pump);
        pump.AddComponent<ComplexVerificationPump>();
    }

    void Update()
    {
        if (busy || Time.unscaledTime < nextPoll) return;
        nextPoll = Time.unscaledTime + 0.05f;
        var host = ComplexInventoryHost.Instance;
        if (host == null || !host.Ready || string.IsNullOrWhiteSpace(host.verificationDirectory)) return;
        string directory = Path.GetFullPath(host.verificationDirectory);
        if (!Directory.Exists(directory)) return; // Explicit existing test directory is the opt-in.
        string file = Path.Combine(directory, "command.json");
        if (!File.Exists(file)) return;
        Command command = null;
        string raw = null;
        Exception invalid = null;
        try
        {
            raw = File.ReadAllText(file, Utf8);
            command = JsonUtility.FromJson<Command>(raw);
            if (command == null || !Regex.IsMatch(command.id ?? "", "^[A-Za-z0-9_-]{1,96}$")
                || !Regex.IsMatch(command.op ?? "", "^[a-z][a-z0-9_-]{0,63}$"))
                throw new InvalidDataException("Expected safe id, lowercase op, and argsJson in command.json.");
            if (command.argsJson == null) command.argsJson = "{}";
        }
        catch (Exception error) { invalid = error; }
        if (command == null || !Regex.IsMatch(command.id ?? "", "^[A-Za-z0-9_-]{1,96}$"))
            command = new Command { id = "invalid-" + Guid.NewGuid().ToString("N"), op = "invalid", argsJson = "{}" };
        string archive = Path.Combine(directory, "command-" + command.id + ".json");
        try
        {
            if (File.Exists(archive))
            {
                var prior = JsonUtility.FromJson<Command>(File.ReadAllText(archive, Utf8));
                bool same = prior != null && prior.id == command.id && prior.op == command.op && (prior.argsJson ?? "{}") == command.argsJson;
                File.Move(file, Path.Combine(directory, "duplicate-" + command.id + "-" + Guid.NewGuid().ToString("N") + ".json"));
                if (!same) Debug.LogWarning("Verification command id conflict was archived without executing: " + command.id);
                return;
            }
            File.Move(file, archive);
        }
        catch (IOException) { return; }
        busy = true;
        StartCoroutine(Process(host, directory, command, invalid));
    }

    IEnumerator Process(ComplexInventoryHost host, string directory, Command command, Exception invalid)
    {
        var response = new Response { id = command.id, op = command.op, argsJson = command.argsJson,
            startedAt = DateTime.UtcNow.ToString("o"), startFrame = Time.frameCount };
        if (command.op == "click-control" || command.op == "select-slot")
            response.inputMethod = "instrumented FairyGUI onClick.Call event; not OS input, hit testing or computer control";
        Exception failure = invalid;
        int beforeErrors = 0;
        bool quitting = command.op == "quit";
        string capture = null;
        if (failure == null)
        {
            try
            {
                beforeErrors = ReadSnapshot(host).errors?.Length ?? 0;
                if (!host.Ready) throw new InvalidOperationException("ComplexInventoryHost is not ready.");
                response.executed = true;
                if (command.op == "screenshot")
                {
                    capture = Path.Combine(directory, "screenshot-" + command.id + ".png");
                    ScreenCapture.CaptureScreenshot(capture);
                }
                else if (!quitting)
                {
                    if (command.op == "snapshot") host.SnapshotJson();
                    else host.ExecuteVerification(command.op == "popup" ? "reward" : command.op, command.argsJson);
                }
            }
            catch (Exception error) { failure = error; }
        }
        yield return null;
        yield return null;
        if (capture != null && failure == null)
        {
            float until = Time.realtimeSinceStartup + 5f;
            bool captured = false;
            while (Time.realtimeSinceStartup < until)
            {
                try { captured = File.Exists(capture) && new FileInfo(capture).Length > 0; }
                catch (IOException) { }
                if (captured) break;
                yield return null;
            }
            if (!captured) failure = new IOException("ScreenCapture produced no PNG within 5 seconds.");
            else response.screenshotPath = capture;
        }
        try
        {
            response.snapshot = ReadSnapshot(host);
            if ((response.snapshot.errors?.Length ?? 0) > beforeErrors && failure == null)
                failure = new InvalidOperationException("ComplexInventoryHost recorded an error while executing this command: " + response.snapshot.errors[response.snapshot.errors.Length - 1]);
        }
        catch (Exception error) { if (failure == null) failure = error; }
        response.ok = failure == null;
        if (failure != null) response.error = new PumpError { code = "verification_command_failed", message = failure.Message, details = failure.ToString() };
        response.completedAt = DateTime.UtcNow.ToString("o");
        response.endFrame = Time.frameCount;
        try
        {
            string json = JsonUtility.ToJson(response);
            string final = Path.Combine(directory, "response-" + command.id + ".json");
            string temporary = final + ".tmp";
            File.WriteAllText(temporary, json, Utf8);
            File.Move(temporary, final);
            File.AppendAllText(Path.Combine(directory, "pump-responses.jsonl"), json + Environment.NewLine, Utf8);
        }
        catch (Exception error) { Debug.LogWarning("Verification response could not be saved: " + error); }
        busy = false;
        if (quitting && response.ok)
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit(0);
#endif
        }
    }

    static ComplexInventoryHost.HostSnapshot ReadSnapshot(ComplexInventoryHost host)
    {
        if (host == null) throw new InvalidOperationException("ComplexInventoryHost was destroyed during the command.");
        var snapshot = JsonUtility.FromJson<ComplexInventoryHost.HostSnapshot>(host.SnapshotJson());
        if (snapshot == null) throw new InvalidDataException("Host returned no parseable snapshot.");
        return snapshot;
    }
}
