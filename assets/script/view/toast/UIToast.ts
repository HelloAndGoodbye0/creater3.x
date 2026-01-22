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
     */
    refresh(str: string): void {
        this.label.string = str;
    }

    protected start(): void {
        this.aniToast.once(Animation.EventType.FINISHED, () => {
             this.node.destroy()
        }, this);
    }
}


