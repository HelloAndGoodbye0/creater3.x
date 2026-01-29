
import { Component, error, Label, RichText, warn, _decorator } from "cc";
import { XKit } from "../XKit";

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
        this.label && (this.label.string =  XKit.language.getLangByTag(this.key,this.gameID.toString()));
    }
}
