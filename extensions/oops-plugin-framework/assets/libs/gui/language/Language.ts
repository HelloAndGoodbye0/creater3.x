import { error, warn,_decorator} from "cc";
import { EventDispatcher } from "../../../core/common/event/EventDispatcher";
import { Logger } from "../../../core/common/log/Logger";
import { LanguageData } from "./LanguageData";
import { LanguagePack } from "./LanguagePack";
import { oops } from "../../../core/Oops";
import { SpriteFrame } from "cc";
import { settings } from "cc";
import { Settings } from "cc";
import { EDITOR } from "cc/env";

export enum LanguageEvent {
    /** 语种变化事件 */
    CHANGE = 'LanguageEvent.CHANGE',
    /** 语种资源释放事件 */
    RELEASE_RES = "LanguageEvent.RELEASE_RES"
}

/**
 * 语言枚举定义
 */
export enum LanguageDefine {
    EN = "en",//英语
    PT = "pt",//葡萄牙语
    VI = "vi",//越南语
    THA = "tha",//泰语
    ES_MX = "es_mx",//西语
    BN = "bn",//孟加拉语
    ID = "id",//印尼语
    AR = "ar",//阿拉伯语
    MY="my",  //缅甸语
    MS = "ms", //马来语
}
const {executeInEditMode } = _decorator;
@executeInEditMode
export class LanguageManager extends EventDispatcher {

    private bundleMap:Map<string,boolean> = new Map<string,boolean>()
    constructor() {
        super();
        let projectBundle = settings.querySettings(Settings.Category.ASSETS, 'projectBundles') || [];
        this.bundleMap.clear()
        projectBundle.forEach((bundle:string)=>{
            this.bundleMap.set(bundle, true)
        })
    }

    /**
     * 是否有某个包
     * @param bundleName 
     * @returns 
     */
    hasBundle(bundleName:string):boolean{
        return this.bundleMap.has(bundleName)||false
    }

    //默认语言
    static DEFAULT_LANGUAGE:string = LanguageDefine.EN
    private _support: Array<string> = [ // 支持的语言
        LanguageDefine.EN, 
        LanguageDefine.PT,
        LanguageDefine.VI,
        LanguageDefine.THA,
        LanguageDefine.ES_MX,
        LanguageDefine.BN,
        LanguageDefine.ID,
        LanguageDefine.AR,
        LanguageDefine.MY,
        LanguageDefine.MS
    ];        
    private _languagePack: LanguagePack = new LanguagePack();    // 语言包  

    /** 设置多语言系统支持哪些语种 */
    public set supportLanguages(supportLanguages: Array<string>) { 
        this._support = supportLanguages;
    }

    /**
     * 获取当前语种
     */
    public get current(): string {
        return LanguageData.current;
    }

    /**
     * 获取支持的多语种数组
     */
    public get languages(): string[] {
        return this._support;
    }

    public isExist(lang: string): boolean {
        return this.languages.indexOf(lang) > -1;
    }

    /**
     * 获取下一个语种
     */
    public getNextLang(): string {
        let supportLangs = this.languages;
        let index = supportLangs.indexOf(LanguageData.current);
        let newLanguage = supportLangs[(index + 1) % supportLangs.length];
        return newLanguage;
    }

