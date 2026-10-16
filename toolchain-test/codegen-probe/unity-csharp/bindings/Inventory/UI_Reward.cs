/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

using FairyGUI;
using FairyGUI.Utils;

namespace Inventory
{
	public partial class UI_Reward : GComponent
	{
		public const string URL = "ui://invtest1reward01";
		public GGraph m_rewardbg;
		public GTextField m_title;
		public GTextField m_body;
		public UI_Btn m_confirm;

		public static UI_Reward CreateInstance()
		{
			return (UI_Reward)UIPackage.CreateObject("Inventory", "Reward");
		}

		public override void ConstructFromXML(XML xml)
		{
			base.ConstructFromXML(xml);
			m_rewardbg = (GGraph)this.GetChildAt(0);
			m_title = (GTextField)this.GetChildAt(1);
			m_body = (GTextField)this.GetChildAt(2);
			m_confirm = (UI_Btn)this.GetChildAt(3);

		}
	}
}
