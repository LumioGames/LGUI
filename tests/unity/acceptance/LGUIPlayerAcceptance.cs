// Explicitly installed Release Player verification tools. Never part of the runtime package.
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.CompilerServices;
using FairyGUI;
using UnityEngine;
using UnityEngine.Profiling;
using UnityEngine.Rendering;
using UnityEngine.SceneManagement;
using UnityEngine.Scripting;

namespace LGUI.Tests
{
    [Preserve]
    public static class PlayerAcceptance
    {
        static LGUIPlayerAcceptance runner;
        static int inspectorPort = -1;
        static readonly Queue<V8Request> v8Requests = new Queue<V8Request>();
        static bool runnerStopped;
        static bool collectingV8;

        static InvalidOperationException Unsupported(string message)
        {
            return new InvalidOperationException("LGUI-RT-001 LGUIPlayerAcceptance.cs: " + message +
                " → Check the explicit Release Player acceptance arguments and native evidence directory.");
        }

        static string Argument(string name)
        {
            var arguments = Environment.GetCommandLineArgs();
            string value = null;
            for (int index = 0; index < arguments.Length; index++)
            {
                if (arguments[index] != name) continue;
                if (value != null) throw Unsupported(name + " must occur once.");
                if (index + 1 == arguments.Length || arguments[index + 1].StartsWith("-", StringComparison.Ordinal))
                    throw Unsupported(name + " requires a value.");
                value = arguments[++index];
            }
            return value;
        }

        [Preserve]
        public static string Scenario
        {
            get
            {
                var value = Argument("-lguiCase");
                if (string.IsNullOrEmpty(value) || value.Length > 64 || value[0] < 'a' || value[0] > 'z')
                    throw Unsupported("-lguiCase must match [a-z][a-z0-9-]{0,63}.");
                for (int index = 1; index < value.Length; index++)
                    if ((value[index] < 'a' || value[index] > 'z') &&
                        (value[index] < '0' || value[index] > '9') && value[index] != '-')
                        throw Unsupported("-lguiCase must match [a-z][a-z0-9-]{0,63}.");
                // The TypeScript dispatcher owns the exact case whitelist.
                return value;
            }
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Initialize()
        {
            runnerStopped = true;
            RejectV8Requests("The acceptance runtime was reinitialized before the queued V8 collection ran.");
            runner = null;
            runnerStopped = false;
            collectingV8 = false;
            inspectorPort = -1;
            SceneManager.sceneLoaded -= ConfigureInspector;
            if (Argument("-lguiCase") != null)
            {
                _ = Scenario;
                EnsureRunner();
            }
            var requestedPort = Argument("-lguiInspectorPort");
            if (requestedPort == null) return;
            if (!int.TryParse(requestedPort, NumberStyles.None, CultureInfo.InvariantCulture, out inspectorPort) ||
                inspectorPort < 1 || inspectorPort > 65535)
                throw Unsupported("-lguiInspectorPort must be an explicit TCP port from 1 to 65535.");
            // sceneLoaded runs after Awake/OnEnable and before the scene's Start methods.
            SceneManager.sceneLoaded += ConfigureInspector;
        }

        [Preserve]
        public static string FixtureBaseURL
        {
            get
            {
                var value = Argument("-lguiFixtureBase");
                Uri uri;
                if (string.IsNullOrEmpty(value) || !Uri.TryCreate(value, UriKind.Absolute, out uri) ||
                    uri.Scheme != Uri.UriSchemeHttp || !uri.IsLoopback || uri.AbsolutePath != "/" ||
                    !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment) || !string.IsNullOrEmpty(uri.UserInfo))
                    throw Unsupported("-lguiFixtureBase must name the explicit loopback HTTP fixture origin.");
                return uri.GetLeftPart(UriPartial.Authority);
            }
        }

        static void ConfigureInspector(Scene scene, LoadSceneMode mode)
        {
            var boots = new List<LGUIBoot>();
            foreach (var root in scene.GetRootGameObjects()) boots.AddRange(root.GetComponentsInChildren<LGUIBoot>(true));
            if (boots.Count != 1) throw Unsupported("Inspector verification requires exactly one LGUIBoot in the startup scene.");
            var field = typeof(LGUIBoot).GetField("debugPort", BindingFlags.Instance | BindingFlags.NonPublic);
            if (field == null || field.FieldType != typeof(int)) throw Unsupported("The existing LGUIBoot.debugPort field is unavailable.");
            field.SetValue(boots[0], inspectorPort);
            SceneManager.sceneLoaded -= ConfigureInspector;
        }

