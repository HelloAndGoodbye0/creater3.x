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
    /** 默认弹框优先级 */
    private static readonly DEFAULT_PRIORITY = 0;
    /** 队列处理时间间隔（毫秒） */
    private static readonly QUEUE_PROCESS_INTERVAL = 1000;

    /** GUI实例 */
    private gui: GUI;
    /** 弹框队列 */
    private popupQueue: IPopupConfig[] = [];
    /** 当前显示的弹框 */
    private currentPopup: UIBase | null = null;
    /** 弹框队列处理中 */
    private isProcessing: boolean = false;
    /** 队列处理定时器 */
    private popInterval: NodeJS.Timeout | null = null;
    /** 2个弹框之间的间隔(毫秒) */
    private delayTime: number = 0;

    constructor(gui: GUI) {
        this.gui = gui;
    }


    //#region 外部调用
    /**
     * 添加弹框到队列
     * @param config 弹框配置
     * @param isFront 是否插入队列最前面
     * @param isImmediate 是否立即弹出（跳过队列直接显示）
     */
    addPopup(config: IPopupConfig, isFront?: boolean, isImmediate?: boolean): void {
        // 如果立即弹出，直接显示该弹框
        if (isImmediate) {
            this.showPopup(config);
            //关闭当前已经打开了的弹框？
            if(this.currentPopup!=null)
            {
                this.gui.close(this.currentPopup._url)
            }
            
            return;
        }

        if (isFront) {
            this.popupQueue.unshift(config);
            return;
        }

        const priority = config.priority ?? PopupManager.DEFAULT_PRIORITY;
        const insertIndex = this.popupQueue.findIndex(
            item => (item.priority ?? PopupManager.DEFAULT_PRIORITY) < priority
        );
        const targetIndex = insertIndex === -1 ? this.popupQueue.length : insertIndex;
        this.popupQueue.splice(targetIndex, 0, config);
    }

    /**
     * 开始处理弹框队列
     */
    startPopup(): void {
        this.processQueue();
        this.popInterval = setInterval(
            () => this.processQueue(),
            PopupManager.QUEUE_PROCESS_INTERVAL
        );
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

        try {
            for (const config of this.popupQueue) {
                await this.showPopup(config);
                config.popCount = (config.popCount ?? 0) - 1;
                if (this.delayTime > 0) {
                    await this.delay(this.delayTime);
                }
            }

            // 过滤掉次数已用完的弹框
            this.popupQueue = this.popupQueue.filter(config => (config.popCount ?? 0) > 0);
        } finally {
            this.isProcessing = false;
        }
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
            if (config.condition && !config.condition()) {
                XKit.log.logBusiness(config.uiId, "弹框条件不满足");
                return;
            }

            // 检查次数
            if ((config.popCount ?? 0) <= 0) {
                XKit.log.logBusiness(config.uiId, "弹框次数已用完");
                return;
            }

            if (this.currentPopup) {
                XKit.log.logBusiness(config.uiId, "弹框正在显示中");
                return;
            }

            // 打开弹框
            const uiConfig = UIConfigData[config.uiId];
            uiConfig.args = config.args || {};
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
            XKit.log.logBusiness(config.uiId, `Error showing popup: ${error}`);
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