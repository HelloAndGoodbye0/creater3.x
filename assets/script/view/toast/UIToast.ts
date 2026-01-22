import { utils } from '../../../script/XKit/utils/utils';
import { UIBase } from '../../../script/XKit/GUI/UIBase';
import { _decorator, Animation, Label, Node } from 'cc';
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
    refresh(str: string,onFinish: (comp: UIToast)=> void): void {
        this.label.string = str;
        utils.playAnimation(this.aniToast, "notify",this,()=>{
            this.close()
            onFinish(this);
        });
        //设置最上层
        this.node.setSiblingIndex(-1)
    }


}


