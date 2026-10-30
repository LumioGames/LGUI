using System;
using System.Reflection;
using FairyGUI;

namespace LGUI
{
    public static partial class Platform
    {
        // FairyGUI-unity 不公开按钮音效的地址和动效的自动播放设置；后端要用它们像 h5 一样放按钮音、通知动效的 done。
        static readonly FieldInfo autoPlayField = TransitionField("_autoPlay");
        static readonly FieldInfo autoPlayTimesField = TransitionField("_autoPlayTimes");
        static readonly FieldInfo autoPlayDelayField = TransitionField("_autoPlayDelay");

        static FieldInfo TransitionField(string name)
        {
            return typeof(Transition).GetField(name, BindingFlags.Instance | BindingFlags.NonPublic);
        }

        static object TransitionValue(FieldInfo field, Transition transition)
        {
            if (transition == null) throw Failure("动效为空。");
            if (field == null) throw new InvalidOperationException("LGUI-RT-160  FairyGUI 的 Transition 没有自动播放字段（_autoPlay、_autoPlayTimes、_autoPlayDelay）。 → 使用随 LGUI 分发的 FairyGUI-unity。");
            return field.GetValue(transition);
        }

        /// <summary>动效在 ui/ 里是否勾了自动播放。</summary>
        public static bool TransitionAutoPlay(Transition transition) { return (bool)TransitionValue(autoPlayField, transition); }

        /// <summary>自动播放的次数（-1 一直循环）。</summary>
        public static int TransitionAutoPlayTimes(Transition transition) { return (int)TransitionValue(autoPlayTimesField, transition); }

        /// <summary>自动播放前等多久（秒）。</summary>
        public static float TransitionAutoPlayDelay(Transition transition) { return (float)TransitionValue(autoPlayDelayField, transition); }

        /// <summary>按钮在 ui/ 里设的点击音效的 ui:// 地址：FairyGUI 只留下了加载好的声音，按它反查包里的资源。没设是空字符串。</summary>
        public static string ButtonSoundUrl(GButton button)
        {
            if (button == null) throw Failure("按钮为空。");
            if (button.sound == null) return "";
            foreach (var pkg in UIPackage.GetPackages())
                foreach (var item in pkg.GetItems())
                    if (item.type == PackageItemType.Sound && item.audioClip == button.sound) return "ui://" + pkg.id + item.id;
            return "";
        }
    }
}
