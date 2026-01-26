// scripts/framework/ui/UIBase.ts
import { _decorator, assetManager, Component, Enum, Animation } from 'cc';
import { XKit } from '../XKit';
import { EDITOR } from 'cc/env';
import { utils } from '../utils/utils';
import { UIID } from './UIConfig';
import { UIWaiting } from 'assets/script/view/wait/UIWaiting';
const { ccclass, property } = _decorator;


/**
 * 弹出类型
 */
enum popType {
    NONE = 0,
    SCAlE, //缩放
    RIGHT_SHOW, //右侧弹出 (需要把动画节点初始位置放到右边)
}

const AnimationConfig = {
    [popType.SCAlE]: { show: "view_show", hide: "view_dismiss" },
    [popType.RIGHT_SHOW]: { show: "view_right_show", hide: "view_right_dismiss" },
}

@ccclass('UIBase')
export abstract class UIBase extends Component {

    @property({ visible: false })
    popType: popType = popType.NONE

    @property({ type: Enum(popType), displayName: 'popType', visible: true, tooltip: "弹出类型" })
    get _popType() {
        return this.popType;
    }
    set _popType(type: number) {
        this.popType = type;
        this.loadAnimation()
    }
    /**
     * 播放动画组件
     */
    @property({ visible: false })
    animation: Animation = null
    @property({ type: Animation, displayName: 'animation', visible: true, tooltip: "播放动画组件" })
    get _animation() {
        return this.animation;
    }
    set _animation(ani: Animation) {
        this.animation = ani;
        this.loadAnimation()
    }


    /**
     * 正在关闭
     */
    protected bClosing:boolean = false

    /**
     * 弹出动画委托
     */
    protected popUpHandler: (onCompleted?: Function) => void = (onCompleted?: Function) => {
        if (this.popType != popType.NONE && this.animation != null) {
            utils.playAnimation(this.animation, AnimationConfig[this.popType].show, this, () => {
                onCompleted?.()
            })
        }
        else {
            onCompleted?.()
        }
    }

    /**
     * 关闭动画委托：关闭后执行回调（关闭node）
     */
    protected popDownHandler:( onCompleted:Function )=>void = (onCompleted:Function)=>{
        if(this.popType!=popType.NONE && this.animation != null)
        {
            utils.playAnimation(this.animation, AnimationConfig[this.popType].hide, this, ()=>{
                onCompleted?.()
            })
        }
        else
        {
            onCompleted?.()
        }
    }

    protected async loadAnimation() {

        if (this.popType != popType.NONE && EDITOR) {
            var popData = AnimationConfig[this.popType]
            var show_ani = `db://assets/resources/animations/${popData.show}.anim`
            var hide_ani = `db://assets/resources/animations/${popData.hide}.anim`
            const uuid_show = await Editor.Message.request("asset-db", "query-uuid", show_ani);
            const uuid_hide = await Editor.Message.request("asset-db", "query-uuid", hide_ani);
            // console.log(uuid_show, uuid_hide)
            assetManager.loadAny([{ uuid: uuid_show }, { uuid: uuid_hide }], (err, data) => {
                if (err) {
                    console.log(err)
                    return
                }
                this.animation.clips = data

            })
        }
    }

    /** 传入的参数 */
    protected _args: any = null;
    /** 资源路径（由管理器赋值） */
    public _url: string = "";
    /** 是否使用对象池 */
    public _usePool: boolean = false;


    /**
     * 页面刷新
     * @param arg 依赖参数
     */
    refresh( args:any ){}

    /**
     * 打开页面
     * @param callback 打开完成回调，如有弹窗动画，则动画播放完成后回调
     */
    show( callback?:Function )
    {
        this.node.active = true
        this.onShow()
        if(this.popUpHandler != null)
        {
            this.popUpHandler( callback )
        }
        else
        {
            callback?.()
        }
    }



    /**
     * 关闭页面
     * @param bDestory 是否销毁节点
     * @param callback 关闭完成回调，如有弹窗动画，则动画播放完成后回调
     * @param bSkipAnim 是否跳过关闭动画，直接关闭
     */
    close(callback?:Function,bSkipAnim:boolean = false )
    {
        //如果正在关闭，则不重复执行
        if(this.bClosing) return
        
        let closeAction = ()=>{
            this.onClose()
            this.setVisible(false)
            this.bClosing = false
            callback?.()
        }

        if(this.popDownHandler == null || bSkipAnim)
        {
            closeAction()
        }
        else
        {
            this.bClosing = true
            this.popDownHandler(()=>{
                closeAction()
            }) 
        }
    }

    /**
     * 打开时立即执行（动画前）
     */
    protected onShow(){}

    /**
     * 关闭时执行
     */
    protected onClose(){}

    /**
     * 设置是否显示
     * @param b 
     */
    setVisible(b:boolean)
    {
        this.node.active = b
    }
 

    //# region 事件监听
     on(name:string,callback:Function,target:any)
     {
        XKit.message.on(name,callback,target)
     }

     once(name:string,callback:Function,target:any)
     {
        XKit.message.once(name,callback,target)
     }
     off(name:string,callback:Function,target:any)
     {
        XKit.message.off(name,callback,target)
     }

     emit(name:string,...args:any)
     {
        XKit.message.emit(name,...args)
     }
    //# endregion

    //## region 菊花转
    protected async showLoading(b:boolean)
    {
        if(b)
        {
           let waiting: UIWaiting = await XKit.gui.open<UIWaiting>(UIID.Waiting)
        }
        else
        {
            XKit.gui.close(UIID.Waiting)
        }
    }
    //## endregion
}