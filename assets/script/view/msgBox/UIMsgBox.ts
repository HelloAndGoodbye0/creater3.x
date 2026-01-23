import { UIBase } from "../../../script/XKit/GUI/UIBase"
import { utils } from "../../../script/XKit/utils/utils";
import { _decorator, Label, Button } from 'cc';
const { ccclass, property } = _decorator;


/**
 * 按钮数据项
 */
export interface MsgBoxBtnOptions
{
    txt:string
    click?:Function
}

/**
 * 消息盒子数据
 */
export interface MsgBoxData
{
    title:string
    content:string
    left:MsgBoxBtnOptions
    right?:MsgBoxBtnOptions
}

@ccclass('msgBox')
export class UIMsgBox extends UIBase {

    @property({type:Label, tooltip:'标题'})
    private lbTitle:Label = null!

    @property({type:Label, tooltip:'内容'})
    private lbContent:Label = null!

    @property({type:Button, tooltip:'右边按钮'})
    private btnRight:Button = null!

    @property({type:Label, tooltip:'右边按钮文字'})
    private lbRight:Label = null!

    @property({type:Button, tooltip:'左边按钮'})
    private btnLeft:Button = null!

    @property({type:Label, tooltip:'左边按钮文字'})
    private lbLeft:Label = null!

    /**
     * 左点击委托
     */
    private leftClickHandler:Function

    /**
     * 右点击委托
     */
    private rightClickHandler:Function

    /**
     * 关闭委托
     */
    protected _closeHandler:(box:UIMsgBox)=>void = null


    start(  )
    {
        //左边按钮点击事件
        utils.ButtonBindClick(this.btnLeft,()=>{
            this.onClickBtn( true )
        },this)
        //右边按钮点击事件
        utils.ButtonBindClick(this.btnRight,()=>{
            this.onClickBtn( false )
        },this)

    }

    private onClickBtn( bLeft:boolean = true )
    {
        this.setBtnInteractable( false )
        this.close()
        if(bLeft)
        {
            this.leftClickHandler?.()
        }
        else
        {
            this.rightClickHandler?.()
        }

        //清空点击委托
        this.leftClickHandler = null
        this.rightClickHandler = null
    }

    protected onClose(): void {
        this._closeHandler?.( this )
        this._closeHandler = null
    }

    private setBtnInteractable(bActive:boolean)
    {
        this.btnLeft.interactable = bActive
        this.btnRight.interactable = bActive
    }
    
    /**
     * 设置关闭回调
     * @param handler 
     */
    setCloseHandler( handler:(box:UIMsgBox)=>void  )
    {
        this._closeHandler = handler
    }
    /**
     * 显示提示框
     * @param title 标题
     * @param content 内容
     * @param right 右按键
     * @param left 左按键
     */
    refresh(data:MsgBoxData) 
    {
        let {title, content, right, left} = data
        //更新title
        this.lbTitle.string = title
        //更新内容
        this.lbContent.string = content
        //左按钮文字
        this.lbLeft.string = left.txt
        this.leftClickHandler = left.click

        let bShowR = (right != null)
        this.btnRight.node.active = bShowR
        if(bShowR)
        {
            this.lbRight.string = right.txt
            this.rightClickHandler = right.click
        }

        this.setBtnInteractable(true)

        //设置msgbox为Dialog层最上层
        this.node.setSiblingIndex(-1)
    }




}
