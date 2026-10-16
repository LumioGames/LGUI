/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

import UI_Btn from "./UI_Btn";

export default class UI_Main extends fgui.GComponent
{
	public static URL:string = "ui://invtest1main0001";
	public m_background:fgui.GGraph;
	public m_title:fgui.GTextField;
	public m_searchbg:fgui.GGraph;
	public m_search:fgui.GTextInput;
	public m_update:UI_Btn;
	public m_reward:UI_Btn;
	public m_close:UI_Btn;
	public m_list:fgui.GList;
	public m_summary:fgui.GTextField;
	public m_enter:fgui.Transition;

	public static createInstance():UI_Main
	{
		return <UI_Main><any>(fgui.UIPackage.createObject("Inventory","Main"));
	}

	protected onConstruct():void
	{
		this.m_background = <fgui.GGraph><any>(this.getChildAt(0));
		this.m_title = <fgui.GTextField><any>(this.getChildAt(1));
		this.m_searchbg = <fgui.GGraph><any>(this.getChildAt(2));
		this.m_search = <fgui.GTextInput><any>(this.getChildAt(3));
		this.m_update = <UI_Btn><any>(this.getChildAt(4));
		this.m_reward = <UI_Btn><any>(this.getChildAt(5));
		this.m_close = <UI_Btn><any>(this.getChildAt(6));
		this.m_list = <fgui.GList><any>(this.getChildAt(7));
		this.m_summary = <fgui.GTextField><any>(this.getChildAt(8));
		this.m_enter = this.getTransitionAt(0);
	}
}
