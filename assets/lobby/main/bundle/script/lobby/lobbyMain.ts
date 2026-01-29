import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { XKit } from '../../../../../script/XKit/XKit';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
import { UILayer } from '../../../../../script/XKit/GUI/UILayer';
const { ccclass, property } = _decorator;

@ccclass('lobbyMain')
export class lobbyMain extends lobbyMod {

    onEnter(...args: any): void {
        XKit.gui.open({ layer: UILayer.UI, prefab: "prefabs/lobby", bundle: PModuleID.Lobby.toString()})
    }
}



lobbyModHub.getInstance().registerModule(PModuleID.Lobby,lobbyMain)