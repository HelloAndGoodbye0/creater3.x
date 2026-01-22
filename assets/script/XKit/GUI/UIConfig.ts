import { UILayer } from "./UILayer";


/** 界面唯一标识（方便服务器通过编号数据触发界面打开） */
export enum UIID {

    Waiting = 0,//菊花转

    Toast = 1,//toast

    MsgBox=2,//消息框
}


 /**
  * 界面配置接口
  */
export interface UIConfig {
    /** 远程包名 */
    bundle?: string;
    /** 窗口层级 */
    layer: UILayer;
    /** 预制资源相对路径 */
    prefab: string;
    //传递给界面的参数
    args?: any;
}


/** 打开界面方式的配置数据 */
export var UIConfigData: { [key: number]: UIConfig } = {

    //菊花转
    [UIID.Waiting]: { layer: UILayer.Waiting, prefab: "prefabs/loadingNode", bundle: "resources" },
    //toast
    [UIID.Toast]: { layer: UILayer.Toast, prefab: "prefabs/notify", bundle: "resources" },
    //消息框
    [UIID.MsgBox]: { layer: UILayer.Dialog, prefab: "prefabs/alertNode", bundle: "resources" },
}