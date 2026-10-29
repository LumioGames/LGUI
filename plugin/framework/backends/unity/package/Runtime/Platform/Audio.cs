using System;
using System.Collections;
using FairyGUI;
using UnityEngine;
using UnityEngine.Networking;

namespace LGUI
{
    public static partial class Platform
    {
        // LGUI 的声音出口：音效用一个 AudioSource，背景音乐每首一个（换曲时新旧两首同时淡入淡出）。
        // FairyGUI-unity 自带的按钮音、动效音由 TypeScript 后端关掉（Stage.soundVolume = 0），和网页版的 FairyGUI 一样只由框架放声音。
        static AudioSource sfx;
        static LGUIMusicTrack music;
        static string pendingMusicUrl;
        static float pendingMusicVolume;
        static int musicRequest;
        internal static bool audioPaused;

        static void PlaySfx(AudioClip clip, float volume)
        {
            if (audioPaused) return;
            if (owner == null) throw new InvalidOperationException("LGUI-RT-160  Unity 平台服务还没启动。 → 先由 LGUIBoot 启动游戏。");
            if (sfx == null)
            {
                sfx = owner.gameObject.AddComponent<AudioSource>();
                sfx.playOnAwake = false;
                sfx.bypassEffects = true;
            }
            sfx.PlayOneShot(clip, volume);
        }

        /// <summary>背景音乐换成 url（空是停掉），新旧两首用 fadeMs 毫秒淡入淡出；和正在放（或正在下载）的一样时只改音量，不从头放。</summary>
        public static void PlayMusic(string url, float volume, float fadeMs)
        {
            if (float.IsNaN(volume) || float.IsInfinity(volume)) throw Failure("音量必须是有限数字。");
            if (float.IsNaN(fadeMs) || float.IsInfinity(fadeMs) || fadeMs < 0) throw Failure("淡入淡出时长必须是不小于 0 的有限数字。");
            volume = Mathf.Clamp01(volume);
            var fade = fadeMs / 1000f;
            if (!string.IsNullOrEmpty(url))
            {
                if (music != null && music.url == url) { music.FadeTo(volume, 0.05f, false); return; }
                if (music == null && pendingMusicUrl == url) { pendingMusicVolume = volume; return; }
            }
            musicRequest++;
            pendingMusicUrl = null;
            if (music != null) { music.FadeTo(0, fade, true); music = null; }
            if (string.IsNullOrEmpty(url)) return;
            if (url.StartsWith("ui://", StringComparison.Ordinal))
            {
                var clip = UIPackage.GetItemAssetByURL(url) as NAudioClip;
                if (clip == null || clip.nativeClip == null) throw Failure("背景音乐不存在：" + url);
                StartMusic(url, clip.nativeClip, false, volume, fade);
                return;
            }
            RequireHttp(url);
            var type = NetworkAudioType(url);
            pendingMusicUrl = url;
            pendingMusicVolume = volume;
            Run(DownloadMusic(url, type, fade, musicRequest, generation));
        }

        /// <summary>暂停或恢复 LGUI 的全部声音（切到后台时由框架调用）；暂停时不放新的音效。</summary>
        public static void SetAudioPaused(bool paused)
        {
            audioPaused = paused;
            if (sfx != null) { if (paused) sfx.Pause(); else sfx.UnPause(); }
            if (owner == null) return;
            foreach (var track in owner.GetComponentsInChildren<LGUIMusicTrack>(true)) track.SetPaused(paused);
        }

        static void StartMusic(string url, AudioClip clip, bool ownsClip, float volume, float fade)
        {
            if (owner == null) throw new InvalidOperationException("LGUI-RT-160  Unity 平台服务还没启动。 → 先由 LGUIBoot 启动游戏。");
            music = LGUIMusicTrack.Create(owner.transform, url, clip, ownsClip);
            music.FadeTo(volume, fade, false);
        }

        static IEnumerator DownloadMusic(string url, AudioType type, float fade, int request, int startedGeneration)
        {
            var web = UnityWebRequestMultimedia.GetAudioClip(url, type);
            Track(web);
            AudioClip clip = null;
            try
            {
                UnityWebRequestAsyncOperation operation;
                Exception startupError;
                if (!TryStartRequest(web, out operation, out startupError))
                {
                    if (startedGeneration != generation || owner == null || request != musicRequest) yield break;
                    pendingMusicUrl = null;
                    Log("warn", Failure("背景音乐请求无法启动：" + url + "；" + startupError.Message, startupError).ToString());
                    yield break;
                }
                yield return operation;
                if (startedGeneration != generation || owner == null || request != musicRequest) yield break;
                pendingMusicUrl = null;
                if (web.result != UnityWebRequest.Result.Success)
                {
                    Log("warn", "LGUI-RT-161  背景音乐加载失败：" + url + "；" + web.error + "。 → 检查地址和格式。");
                    yield break;
                }
                clip = DownloadHandlerAudioClip.GetContent(web);
                if (clip == null)
                {
                    Log("warn", "LGUI-RT-161  背景音乐没有可播放的数据：" + url + "。 → 检查格式。");
                    yield break;
                }
            }
            finally { Untrack(web); web.Dispose(); }
            StartMusic(url, clip, true, pendingMusicVolume, fade);
        }

        static void StopAudio()
        {
            musicRequest++;
            pendingMusicUrl = null;
            music = null;
            audioPaused = false;
            if (owner != null) foreach (var track in owner.GetComponentsInChildren<LGUIMusicTrack>(true)) UnityEngine.Object.Destroy(track.gameObject);
            if (sfx != null) UnityEngine.Object.Destroy(sfx);
            sfx = null;
        }
    }
}
