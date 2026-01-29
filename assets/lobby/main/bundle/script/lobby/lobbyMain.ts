import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { XKit } from '../../../../../script/XKit/XKit';
import { UIID } from '../../../../../script/XKit/GUI/UIConfig';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
const { ccclass, property } = _decorator;

@ccclass('lobbyMain')
export class lobbyMain extends lobbyMod {

    onEnter(...args: any): void {
        XKit.gui.open(UIID.Lobby)
    }
}



lobbyModHub.getInstance().registerModule(PModuleID.Lobby,lobbyMain)