        static LGUIPlayerAcceptance EnsureRunner()
        {
            if (runnerStopped) throw Unsupported("The acceptance host has stopped; a new request cannot be accepted.");
            if (runner != null) return runner;
            var host = new GameObject("LGUI Player Acceptance");
            runner = host.AddComponent<LGUIPlayerAcceptance>();
            UnityEngine.Object.DontDestroyOnLoad(host);
            return runner;
        }

        [Serializable]
        sealed class Metric
        {
            public bool available;
            public long bytes = -1;
            public string note;
            public string error;
        }

        [Serializable]
        sealed class ProfilerSnapshot
        {
            public bool enabled;
            public Metric allocated, reserved, unusedReserved, managedUsed, managedReserved, graphicsDriver;
        }

        [Serializable]
        sealed class Counts
        {
            public bool available;
            public string error;
            public int displayObjectInfos = -1, gameObjects = -1, textures = -1, meshes = -1;
            public int inactiveDisplayObjectInfos = -1, inactiveGameObjects = -1, detachedDisplayObjectInfos = -1;
            public int loaders = -1, inactiveLoaders = -1, detachedLoaders = -1;
        }

        [Serializable]
        sealed class LoaderDetail
        {
            public string gameObjectId;
            public string gameObjectName, ownerId, ownerName, ownerType, parentName, displayParentName, url;
            public bool activeSelf, activeInHierarchy, detached, disposed;
        }

        [Serializable]
        sealed class NativeReport
        {
            public bool ok;
            public string error;
            public int frame, screenWidth, screenHeight;
            public double realtimeMs;
            public bool isEditor, developmentBuild, detailsRequested;
            public string graphicsDevice;
            public Counts counts;
            public Metric managedHeap;
            public ProfilerSnapshot profiler;
            public LoaderDetail[] loaderDetails;
        }

        static Metric Measure(Func<long> read, string note, bool zeroUnavailable = true)
        {
            var metric = new Metric { note = note };
            try
            {
                var bytes = read();
                metric.available = bytes >= 0 && (!zeroUnavailable || bytes > 0);
                if (metric.available) metric.bytes = bytes;
                else metric.note += " Returned zero or a negative value; availability is unconfirmed, not zero memory usage.";
            }
            catch (Exception error) { metric.error = Unsupported("Memory measurement failed: " + error).Message; }
            return metric;
        }

        // No native arrays, GObjects, textures or meshes escape this method.
        static Counts CountNative(bool details, out LoaderDetail[] loaderDetails)
        {
            var counts = new Counts();
            loaderDetails = Array.Empty<LoaderDetail>();
            try
            {
                var infos = Resources.FindObjectsOfTypeAll<DisplayObjectInfo>();
                var objects = Resources.FindObjectsOfTypeAll<GameObject>();
                counts.displayObjectInfos = infos.Length;
                counts.gameObjects = objects.Length;
                counts.textures = Resources.FindObjectsOfTypeAll<Texture>().Length;
                counts.meshes = Resources.FindObjectsOfTypeAll<Mesh>().Length;
                counts.inactiveDisplayObjectInfos = counts.inactiveGameObjects = counts.detachedDisplayObjectInfos = 0;
                counts.loaders = counts.inactiveLoaders = counts.detachedLoaders = 0;
                foreach (var item in objects) if (!item.activeInHierarchy) counts.inactiveGameObjects++;
                var seen = new HashSet<GLoader>();
                var report = details ? new List<LoaderDetail>() : null;
                foreach (var info in infos)
                {
                    if (!info.gameObject.activeInHierarchy) counts.inactiveDisplayObjectInfos++;
                    var display = info.displayObject;
                    if (display == null || display.parent == null) counts.detachedDisplayObjectInfos++;
                    var loader = display == null ? null : display.gOwner as GLoader;
                    if (loader == null || !seen.Add(loader)) continue;
                    bool inactive = !info.gameObject.activeInHierarchy;
                    bool detached = loader.parent == null;
                    counts.loaders++;
                    if (inactive) counts.inactiveLoaders++;
                    if (detached) counts.detachedLoaders++;
                    if (details) report.Add(new LoaderDetail
                    {
                        gameObjectId = info.gameObject.GetEntityId().ToString(), gameObjectName = info.gameObject.name,
                        ownerId = loader.id, ownerName = loader.name, ownerType = loader.GetType().FullName,
                        parentName = loader.parent == null ? null : loader.parent.name,
                        displayParentName = display.parent == null ? null : display.parent.name,
                        url = loader.url, activeSelf = info.gameObject.activeSelf, activeInHierarchy = !inactive,
                        detached = detached, disposed = loader.isDisposed
                    });
                }
                if (details)
                {
                    report.Sort((left, right) => string.CompareOrdinal(left.gameObjectId, right.gameObjectId));
                    loaderDetails = report.ToArray();
                }
                counts.available = true;
            }
            catch (Exception error) { counts.error = Unsupported("Native object enumeration failed: " + error).Message; }
            return counts;
        }

