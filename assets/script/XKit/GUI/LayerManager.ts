// scripts/framework/ui/UIManager.ts
import { _decorator, Node, Widget } from 'cc';
import { UIBase } from './UIBase';
import { UILayer } from './UILayer';
import { baseUIConfig, UIConfig, UID } from './UIConfig';
import { XKit } from '../XKit';
import { UIToast } from '../../../script/view/toast/UIToast';
import { MsgBoxData } from '../../../script/view/msgBox/UIMsgBox';
import { LayerUI } from './LayerUI';
import { LayerPopup } from './LayerPopup';
import { LayerDialog } from './LayerDialog';
import { LayerToast } from './LayerToast';
import { LayerWaiting } from './LayerWaiting';
import { LayerNotify } from './LayerNotify';

const { ccclass } = _decorator;
/**
 * 层级对应的节点类
 */
const Layer2Class = {
    [UILayer.Game]: LayerUI,
    [UILayer.UI]: LayerUI,
    [UILayer.PopUp]: LayerPopup,
    [UILayer.Dialog]: LayerDialog,
    [UILayer.Waiting]: LayerWaiting,
    [UILayer.Notify]: LayerNotify,
    [UILayer.Toast]: LayerToast,
    [UILayer.Guide]: LayerUI,

}

@ccclass('LayerManager')
export class LayerManager {

    /** 存储层级节点的 Map*/
    private _layerMap: Map<UILayer, LayerUI> = new Map();

    /**ui根节点 */
    private _root: Node = null;

    /**非自动弹框打开回调*/
    public onNonAutoPopupOpened?: () => void;
    /**非自动弹框关闭回调*/
    public onNonAutoPopupClosed?: () => void;

    /**
     * UI 配置表
     */
    _uiConfig:Map<number, UIConfig> = new Map()



    /**
     * 注册 UI 配置
     * @param ID 
     * @param config 
     */
    reigster(ID:number,config:UIConfig){
        if(this._uiConfig.has(ID)){
            XKit.log.logBusiness(`reigster ID:${ID} 重复注册`);
        }
        this._uiConfig.set(ID,config)
    }


    /**
     * 初始化 UI 根节点和层级
     * 建议在游戏入口脚本（如 Main.ts）的 onLoad 中调用
     * @param root 父节点，通常是 Canvas
     */
    constructor(root: Node) {
        this._root = root;
        this._layerMap.clear();

        // 遍历枚举，创建对应的层级节点
        const keys = Object.keys(UILayer)
        for (const key of keys) {
            const layerNode = new Layer2Class[key](key);
            // 添加 Widget 使得层级节点撑满屏幕
            const widget = layerNode.addComponent(Widget);
            widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
            widget.top = widget.bottom = widget.left = widget.right = 0;

            // 统一管理层级节点挂载
            this._root.addChild(layerNode);
            this._layerMap.set(key as UILayer, layerNode);
        }

        //注册基础UI
        for (const key in baseUIConfig) {
            const config = baseUIConfig[key];
            this.reigster(Number(key), config);
        }

    }


    /**
     * 同步方式打开UI
     * @param ID 
     * @param args 
     * @param bAuto 
     * @returns 
     */
    public async open<T extends UIBase>(ID:number, args?: any,bAuto?: boolean): Promise<T | null> {
        let config = this._uiConfig.get(ID)
        if(!config){
            XKit.log.logBusiness(`open ID:${ID} 未注册`);
            return null
        }
        config.args = args
        config.bAuto = bAuto||false
        let  layerNode = this._layerMap.get(config?.layer || UILayer.UI); 
        if (!bAuto && (config.layer == UILayer.PopUp || config.layer == UILayer.Dialog)) {
            this.onNonAutoPopupOpened?.();
        }
        return layerNode.add(config)
    }

    /**
     * 关闭 UI
     * @param path UI 路径
     * @param bDestory 是否销毁节点
     * @param callback 关闭完成回调，如有弹窗动画，则动画播放完成后回调
     * @param bSkipAnim 是否跳过关闭动画，直接关闭
     */
    public close(ID:number,bDestory:boolean = false,bSkipAnim:boolean = false,callback?:(com?:UIBase)=>void): void {
        let config = this._uiConfig.get(ID)
        if(!config){
            XKit.log.logBusiness(`close ID:${ID} 未注册`);
            return
        }
        let  layerNode = this._layerMap.get(config?.layer || UILayer.UI);
        layerNode.remove(config,bDestory,bSkipAnim,(_com?:UIBase)=>{
            callback?.(_com)
            let layer = _com?._config.layer;
            let bAuto = _com?._config.bAuto;
            //手动弹框关闭后通知 弹框管理器继续？
            if(!bAuto &&(layer == UILayer.PopUp || layer == UILayer.Dialog) && layerNode.queue.length == 0)
            {
                this.onNonAutoPopupClosed?.();
            }
            
        })
    }

    /**
     * 显示消息弹窗
     * @param title 
     * @param content 
     * @param left 
     * @param right 
     */
    async showMsgBox(data: MsgBoxData) {
        this.open<UIToast>(UID.MsgBox, data)

    }


    /**
     * 渐隐飘过提示
     * @param content 文本表示
     * @param useI18n 是否使用多语言
     */
    async toast(content: string) {
        this.open<UIToast>(UID.Toast, content)
    }


    /**
     * 获得UILayer对应的根节点
     * @param layer 
     * @returns 
     */
    getUIRootLayer(layer: UILayer): Node {
        return this._layerMap.get(layer);
    }

    //#endregion
}