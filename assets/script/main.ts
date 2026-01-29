

import { _decorator, Component, Label, CCInteger, Node, UITransform, director, Button } from 'cc';

const { ccclass, property } = _decorator;
import { XKit } from './XKit/XKit';
import { LayerManager } from './XKit/GUI/LayerManager';
import { AudioManager } from './XKit/audio/AudioManager';
import { UIBase } from './XKit/GUI/UIBase';
import { PopupManager } from './XKit/GUI/PopupManager';




@ccclass('main')
export class main extends UIBase {



    async onLoad() {

        let persistRootNode = new Node("PersistRootNode");
        director.addPersistRootNode(persistRootNode);
        // 创建音频模块
        XKit.audio = persistRootNode.addComponent(AudioManager);
        XKit.audio.load();
        // 初始化GUI
        XKit.gui = new LayerManager()
        XKit.gui.init(this.node)

        //弹框管理
        XKit.popManager = new PopupManager(XKit.gui);

        //加载必要bundle
        await XKit.res.loadBundle("100");
        //TODO热更新？
        //去登录界面
        globalThis.goLogin()

    }



}

