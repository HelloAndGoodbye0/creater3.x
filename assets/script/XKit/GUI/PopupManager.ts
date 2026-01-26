// scripts/framework/ui/PopupManager.ts
import { UIBase } from './UIBase';
import { GUI } from './GUI';
import { UIConfigData, UIID } from './UIConfig';

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
}

/**
 * 弹框管理器，用于管理大厅弹出一系列弹框
 * 基于GUI和UIBase，提供队列管理、优先级、条件检查等功能
 */
export class PopupManager {
    private gui: GUI;
    private popupQueue: IPopupConfig[] = [];
    private currentPopup: UIBase | null = null;
    private isProcessing: boolean = false;

    constructor(gui: GUI) {
        this.gui = gui;
    }

    /**
     * 添加弹框到队列
     * @param config 弹框配置
     */
    addPopup(config: IPopupConfig): void {
        // 根据优先级插入队列
        const priority = config.priority || 0;
        let insertIndex = this.popupQueue.length;
        for (let i = 0; i < this.popupQueue.length; i++) {
            if ((this.popupQueue[i].priority || 0) < priority) {
                insertIndex = i;
                break;
            }
        }
        this.popupQueue.splice(insertIndex, 0, config);

        // 如果当前没有在处理，开始处理队列
        if (!this.isProcessing) {
            this.processQueue();
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
     * 清除队列中的所有弹框
     */
    clearQueue(): void {
        this.popupQueue = [];
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
     * 强制关闭当前弹框并继续下一个
     */
    forceCloseCurrent(): void {
        if (this.currentPopup) {
            // 通过GUI.close来确保正确的回收逻辑
            this.gui.close(this.currentPopup._url, false, true, () => {
                this.onPopupClosed();
            });
        }
    }

    /**
     * 处理弹框队列
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.popupQueue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.popupQueue.length > 0) {
            const config = this.popupQueue.shift()!;
            await this.showPopup(config);
        }

        this.isProcessing = false;
    }

    /**
     * 显示单个弹框
     */
    private async showPopup(config: IPopupConfig): Promise<void> {
        try {
            // 检查条件
            if (config?.condition && !config.condition()) {
                return 
            }

            // 打开弹框
            let uiConfig = UIConfigData[config.uiId];
            uiConfig.args = config.args || [];
            const popup = await this.gui.open<UIBase>(uiConfig);
            if (!popup) {
                console.warn(`Failed to open popup: ${config.uiId}`);
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
            console.error('Error showing popup:', error);
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
     * 扩展：添加自定义弹框类型
     * 子类可以重写此方法来处理特殊类型的弹框
     */
    protected handleCustomPopup(config: IPopupConfig): boolean {
        // 默认不处理，返回false让基类处理
        return false;
    }

    /**
     * 扩展：自定义弹框显示逻辑
     */
    protected async customShowPopup(config: IPopupConfig): Promise<boolean> {
        // 默认不处理，返回false让基类处理
        return false;
    }
}