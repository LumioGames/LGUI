using UnityEngine;

namespace LGUI
{
    /// <summary>一首背景音乐：循环播放，按不受 timeScale 影响的时间淡入淡出；淡出到头后销毁自己（下载来的声音一起销毁）。</summary>
    [AddComponentMenu("")]
    public sealed class LGUIMusicTrack : MonoBehaviour
    {
        internal string url;
        AudioSource source;
        bool ownsClip;
        float from, to, duration, elapsed;
        bool stopAtEnd;

        internal static LGUIMusicTrack Create(Transform parent, string url, AudioClip clip, bool ownsClip)
        {
            var holder = new GameObject("LGUI Music");
            holder.transform.SetParent(parent, false);
            var track = holder.AddComponent<LGUIMusicTrack>();
            track.url = url;
            track.ownsClip = ownsClip;
            track.source = holder.AddComponent<AudioSource>();
            track.source.playOnAwake = false;
            track.source.bypassEffects = true;
            track.source.loop = true;
            track.source.clip = clip;
            track.source.volume = 0;
            track.source.Play();
            if (Platform.audioPaused) track.source.Pause();
            return track;
        }

        internal void FadeTo(float volume, float seconds, bool stop)
        {
            from = source.volume;
            to = volume;
            duration = Mathf.Max(0, seconds);
            elapsed = 0;
            stopAtEnd = stop;
            enabled = true;
        }

        internal void SetPaused(bool paused)
        {
            if (paused) source.Pause(); else source.UnPause();
        }

        void Update()
        {
            if (Platform.audioPaused) return;
            elapsed += Time.unscaledDeltaTime;
            source.volume = duration > 0 ? Mathf.Lerp(from, to, Mathf.Clamp01(elapsed / duration)) : to;
            if (elapsed < duration) return;
            enabled = false;
            if (stopAtEnd) Destroy(gameObject);
        }

        void OnDestroy()
        {
            if (ownsClip && source != null && source.clip != null) Destroy(source.clip);
        }
    }
}
