/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

import UI_Btn from "./UI_Btn";

export default class UI_ItemRow extends fgui.GComponent
{
	public static URL:string = "ui://invtest1itemrow1";
	public m_state:fgui.Controller;
	public m_rowbg:fgui.GGraph;
	public m_icon:fgui.GImage;
	public m_label:fgui.GTextField;
	public m_status:fgui.GTextField;
	public m_claim:UI_Btn;

	public static createInstance():UI_ItemRow
	{
		return <UI_ItemRow><any>(fgui.UIPackage.createObject("Inventory","ItemRow"));
	}

	protected onConstruct():void
	{
		this.m_state = this.getControllerAt(0);
		this.m_rowbg = <fgui.GGraph><any>(this.getChildAt(0));
		this.m_icon = <fgui.GImage><any>(this.getChildAt(1));
		this.m_label = <fgui.GTextField><any>(this.getChildAt(2));
		this.m_status = <fgui.GTextField><any>(this.getChildAt(3));
		this.m_claim = <UI_Btn><any>(this.getChildAt(4));
	}
}
