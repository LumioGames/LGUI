using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.Scripting;

namespace LGUI
{
    /// <summary>Unity services used by the TypeScript backend. Game code uses lgui.platform.</summary>
    [Preserve]
    public static partial class Platform
    {
        static readonly System.Diagnostics.Stopwatch clock = System.Diagnostics.Stopwatch.StartNew();
        static readonly HashSet<UnityWebRequest> requests = new HashSet<UnityWebRequest>();
        static readonly HashSet<AudioClip> downloadedSounds = new HashSet<AudioClip>();
        static MonoBehaviour owner;
        static int generation;
        static string inputMode = "all";

        public static double Now { get { return clock.Elapsed.TotalMilliseconds; } }
        public static int ScreenWidth { get { return Screen.width; } }
        public static int ScreenHeight { get { return Screen.height; } }
        public static float SafeAreaTop { get { return Screen.height - Screen.safeArea.yMax; } }
        public static float SafeAreaRight { get { return Screen.width - Screen.safeArea.xMax; } }
        public static float SafeAreaBottom { get { return Screen.safeArea.yMin; } }
        public static float SafeAreaLeft { get { return Screen.safeArea.xMin; } }
        public static bool IsComposing { get { return !string.IsNullOrEmpty(Input.compositionString); } }
        public static float WheelDeltaX
        {
            get
            {
                var current = Event.current;
                return current != null && current.type == EventType.ScrollWheel
                    ? current.delta.x * FairyGUI.Stage.mouseWheelScale : 0;
            }
        }
        public static string InputMode { get { return inputMode; } }

        public static void Initialize(MonoBehaviour instance)
        {
            if (instance == null) throw new InvalidOperationException("LGUI-RT-160  Unity 宿主不存在。 → 在启动场景中添加 LGUIBoot。");
            if (owner != null && owner != instance) throw new InvalidOperationException("LGUI-RT-160  已有一个 Unity 宿主。 → 场景中只保留一个 LGUIBoot。");
            owner = instance;
        }

        public static void Shutdown(MonoBehaviour instance)
        {
            if (owner != instance) return;
            generation++;
            if (owner != null) owner.StopAllCoroutines();
            foreach (var request in new List<UnityWebRequest>(requests))
            {
                request.Abort();
                request.Dispose();
            }
            requests.Clear();
            foreach (var clip in downloadedSounds) if (clip != null) UnityEngine.Object.Destroy(clip);
            downloadedSounds.Clear();
            owner = null;
            inputMode = "all";
        }

        internal static Coroutine Run(IEnumerator routine)
        {
            if (owner == null) throw new InvalidOperationException("LGUI-RT-160  Unity 平台服务还没启动。 → 先由 LGUIBoot 启动游戏。");
            return owner.StartCoroutine(routine);
        }

        internal static void Track(UnityWebRequest request) { requests.Add(request); }
        internal static void Untrack(UnityWebRequest request) { requests.Remove(request); }

        internal static InvalidOperationException Failure(string message, Exception cause = null)
        {
            return new InvalidOperationException("LGUI-RT-161  " + message + " → 检查资源地址、网络连接或本地目录权限。", cause);
        }

        public static void SetInputMode(string mode)
        {
            if (mode != "ui" && mode != "game" && mode != "all") throw Failure("输入模式必须是 ui、game 或 all。");
            inputMode = mode;
        }

        static string StoragePath(string project, string key)
        {
            if (string.IsNullOrEmpty(project) || key == null) throw Failure("存储需要工程名称和键名。");
            return Path.Combine(Application.persistentDataPath, "LGUI", Hash(project), Hash(key) + ".txt");
        }

        static string Hash(string value)
        {
            using (var algorithm = SHA256.Create())
                return BitConverter.ToString(algorithm.ComputeHash(Encoding.UTF8.GetBytes(value))).Replace("-", "").ToLowerInvariant();
        }

        public static string StorageGet(string project, string key)
        {
            try { return File.ReadAllText(StoragePath(project, key), Encoding.UTF8); }
            catch (FileNotFoundException) { return null; }
            catch (DirectoryNotFoundException) { return null; }
            catch (Exception error) { throw Failure("无法读取本地存储：" + error.Message, error); }
        }

        public static void StorageSet(string project, string key, string value)
        {
            try
            {
                if (value == null) throw Failure("存储值必须是字符串。");
                var file = StoragePath(project, key);
                Directory.CreateDirectory(Path.GetDirectoryName(file));
                File.WriteAllText(file, value, new UTF8Encoding(false));
            }
            catch (Exception error) { throw Failure("无法写入本地存储：" + error.Message, error); }
        }

