/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2023-01-19 14:52:40
 */
import { Vec2 } from "cc";
import { Camera, Component, ResolutionPolicy, UITransform, _decorator, math, screen, view,Size,size,sys } from "cc";
const { ccclass, menu } = _decorator;

/** 游戏界面屏幕自适应管理 */
@ccclass('GUI')
export class GUI extends Component {

    /**
     * 临时尺寸
     */
    private tempSize:Size = size(0,0);

    /**
     * 默认设计尺寸
     */
    private defaultSize:Size = size(1334,750)

    /**
     * 是否是超出范围
     */
    private bMaxBound:boolean = false;
    onLoad() {

        this.init();
    }

    /** 初始化引擎 */
    protected init() {

        this.resize()
        
    }

    /** 重置界面 */
    public resize() {
        let winSize = screen.windowSize;//屏幕尺寸
        let drs = view.getDesignResolutionSize();//设计尺寸
        if(!this.tempSize.equals(winSize) ){
            let minRatio = 16/9 //最小比例
            let maxRatio = 2.1 //最大比例
            let isLandscape = drs.width > drs.height//是否横屏
            let ratio =  winSize.width > winSize.height ? winSize.width / winSize.height : winSize.height / winSize.width;//屏幕比例
            let drsRatio = isLandscape ? drs.width / drs.height :drs.height / drs.width;//设计尺寸比例
            // console.log("ratio====",ratio,drsRatio);

            let width = this.defaultSize.width;
            let height = this.defaultSize.height;
            if(!isLandscape){
                let temp = width;
                width = height;
                height = temp;
            }
            // console.log("ratio====",ratio,isLandscape);
            // console.log("winSize====",winSize.width,winSize.height);
            // console.log("drs====",drs.width,drs.height);
            if(ratio>minRatio&&ratio<maxRatio){//在最小和最大之间
                if(ratio > drsRatio || this.bMaxBound){
                    //wider than desgin. fixed height
                    // console.log("FIXED_HEIGHT")
                    view.setDesignResolutionSize(width,height,isLandscape?ResolutionPolicy.FIXED_HEIGHT:ResolutionPolicy.FIXED_WIDTH);
                    
                }
                else{
                    //
                    // console.log("FIXED_WIDTH")
                    view.setDesignResolutionSize(width,height,isLandscape?ResolutionPolicy.FIXED_WIDTH:ResolutionPolicy.FIXED_HEIGHT);
                }
                this.bMaxBound = false
            }
            else//超出范围
            {
                if(ratio>maxRatio) //超出最大比例
                {
                    this.bMaxBound = true
                    let size = new Vec2(0,0)
                    if(isLandscape)
                    {
                        size.y = drs.height
                        size.x = size.y * maxRatio
                    }
                    else
                    {
                        size.x = drs.width
                        size.y = size.x * maxRatio
                    }
                    // console.log("SHOW_ALL1",size)
                    view.setDesignResolutionSize(size.x,size.y,ResolutionPolicy.SHOW_ALL);
                }
                else//小于最小比例
                {
                    // console.log("SHOW_ALL2",width,height)
                    this.bMaxBound = false
                    view.setDesignResolutionSize(width,height,ResolutionPolicy.SHOW_ALL);
                }
            }
            this.tempSize.set(winSize);  
        }
    }
}