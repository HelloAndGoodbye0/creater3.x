import { UILayer } from "./UILayer";



 /**
  * 界面配置接口
  */
export interface UIConfig {
    /** 远程包名 不传默认为resources包*/
    bundle?: string;
    /** 窗口层级 默认为UI*/
    layer?: UILayer;
    /** 预制资源在bundle中的路径 */
    prefab: string;
    /** 传递给界面的参数 */
    args?: any;
    /** 是否使用对象池(比如toast,msgBox等可能多次使用的) */
    usePool?: boolean;
    /** 是否自动打开(PopupManager弹出的会为true) */
    bAuto?: boolean;
}


/**
 * 基础UI配置 从0开始
 */
export enum UID {
    /**
     * 弹窗
     */
    MsgBox = 0,
    /**
     * 浮动文字
     */
    Toast,

}


export var baseUIConfig: { [key: number]: UIConfig } = {
    [UID.MsgBox]: { layer: UILayer.Dialog, prefab: "prefabs/alertNode", bundle: "resources", usePool: true },
    [UID.Toast]: { layer: UILayer.Toast, prefab: "prefabs/notify", bundle: "resources", usePool: false }
}

