/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-03-02 18:05:10
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-05-20 11:24:32
 * @FilePath: \cocos_framework_base\extensions\oops-plugin-framework\assets\libs\gui\language\LanguageLabel.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { CCString, Component, error, Label, RichText, warn, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { LanguageData } from "./LanguageData";

const { ccclass, property, menu,executeInEditMode,requireComponent } = _decorator;

@ccclass("LangLabelParamsItem")
export class LangLabelParamsItem {
    @property
    key: string = "";
    @property
    value: string = "";
}

@ccclass("LanguageLabel")
@menu('ui/language/LanguageLabel')
@executeInEditMode
// @requireComponent(Label||RichText)
export class LanguageLabel extends Component {

    label: Label | RichText | null = null;

    @property({ visible: false })
    key: string = '';

    @property({ displayName: 'Key', visible: true,tooltip:"多语言key" })
    get _key() {
        return this.key;
    }
    set _key(str: string) {
        this.key = str;
        this.updateLabel();
    }

    @property({ visible: false })
    gameID:number = 0
    @property({ displayName: 'gameID', visible: true,tooltip:"子游戏id" })
    get _gameID() {
        return this.gameID;
    }
    set _gameID(str: number) {
        this.gameID = str;
        // this.updateLabel();
        
    }

    onLoad() {
        this.fetchRender();
    }

        /** 更新语言 */
    language() {
        this.fetchRender();
    }
    fetchRender () {
        let label = this.getComponent(Label);
        if (!label) {
            //@ts-ignore
            label = this.getComponent(RichText);
        }
        if (label) {
            this.label = label;
            this.updateLabel();
        } 
    }

    updateLabel () {
        this.label && (this.label.string =  LanguageData.getLangByTag(this.key,this.gameID.toString()));
    }
}
