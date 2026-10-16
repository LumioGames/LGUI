/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

using FairyGUI;
using FairyGUI.Utils;

namespace Inventory
{
	public partial class UI_Btn : GButton
	{
		public const string URL = "ui://invtest1button01";
		public GGraph m_btnbg;
		public GTextField m_title;

		public static UI_Btn CreateInstance()
		{
			return (UI_Btn)UIPackage.CreateObject("Inventory", "Btn");
		}

		public override void ConstructFromXML(XML xml)
		{
			base.ConstructFromXML(xml);
			m_btnbg = (GGraph)this.GetChildAt(0);
			m_title = (GTextField)this.GetChildAt(1);

		}
	}
}
