import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
import { XKit } from '../../../../../script/XKit/XKit';
import { viewLogin } from './view/viewLogin';
import { GameUIConfig, UID } from '../../../../../script/XKit/GUI/UIConfig';
const { ccclass, property } = _decorator;

@ccclass('loginMian')
export class loginMian extends lobbyMod {

    ID = PModuleID.Login
    async onEnter(...args: any) {
        XKit.gui.open<viewLogin>(UID.Login)
    }

}

lobbyModHub.getInstance().registerModule(PModuleID.Login,loginMian)

globalThis.goLogin= ()=>{

    //注册大厅的UI
    for (const key in GameUIConfig) {
        const config = GameUIConfig[key];
        XKit.gui.reigster(Number(key), config);
    }

    lobbyModHub.getInstance().enterByModID(PModuleID.Login,true)
}





