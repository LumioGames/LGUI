using System;
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

// Explicit test interface. Uses Editor APIs, never operating-system input.
[InitializeOnLoad]
public static class FidelityEditorVerification
{
    const string Key = "FidelityInventory.EditorVerification.";
    const double IdleSeconds = 12;
    static bool delayedCallbacksObserved;
    static double idleSince = -1;
    static double attachedAt;

    [Serializable] public sealed class StartupRecord
    {
        public string purpose = "Instrumented Editor API startup and Play; not physical input or computer control";
        public string status, scheduledAtUtc, idleStartedAtUtc, playRequestedAtUtc, enteredPlayAtUtc, editorVersion, evidenceDirectory, scene;
        public double requiredIdleSeconds = IdleSeconds;
        public bool firstDelayedCallbacksObserved, searchIndexExists;
    }
    static FidelityEditorVerification()
    {
        EditorApplication.playModeStateChanged -= OnPlayModeChanged;
        EditorApplication.playModeStateChanged += OnPlayModeChanged;
        if (SessionState.GetBool(Key + "Pending", false)) AttachWatch();
    }
    public static void SchedulePlay()
    {
        string directory = Path.Combine(FidelityMigrationBuild.Root, "evidence/editor-auto");
        var args = Environment.GetCommandLineArgs();
        for (int i = 0; i < args.Length - 1; i++) if (args[i] == "-verificationDir") directory = args[i + 1];
        directory = Path.GetFullPath(directory); Directory.CreateDirectory(directory);
        var record = new StartupRecord { status = "waiting_for_editor_idle", scheduledAtUtc = DateTime.UtcNow.ToString("o"), editorVersion = Application.unityVersion, evidenceDirectory = directory, scene = FidelityMigrationBuild.ScenePath };
        SessionState.SetString(Key + "Directory", directory); WriteRecord(record);
        SessionState.SetBool(Key + "Pending", true); AttachWatch();
        Debug.Log("FIDELITY_EDITOR_PLAY_SCHEDULED: waiting for initial delayed callbacks, Search.index and 12 continuous idle seconds. Instrumented Editor API only.");
    }
    static void AttachWatch()
    {
        delayedCallbacksObserved = false; idleSince = -1; attachedAt = EditorApplication.timeSinceStartup;
        EditorApplication.delayCall -= MarkDelayedCallbacks; EditorApplication.delayCall += MarkDelayedCallbacks;
        EditorApplication.update -= WaitForIdle; EditorApplication.update += WaitForIdle;
    }
    static void MarkDelayedCallbacks() { delayedCallbacksObserved = true; }
    static StartupRecord ReadRecord()
    {
        return JsonUtility.FromJson<StartupRecord>(SessionState.GetString(Key + "Record", "{}")) ?? new StartupRecord();
    }
    static void WriteRecord(StartupRecord record)
    {
        string json = JsonUtility.ToJson(record, true); SessionState.SetString(Key + "Record", json);
        string directory = SessionState.GetString(Key + "Directory", record.evidenceDirectory);
        if (!string.IsNullOrEmpty(directory)) File.WriteAllText(Path.Combine(directory, "editor-api-startup.json"), json);
    }
    static void WaitForIdle()
    {
        double now = EditorApplication.timeSinceStartup;
        if (now - attachedAt > 180)
        {
            EditorApplication.update -= WaitForIdle; SessionState.SetBool(Key + "Pending", false);
            var failed = ReadRecord(); failed.status = "failed_waiting_for_idle_or_search_index"; WriteRecord(failed);
            Debug.LogError("Fidelity Editor test startup timed out before Play; no errors were filtered."); return;
        }
        string index = Path.Combine(Directory.GetParent(Application.dataPath).FullName, "UserSettings/Search.index");
        if (!delayedCallbacksObserved || EditorApplication.isCompiling || EditorApplication.isUpdating || !File.Exists(index)) { idleSince = -1; return; }
        if (idleSince < 0)
        {
            idleSince = now; var waiting = ReadRecord(); waiting.status = "observing_continuous_idle"; waiting.idleStartedAtUtc = DateTime.UtcNow.ToString("o"); waiting.firstDelayedCallbacksObserved = true; waiting.searchIndexExists = true; WriteRecord(waiting); return;
        }
        if (now - idleSince < IdleSeconds) return;
        EditorApplication.update -= WaitForIdle; SessionState.SetBool(Key + "Pending", false);
        try
        {
            EditorSceneManager.OpenScene(FidelityMigrationBuild.ScenePath);
            var record = ReadRecord(); record.status = "play_requested"; record.playRequestedAtUtc = DateTime.UtcNow.ToString("o"); WriteRecord(record);
            EditorApplication.isPlaying = true;
        }
        catch (Exception error)
        {
            var failed = ReadRecord(); failed.status = "failed_requesting_play"; WriteRecord(failed); Debug.LogException(error);
        }
    }
    static void OnPlayModeChanged(PlayModeStateChange state)
    {
        if (state == PlayModeStateChange.EnteredEditMode && SessionState.GetBool(Key + "ExitAfterPlay", false))
        {
            SessionState.SetBool(Key + "ExitAfterPlay", false);
            EditorApplication.delayCall += delegate { EditorApplication.Exit(0); };
            return;
        }
        if (state != PlayModeStateChange.EnteredPlayMode || string.IsNullOrEmpty(SessionState.GetString(Key + "Directory", ""))) return;
        var record = ReadRecord(); record.status = "entered_play_mode"; record.enteredPlayAtUtc = DateTime.UtcNow.ToString("o"); WriteRecord(record);
        Debug.Log("FIDELITY_EDITOR_ENTERED_PLAY: instrumented Editor API after startup idle wait.");
    }
}


