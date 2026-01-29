import { baseModule } from '../../../../../script/XKit/module/baseModel';
import { _decorator, Component, Node } from 'cc';
import { PModuleID } from '../PModule';
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

}


