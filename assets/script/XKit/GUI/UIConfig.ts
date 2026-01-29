import { UILayer } from "./UILayer";



 /**
  * 界面配置接口
  */
export interface UIConfig {
    /** 远程包名 */
    bundle?: string;
    /** 窗口层级 */
    layer?: UILayer;
    /** 预制资源相对路径 */
    prefab: string;
    /** 传递给界面的参数 */
    args?: any;
    /** 是否使用对象池 */
    usePool?: boolean;
    /** 是否自动打开 */
    bAuto?: boolean;
}



