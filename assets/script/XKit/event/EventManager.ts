import { _decorator, error, warn } from 'cc';
const { ccclass } = _decorator;

/**
 * 监听器接口定义
 */
interface IListener {
    callback: Function; // 回调函数
    target: any;        // 上下文 (this)
    once: boolean;      // 是否只触发一次
}

@ccclass('EventManager')
export class EventManager {
    private static _instance: EventManager = null;
    private _eventMap: Map<string, IListener[]> = new Map();

    /**
     * 获取单例
     */
    public static get instance(): EventManager {
        if (!this._instance) {
            this._instance = new EventManager();
        }
        return this._instance;
    }

    /**
     * 注册事件监听
     * @param eventName 事件名或事件名数组
     * @param callback 回调函数
     * @param target 上下文 (通常传 this)
     */
    public on(eventName: string, callback: Function, target?: any) {
       this.addListener(eventName, callback, target, false);
    }

    /**
     * 注册一次性事件监听
     * @param eventName 事件名
     * @param callback 回调函数
     * @param target 上下文
     */
    public once(eventName: string , callback: Function, target?: any) {
        this.addListener(eventName, callback, target, true);
    }

    /**
     * 取消事件监听
     * @param eventName 事件名或事件名数组
     * @param callback 回调函数 (可选，如果不传则移除该 target 下该事件的所有回调)
     * @param target 上下文 (必须与 on 时一致)
     */
    public off(eventName: string, callback?: Function, target?: any) {
         this.removeListener(eventName, callback, target);
    }

    /**
     * 派发事件 (支持返回值)
     * @param eventName 事件名
     * @param args 参数列表
     * @returns any[] 返回所有监听回调的返回值组成的数组 (过滤掉 undefined)
     */
    public emit(eventName: string, ...args):any {
        const listeners = this._eventMap.get(eventName);
        if (!listeners || listeners.length === 0) {
            return [];
        }

        const results: any[] = [];
        // 倒序遍历，防止在回调中 off 导致数组索引错乱，或者复制一份数组遍历
        // 这里采用浅拷贝遍历，保证安全性
        const listCopy = [...listeners];

        for (const listener of listCopy) {
            const { callback, target, once } = listener;
            
            // 执行回调并获取返回值
            try {
                const result = callback.apply(target, args);
                if (result !== undefined) {
                    results.push(result);
                }
            } catch (e) {
                error(`EventManager emit error: event=[${eventName}]`, e);
            }

            // 如果是 once 类型，触发后立即移除
            if (once) {
                this.removeListener(eventName, callback, target);
            }
        }

        return results;
    }

    /**
     * 清理某个 Target 所有的监听 (通常在 onDestroy 中调用)
     * @param target 上下文
     */
    public targetOff(target: any) {
        this._eventMap.forEach((listeners, eventName) => {
            // 过滤掉该 target 的监听器
            const leftListeners = listeners.filter(l => l.target !== target);
            if (leftListeners.length > 0) {
                this._eventMap.set(eventName, leftListeners);
            } else {
                this._eventMap.delete(eventName);
            }
        });
    }

    /**
     * 清空所有事件
     */
    public clear() {
        this._eventMap.clear();
    }

    // --- 内部私有方法 ---

    private addListener(eventName: string, callback: Function, target: any, once: boolean) {
        if (!eventName || !callback) {
            warn('EventManager: eventName or callback is null');
            return;
        }

        let listeners = this._eventMap.get(eventName);
        if (!listeners) {
            listeners = [];
            this._eventMap.set(eventName, listeners);
        }

        // 检查重复添加 (可选)
        const hasSame = listeners.some(l => l.callback === callback && l.target === target);
        if (hasSame) return;

        listeners.push({ callback, target, once });
    }

    private removeListener(eventName: string, callback?: Function, target?: any) {
        const listeners = this._eventMap.get(eventName);
        if (!listeners) return;

        if (callback) {
            // 移除特定回调
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.callback === callback && (!target || l.target === target)) {
                    listeners.splice(i, 1);
                }
            }
        } else if (target) {
            // 移除该 target 下该事件的所有回调
            for (let i = listeners.length - 1; i >= 0; i--) {
                const l = listeners[i];
                if (l.target === target) {
                    listeners.splice(i, 1);
                }
            }
        }

        if (listeners.length === 0) {
            this._eventMap.delete(eventName);
        }
    }
}