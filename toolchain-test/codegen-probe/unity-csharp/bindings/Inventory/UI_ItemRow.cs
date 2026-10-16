/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

using FairyGUI;
using FairyGUI.Utils;

namespace Inventory
{
	public partial class UI_ItemRow : GComponent
	{
		public const string URL = "ui://invtest1itemrow1";
		public Controller m_state;
		public GGraph m_rowbg;
		public GImage m_icon;
		public GTextField m_label;
		public GTextField m_status;
		public UI_Btn m_claim;

		public static UI_ItemRow CreateInstance()
		{
			return (UI_ItemRow)UIPackage.CreateObject("Inventory", "ItemRow");
		}

		public override void ConstructFromXML(XML xml)
		{
			base.ConstructFromXML(xml);
			m_state = this.GetControllerAt(0);
			m_rowbg = (GGraph)this.GetChildAt(0);
			m_icon = (GImage)this.GetChildAt(1);
			m_label = (GTextField)this.GetChildAt(2);
			m_status = (GTextField)this.GetChildAt(3);
			m_claim = (UI_Btn)this.GetChildAt(4);

		}
	}
}
