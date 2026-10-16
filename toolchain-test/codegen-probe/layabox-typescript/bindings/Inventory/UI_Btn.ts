/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

export default class UI_Btn extends fgui.GButton
{
	public static URL:string = "ui://invtest1button01";
	public m_btnbg:fgui.GGraph;
	public m_title:fgui.GTextField;

	public static createInstance():UI_Btn
	{
		return <UI_Btn><any>(fgui.UIPackage.createObject("Inventory","Btn"));
	}

	protected onConstruct():void
	{
		this.m_btnbg = <fgui.GGraph><any>(this.getChildAt(0));
		this.m_title = <fgui.GTextField><any>(this.getChildAt(1));
	}
}
