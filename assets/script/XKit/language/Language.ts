import { warn,_decorator} from "cc";
import { SpriteFrame } from "cc";
import { settings } from "cc";
import { Settings } from "cc";
import { EDITOR } from "cc/env";
import { XKit } from "../XKit";


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
export class Language  {

    private bundleMap:Map<string,boolean> = new Map<string,boolean>()
    constructor() {
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

    /**
     * 默认语言
     */
    static DEFAULT_LANGUAGE:LanguageDefine = LanguageDefine.EN
    /**
     * 当前语言
     */
    protected _currentLanguage: LanguageDefine = LanguageDefine.EN;

    private _support: Array<LanguageDefine> = [ // 支持的语言
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


    /** 设置多语言系统支持哪些语种 */
    public set supportLanguages(supportLanguages: Array<LanguageDefine>) { 
        this._support = supportLanguages;
    }

    /**
     * 获取当前语种
     */
    public get current(): LanguageDefine {
        return this._currentLanguage
    }

    /**
     * 获取支持的多语种数组
     */
    public get languages(): LanguageDefine[] {
        return this._support;
    }

    public isExist(lang: LanguageDefine): boolean {
        return this.languages.indexOf(lang) > -1;
    }



    /**
     * 改变语种，会自动下载对应的语种，下载完成回调
     * @param language 
     */
    public setLanguage(language: LanguageDefine, callback: (success: boolean) => void) {
        if (!language) {
            language = Language.DEFAULT_LANGUAGE;
        }
        let index = this.languages.indexOf(language);
        if (index < 0) {
            warn(`当前不支持该语种" + language + " 将自动切换到 ${Language.DEFAULT_LANGUAGE} 语种!`);
            language = Language.DEFAULT_LANGUAGE;
        }
        if (language === this.current) {
            callback(false);
            return;
        }
        
        XKit.log.logConfig(`当前语言为【${language}】`);
        callback(true);
        
 
    }



    /**
     * 通过字符串标签获取配置多语言文本
     * @param id 
     * @param gameid 
     */
    public  getLangByTag(id: string, gameid?:string|number): string {
       const win: any = window;
        if (!win.languages) {
            return id;
        }
        let strDef = win.strDef[gameid][id]

  
        let data = win.languages[this.current]?.[gameid]?.[strDef];
        if(data==null)//尝试加载默认语言
        {
            data = win.languages[Language.DEFAULT_LANGUAGE]?.[gameid]?.[strDef];
        }
        return data || gameid+"-"+id;
    }

    /**
     * 通过ID获取配置多语言文本
     * @param labTag 
     * @returns 
     */
    public  getLangByID( tag:string, gameid?:string|number ):string{
        const win: any = window;
        if (!win.languages) {
            return tag;
        }
        let data = win.languages[this.current]?.[gameid]?.[tag];
        if(data==null)//尝试加载默认语言
        {
            data = win.languages[Language.DEFAULT_LANGUAGE]?.[gameid]?.[tag];
        }
        return data || gameid+"-"+tag;
    }

    /**
     * 根据游戏id获取stringDef
     * @param gameID 
     * @returns 
     */
    public  getLangStrDef( gameID:number = 0):{[key:string]:string}{
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
    public  getLanSprite(resName:string,onComplete:(err,sprite:SpriteFrame)=>void,bundleName?:string | number,fileDir:string = 'content/sprite/lan' ){
        var current =  this.current
        let path = `${fileDir}/${current}/${resName}/spriteFrame`;
        let name= bundleName?`${bundleName}_${current}`:"resources"
        if(!EDITOR && !this.hasBundle(name)) //没有这个bundle 就去en加载
        {
            name = `${bundleName}_${LanguageDefine.EN}`
            path = `${fileDir}/${LanguageDefine.EN}/${resName}/spriteFrame`;
        }
        XKit.res.load(name,path,SpriteFrame,(error, sprite:SpriteFrame)=>{
            if(error){ //加载当前语言失败  尝试加载默认语言
                
                let defaultPath = `${fileDir}/${LanguageDefine.EN}/${resName}/spriteFrame`;
                name = `${bundleName}_${LanguageDefine.EN}`
                XKit.res.load(name,defaultPath,SpriteFrame,(error, sprite:SpriteFrame)=>{
                    onComplete?.(error,sprite)
                })
                return 
            }
            onComplete?.(error,sprite)
        })

    }


}