        public static void StorageRemove(string project, string key)
        {
            try { File.Delete(StoragePath(project, key)); }
            catch (DirectoryNotFoundException) { }
            catch (Exception error) { throw Failure("无法删除本地存储：" + error.Message, error); }
        }

        public static string LoadText(string resourcePath)
        {
            if (string.IsNullOrEmpty(resourcePath)) throw new InvalidOperationException("LGUI-RT-160  文本资源路径为空。 → 重新运行 lgui unity export。");
            var asset = Resources.Load<TextAsset>(resourcePath);
            if (asset == null) throw new InvalidOperationException("LGUI-RT-160  缺少文本资源 " + resourcePath + "。 → 重新运行 lgui unity export。");
            return asset.text;
        }

        public static void Log(string level, string message)
        {
            switch (level)
            {
                case "debug": case "info": Debug.Log(message); break;
                case "warn": Debug.LogWarning(message); break;
                case "error": Debug.LogError(message); break;
                default: throw Failure("不支持的日志级别：" + level);
            }
        }

        public static string SystemLanguage
        {
            get
            {
                switch (Application.systemLanguage)
                {
                    case UnityEngine.SystemLanguage.Afrikaans: return "af";
                    case UnityEngine.SystemLanguage.Arabic: return "ar";
                    case UnityEngine.SystemLanguage.Basque: return "eu";
                    case UnityEngine.SystemLanguage.Belarusian: return "be";
                    case UnityEngine.SystemLanguage.Bulgarian: return "bg";
                    case UnityEngine.SystemLanguage.Catalan: return "ca";
                    case UnityEngine.SystemLanguage.Chinese: case UnityEngine.SystemLanguage.ChineseSimplified: return "zh-CN";
                    case UnityEngine.SystemLanguage.ChineseTraditional: return "zh-TW";
                    case UnityEngine.SystemLanguage.Czech: return "cs";
                    case UnityEngine.SystemLanguage.Danish: return "da";
                    case UnityEngine.SystemLanguage.Dutch: return "nl";
                    case UnityEngine.SystemLanguage.English: return "en";
                    case UnityEngine.SystemLanguage.Estonian: return "et";
                    case UnityEngine.SystemLanguage.Faroese: return "fo";
                    case UnityEngine.SystemLanguage.Finnish: return "fi";
                    case UnityEngine.SystemLanguage.French: return "fr";
                    case UnityEngine.SystemLanguage.German: return "de";
                    case UnityEngine.SystemLanguage.Greek: return "el";
                    case UnityEngine.SystemLanguage.Hebrew: return "he";
                    case UnityEngine.SystemLanguage.Hungarian: return "hu";
                    case UnityEngine.SystemLanguage.Icelandic: return "is";
                    case UnityEngine.SystemLanguage.Indonesian: return "id";
                    case UnityEngine.SystemLanguage.Italian: return "it";
                    case UnityEngine.SystemLanguage.Japanese: return "ja";
                    case UnityEngine.SystemLanguage.Korean: return "ko";
                    case UnityEngine.SystemLanguage.Latvian: return "lv";
                    case UnityEngine.SystemLanguage.Lithuanian: return "lt";
                    case UnityEngine.SystemLanguage.Norwegian: return "no";
                    case UnityEngine.SystemLanguage.Polish: return "pl";
                    case UnityEngine.SystemLanguage.Portuguese: return "pt";
                    case UnityEngine.SystemLanguage.Romanian: return "ro";
                    case UnityEngine.SystemLanguage.Russian: return "ru";
                    case UnityEngine.SystemLanguage.SerboCroatian: return "sh";
                    case UnityEngine.SystemLanguage.Slovak: return "sk";
                    case UnityEngine.SystemLanguage.Slovenian: return "sl";
                    case UnityEngine.SystemLanguage.Spanish: return "es";
                    case UnityEngine.SystemLanguage.Swedish: return "sv";
                    case UnityEngine.SystemLanguage.Thai: return "th";
                    case UnityEngine.SystemLanguage.Turkish: return "tr";
                    case UnityEngine.SystemLanguage.Ukrainian: return "uk";
                    case UnityEngine.SystemLanguage.Vietnamese: return "vi";
                    default: return "und";
                }
            }
        }
    }
}
