import { utils } from '../../../script/XKit/utils/utils';
import { UIBase } from '../../../script/XKit/GUI/UIBase';
import { _decorator, Animation, Label, Node } from 'cc';
import { XKit } from '../../../script/XKit/XKit';
const { ccclass, property } = _decorator;

@ccclass('UIToast')
export class UIToast extends UIBase {

    @property(Label)
    label: Label = null;

    @property(Animation)
    aniToast: Animation = null;

    /**
     * 刷新界面
     * @param str 
     * @param onFinish
     */
    refresh(str: string): void {
        this.label.string = str;
        utils.playAnimation(this.aniToast, "notify",this,()=>{
            XKit.gui.close(this._url)
        });

    }


}


