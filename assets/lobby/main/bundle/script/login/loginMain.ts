import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
import { XKit } from '../../../../../script/XKit/XKit';
import { UILayer } from '../../../../../script/XKit/GUI/UILayer';
import { viewLogin } from './view/viewLogin';
import { lobbyUIConfig, LobbyUID } from '../lobbyUIConfig';
const { ccclass, property } = _decorator;

@ccclass('loginMian')
export class loginMian extends lobbyMod {

    ID = PModuleID.Login
    async onEnter(...args: any) {
        XKit.gui.open<viewLogin>(LobbyUID.Login)
    }

}

lobbyModHub.getInstance().registerModule(PModuleID.Login,loginMian)

globalThis.goLogin= ()=>{

    //注册大厅的UI
    for (const key in lobbyUIConfig) {
        const config = lobbyUIConfig[key];
        XKit.gui.reigster(Number(key), config);
    }

    lobbyModHub.getInstance().enterByModID(PModuleID.Login,true)
}





