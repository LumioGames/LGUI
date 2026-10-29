using System;
using System.Collections;
using System.Text;
using FairyGUI;
using UnityEngine;
using UnityEngine.Networking;

namespace LGUI
{
    public static partial class Platform
    {
        [Serializable] sealed class Headers { public Header[] items; }
        [Serializable] sealed class Header { public string name; public string value; }
        [Serializable] sealed class Response { public int status; public string text; public string error; }

        public static void Fetch(string url, string method, string headersJson, string body, Action<string> complete)
        {
            RequireHttp(url);
            if (complete == null) throw Failure("HTTP 请求缺少完成回调。");
            UnityWebRequest request = null;
            try
            {
                request = new UnityWebRequest(url, string.IsNullOrEmpty(method) ? "GET" : method);
                request.downloadHandler = new DownloadHandlerBuffer();
                if (body != null) request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(body));
                if (!string.IsNullOrEmpty(headersJson))
                {
                    var headers = JsonUtility.FromJson<Headers>(headersJson);
                    if (headers == null || headers.items == null) throw Failure("HTTP 请求头格式必须是 {items:[{name,value}]}。");
                    foreach (var header in headers.items)
                    {
                        if (header == null || string.IsNullOrEmpty(header.name)) throw Failure("HTTP 请求头缺少 name。");
                        request.SetRequestHeader(header.name, header.value ?? "");
                    }
                }
                Run(Send(request, complete, generation));
            }
            catch (Exception error)
            {
                if (request != null) request.Dispose();
                throw Failure("HTTP 请求无法启动：" + error.Message, error);
            }
        }

        internal static int RequestGeneration { get { return generation; } }
        internal static bool IsRequestCurrent(int startedGeneration) { return startedGeneration == generation && owner != null; }

        internal static bool TryStartRequest(UnityWebRequest request, out UnityWebRequestAsyncOperation operation, out Exception startupError)
        {
            try
            {
                operation = request.SendWebRequest();
                startupError = null;
                return true;
            }
            catch (Exception error)
            {
                operation = null;
                startupError = error;
                return false;
            }
        }

        static IEnumerator Send(UnityWebRequest request, Action<string> complete, int startedGeneration)
        {
            Track(request);
            try
            {
                UnityWebRequestAsyncOperation operation;
                Exception startupError;
                if (!TryStartRequest(request, out operation, out startupError))
                {
                    if (startedGeneration != generation || owner == null) yield break;
                    complete(JsonUtility.ToJson(new Response {
                        status = 0,
                        text = "",
                        error = Failure("HTTP 请求无法启动：" + startupError, startupError).ToString()
                    }));
                    yield break;
                }
                yield return operation;
                if (startedGeneration != generation || owner == null) yield break;
                var failed = request.result == UnityWebRequest.Result.ConnectionError || request.result == UnityWebRequest.Result.DataProcessingError;
                complete(JsonUtility.ToJson(new Response {
                    status = request.responseCode < 0 ? 0 : (int)request.responseCode,
                    text = request.downloadHandler == null ? "" : request.downloadHandler.text,
                    error = failed ? "LGUI-RT-161  HTTP 请求失败：" + request.error + "。 → 检查网络连接和请求地址。" : ""
                }));
            }
            finally { Untrack(request); request.Dispose(); }
        }

        static void RequireHttp(string url)
        {
            Uri uri;
            if (!Uri.TryCreate(url, UriKind.Absolute, out uri) || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
                throw Failure("网络资源必须使用 HTTP 或 HTTPS 地址：" + url);
        }

        public static void PlayAudio(string url, float volume)
        {
            if (string.IsNullOrEmpty(url)) throw Failure("音效地址为空。");
            if (float.IsNaN(volume) || float.IsInfinity(volume)) throw Failure("音量必须是有限数字。");
            if (url.StartsWith("ui://", StringComparison.Ordinal))
            {
                var clip = UIPackage.GetItemAssetByURL(url) as NAudioClip;
                if (clip == null || clip.nativeClip == null) throw Failure("界面音效不存在：" + url);
                GRoot.inst.PlayOneShotSound(clip.nativeClip, Mathf.Clamp01(volume));
                return;
            }
            RequireHttp(url);
            var extension = System.IO.Path.GetExtension(new Uri(url).AbsolutePath).ToLowerInvariant();
            AudioType type;
            switch (extension)
            {
                case ".wav": type = AudioType.WAV; break;
                case ".ogg": type = AudioType.OGGVORBIS; break;
                case ".mp3": type = AudioType.MPEG; break;
                case ".aif": case ".aiff": type = AudioType.AIFF; break;
                default: throw new NotSupportedException("LGUI-RT-001  Unity 后端尚不支持这种网络音效格式：" + extension + "。 → 使用 WAV、OGG、MP3 或 AIFF。");
            }
            Run(DownloadSound(url, type, Mathf.Clamp01(volume), generation));
        }

        static IEnumerator DownloadSound(string url, AudioType type, float volume, int startedGeneration)
        {
            var request = UnityWebRequestMultimedia.GetAudioClip(url, type);
            Track(request);
            AudioClip clip = null;
            try
            {
                UnityWebRequestAsyncOperation operation;
                Exception startupError;
                if (!TryStartRequest(request, out operation, out startupError))
                {
                    if (startedGeneration != generation || owner == null) yield break;
                    Log("error", Failure("音效请求无法启动：" + url + "；" + startupError.Message, startupError).ToString());
                    yield break;
                }
                yield return operation;
                if (startedGeneration != generation || owner == null) yield break;
                if (request.result != UnityWebRequest.Result.Success)
                {
                    Log("error", "LGUI-RT-161  音效加载失败：" + url + "；" + request.error + "。 → 检查音效地址和格式。");
                    yield break;
                }
                clip = DownloadHandlerAudioClip.GetContent(request);
                if (clip == null)
                {
                    Log("error", "LGUI-RT-161  音效没有可播放的数据：" + url + "。 → 检查音效格式。");
                    yield break;
                }
                downloadedSounds.Add(clip);
                GRoot.inst.PlayOneShotSound(clip, volume);
            }
            finally { Untrack(request); request.Dispose(); }
            if (clip != null)
            {
                yield return new WaitForSecondsRealtime(clip.length + 0.1f);
                downloadedSounds.Remove(clip);
                UnityEngine.Object.Destroy(clip);
            }
        }
    }
}