        [Preserve]
        public static string NativeSnapshot(bool details)
        {
            // This host is created before the first sample, so later coroutines do not add a new baseline object.
            EnsureRunner();
            var report = new NativeReport
            {
                frame = Time.frameCount, realtimeMs = Time.realtimeSinceStartupAsDouble * 1000,
                screenWidth = Screen.width, screenHeight = Screen.height, isEditor = Application.isEditor,
                developmentBuild = Debug.isDebugBuild, graphicsDevice = SystemInfo.graphicsDeviceType.ToString(),
                detailsRequested = details,
                managedHeap = Measure(() => GC.GetTotalMemory(false), "GC.GetTotalMemory(false): managed used heap; excludes V8 and native allocations."),
                profiler = new ProfilerSnapshot
                {
                    enabled = Profiler.enabled,
                    allocated = Measure(Profiler.GetTotalAllocatedMemoryLong, "Unity internal allocators; returns zero when Profiler is unavailable."),
                    reserved = Measure(Profiler.GetTotalReservedMemoryLong, "Unity allocator reserved pools; returns zero when Profiler is unavailable."),
                    unusedReserved = Measure(Profiler.GetTotalUnusedReservedMemoryLong, "Unused Unity pools; a zero result cannot distinguish no unused pool from an unavailable Profiler."),
                    managedUsed = Measure(Profiler.GetMonoUsedSizeLong, "Unity managed used memory, including objects not yet collected."),
                    managedReserved = Measure(Profiler.GetMonoHeapSizeLong, "Unity managed reserved heap."),
                    graphicsDriver = Application.isEditor || Debug.isDebugBuild
                        ? Measure(Profiler.GetAllocatedMemoryForGraphicsDriver, "Estimated graphics driver memory; zero does not establish availability.")
                        : new Metric { note = "Unavailable: Unity returns zero for graphics driver memory in Release Players." }
                }
            };
            report.counts = CountNative(details, out report.loaderDetails);
            report.ok = report.counts.available && report.managedHeap.available;
            if (!report.ok) report.error = report.counts.error ?? report.managedHeap.error ??
                Unsupported("A required native count or managed heap sample is unavailable.").Message;
            return JsonUtility.ToJson(report);
        }

        [Serializable]
        sealed class FailureReport
        {
            public bool ok = false;
            public string error;
        }

        sealed class V8Request
        {
            public Action<string> callback;
            public int queuedFrame;
        }

        [Serializable]
        sealed class V8CollectionReport
        {
            public bool ok;
            public string error;
            public string method = "JsEnv.Backend.LowMemoryNotification";
            public string backend, bootEntityId, environmentIdentity;
            public string environmentIdentityKind = "RuntimeHelpers.GetHashCode";
            public int frame, queuedFrame;
        }

        [Serializable]
        sealed class PoolTypeCount
        {
            public string type;
            public int count;
        }

        [Serializable]
        sealed class ObjectPoolReport
        {
            public bool available;
            public string error, backend, bootEntityId, environmentIdentity, scriptEnvIdentity, poolType;
            public string environmentIdentityKind = "RuntimeHelpers.GetHashCode";
            public int frame;
            public int referencedSlots = -1, highWater = -1, capacity = -1, activeSlots = -1, activeNullSlots = -1;
            public PoolTypeCount[] types = Array.Empty<PoolTypeCount>();
            public string interpretation = "Read-only PuerTS 3.0.3 IL2CPP ObjectPool observation. Capacity/highWater are not live-object counts; this report makes no leak verdict.";
        }

