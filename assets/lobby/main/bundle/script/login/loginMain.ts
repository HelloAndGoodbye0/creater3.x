import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModule';
import { XKit } from '../../../../../script/XKit/XKit';
import { UILayer } from '../../../../../script/XKit/GUI/UILayer';
const { ccclass, property } = _decorator;

@ccclass('loginMian')
export class loginMian extends lobbyMod {

    ID = PModuleID.Login
    onEnter(...args: any): void {
        XKit.gui.open({ layer: UILayer.UI, prefab: "prefabs/login", bundle: PModuleID.Lobby.toString()})
    }

}

lobbyModHub.getInstance().registerModule(PModuleID.Login,loginMian)

globalThis.goLogin= ()=>{
    lobbyModHub.getInstance().enterByModID(PModuleID.Login)
}


