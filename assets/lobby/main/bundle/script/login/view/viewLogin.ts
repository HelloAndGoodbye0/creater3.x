import { UIBase } from '../../../../../../script/XKit/GUI/UIBase';
import { _decorator, Button, Component, Node } from 'cc';
import { ConstEventDefine } from '../../../../../../script/config/ConstEventDefine';
import { MsgBoxData } from '../../../../../../script/view/msgBox/UIMsgBox';
import { utils } from '../../../../../../script/XKit/utils/utils';
import { XKit } from '../../../../../../script/XKit/XKit';
import { tutorial } from 'pb_framework';
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
        utils.ButtonBindClick(this.btn_load, async () => {
            this.showLoading(true)
            setTimeout(() => {
                this.showLoading(false)
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

}


