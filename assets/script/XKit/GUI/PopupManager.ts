// scripts/framework/ui/PopupManager.ts
import { UIBase } from './UIBase';
import { GUI } from './GUI';
import { UIConfigData, UIID } from './UIConfig';
import { XKit } from '../XKit';

/**
 * 弹框配置接口
 */
export interface IPopupConfig {
    /** UI ID */
    uiId: UIID;
    /** 传递给弹框的参数 */
    args?: any;
    /** 弹框关闭后的回调 */
    onClosed?: (result?: any) => void;
    /** 优先级，数字越大优先级越高 */
    priority?: number;
    /** 条件检查函数，返回true才弹出 */
    condition?: () => boolean;
    /**弹出次数 */
    popCount?: number; //弹出次数记录
}

/**
 * 弹框管理器，用于管理大厅弹出一系列弹框
 * 基于GUI和UIBase，提供队列管理、优先级、条件检查等功能
 */
export class PopupManager {
    /** GUI实例 */
    private gui: GUI;
    /** 弹框队列 */
    private popupQueue: IPopupConfig[] = [];
    /** 当前显示的弹框 */
    private currentPopup: UIBase | null = null;
    /** 弹框队列处理中 */
    private isProcessing: boolean = false;
    /**弹框时间 */
    private popInterval: any = null;
    /**一轮弹框的时间间隔 (毫秒)*/
    private popIntervalTime: number = 1000;
    /**弹框间隔(毫秒) */
    private delayTime: number = 0;

    constructor(gui: GUI) {
        this.gui = gui;
    }


    //#region 外部调用
    /**
     * 添加弹框到队列
     * @param config 弹框配置
     * @param isFront 是否优先显示
     */
    addPopup(config: IPopupConfig, isFront?: boolean): void {
        //先判断数组里面是否已经有了
        // if (this.popupQueue.find(item => item.uiId === config.uiId)) {
        //     return;
        // }

        if (isFront) {
            this.popupQueue.unshift(config);
        }
        else {
            // 根据优先级插入队列
            let priority = config.priority || 0;
            let insertIndex = this.popupQueue.length;
            for (let i = 0; i < this.popupQueue.length; i++) {
                if ((this.popupQueue[i].priority || 0) < priority) {
                    insertIndex = i;
                    break;
                }
            }
            this.popupQueue.splice(insertIndex, 0, config);
        }
    }

    /**
     * 开始处理弹框队列
     */
    startPopup(): void {
        this.processQueue();
        this.popInterval = setInterval(() => {
            this.processQueue();
        }, this.popIntervalTime)
    }
    /**
     * 停止处理弹框队列
     */
    stopPopup(): void {
        if (this.popInterval) {
            clearInterval(this.popInterval);
            this.popInterval = null;
        }
    }
    /**
     * 批量添加弹框
     * @param configs 弹框配置数组
     */
    addPopups(configs: IPopupConfig[]): void {
        configs.forEach(config => this.addPopup(config));
    }



    /**
     * 获取当前弹框
     */
    getCurrentPopup(): UIBase | null {
        return this.currentPopup;
    }

    /**
     * 检查队列是否为空
     */
    isQueueEmpty(): boolean {
        return this.popupQueue.length === 0;
    }

        /**
     * 清空弹框队列
     */
    clear(): void {
        this.currentPopup = null;
        this.popupQueue = [];
        this.isProcessing = false;

    }
    // #endregion

    /**
     * 处理弹框队列
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.popupQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        let index  = 0
        let needRemoveIndex = []
        while (index<this.popupQueue.length) {
            const config = this.popupQueue[index]
            if(config)
            {
                 await this.showPopup(config);
                 config.popCount--
                 if(config.popCount<=0)
                 {
                    needRemoveIndex.push(index)
                 }
                // 添加间隔等待
                 if(this.delayTime > 0){
                     await this.delay(this.delayTime);
                 }
            }
            index++
        }

        //删除次数为0的 从后面往前删除
        for(let i=needRemoveIndex.length-1;i>=0;i--)
        {
            this.popupQueue.splice(needRemoveIndex[i],1)
        }

        this.isProcessing = false;
    }

    
    /**
     * 延迟方法
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * 显示单个弹框
     */
    private async showPopup(config: IPopupConfig): Promise<void> {
        try {
            // 检查条件
            if (config?.condition && !config.condition()) {
                XKit.log.logBusiness(config.uiId, "弹框条件不满足");
                return
            }
            // 检查次数
            if (config.popCount <= 0) {
                XKit.log.logBusiness(config.uiId, "弹框次数已用完");
                return
            }

            if (this.currentPopup) {
                XKit.log.logBusiness(config.uiId, "弹框正在显示中");
                return
            }

            // 打开弹框
            let uiConfig = UIConfigData[config.uiId];
            uiConfig.args = config.args || [];
            const popup = await this.gui.open<UIBase>(uiConfig);
            if (!popup) {
                XKit.log.logBusiness(`Failed to open popup: ${config.uiId}`);
                return;
            }

            this.currentPopup = popup;

            // 刷新参数
            if (config.args) {
                popup.refresh(config.args);
            }

            // 创建等待弹框关闭的Promise
            return new Promise<void>((resolve) => {
                const originalClose = popup.close.bind(popup);
                popup.close = (callback?: Function, bSkipAnim?: boolean) => {
                    originalClose(() => {
                        this.onPopupClosed(config.onClosed);
                        callback?.();
                        resolve(); // 弹框关闭时resolve Promise
                        popup.close = originalClose; // 恢复原始close方法
                    }, bSkipAnim);
                };
            });

        } catch (error) {
            XKit.log.logBusiness(config, 'Error showing popup:');
        }
    }

    /**
     * 弹框关闭回调
     */
    private onPopupClosed(onClosed?: (result?: any) => void): void {
        this.currentPopup = null;
        onClosed?.();
    }


}