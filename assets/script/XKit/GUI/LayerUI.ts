import { error, instantiate, Node, Prefab, resources } from "cc";
import { UIConfig } from "./UIConfig";
import { UIBase } from "./UIBase";
import { UILayer } from "./UILayer";
import { XKit } from "../XKit";


export class LayerUI extends Node {

    /**已经打开的UI组件缓存 <路径, 组件实例数组> */
    private _uiMap: Map<string, UIBase> = new Map();

    /**预制缓存 <路径, Prefab> */
    private _prefabCache: Map<string, Prefab> = new Map();

    /**UI 对象池 <路径, UIBase组件数组>*/
    protected uiPool: Map<string, UIBase[]> = new Map()
    /**同一种类 UI 池的最大数量 */
    protected poolSize: number = 8

    constructor(name: string) {
        super(name);
    }
    remove(data: UIConfig, bDestory: boolean = false, bSkipAnim: boolean = false, callback?: (com: UIBase) => void) {
        let path = data.prefab
        let comp = this._uiMap.get(path);
        XKit.log.logBusiness(`close: ${path}`)
        comp?.close(() => {
           
            this._uiMap.delete(path);
            //使用缓存池 || 不销毁 都放进池子里
            if (comp._usePool || !bDestory) {
                this.recycleToPool(comp);
            }
            else if (bDestory) {
                // 强制销毁
                comp.node.destroy();
            }
            callback?.(comp)
        }, bSkipAnim)
    }

    /**
     * 添加界面
     * @param data 
     * @returns 
     */
    async add<T extends UIBase>(data: UIConfig): Promise<T | null> {
        let path = data.prefab
        let args = data?.args || {}
        let bundleName = data?.bundle || "resources"


        // 1. 检查是否已经打开
        if (this._uiMap.has(path)) {
            let comp = this._uiMap.get(path)
            comp.show()
            comp.refresh(args)
            return comp as T;
        }

        // 2 尝试从池中获取
        let pool = this.getPoolByPath(path)
        let cacheComp = pool?.pop() as T
        if (cacheComp) {
            cacheComp.show()
            cacheComp.refresh(args)
            this._setupUIComponent(cacheComp, data);
            return cacheComp;
        }

        // 3. 加载资源 (优先从缓存获取)
        let prefab = this._prefabCache.get(path);
        if (!prefab) {
            prefab = await this._loadResource<Prefab>(path, bundleName);
            if (prefab) {
                this._prefabCache.set(path, prefab);
            }
            else {
                error(`Failed to load UI: ${path}`);
                return null;
            }
        }

        // 4. 实例化
        const node = instantiate(prefab);
        const comp = node.getComponent(UIBase);
        if (!comp) {
            error(`Prefab at ${path} does not have UIBase component!`);
            node.destroy();
            return null;
        }

        // 5. 设置属性
        this._setupUIComponent(comp, data);


        // 6. 添加到父节点
        this.addChild(node);

        // 7.显示刷新
        comp.show()
        comp.refresh(args)
        return comp as T;
    }

    /**
     * 从对象池获取UI组件
     * @param path 
     * @returns 
     */
    protected getPoolByPath(path: string): UIBase[] {
        return this.uiPool.get(path) || []
    }

    /**
     * 设置UI组件属性并添加到映射表
     * @param comp UI组件
     * @param config UI配置
     */
    protected _setupUIComponent(comp: UIBase, config: UIConfig): void {
        comp._prefab = config.prefab;
        comp._usePool = config.usePool;
        comp._layer = config.layer;
        comp._bAuto = config.bAuto || false;
        this._uiMap.set(config.prefab, comp);
        // 设置层级
        comp.node.setSiblingIndex(-1);
    }

    /**
     * 回收UI组件到对象池
     * @param comp 
     */
    protected recycleToPool(comp: UIBase) {
        let key = comp._prefab.indexOf("_") > -1 ? comp._prefab.split("_")[0] : comp._prefab
        let arr = this.uiPool.get(key)
        if (!arr) {
            arr = []
            arr.push(comp)
        }
        else {
            if (arr.length >= this.poolSize) {
                //超出池子大小，直接销毁
                comp.node.destroy()
                return
            } else {
                arr.push(comp)
            }
        }
        this.uiPool.set(key, arr)

    }

    /**
     * 内部加载器封装
     */
    private _loadResource<T>(path: string, bundleName: string): Promise<T> {
        return new Promise((resolve, reject) => {

            if (bundleName == "resources") {
                resources.load(path, Prefab, (err, asset) => {
                    if (err) {
                        resolve(null);
                        XKit.log.logBusiness(`loadResource error ${path} ${bundleName}`)
                    }
                    else {
                        resolve(asset as any);
                    }
                });
            }
            else {
                XKit.res.load(bundleName, path, Prefab, (err, asset) => {
                    if (err) {
                        resolve(null);
                        XKit.log.logBusiness(`loadResource error ${path} ${bundleName}`)
                    }
                    else {
                        resolve(asset as any);
                    }
                })
            }
        });
    }
}