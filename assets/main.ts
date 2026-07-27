

import { _decorator, Node, director, Component } from 'cc';
import { XKit } from './script/XKit/XKit';
import { LayerManager } from './script/XKit/GUI/LayerManager';
import { AudioManager } from './script/XKit/audio/AudioManager';
import { PopupManager } from './script/XKit/GUI/PopupManager';

const { ccclass } = _decorator;

/** 全局 goLogin 函数声明 */
declare global {
    function goLogin(): void;
}

@ccclass('main')
export class main extends Component {

    async onLoad() {
        // 第一步：检查热更新
        const persistRootNode = new Node("PersistRootNode");
        director.addPersistRootNode(persistRootNode);

        // 创建音频模块
        XKit.audio = persistRootNode.addComponent(AudioManager);
        XKit.audio.load();

        // 初始化 GUI
        XKit.gui = new LayerManager(this.node);

        // 弹框管理
        XKit.popManager = new PopupManager(XKit.gui);

        // 加载必要 bundle
        try {
            await this.loadLobbyBundle();
        } catch (e) {
            XKit.log.logBusiness(`loadLobbyBundle failed - ${e}`);
        }

        // 去登录界面
        goLogin();
    }


    /**
     * 加载大厅场景资源包
     */
    protected async loadLobbyBundle(): Promise<void> {
        //通用资源bundle包
        await XKit.res.loadBundle("99");
        //大厅场景资源bundle包
        await XKit.res.loadBundle("100");
    }
}

