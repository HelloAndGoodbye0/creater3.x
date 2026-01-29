import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModule';
import { XKit } from '../../../../../script/XKit/XKit';
import { UIID } from '../../../../../script/XKit/GUI/UIConfig';
const { ccclass, property } = _decorator;

@ccclass('loginMian')
export class loginMian extends lobbyMod {

    ID = PModuleID.Login
    onEnter(...args: any): void {
        XKit.gui.open(UIID.Login)
    }

}

lobbyModHub.getInstance().registerModule(PModuleID.Login,loginMian)

globalThis.goLogin= ()=>{
    lobbyModHub.getInstance().enterByModID(PModuleID.Login)
}


