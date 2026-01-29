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
    private static readonly QUEUE_PROCESS_INTERVAL = 5000;

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
    /** 自动弹框是否暂停 */
    private isPaused: boolean = false;
    /** 当前处理的队列索引，供恢复时继续 */
    private currentQueueIndex: number = 0;
    /** 2个弹框之间的间隔(毫秒) */
    private delayTime: number = 3000;

    constructor(gui: GUI) {
        this.gui = gui;
        // 订阅GUI事件
        this.gui.onNonAutoPopupOpened = () => this.pause();
        this.gui.onNonAutoPopupClosed = () => this.resume();
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
            //关闭当前已经打开了的弹框？
            if(this.currentPopup!=null)
            {
                this.gui.close(this.currentPopup._url)
                this.currentPopup = null;
            }

            this.showPopup(config);
            
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
        if(this.currentPopup)
        {
            this.gui.close(this.currentPopup._url)
        }
        this.currentPopup = null;
        this.popupQueue = [];
        this.isProcessing = false;
        this.currentQueueIndex = 0;
    }
    // #endregion

    /**
     * 处理弹框队列
     */
    private async processQueue(): Promise<void> {
        // 如果暂停或没有队列，不处理
        if (this.isPaused || this.isProcessing || this.popupQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        try {
            // 从当前索引开始处理，支持恢复后继续
            for (let i = this.currentQueueIndex; i < this.popupQueue.length; i++) {
                const config = this.popupQueue[i];
                
                // 处理中再次检查暂停状态
                if (this.isPaused) {
                    this.currentQueueIndex = i; // 记录中断位置
                    break;
                }

                if(config.popCount>0)
                {
                    await this.showPopup(config);
                    //更新次数
                    config.popCount =  config.popCount - 1;
                    //有弹框间隔 && 间隔不算最后一个
                    if (this.delayTime > 0 && i<(this.popupQueue.length-1)) {
                        await this.delay(this.delayTime);
                    }
                }
     
            }
            // 整个队列处理完成，过滤掉次数已用完的弹框
            if (!this.isPaused) {
                this.popupQueue = this.popupQueue.filter(config => (config.popCount ?? 0) > 0);
                this.currentQueueIndex = 0; // 正常情况下重置索引
            }
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
                XKit.log.logBusiness(config.uiId, "condition not met");
                return;
            }

            // 检查次数
            if ((config.popCount ?? 0) <= 0) {
                XKit.log.logBusiness(config.uiId, "popCount<=0 uid:");
                return;
            }

            if (this.currentPopup) {
                XKit.log.logBusiness(config.uiId, "currentPopup!=null");
                return;
            }

            // 打开弹框 需要设置bAuto为true 使用浅拷贝
            const baseConfig = UIConfigData[config.uiId];
            const uiConfig = { ...baseConfig }; // 浅克隆
            uiConfig.args = config.args || {};
            uiConfig.bAuto = true;
            const popup = await this.gui.open<UIBase>(uiConfig);
            if (!popup) {
                XKit.log.logBusiness(`Failed to open popup: ${config.uiId}`);
                return;
            }
            if(this.isPaused)
            {
                XKit.log.logBusiness(`Popup ${config.uiId} is paused.`);
                this.gui.close(popup._url);
                return 
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

    /**
     * 暂停自动弹框处理
     */
    private pause(): void {
        if (!this.isPaused) {
            this.isPaused = true;
            if(this.currentPopup){
                this.gui.close(this.currentPopup._url);
                this.currentPopup = null;
            }
            XKit.log.logBusiness( "PopupManager pause");
        }
    }

    /**
     * 恢复自动弹框处理
     */
    private resume(): void {
        if (this.isPaused) {
            this.isPaused = false;
            // 立即触发一次队列处理，从中断位置继续
            this.processQueue();
            XKit.log.logBusiness( "PopupManager resume");
        }
    }
}