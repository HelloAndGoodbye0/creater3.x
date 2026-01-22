

import { _decorator, Component, Label, CCInteger, Node, UITransform, director, Button } from 'cc';
import { tutorial } from 'pb_framework';
const { ccclass, property } = _decorator;
import {ConstEventDefine} from './config/ConstEventDefine';
import { XKit } from './XKit/XKit';
import { GUI } from './XKit/GUI/GUI';
import { UIID } from './XKit/GUI/UIConfig';
import { UIWaiting } from './view/wait/UIWaiting';
import { AudioManager } from './XKit/audio/AudioManager';
import { UIBase } from './XKit/GUI/UIBase';
import { utils } from './XKit/utils/utils';




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


    }
    showGuide(target: Node) {
        // var lcoal_pos = convert2NodePos(this.mask, this.mChild.alert)
        // this.mask.position = lcoal_pos
        // this.mask.getComponent(UITransform).contentSize = target.getComponent(UITransform).contentSize
    }
    start() {

        utils.ButtonBindClick(this.btn_load,async ()=>{
            let waiting:UIWaiting = await XKit.gui.open<UIWaiting>(UIID.Waiting)
            setTimeout(() => {
                XKit.gui.close(UIID.Waiting)
            }, 3000)
        })
        

        utils.ButtonBindClick(this.btn_event,()=>{
            this.emit(ConstEventDefine.TEST, { "name": "Lee123" })
        })

        utils.ButtonBindClick(this.btn_alert,()=>{
            
            XKit.gui.showMsgBox("提示", "这是一个测试", { txt: "确定", click: () =>{
                XKit.log.logBusiness("点击确定")
            }}, { txt: "取消" ,click: () =>{
                XKit.log.logBusiness("点击取消")
            }})

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


    eventTest(name,data) {
        console.log("EventTest", data)
        XKit.gui.toast("收到事件回调：" + data.name)
    }
    onDestroy() {
        // EventManager.off(ConstEventDefine.TEST, this.eventTest, this)
    }

}

