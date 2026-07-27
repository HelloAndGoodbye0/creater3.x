/*
 * @Author: dgflash
 * @Date: 2022-02-11 09:31:52
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-07-04 17:07:52
 */
import { _decorator } from "cc";
import { LanguageManager } from "./Language";
const {executeInEditMode } = _decorator;
@executeInEditMode
export class LanguageData {
    /** 当前语言 */ 
    static current: string = LanguageManager.DEFAULT_LANGUAGE;
    /** 语言配置 */
    static data: any = {}

    public static getLangByTag(id: string,gameid:string = "0"): string {
        const win: any = window;
        if (!win.languages) {
            return id;
        }
        let strDef = win.strDef[gameid][id]

  
        let data = win.languages[LanguageData.current]?.[gameid]?.[strDef];
        if(data==null)//尝试加载默认语言
        {
            data = win.languages[LanguageManager.DEFAULT_LANGUAGE]?.[gameid]?.[strDef];
        }
        return data || gameid+"-"+id;
    }

    /**
     * 通过标签获取文本
     * @param tag 
     * @param gameid 
     * @returns 
     */
    public static getLangByID( tag:string, gameid:string = '0' ):string
    {
        const win: any = window;
        if (!win.languages) {
            return tag;
        }
        let data = win.languages[LanguageData.current]?.[gameid]?.[tag];
        if(data==null)//尝试加载默认语言
        {
            data = win.languages[LanguageManager.DEFAULT_LANGUAGE]?.[gameid]?.[tag];
        }
        return data || gameid+"-"+tag;
    }

}