
import { XKit } from "../XKit"


export enum HttpType {
    GET = 'GET',
    POST = 'POST'
}

/**
 * 模块基类
 * 初始化
 * init()
 *      onInit()
 *      addEventListener()
 * 释放
 * Dispose()
 *      onDispose()
 *      removeEventListener()
 *      
 * 
 */
export abstract class baseModule {

    /**
     * 初始化模块
     * @param args 
     */
    init(...args:any) 
    {
        this.onInit(...args)
        this.addEventListener()
    }


    /**
     * 销毁模块
     */
    Dispose()
    {
        this.onDispose()
        this.removeEventListener()
        //移除所有事件监听
        this.offAll()
    }
    
    /**
     * 监听事件
     * @param name 
     * @param callback 
     */
    on(name:string, callback:Function)
    {
        XKit.message.on(name,callback,this)
    }
    /**
     * 监听一次事件
     * @param name 
     * @param callback 
     */
    onOnce(name:string, callback:Function)
    {
        XKit.message.once(name,callback,this)
    }

    /**
     * 发送事件
     * @param name 
     * @param data 
     */
    emit(name:string,data?:any)
    {
        XKit.message.emit(name,data)
    }

    /**
     * 移除事件监听
     * @param name 
     * @param callback 
     */
    off(name:string, callback:Function)
    {
        XKit.message.off(name,callback,this)
    }

    /**
     * 移除所有事件监听
     */
    offAll()
    {
        XKit.message.targetOff(this)
    }


    /** 基类复写初始化逻辑 */
    protected abstract onInit(...args:any):void
    /** 基类复写销毁逻辑 */
    protected abstract onDispose():void
    /** 基类复写添加监听逻辑 */
    protected abstract addEventListener():void
    /** 基类复写移除监听逻辑 */
    protected abstract removeEventListener():void
}