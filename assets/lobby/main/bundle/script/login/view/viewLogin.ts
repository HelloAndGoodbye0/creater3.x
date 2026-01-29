import { UIBase } from '../../../../../../script/XKit/GUI/UIBase';
import { _decorator, Button, Component, Node } from 'cc';

import { MsgBoxData } from '../../../../../../script/view/msgBox/UIMsgBox';
import { utils } from '../../../../../../script/XKit/utils/utils';
import { XKit } from '../../../../../../script/XKit/XKit';
import { tutorial } from 'pb_framework';
import { UIID } from '../../../../../../script/XKit/GUI/UIConfig';
import { ConstEventDefine } from '../../config/ConstEventDefine';
const { ccclass, property } = _decorator;

@ccclass('viewLogin')
export class viewLogin extends UIBase {
    @property(Button)
    btn_load: Button = null;

    @property(Button)
    btn_event: Button = null;

    @property(Button)
    btn_alert: Button = null;

    protected start(): void {
        utils.ButtonBindClick(this.btn_load, this.clickPopup, this)

        utils.ButtonBindClick(this.btn_event, this.clickEvent, this)

        utils.ButtonBindClick(this.btn_alert, this.showAlert, this)



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


    protected clickPopup() {
        XKit.popManager.addPopup({
            uiId: UIID.MsgBox,
            args: {
                title: "提示1",
                content: "1",
                left: { txt: "确定" },
                right: { txt: "取消" }
            },
            popCount: 1,
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
            popCount: 2,
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
            popCount: 3,
            onClosed: () => {
                console.log("弹框3关闭了")
            }
        })
        XKit.popManager.startPopup();
    }
    protected clickEvent(event: Event) {
        this.emit(ConstEventDefine.TEST, { "name": "Lee123" })
    }

    protected showAlert() {
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
    }

    eventTest(data) {
        console.log("EventTest", data)
        XKit.gui.toast("收到事件回调：" + data.name)
    }

}


