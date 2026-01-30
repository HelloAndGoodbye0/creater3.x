// scripts/framework/ui/PopupManager.ts
import { UIBase } from './UIBase';
import { LayerManager } from './LayerManager';
import { UIConfig } from './UIConfig';
import { XKit } from '../XKit';

/**
 * 弹框配置接口
 */
export interface IPopupConfig {
    /** UIConfig */
    uiConfig: UIConfig;
    /** 弹框关闭后的回调 */
    onClosed?: (result?: any) => void;
    /** 条件检查函数，返回true才弹出 */
    condition?: () => boolean;
    /** 弹出次数 (每成功弹出并关闭一次减1，<=0时不弹出) */
    popCount?: number; 
}

/**
 * 弹框管理器
 * 功能：队列管理、自动轮询、条件检查、暂停恢复
 */
export class PopupManager {
    /** 每一轮队列处理完成后的轮询间隔（毫秒） */
    private static readonly ROUND_INTERVAL = 5000;

    /** GUI实例 */
    private gui: LayerManager;
    /** 弹框队列 */
    private popupQueue: IPopupConfig[] = [];
    /** 当前显示的弹框 */
    private currentPopup: UIBase | null = null;
    
    /** 状态控制 */
    private isPaused: boolean = false;
    private isProcessing: boolean = false; // 是否正在处理弹框流程中（含等待时间）
    
    /** 流程游标与计时器 */
    private currentQueueIndex: number = 0;
    private timer: NodeJS.Timeout | null = null; // 复用计时器（用于弹框间隔 或 轮询间隔）
    private delayTime: number = 0; // 两个弹框之间的间隔(毫秒)

    constructor(gui: LayerManager) {
        this.gui = gui;
        // 监听GUI层事件，当有非自动弹框（如手动打开的界面）打开时暂停自动弹框，关闭时恢复
        this.gui.onNonAutoPopupOpened = () => this.pause();
        this.gui.onNonAutoPopupClosed = () => this.resume();
    }

    //#region 外部调用

    /**
     * 添加弹框到队列
     * @param config 弹框配置
     * @param isFront 是否插入到队列最前面
     */
    addPopup(config: IPopupConfig, isFront: boolean = false): void {
        if (isFront) {
            this.popupQueue.unshift(config);
            // 如果插入到最前且当前正在处理后面的，需要调整索引以保持逻辑正确
            // 但为了简化，这里不做索引偏移，新加入的会在下一轮轮询或重置时生效
            // 或者如果当前处于 Idle 状态，它会被立即捕获
        } else {
            this.popupQueue.push(config);
        }

        // 如果当前没有在处理流程中，且未暂停，尝试激活流程
        if (!this.isProcessing && !this.isPaused) {
            this.tryProcessNext();
        }
    }

    /**
     * 批量添加弹框
     */
    addPopups(configs: IPopupConfig[]): void {
        configs.forEach(config => this.addPopup(config));
    }

    /**
     * 暂停自动弹框
     * 说明：关闭当前自动弹出的弹框，停止计时器，保留当前队列索引
     */
    pause(): void {
        if (this.isPaused) return;
        this.isPaused = true;
        XKit.log.logBusiness("PopupManager Paused");

        // 1. 清理计时器（可能是轮询等待，也可能是弹框间隔等待）
        this.clearTimer();

        // 2. 关闭当前正在显示的自动弹框
        if (this.currentPopup) {
            // 注意：关闭会触发 onClose 回调，我们在 onClose 里做了状态判断阻止继续执行
            this.gui.close(this.currentPopup._url);
            this.currentPopup = null;
        }

        // 3. 标记不再处理中
        this.isProcessing = false;
    }

    /**
     * 恢复自动弹框
     * 说明：从暂停时的索引位置继续执行
     */
    resume(): void {
        if (!this.isPaused) return;
        this.isPaused = false;
        XKit.log.logBusiness("PopupManager Resumed");

        // 恢复时，如果当前未在处理，立即尝试处理当前索引的弹框
        if (!this.isProcessing) {
            this.tryProcessNext();
        }
    }

    /**
     * 获取当前弹框
     */
    getCurrentPopup(): UIBase | null {
        return this.currentPopup;
    }

    /**
     * 清空并重置
     */
    clear(): void {
        this.pause(); // 先暂停清理现场
        this.popupQueue = [];
        this.currentQueueIndex = 0;
        this.isPaused = false; // 重置暂停状态
        this.isProcessing = false;
    }