        [Preserve]
        public static string ObjectPoolSnapshot()
        {
            var report = new ObjectPoolReport { frame = Time.frameCount };
            try
            {
                var boots = UnityEngine.Object.FindObjectsByType<LGUIBoot>(FindObjectsInactive.Include);
                if (boots.Length != 1) throw Unsupported("ObjectPool observation requires exactly one existing LGUIBoot.");
                report.bootEntityId = boots[0].GetEntityId().ToString();
                var environmentField = typeof(LGUIBoot).GetField("environment", BindingFlags.Instance | BindingFlags.NonPublic);
                if (environmentField == null) throw Unsupported("The existing LGUIBoot.environment field is unavailable.");
#pragma warning disable CS0618 // Inspect the original compatibility environment; do not create another VM.
                var environment = environmentField.GetValue(boots[0]) as Puerts.JsEnv;
#pragma warning restore CS0618
                if (environment == null || environment.Backend == null) throw Unsupported("The existing LGUIBoot has no live environment/backend.");
                report.backend = environment.Backend.GetType().FullName;
                report.environmentIdentity = RuntimeHelpers.GetHashCode(environment).ToString("X8", CultureInfo.InvariantCulture);
                if (!(environment.Backend is Puerts.BackendV8)) throw Unsupported("The observed environment must use the V8 backend.");
                var scriptEnvironment = environment.env;
                if (scriptEnvironment == null) throw Unsupported("The original JsEnv has no ScriptEnv.");
                report.scriptEnvIdentity = RuntimeHelpers.GetHashCode(scriptEnvironment).ToString("X8", CultureInfo.InvariantCulture);
                const BindingFlags privateInstance = BindingFlags.Instance | BindingFlags.NonPublic | BindingFlags.DeclaredOnly;
                var poolField = scriptEnvironment.GetType().GetField("objectPool", privateInstance);
                if (poolField == null || poolField.FieldType.FullName != "PuertsIl2cpp.ObjectPool")
                    throw Unsupported("Only the original PuerTS 3.0.3 IL2CPP ScriptEnv.objectPool format is supported.");
                var pool = poolField.GetValue(scriptEnvironment);
                if (pool == null || pool.GetType().FullName != "PuertsIl2cpp.ObjectPool") throw Unsupported("The original IL2CPP ObjectPool is unavailable.");
                report.poolType = pool.GetType().FullName;
                var listField = pool.GetType().GetField("list", privateInstance);
                var countField = pool.GetType().GetField("count", privateInstance);
                if (listField == null || !listField.FieldType.IsArray || listField.FieldType.GetArrayRank() != 1 ||
                    countField == null || countField.FieldType != typeof(int))
                    throw Unsupported("ObjectPool.list/count do not match the inspected PuerTS 3.0.3 source.");
                var slotType = listField.FieldType.GetElementType();
                if (slotType == null || !slotType.IsValueType || slotType.FullName != "PuertsIl2cpp.ObjectPool+Slot")
                    throw Unsupported("ObjectPool.list must contain the original private Slot value type.");
                var nextField = slotType.GetField("next", BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);
                var objectField = slotType.GetField("obj", BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);
                if (nextField == null || nextField.FieldType != typeof(int) || objectField == null || objectField.FieldType != typeof(object))
                    throw Unsupported("ObjectPool.Slot.next/obj do not match the inspected PuerTS 3.0.3 source.");
                var slots = listField.GetValue(pool) as Array;
                if (slots == null) throw Unsupported("ObjectPool.list is null.");
                var highWater = (int)countField.GetValue(pool);
                if (highWater < 0 || highWater > slots.Length) throw Unsupported("ObjectPool.count is outside the allocated Slot array.");
                int referenced = 0, active = 0, activeNull = 0;
                var counts = new Dictionary<string, int>(StringComparer.Ordinal);
                // Reflection boxes each Slot only locally. No pool, slot or contained object is returned or cached.
                for (int index = 0; index < highWater; index++)
                {
                    var slot = slots.GetValue(index);
                    var next = (int)nextField.GetValue(slot);
                    var value = objectField.GetValue(slot);
                    if (value != null) referenced++;
                    if (next != -2) continue;
                    active++;
                    if (value == null) { activeNull++; continue; }
                    var typeName = value.GetType().FullName;
                    if (string.IsNullOrEmpty(typeName)) throw Unsupported("An active pooled object has no runtime FullName.");
                    counts.TryGetValue(typeName, out int existing);
                    counts[typeName] = existing + 1;
                }
                var grouped = new List<PoolTypeCount>();
                foreach (var pair in counts) grouped.Add(new PoolTypeCount { type = pair.Key, count = pair.Value });
                grouped.Sort((left, right) => string.CompareOrdinal(left.type, right.type));
                report.capacity = slots.Length;
                report.highWater = highWater;
                report.referencedSlots = referenced;
                report.activeSlots = active;
                report.activeNullSlots = activeNull;
                report.types = grouped.ToArray();
                report.available = true;
            }
            catch (Exception error) { report.error = Unsupported("Read-only original ObjectPool observation failed: " + error).Message; }
            return JsonUtility.ToJson(report);
        }

