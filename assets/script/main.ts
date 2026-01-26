

import { _decorator, Component, Label, CCInteger, Node, UITransform, director, Button } from 'cc';
import { tutorial } from 'pb_framework';
const { ccclass, property } = _decorator;
import { ConstEventDefine } from './config/ConstEventDefine';
import { XKit } from './XKit/XKit';
import { GUI } from './XKit/GUI/GUI';
import { UIID } from './XKit/GUI/UIConfig';
import { UIWaiting } from './view/wait/UIWaiting';
import { AudioManager } from './XKit/audio/AudioManager';
import { UIBase } from './XKit/GUI/UIBase';
import { utils } from './XKit/utils/utils';
import { PopupManager } from './XKit/GUI/PopupManager';
import { MsgBoxData } from './view/msgBox/UIMsgBox';




@ccclass('main')
export class main extends UIBase {

    @property(Button)
    btn_load: Button = null;

    @property(Button)
    btn_event: Button = null;

    @property(Button)
    btn_alert: Button = null;


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
        XKit.popManager.addPopup({
            uiId: UIID.MsgBox,
            args: {
                title: "提示1",
                content: "1",
                left: { txt: "确定" },
                right: { txt: "取消" }
            },
            popCount:1,
            onClosed: () => {
                console.log("弹框1关闭了")
            }
        })

        XKit.popManager.addPopup({
            uiId: UIID.MsgBox,
            args: {
                title: "提示2",
                content: "2",
                left: { txt: "确定" },
                right: { txt: "取消" }
            },
            popCount:2,
            onClosed: () => {
                console.log("弹框2关闭了")
            }
        })

        XKit.popManager.addPopup({
            uiId: UIID.MsgBox,
            args: {
                title: "提示3",
                content: "3",
                left: { txt: "确定" },
                right: { txt: "取消" }
            },
            popCount:3,
            onClosed: () => {
                console.log("弹框3关闭了")
            }
        })
        XKit.popManager.startPopup();

    }
    start() {

        utils.ButtonBindClick(this.btn_load, async () => {
            let waiting: UIWaiting = await XKit.gui.open<UIWaiting>(UIID.Waiting)
            setTimeout(() => {
                XKit.gui.close(UIID.Waiting)
            }, 3000)
        })


        utils.ButtonBindClick(this.btn_event, () => {
            this.emit(ConstEventDefine.TEST, { "name": "Lee123" })
        })

        utils.ButtonBindClick(this.btn_alert, () => {

            let data: MsgBoxData = {
                title: "提示",
                content: "这是一个测试",
                right: {
                    txt: "确定", click: () => {
                        XKit.log.logBusiness("点击确定")
                    }
                },
                left: {
                    txt: "取消", click: () => {
                        XKit.log.logBusiness("点击取消")
                    }
                }
            }
            XKit.gui.showMsgBox(data)

        })



        this.on(ConstEventDefine.TEST, this.eventTest, this)
        //pb Test
        var peron2 = tutorial.Person.create()
        peron2.name = "hello world"
        peron2.email = "497232807@qq.com"
        peron2.id = 110
        var byteData = tutorial.Person.encode(peron2).finish()
        console.log("编码测试===========", byteData)

        var decodeData = tutorial.Person.decode(byteData)
        console.log("解码测试===========", JSON.stringify(decodeData))



    }


    eventTest(data) {
        console.log("EventTest", data)
        XKit.gui.toast("收到事件回调：" + data.name)
    }
    onDestroy() {
        // EventManager.off(ConstEventDefine.TEST, this.eventTest, this)
    }

}

