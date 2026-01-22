// scripts/framework/ui/UIManager.ts
import { _decorator, Node, Prefab, resources, instantiate, Director, director, Widget, UITransform, Size, view, error, warn } from 'cc';
import { UIBase } from './UIBase';
import { UILayer } from './UILayer';
import { UIConfig, UIConfigData, UIID } from './UIConfig';
import { XKit } from '../XKit';

const { ccclass } = _decorator;

@ccclass('GUI')
export class GUI {
    // private static _instance: GUI = null;
    // public static get instance(): GUI {
    //     if (!this._instance) this._instance = new GUI();
    //     return this._instance;
    // }

    // 存储层级节点的 Map
    private _layerMap: Map<UILayer, Node> = new Map();
    // 存储已打开 UI 的 Map <路径, UIBase组件>
    private _uiMap: Map<string, UIBase> = new Map();
    // 简单的资源缓存 <路径, Prefab>
    private _prefabCache: Map<string, Prefab> = new Map();

    private _root: Node = null;

    /**
     * 初始化 UI 根节点和层级
     * 建议在游戏入口脚本（如 Main.ts）的 onLoad 中调用
     * @param root 父节点，通常是 Canvas
     */
    public init(root: Node): void {
        this._root = root;
        this._layerMap.clear();

        // 遍历枚举，创建对应的层级节点
        const keys = Object.keys(UILayer).filter(k => typeof UILayer[k as any] === "number");
        for (const key of keys) {
            const layerIndex = Number(UILayer[key as any]);
            const layerNode = new Node(key);

            // 添加 Widget 使得层级节点撑满屏幕
            const widget = layerNode.addComponent(Widget);
            widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;
            widget.top = widget.bottom = widget.left = widget.right = 0;

            // 统一管理层级节点挂载
            this._root.addChild(layerNode);
            this._layerMap.set(layerIndex, layerNode);
        }
    }


    /**
     * 异步打开 UI
     * @param path Prefab 路径 (Resources下)
     * @param layer UI 层级
     * @param args 传递给 UI 的参数
     * @returns Promise<T> 返回对应的组件实例
     */
    public async open<T extends UIBase>(data: UIID): Promise<T | null>;
    public async open<T extends UIBase>(data: UIConfig): Promise<T | null>
    public async open<T extends UIBase>(data: UIConfig|UIID): Promise<T | null> {

        if(typeof data === "number")
        {
            data = UIConfigData[data]
        }
        let path = data.prefab
        let layer = data.layer
        let args = data?.args
        let bundleName = data.bundle
        // 1. 检查是否已经打开
        if (this._uiMap.has(path)) {
            warn(`UI ${path} is already opened.`);
            return this._uiMap.get(path) as T;
        }

        // 2. 加载资源 (优先从缓存获取)
        let prefab = this._prefabCache.get(path);
        if (!prefab) {
            try {
                prefab = await this._loadResource(path, bundleName);
                this._prefabCache.set(path, prefab);
            } catch (e) {
                error(`Failed to load UI: ${path}`, e);
                return null;
            }
        }

        // 3. 实例化
        const node = instantiate(prefab);
        const comp = node.getComponent(UIBase);
        if (!comp) {
            error(`Prefab at ${path} does not have UIBase component!`);
            node.destroy();
            return null;
        }

        // 4. 设置基础属性
        comp._url = path;
        

        // 5. 添加到指定层级
        const layerNode = this._layerMap.get(layer);
        if (layerNode) {
            layerNode.addChild(node);
        } else {
            this._root.addChild(node); // 降级处理
        }

        // 6. 记录并调用生命周期
        this._uiMap.set(path, comp);
        comp.show()
        comp.refresh(args)
        return comp as T;
    }

    /**
     * 关闭 UI
     * @param path UI 路径
     * @param bDestory 是否销毁节点
     * @param callback 关闭完成回调，如有弹窗动画，则动画播放完成后回调
     * @param bSkipAnim 是否跳过关闭动画，直接关闭
     */
    public close(path: string, bDestory: boolean,bSkipAnim:boolean, callback?:Function): void;
    public close(path: number): void;
    public close(path: string|number, bDestory: boolean = false,bSkipAnim:boolean = false, callback?:Function): void {
        if(typeof path === "number")
        {
            const config = UIConfigData[path];
            if (!config) return;
            path = config.prefab;
        }
        const comp = this._uiMap.get(path);
        if (comp) {
            comp.close(bDestory,()=>{
                callback?.()
                if(bDestory)
                {
                    this._uiMap.delete(path);
                    comp.node.destroy();
                }
            },bSkipAnim)
        }
    }

    /**
     * 获取已打开的 UI 组件
     */
    public getUI<T extends UIBase>(id: UIID): T | null {
        const config = UIConfigData[id];
        if (!config) return null;
        return this._uiMap.get(config.prefab) as T || null;
    }

    /**
     * 内部加载器封装
     */
    private _loadResource<T>(path: string, bundleName: string): Promise<T> {
        return new Promise((resolve, reject) => {

            if (bundleName == "resources") {
                resources.load(path, Prefab, (err, asset) => {
                    if (err) reject(err);
                    else resolve(asset as any);
                });
            }
            else{
                XKit.res.load(bundleName,path,Prefab,(err,asset)=>{
                    if(err) reject(err);
                    else resolve(asset as any);
                })
            }
        });
    }


        /**
     * 渐隐飘过提示
     * @param content 文本表示
     * @param useI18n 是否使用多语言
     * @example 
     * oops.gui.toast("提示内容");
     */
    toast(content: string, useI18n: boolean = false) {
    }
}