    /**
     * 改变语种，会自动下载对应的语种，下载完成回调
     * @param language 
     */
    public setLanguage(language: string, callback: (success: boolean) => void) {
        if (!language) {
            language = LanguageManager.DEFAULT_LANGUAGE;
        }
        language = language.toLowerCase();
        let index = this.languages.indexOf(language);
        if (index < 0) {
            warn(`当前不支持该语种" + language + " 将自动切换到 ${LanguageManager.DEFAULT_LANGUAGE} 语种!`);
            language = LanguageManager.DEFAULT_LANGUAGE;
        }
        if (language === LanguageData.current) {
            callback(false);
            return;
        }
        
        Logger.logConfig(`当前语言为【${language}】`);
        LanguageData.current = language;
        this._languagePack.updateLanguage(language);
        this.dispatchEvent(LanguageEvent.CHANGE, language);
        callback(true);
        
        // this.loadLanguageAssets(language, (err: any, lang: string) => {
        //     if (err) {
        //         error("语言资源包下载失败", err);
        //         callback(false);
        //         return;
        //     }

        //     Logger.logConfig(`当前语言为【${language}】`);
        //     LanguageData.current = language;
        //     this._languagePack.updateLanguage(language);
        //     this.dispatchEvent(LanguageEvent.CHANGE, lang);
        //     callback(true);
        // });
    }

    /**
     * 设置多语言资源目录
     * @param langjsonPath 多语言json目录
     * @param langTexturePath 多语言图片目录
     */
    public setAssetsPath(langjsonPath: string, langTexturePath: string) {
        this._languagePack.setAssetsPath(langjsonPath, langTexturePath);
    }

    /**
     * 通过字符串标签获取配置多语言文本
     * @param labId 
     * @param arr 
     */
    public static getLangByTag(labId: string, gameID?:string|number): string {
        let bID = (gameID == null)?'0':gameID.toString()
        return LanguageData.getLangByTag(labId, bID)
    }

    /**
     * 通过ID获取配置多语言文本
     * @param labTag 
     * @returns 
     */
    public static getLangByID( labTag:string, gameID?:string|number ):string{
        let bID = (gameID == null)?'0':gameID.toString()
        return LanguageData.getLangByID( labTag, bID )
    }

    /**
     * 根据游戏id获取stringDef
     * @param gameID 
     * @returns 
     */
    public static getLangStrDef( gameID:number = 0):{[key:string]:string}{
        const win = window as any
        return win.strDef[gameID]
    }


    /**
     * 获取多语言图片
     * @param resName       图片名称
     * @param onComplete    完成回调
     * @param bundleName    bundle名称
     * @param fileDir  自定义目录:默认为'content/sprite/lan'
     */
    public static getLanSprite(resName:string,onComplete:(err,sprite:SpriteFrame)=>void,bundleName?:string | number,fileDir:string = 'content/sprite/lan' ){
        var current =  LanguageData.current
        let path = `${fileDir}/${current}/${resName}/spriteFrame`;
        let name= bundleName?`${bundleName}_${current}`:"resources"
        if(!EDITOR && !oops.language.hasBundle(name)) //没有这个bundle 就去en加载
        {
            name = `${bundleName}_${LanguageDefine.EN}`
            path = `${fileDir}/${LanguageDefine.EN}/${resName}/spriteFrame`;
        }
        oops.res.load(name,path,SpriteFrame,(error, sprite:SpriteFrame)=>{
            if(error){ //加载当前语言失败  尝试加载默认语言
                
                let defaultPath = `${fileDir}/${LanguageDefine.EN}/${resName}/spriteFrame`;
                name = `${bundleName}_${LanguageDefine.EN}`
                oops.res.load(name,defaultPath,SpriteFrame,(error, sprite:SpriteFrame)=>{
                    onComplete?.(error,sprite)
                })
                return 
            }
            onComplete?.(error,sprite)
        })

    }

    /**
     * 下载语言包素材资源
     * 包括语言json配置和语言纹理包
     * @param lang 
     * @param callback 
     */
    public loadLanguageAssets(lang: string, callback: Function) {
        lang = lang.toLowerCase();
        return this._languagePack.loadLanguageAssets(lang, callback);
    }

    /**
     * 释放不需要的语言包资源
     * @param lang 
     */
    public releaseLanguageAssets(lang: string) {
        lang = lang.toLowerCase();
        this._languagePack.releaseLanguageAssets(lang);
        this.dispatchEvent(LanguageEvent.RELEASE_RES, lang);
    }
}