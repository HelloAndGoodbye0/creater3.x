import { _decorator, Component, Node } from 'cc';
import { PModuleID } from './PModuleID';
import { UILayer } from '../../../../script/XKit/GUI/UILayer';
import { UIConfig } from '../../../../script/XKit/GUI/UIConfig';
import { XKit } from '../../../../script/XKit/XKit';
const { ccclass, property } = _decorator;
/**
 * 大厅uid 定义从10000开始
 */
export enum LobbyUID {
    /**登录 */
    Login = 1000,
    /**大厅 */
    Lobby ,
}

/**
 * 大厅ui配置
 */
export var  lobbyUIConfig: { [key: number]: UIConfig } = {
    [LobbyUID.Login]: { layer: UILayer.UI, prefab: "prefabs/login", bundle: PModuleID.Lobby.toString()},
    [LobbyUID.Lobby]: { layer: UILayer.UI, prefab: "prefabs/lobby", bundle: PModuleID.Lobby.toString()}
}

