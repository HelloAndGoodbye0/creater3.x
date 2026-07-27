import { BaseGameUIConfig, BundleConfig, UIConfig } from "../../../../../script/XKit/GUI/UIConfig";
import { UILayer } from "../../../../../script/XKit/GUI/UILayer";


export enum UID {

    //合并BaseUID
    
    /**登录 */
    Login = 1000,
    /**大厅 */
    Lobby = 1001,

}

/**
 * 游戏内的ui配置
 */
export var GameUIConfig: { [key: number]: UIConfig } = {
    //合并基础UI配置
    ...BaseGameUIConfig,
    [UID.Login]: { layer: UILayer.UI, prefab: "prefabs/login", bundle: BundleConfig.lobby.toString()},
    [UID.Lobby]: { layer: UILayer.UI, prefab: "prefabs/lobby", bundle: BundleConfig.lobby.toString()}
}