    //#endregion

    //#region 核心流程控制

    /**
     * 尝试处理队列中的下一个
     * 这是一个递归驱动的异步链
     */
    private async tryProcessNext(): Promise<void> {
        // 1. 基础拦截
        if (this.isPaused) return;

        this.isProcessing = true;

        // 2. 队列轮询结束检查
        if (this.currentQueueIndex >= this.popupQueue.length) {
            this.handleRoundComplete();
            return;
        }

        // 3. 获取配置
        const config = this.popupQueue[this.currentQueueIndex];

        // 4. 预检查：次数耗尽 (Skip)
        if ((config.popCount ?? 0) <= 0) {
            // 次数没了，直接跳下一个
            this.currentQueueIndex++;
            this.tryProcessNext();
            return;
        }

        // 5. 预检查：条件不满足 (Skip)
        if (config.condition && !config.condition()) {
            // 条件不满足，跳下一个
            XKit.log.logBusiness(config.uiConfig, "Condition false, skipping");
            this.currentQueueIndex++;
            this.tryProcessNext();
            return;
        }

        // 6. 执行弹出
        const isShown = await this.showPopup(config);

        if (isShown) {
            // 成功显示，扣除次数
            if (config.popCount) {
                config.popCount--;
            }
            // 此时流程暂停，等待弹框关闭回调 (onPopupClosed) 来驱动下一步
        } else {
            // 显示失败（可能被抢占或资源加载失败），直接处理下一个
            this.currentQueueIndex++;
            this.tryProcessNext();
        }
    }

    /**
     * 处理一轮结束
     */
    private handleRoundComplete(): void {
        // 过滤掉次数用完的 (可选优化，避免数组无限膨胀)
        this.popupQueue = this.popupQueue.filter(c => (c.popCount ?? 0) > 0);

        // 如果队列为空，直接结束处理状态，等待下一次 addPopup 唤醒
        if (this.popupQueue.length === 0) {
            this.isProcessing = false;
            this.currentQueueIndex = 0;
            return;
        }

        // 进入轮询等待期
        XKit.log.logBusiness(`Round complete. Waiting ${PopupManager.ROUND_INTERVAL}ms...`);
        
        this.clearTimer();
        this.timer = setTimeout(() => {
            this.timer = null;
            if (!this.isPaused) {
                // 倒计时结束，重置索引，开始新的一轮
                this.currentQueueIndex = 0;
                this.tryProcessNext();
            }
        }, PopupManager.ROUND_INTERVAL);
    }

    /**
     * 显示弹框逻辑
     */
    private async showPopup(config: IPopupConfig): Promise<boolean> {
        // 安全检查
        if (this.currentPopup) return false;
        if (this.isPaused) return false;

        try {
            // 浅拷贝配置，强制设为自动模式
            const uiConfig = { ...config.uiConfig };
            uiConfig.bAuto = true;

            const popup = await this.gui.open<UIBase>(uiConfig);

            // 再次检查（防止await期间被暂停）
            if (!popup) return false;
            if (this.isPaused) {
                this.gui.close(popup._url);
                return false;
            }

            this.currentPopup = popup;

            // 刷新参数
            if (uiConfig.args) {
                popup.refresh(uiConfig.args);
            }

            // --- 核心：劫持 Close 方法以驱动队列 ---
            const originalClose = popup.close.bind(popup);
            
            popup.close = (callback?: Function, bSkipAnim?: boolean) => {
                originalClose(() => {
                    // 1. 业务回调
                    config.onClosed?.();
                    callback?.();

                    // 2. 恢复引用
                    popup.close = originalClose;
                    this.currentPopup = null;

                    // 3. 驱动下一步
                    this.onPopupClosed();
                }, bSkipAnim);
            };

            return true;

        } catch (e) {
            XKit.log.logBusiness(config.uiConfig, `Show Error: ${e}`);
            return false;
        }
    }

    /**
     * 弹框关闭后的处理
     */
    private onPopupClosed(): void {
        if (this.isPaused) {
            this.isProcessing = false;
            return;
        }

        // 索引指向下一个
        this.currentQueueIndex++;

        // 处理间隔时间
        if (this.delayTime > 0) {
            this.timer = setTimeout(() => {
                this.timer = null;
                this.tryProcessNext();
            }, this.delayTime);
        } else {
            this.tryProcessNext();
        }
    }

    private clearTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    //#endregion
}