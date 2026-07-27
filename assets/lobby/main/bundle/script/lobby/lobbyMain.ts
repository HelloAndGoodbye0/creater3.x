import { _decorator, Component, Node } from 'cc';
import { lobbyMod } from '../mod/lobbyMod';
import { XKit } from '../../../../../script/XKit/XKit';
import { lobbyModHub } from '../mod/lobbyModHub';
import { PModuleID } from '../PModuleID';
import { UID } from '../config/GameUIConfig';

const { ccclass, property } = _decorator;

@ccclass('lobbyMain')
export class lobbyMain extends lobbyMod {

    onEnter(...args: any): void {
        XKit.gui.open(UID.Lobby)
    }
}



lobbyModHub.getInstance().registerModule(PModuleID.Lobby,lobbyMain)