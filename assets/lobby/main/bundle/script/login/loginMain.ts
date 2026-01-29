import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
import { XKit } from '../../../../../script/XKit/XKit';
import { UILayer } from '../../../../../script/XKit/GUI/UILayer';
import { viewLogin } from './view/viewLogin';
const { ccclass, property } = _decorator;

@ccclass('loginMian')
export class loginMian extends lobbyMod {

    ID = PModuleID.Login
    async onEnter(...args: any) {
        XKit.gui.open<viewLogin>({ layer: UILayer.UI, prefab: "prefabs/login", bundle: PModuleID.Lobby.toString()})
    }

}

lobbyModHub.getInstance().registerModule(PModuleID.Login,loginMian)

globalThis.goLogin= ()=>{
    lobbyModHub.getInstance().enterByModID(PModuleID.Login,true)
}