        [Preserve]
        public static void CollectV8(Action<string> callback)
        {
            if (callback == null) throw Unsupported("CollectV8 requires a completion callback.");
            EnsureRunner();
            // Never collect on the JavaScript/Inspector evaluation stack which enqueues this request.
            v8Requests.Enqueue(new V8Request { callback = callback, queuedFrame = Time.frameCount });
        }

        static void CompleteV8(V8Request request, V8CollectionReport report)
        {
            var callback = request.callback;
            request.callback = null;
            try { callback(JsonUtility.ToJson(report)); }
            catch (Exception error)
            {
                Debug.LogError(Unsupported("A queued V8 completion callback failed: " + error).Message);
            }
        }

        static void RejectV8Requests(string reason)
        {
            // Detach accepted work first. Reentrant requests see runnerStopped and fail explicitly.
            var rejected = v8Requests.ToArray();
            v8Requests.Clear();
            foreach (var request in rejected) CompleteV8(request, new V8CollectionReport
            {
                frame = Time.frameCount, queuedFrame = request.queuedFrame, error = Unsupported(reason).Message
            });
        }

        internal static void StopV8(LGUIPlayerAcceptance owner, string reason)
        {
            if (!ReferenceEquals(runner, owner)) return;
            runnerStopped = true;
            runner = null;
            RejectV8Requests(reason);
        }

        internal static void TickV8(LGUIPlayerAcceptance owner)
        {
            if (!ReferenceEquals(runner, owner) || runnerStopped || collectingV8 || v8Requests.Count == 0 ||
                v8Requests.Peek().queuedFrame >= Time.frameCount) return;
            var request = v8Requests.Dequeue();
            var report = new V8CollectionReport { frame = Time.frameCount, queuedFrame = request.queuedFrame };
            collectingV8 = true;
            try
            {
                var boots = UnityEngine.Object.FindObjectsByType<LGUIBoot>(FindObjectsInactive.Include);
                if (boots.Length != 1) throw Unsupported("V8 collection requires exactly one existing LGUIBoot.");
                report.bootEntityId = boots[0].GetEntityId().ToString();
                var field = typeof(LGUIBoot).GetField("environment", BindingFlags.Instance | BindingFlags.NonPublic);
                if (field == null) throw Unsupported("The existing LGUIBoot.environment field is unavailable.");
#pragma warning disable CS0618 // Verify the original environment owned by LGUIBoot; never create another VM.
                var environment = field.GetValue(boots[0]) as Puerts.JsEnv;
#pragma warning restore CS0618
                if (environment == null || environment.Backend == null) throw Unsupported("The existing LGUIBoot has no live environment/backend.");
                report.backend = environment.Backend.GetType().FullName;
                report.environmentIdentity = RuntimeHelpers.GetHashCode(environment).ToString("X8", CultureInfo.InvariantCulture);
                if (!(environment.Backend is Puerts.BackendV8)) throw Unsupported("The existing environment must use the V8 backend.");
                environment.Backend.LowMemoryNotification();
                report.ok = true;
            }
            catch (Exception error) { report.error = Unsupported("Original-VM V8 collection failed: " + error).Message; }
            try { CompleteV8(request, report); }
            finally { collectingV8 = false; }
            // Process at most one accepted request per Update, including callback reentrancy.
        }

