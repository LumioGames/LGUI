/** This is an automatically generated class by FairyGUI. Please do not modify it. **/

import UI_Btn from "./UI_Btn";
import UI_ItemRow from "./UI_ItemRow";
import UI_Main from "./UI_Main";
import UI_Reward from "./UI_Reward";

export default class InventoryBinder
{
	public static bindAll():void
	{
		fgui.UIObjectFactory.setExtension(UI_Btn.URL, UI_Btn);
		fgui.UIObjectFactory.setExtension(UI_ItemRow.URL, UI_ItemRow);
		fgui.UIObjectFactory.setExtension(UI_Main.URL, UI_Main);
		fgui.UIObjectFactory.setExtension(UI_Reward.URL, UI_Reward);
	}
}
