
import { CCString, Component, Size, Sprite, SpriteFrame, UITransform, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { assetManager } from "cc";
import { CCInteger } from "cc";
import { XKit } from "../XKit";
import { Language } from "./Language";


const { ccclass, property, menu, executeInEditMode, requireComponent } = _decorator;

/**
 * 大厅子功能多语言图片路径映射 转换
 */
export const LobbyLanSpriteConfig = {

}

@ccclass("LanguageSprite")
@menu('ui/language/LanguageSprite')
@executeInEditMode
@requireComponent(Sprite)
export class LanguageSprite extends Component {
    @property({ serializable: true })
    private _spriteName: string = "";
    @property({ type: CCString, serializable: true, tooltip: "图片名称" })
    get SpriteName(): string {
        return this._spriteName || "";
    }
    set SpriteName(value: string) {
        this._spriteName = value;
        this.updateSprite();
    }

    @property({ visible: false })
    gameID: number = 0
    @property({ type:CCInteger, displayName: 'gameID', visible: true, tooltip: "子游戏id或者大厅子功能id" })
    get _gameID() {
        return this.gameID;
    }
    set _gameID(str: number) {
        this.gameID = str;
    }

    @property({
        tooltip: "是否设置为图片原始资源大小"
    })
    private isRawSize: boolean = true;

    @property({ type: Sprite, tooltip: "图片组件" })
    private sprite: Sprite

    start() {
        this.updateSprite();
    }

    /** 更新语言 */
    language() {
        this.updateSprite();
    }


    private async updateSprite() {
        // 获取语言标记
        if (this._spriteName.length == 0 || this._spriteName == "") {
            return
        }
        //先根据多语言看 多语言bundle包在不在 ，不在使用en的，en不存在使用this.gameID
        let nowLan = XKit.language.current
        var bundleName = `${this.gameID}_${nowLan}`
        let path = `content/sprite/lan/${nowLan}/${this._spriteName}/spriteFrame`;
        if (EDITOR)//是编辑器
        {
            let  resPath = ""
            if(this.gameID<1000) //大厅子功能 多语言图片
            {
                resPath = `db://assets/${LobbyLanSpriteConfig[this.gameID]}/bundle_lan/bundle_${nowLan}/content/sprite/lan/${nowLan}/${this._spriteName}.png/spriteFrame`
            }
            else //子游戏
            {
                resPath = `db://assets/Game/${this.gameID}/bundle_lan/bundle_${nowLan}/content/sprite/lan/${nowLan}/${this._spriteName}.png/spriteFrame`
            }
            let uuid = await Editor.Message.request("asset-db", "query-uuid", resPath);
            //没获取到图片就尝试获取下jpg图片
            if(uuid.length ==0)
            {
                resPath = resPath.replace(".png",".jpg")
                uuid = await Editor.Message.request("asset-db", "query-uuid", resPath);
            }
            if(uuid.length>0)
            {
                assetManager.loadAny(uuid, function (err, data) {
                    if (err) {
                        console.log("loadAny error ===", err);
                    }
                    else {
                        this.replaceSpriteFrame(data)
                    }
    
                }.bind(this));
            }
            return
        }
        else//运行状态
        {
            if(!XKit.language.hasBundle(bundleName))
            {
                bundleName = `${this.gameID}_${Language.DEFAULT_LANGUAGE}`
            }
            this.loadSpriteFrame(bundleName,path,(err,sf:SpriteFrame)=>{
                if(err)
                {
                    //尝试加载默认图片
                    var defaultPath =  `content/sprite/lan/${Language.DEFAULT_LANGUAGE}/${this._spriteName}/spriteFrame`
                    bundleName = `${this.gameID}_${Language.DEFAULT_LANGUAGE}`
                    this.loadSpriteFrame(bundleName,defaultPath,(err,sf:SpriteFrame)=>{
                        if(!err)
                        {
                            this.replaceSpriteFrame(sf)
                        }
                    })
                }
                else
                {
                    this.replaceSpriteFrame(sf)
                }
            })

        }
    }
    /**
     * 加载图片
     * @param bundleName 
     * @param path 
     * @param callback 
     */
    private loadSpriteFrame(bundleName:string,path: string, callback: (err: Error | null, sf: SpriteFrame | null) => void) {
        XKit.res.load(bundleName,path,SpriteFrame,(err,sf:SpriteFrame)=>{
           callback(err,sf)
        })
    }
    /**
     * 更新图片
     * @param sf
     */
    private replaceSpriteFrame(sf: SpriteFrame) {
        if (this.sprite == null) {
            this.sprite = this.getComponent(Sprite)
        }

        if(this.sprite)
        {
            this.sprite.spriteFrame = sf;

            /** 修改节点为原始图片资源大小 */
            if (this.isRawSize) {
                //@ts-ignore
                let rawSize = sf._originalSize as Size;
                this.sprite.node.getComponent(UITransform)?.setContentSize(rawSize);
            }
        }
       
    }
}