        [Preserve]
        public static void CollectManaged(Action<string> callback)
        {
            if (callback == null) throw Unsupported("CollectManaged requires a completion callback.");
            EnsureRunner().StartCoroutine(CollectRoutine(callback));
        }

        static IEnumerator CollectRoutine(Action<string> callback)
        {
            AsyncOperation unload = null;
            string failure = null;
            try { unload = Resources.UnloadUnusedAssets(); }
            catch (Exception error) { failure = Unsupported("UnloadUnusedAssets failed: " + error).Message; }
            if (unload == null)
            {
                callback(JsonUtility.ToJson(new FailureReport { error = failure ?? Unsupported("UnloadUnusedAssets returned no operation.").Message }));
                yield break;
            }
            yield return unload;
            try
            {
                GC.Collect();
                GC.WaitForPendingFinalizers();
                GC.Collect();
            }
            catch (Exception error) { failure = Unsupported("Managed collection failed: " + error).Message; }
            callback(failure == null ? NativeSnapshot(false) : JsonUtility.ToJson(new FailureReport { error = failure }));
        }

        [Serializable]
        sealed class ScreenshotReport
        {
            public bool ok;
            public string path, error;
            public int width, height;
        }

        [Preserve]
        public static void Screenshot(string absolutePath, Action<string> callback)
        {
            if (callback == null) throw Unsupported("Screenshot requires a completion callback.");
            EnsureRunner().StartCoroutine(ScreenshotRoutine(absolutePath, callback));
        }

        static IEnumerator ScreenshotRoutine(string absolutePath, Action<string> callback)
        {
            var report = new ScreenshotReport { path = absolutePath };
            try
            {
                if (string.IsNullOrEmpty(absolutePath) || !Path.IsPathFullyQualified(absolutePath) ||
                    !string.Equals(Path.GetExtension(absolutePath), ".png", StringComparison.OrdinalIgnoreCase))
                    throw Unsupported("Screenshot requires an absolute, unused .png path.");
                report.path = Path.GetFullPath(absolutePath);
                if (File.Exists(report.path) || Directory.Exists(report.path)) throw Unsupported("Screenshot evidence already exists: " + report.path);
                if (SystemInfo.graphicsDeviceType == GraphicsDeviceType.Null) throw Unsupported("A real graphics device is required for a screenshot.");
            }
            catch (Exception error) { report.error = Unsupported("Screenshot validation failed: " + error).Message; }
            if (report.error != null)
            {
                callback(JsonUtility.ToJson(report));
                yield break;
            }
            yield return new WaitForEndOfFrame();
            Texture2D captured = null;
            try
            {
                captured = ScreenCapture.CaptureScreenshotAsTexture(1);
                if (captured == null || captured.width <= 0 || captured.height <= 0) throw Unsupported("The rendered screenshot texture is empty.");
                report.width = captured.width;
                report.height = captured.height;
                var png = ImageConversion.EncodeToPNG(captured);
                if (png == null || png.Length == 0) throw Unsupported("PNG encoding returned no bytes.");
                Directory.CreateDirectory(Path.GetDirectoryName(report.path));
                // CreateNew also rejects a file created by another operation after validation.
                using (var output = new FileStream(report.path, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                    output.Write(png, 0, png.Length);
                report.ok = true;
            }
            catch (Exception error) { report.error = Unsupported("Screenshot capture failed: " + error).Message; }
            finally { if (captured != null) UnityEngine.Object.Destroy(captured); }
            // A subsequent native-memory checkpoint must not count this temporary GPU texture.
            while (captured != null) yield return null;
            captured = null;
            callback(JsonUtility.ToJson(report));
        }
    }

    [Preserve]
    [DefaultExecutionOrder(-31999)]
    public sealed class LGUIPlayerAcceptance : MonoBehaviour
    {
        void Update() { PlayerAcceptance.TickV8(this); }
        void OnApplicationQuit() { PlayerAcceptance.StopV8(this, "The Player quit before the queued V8 collection ran."); }
        void OnDestroy() { PlayerAcceptance.StopV8(this, "The acceptance host was destroyed before the queued V8 collection ran."); }
    }
}
