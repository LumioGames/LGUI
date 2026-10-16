/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

import UI_Btn from "./UI_Btn";

export default class UI_Reward extends fgui.GComponent
{
	public static URL:string = "ui://invtest1reward01";
	public m_rewardbg:fgui.GGraph;
	public m_title:fgui.GTextField;
	public m_body:fgui.GTextField;
	public m_confirm:UI_Btn;

	public static createInstance():UI_Reward
	{
		return <UI_Reward><any>(fgui.UIPackage.createObject("Inventory","Reward"));
	}

	protected onConstruct():void
	{
		this.m_rewardbg = <fgui.GGraph><any>(this.getChildAt(0));
		this.m_title = <fgui.GTextField><any>(this.getChildAt(1));
		this.m_body = <fgui.GTextField><any>(this.getChildAt(2));
		this.m_confirm = <UI_Btn><any>(this.getChildAt(3));
	}
}
