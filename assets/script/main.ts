

import { _decorator, Component, Label, CCInteger, Node, UITransform, director, Button } from 'cc';

const { ccclass, property } = _decorator;
import { XKit } from './XKit/XKit';
import { GUI } from './XKit/GUI/GUI';
import { UIID } from './XKit/GUI/UIConfig';
import { AudioManager } from './XKit/audio/AudioManager';
import { UIBase } from './XKit/GUI/UIBase';
import { PopupManager } from './XKit/GUI/PopupManager';




@ccclass('main')
export class main extends UIBase {



    onLoad() {

        let persistRootNode = new Node("PersistRootNode");
        director.addPersistRootNode(persistRootNode);
        // 创建音频模块
        XKit.audio = persistRootNode.addComponent(AudioManager);
        XKit.audio.load();
        // 初始化GUI
        XKit.gui = new GUI()
        XKit.gui.init(this.node)

        //弹框管理
        XKit.popManager = new PopupManager(XKit.gui);

        XKit.gui.open(UIID.Lobby)

    }



}

