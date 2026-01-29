import { baseModule, HttpType } from '../../../../../script/XKit/module/baseModel';
import { _decorator, Component, Node } from 'cc';
import { PModuleID } from '../PModuleID';
import { HttpReturn } from '../../../../../script/XKit/http/HttpRequest';
import { XKit } from '../../../../../script/XKit/XKit';
import { UIWaiting } from '../../../../../script/view/wait/UIWaiting';
import { UILayer } from '../../../../../script/XKit/GUI/UILayer';
const { ccclass, property } = _decorator;

@ccclass('lobbyMod')
export class lobbyMod extends baseModule {

    
    public static ID:PModuleID;

    protected onInit(...args: any): void {
        
    }
    protected onDispose(): void {
       
    }
    protected addEventListener(): void {
    }
    protected removeEventListener(): void {
        
    }

    /**
     * 进入模块时执行
     * @param args 
     */
    onEnter( ...args:any ){}

    /**
     * 离开模式时执行
     * @param args 
     */
    onExit( ...args:any ){}

     //#region 网络请求
    /**
     * 发起网络请求
     * @param method 
     * @param url 
     * @param data 
     */
    request(method: HttpType, url: string, data?: any): Promise<any>
    {
        this.showLoading(true)
        return new Promise((resolve,reject)=>{
             this.showLoading(false)
            // 回调处理
            const completeCall = (data: HttpReturn) => {
                 let success = data.isSucc;
                 if (success) {
                     resolve(data.res)
                 }
                 else {
                     reject(null)
                 }
            };

            // 发起请求
            if (method === HttpType.POST) {
                XKit.http.post(url, completeCall,data);
            } else {
                XKit.http.get(url, completeCall,data);
            }
        })
    }

    //#region 菊花转

    protected _waiting: UIWaiting = null;
    protected async showLoading(b:boolean)
    {
        if(b)
        {
           let config = { layer: UILayer.Waiting, prefab: "prefabs/loadingNode", bundle: "resources" }
           this._waiting = await XKit.gui.open<UIWaiting>(config)
        }
        else
        {
            XKit.gui.close(this._waiting._url)
        }
    }
    //## endregion

}


