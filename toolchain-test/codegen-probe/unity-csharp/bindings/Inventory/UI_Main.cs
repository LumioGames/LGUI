/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

using FairyGUI;
using FairyGUI.Utils;

namespace Inventory
{
	public partial class UI_Main : GComponent
	{
		public const string URL = "ui://invtest1main0001";
		public GGraph m_background;
		public GTextField m_title;
		public GGraph m_searchbg;
		public GTextInput m_search;
		public UI_Btn m_update;
		public UI_Btn m_reward;
		public UI_Btn m_close;
		public GList m_list;
		public GTextField m_summary;
		public Transition m_enter;

		public static UI_Main CreateInstance()
		{
			return (UI_Main)UIPackage.CreateObject("Inventory", "Main");
		}

		public override void ConstructFromXML(XML xml)
		{
			base.ConstructFromXML(xml);
			m_background = (GGraph)this.GetChildAt(0);
			m_title = (GTextField)this.GetChildAt(1);
			m_searchbg = (GGraph)this.GetChildAt(2);
			m_search = (GTextInput)this.GetChildAt(3);
			m_update = (UI_Btn)this.GetChildAt(4);
			m_reward = (UI_Btn)this.GetChildAt(5);
			m_close = (UI_Btn)this.GetChildAt(6);
			m_list = (GList)this.GetChildAt(7);
			m_summary = (GTextField)this.GetChildAt(8);
			m_enter = this.GetTransitionAt(0);

		}
	}
}
