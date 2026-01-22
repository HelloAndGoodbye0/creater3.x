import { screen, Node, Animation, sp, tween, TweenEasing, Tween, Button, Toggle, Color, Sprite, js, UITransform, v3, Vec3, math, randomRange } from 'cc';
import { SpriteFrame,view,sys,Size,ResolutionPolicy,macro,native,__private,Component,ImageAsset,Label,Mat4,AudioClip,Vec2 } from "cc";
import { Texture2D,EventTouch,Quat,assetManager } from "cc";
import { DEBUG, HTML5, NATIVE } from "cc/env";
import { XKit } from './XKit';


/**
 * 方向枚举
 */
export enum Dirction {
    PORTRAIT = macro.ORIENTATION_PORTRAIT,
    LANDSCAPE = macro.ORIENTATION_LANDSCAPE,
    AUTO = macro.ORIENTATION_AUTO,
}

export class utils {

    //生成一个字符串的md5码
    public static MD5(str: string): string {
        // return CryptoES.MD5(str).toString()
        return ""
    }

    /**
     * 检查字符串是否为空
     * @param vaule 
     * @returns 
     */
    static StringIsNullOrEmpty(vaule: string): boolean {
        return (vaule == null || vaule.length == 0)
    }

    /**
     * 重置map
     * @param map 
     * @returns 
     */
    static resetMap<T1,T2>( map:Map<T1,T2> ):Map<T1,T2>
    {
        if(map == null)
        {
            map = new Map<T1,T2>()
        }
        else
        {
            map.clear()
        }

        return map
    }

    /**
     * 数组表添加成员
     * @param key 表键
     * @param value 保存的子项
     * @param map 表单
     */
    static addArrayMapItem( key:number, value:any, map:Map<any, any[]> )
    {
        let arr = map.get(key)
        if(arr == null)
        {
            arr = []
            map.set( key, arr )
        }
        arr.push( value )
    }

    /**
     * 查找或添加组件
     * @param node 
     * @param classConstructor 
     * @returns 
     */
    static getOrAddComponent<T extends Component>( node:Node, classConstructor: __private.__types_globals__Constructor<T>): T | null
    {
        if(node == null) return null

        let com = node.getComponent(classConstructor)
        if(com == null)
        {
            com = node.addComponent(classConstructor)
        }
        return com
    }


    /**
     * @description: 设置语言
     * @param {string} language
     * @param {function} callback
     * @return {*}
     */
    public static setLanguage(language: string, callback: (success: boolean) => void | null = null) {
        // webGame.setString("language", language)
        // // 设置语言包路径
        // oops.language.setAssetsPath(oops.config.game.languagePathJson, oops.config.game.languagePathTexture);

        // // 加载语言包资源
        // oops.language.setLanguage(language, (success: boolean) => {
        //     if (callback) {
        //         callback(success)
        //     }
        // });
    }






    /**
     * @description: 获取url参数
     * @return {any}
     */
    public static getUrlParam(url: string): any {
        var params = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(url.indexOf("?") + 1);
            var strs = str.split("&");

            for (var i = 0; i < strs.length; i++) {
                let aName: string = strs[i].split("=")[0]
                params[aName] = strs[i].substring(strs[i].indexOf("=") + 1)
            }
        }
        return params;
    }


    /**
     * @description:  //播放动画
     * @param {anim} Animation
     * @param {string} clipName
     * @param {any} target
     * @param {Function} endCall
     * @return {*}
     */
    public static playAnimation(anim: Animation, clipName: string, target: any, endCall?: Function) {
        if (anim) {
            anim.play(clipName);
            anim.once(Animation.EventType.FINISHED, () => {
                endCall?.()
            }, target);
        }
        else {
            endCall?.()
        }
    }


    /**
     * tween 一个对象
     * @param start 开始对象
     * @param end   结束对象
     * @param updateCall  更新回调
     * @param endCall 结束回调
     * @param easingType 缓动类型
     * @param time  缓动事件
     */
    public static tweenObj(start: object, end: object, updateCall?: Function, endCall?: Function, time: number = 2, easingType: TweenEasing | ((k: number) => number) = "linear"): Tween<Object> {
        return tween(start).to(time, end,
            {
                easing: easingType,
                onUpdate: (target?: object, ratio?: number) => {
                    updateCall?.(target, ratio)
                },
                onComplete: (target?: object) => {
                    endCall?.(target)
                }

            }).start();
    }

    /**
     * 
     * @param startNum 开始数字
     * @param endNumber 结束数字
     * @param time 缓动时间
     * @param updateHandler 更新
     * @param endHandler 结束
     * @param easingType 曲线
     * @returns tweenObject
     */
    public static tweenNumber(startNum: number, endNumber: number, time: number, updateHandler: (curNum: number, ratio?: number) => void,
        endHandler?: (curNum: number) => void, easingType: TweenEasing | ((k: number) => number) = "linear"): Tween<Object> {

        if (time <= 0) {
            endHandler?.(endNumber)
        }

        let options =
        {
            easing: easingType,

            onUpdate: (target?: { num: number }, ratio?: number) => {
                updateHandler?.(target.num, ratio)
            },

            onComplete: (target?: { num: number }) => {
                endHandler?.(target.num)
            }
        }

        return tween({ num: startNum }).to(time, { num: endNumber }, options).start()
    }

    /**
     * 抖动动画（使用缓动动画实现)
     * @param target 
     * @param time 
     * @param offset 
     * @param space 
     * @returns 
     */
    public static tweenShake( target:Node, time:number = 0.2, offset:Vec2 = new Vec2(15,15), space:number = 0.02):Tween<Object>
    {
        let randomPos:Vec3[] = []

        //记录当前坐标
        let localPos = target.getPosition()

        //计算抖动次数，最少3次
        let shakePosNum = (time/space - 1)
        shakePosNum = Math.max(3, shakePosNum)
        //随机偏移坐标
        for (let i = 0; i < shakePosNum; i++) {
            let x = randomRange( -offset.x, offset.x )
            let y = randomRange( -offset.y, offset.y )

            randomPos.push(new Vec3(x+localPos.x, y+localPos.y, 0))
        }
        randomPos.push(localPos)

        let tw = tween(target)//.to( space, {position:randomPos[0]} )
        for (let index = 0; index < randomPos.length; index++) {
            tw.to( space, {position:randomPos[index]} )
        }
        tw.union().repeatForever().start()

        setTimeout(() => {
            tw.stop()
            target.setPosition(localPos)
        }, time*1000);

        return tw
    }


    //#region [常用组件方法]

    /**
     * 绑定按键点击功能及音效（可选）
     * @param btn 按钮
     * @param clickCall 点击功能
     * @param soundUrl 音频
     * @param bundleName bundleName
     */
    public static ButtonBindClick(btn: Button, clickCall: Function, target?: any, soundUrl?: string, bundleName: string="resources", bClear:boolean = true): void {
        if (btn) {
            if (this.StringIsNullOrEmpty(soundUrl)) {
                soundUrl = 'content/audio/button'
            }

            if(bClear)
            {
                btn.node.off(Button.EventType.CLICK)
            }

            btn.node.on(Button.EventType.CLICK, () => {
                XKit.audio.playEffect(soundUrl, bundleName)
                clickCall?.call(target)
            }, target)
        }
        
    }

    /**
     * 绑定按钮长按
     * @param btn 
     * @param longPressCall 
     * @param target 
     * @param time 
     * @param soundUrl 
     * @param bundleName 
     * @param bClear 
     */
    public static ButtonBindClickLong(btn: Button, longPressCall: Function, target?: any, time:number = 2.5, soundUrl?: string, bundleName: string="resources", bClear:boolean = true): void {
        if(btn)
        {
            if (this.StringIsNullOrEmpty(soundUrl)) {
                soundUrl =  "content/audio/button"
            }

            if(bClear)
            {
                // btn.node.off(Node.EventType.TOUCH_START)
                // btn.node.off(Node.EventType.TOUCH_END)
                // btn.node.off(Node.EventType.TOUCH_CANCEL)
            }

            let timer = null
            btn.node.on(Node.EventType.TOUCH_START, (event:EventTouch) => {
                 let startTime = Date.now();
                 timer = setInterval(() => {
                    var touchEndTime = Date.now();
                    if (touchEndTime - startTime >= 1000) { // Adjust the duration as needed
                        clearInterval(timer);
                        timer = null
                        longPressCall.call(target)
                       
                    }
                }, 100); 
            }, target)

            btn.node.on(Node.EventType.TOUCH_END, (event:EventTouch) => {
                if(timer){
                    clearInterval(timer);
                    timer = null
                }
            }, target)
            btn.node.on(Node.EventType.TOUCH_CANCEL, () => {
                if(timer){
                    clearInterval(timer);
                    timer = null
                }
            }, target)
        }
    }

    /**
     * 绑定勾选功能
     * @param tog 勾选组件
     * @param changeCall 勾选值发生变化时执行
     * @param audio 音频：支持url加载音频，或者传入AudioClip；走url加载时，可以通过 soundUrl@bundleName 的方式指定bundleName，如果没有bundleName，则默认为resources
     */
    public static ToggleChecked(tog: Toggle, changeCall: (t: Toggle) => void, audio?: string|AudioClip, alwaysPlaySound:boolean = true, bClear: boolean = true) {
        if( tog == null || changeCall == null ) return
        
        //尝试清理绑定处理
        if(bClear)
        {
            tog.node.off(Toggle.EventType.TOGGLE)
        }

        //#region [设置绑定音频]
            let playSound:()=>void = null
            if ( audio == null || audio == undefined || audio == '' ) 
            {
                audio = 'content/audio/button'
            }
            
            if(typeof(audio) == 'string')
            {
                let bundleName = "resources"//PModuleID.customer.toString()
                if(audio.indexOf('@')!=-1)
                {
                    let arr = audio.split('@')
                    if(arr.length == 2)
                    {
                        audio = arr[0]
                        bundleName = arr[1]
                    }
                }
                playSound = ()=>{XKit.audio.playEffect(audio as string, bundleName)}
            }
            else
            {
                playSound = ()=>{XKit.audio.playEffectClip(audio as AudioClip)}
            }
            //#endregion

        tog.node.on(Toggle.EventType.TOGGLE, ( tg:Toggle )=>{
            if(alwaysPlaySound || tog.isChecked)
            {
                playSound()
            }
            changeCall(tg)
        })
    }


    /**
     * 播放单段spine动画
     * @param spine 
     * @param animation 
     * @param onEndCall 
     * @param bLoop 
     * @param trackIdx 
     * @returns 
     */
    public static PlaySpineAnimation(spine: sp.Skeleton, animation: string, bLoop: boolean = false, onEndCall?: (entry: sp.spine.TrackEntry) => void, trackIdx: number = 0) {
        if (spine == null) {
            XKit.log.logBusiness('SetSpineAnimation error:spine is null')
            return
        }
        else if (this.StringIsNullOrEmpty(animation)) {
            XKit.log.logBusiness('SetSpineAnimation error:animation is null')
            return
        }
        //清除之前的监听
        spine.setCompleteListener(null)
        if (!spine.node.active) {
            spine.node.active = true
        }

        spine.setCompleteListener(null)
        if (onEndCall != null) {
            spine.setCompleteListener((entry) => { onEndCall?.(entry) })
        }
        spine.setAnimation(trackIdx, animation, bLoop)
    }

    /**
     * 播放多段spine动画
     * 1  bLoop为true时， 多个动画播放完毕后, 触发回调一次，最后一个动画会循环播放
     * 2  bLoop为false时，多个动画播放完毕后，触发回调一次，停止播放
     * @param spine 
     * @param animations 
     * @param onEndCall 
     * @param bLoop 
     * @param trackIdx 
     * @returns 
     */
    public static PlaySpineAnimations(spine: sp.Skeleton, animations: string[], bLoop: boolean = false, onEndCall?: (entry: sp.spine.TrackEntry) => void, trackIdx: number = 0) {
        if (spine == null) {
            XKit.log.logBusiness('PlaySpineAnimations error:spine is null')
            return
        }
        else if (animations == null || animations.length == 0) {
            XKit.log.logBusiness('PlaySpineAnimations error:animation is null')
            return
        }
        // 清除之前的监听
        spine.setCompleteListener(null)
        if (!spine.node.active) {
            spine.node.active = true
        }
        let currentIndex = 0;
        let playNextAnimation = (entry: sp.spine.TrackEntry = null) => {
            //最后一个播完了
            if (currentIndex >= animations.length) {
                //清空监听
                spine.setCompleteListener(null)
                //执行回调
                onEndCall?.(entry)
                return
            }
            let animation = animations[currentIndex];
            let bLast = (currentIndex == animations.length - 1)
            let loop = bLast && bLoop? true : false //如果是最后一个动画&&循环播放，则设置为true,否则设置为false
            spine.setCompleteListener((entry) => {
                currentIndex++;
                playNextAnimation(entry);
            });
            spine.setAnimation(trackIdx, animation, loop);
        }
        playNextAnimation()
    }

    /**
     * 按顺序播放多段spine动画(会把多段动画当做一个整体)
     * 1 bLoop为true时，播放完多段动画后，回调会多次触发
     * 2 bLoop为false时，播放完多段动画后，回调触发一次，然后停止播放
     * @param spine spine对象
     * @param animations  动画数组
     * @param bLoop      是否循环播放
     * @param onEndCall   动画播放完成回调
     * @param trackIdx    spine动画轨道索引
     * @returns 
     */
    public static playSpineAnimationsSequence(spine: sp.Skeleton, animations: string[], bLoop: boolean = false, onEndCall?: () => void, trackIdx: number = 0) {
        if (spine == null) {
            XKit.log.logBusiness('playSpineAnimationsSequence error:spine is null')
            return
        }
        else if (animations == null || animations.length == 0) {
            XKit.log.logBusiness('playSpineAnimationsSequence error:animation is null')
            return
        }
        //清除之前的监听
        spine.setCompleteListener(null)
        if (!spine.node.active) {
            spine.node.active = true
        }
        let currentIndex = 0;
        let playNextAnimation = () => {
            if (currentIndex >= animations.length) {
                if (bLoop) {
                    onEndCall?.()
                    //如果循环播放，则重置索引，重新开始播放
                    currentIndex = 0;
                    playNextAnimation();
                }
                else {
                    //清空监听
                    spine.setCompleteListener(null)
                    onEndCall?.()
                    return
                }
            }
            let animation = animations[currentIndex];
            spine.setCompleteListener((entry) => {
                currentIndex++;
                playNextAnimation();
            });
            spine.setAnimation(trackIdx, animation, false);
        }
        playNextAnimation()
    }

    /**
     * @description: spine 添加挂点
     * @param {sp.Skeleton} skeleton spine 节点
     * @param {string} bonePath 传入的是挂点的目标骨骼
     * @param {Node} attchNode 挂点的节点
     * @return {*}
     */
    public static addSpineAttchNode(skeleton: sp.Skeleton, bonePath: string, attchNode: Node) {
        var socket = new sp.SpineSocket(bonePath, attchNode)
        if (skeleton) {
            skeleton!.sockets.push(socket);
            skeleton!.sockets = skeleton!.sockets;
        }
    }

    /**
     * 重写spine 骨骼数据
     * @param originBone 
     * @param targetBone 
     */
    static overrideBoneData(originBone: sp.spine.Bone, targetBone: sp.spine.Bone) {
        targetBone.x = originBone.x
        targetBone.y = originBone.y
        targetBone.rotation = originBone.rotation
        targetBone.scaleX = originBone.scaleX
        targetBone.scaleY = originBone.scaleY
        targetBone.updateWorldTransform()
    }

    /**
     * 获取spine 某个骨骼世界坐标
     * @param skeleton 
     * @param boneName 
     * @returns 
     */
    static getSpineBoneWorldPos(skeleton: sp.Skeleton, boneName: string): Vec3 {
        var pos: Vec3 = null
        var bone = skeleton.findBone(boneName)
        if (bone) {
            var bone_pos = v3(bone.x, bone.y, 0)
            pos = skeleton.node.parent.getComponent(UITransform).convertToWorldSpaceAR(skeleton.node.getPosition().add(bone_pos))
        }
        return pos
    }

    /**
     * 设置node是否显示
     * @param node 
     * @param visible 
     */
    static setNodeVisible(node: Node, visible: boolean) {
        if (node) {
            node.active = visible
        }
    }
    /**
     * 设置toggle是否可用
     * @param tog 
     * @param b 
     */
    static setToggleEnable(tog: Toggle, b: boolean) {
        if (tog) {
            tog.interactable = b
            //顺便把checkMark Sprite颜色修改一下
            if (tog.checkMark) {
                tog.checkMark.color = b ? Color.WHITE : Color.GRAY
            }

        }

    }
    /**
     * 按钮是否可用
     * @param btn 
     * @param b 
     */
    static setBtnEnable(btn: Button, b: boolean) {
        if (btn) {
            btn.interactable = b

            // var sp = btn.node.getComponent(Sprite)
            // if(sp)
            // {
            //     sp.color  = b?Color.WHITE:new Color(200,200,200,200)
            // }
        }
    }

    /**
     * 获取一个节点的世界坐标
     * @param node 
     */
    static getWorldPos(node: Node): Vec3 {
        var pos = Vec3.ZERO
        var uiTransform = node.parent.getComponent(UITransform)
        if (uiTransform) {
            pos = uiTransform.convertToWorldSpaceAR(node.getPosition())
        }
        return pos
    }
    /**
     * a节点坐标装换成相对于b点的坐标
     * @param a         A节点
     * @param b         B节点
     */
    static calculateASpaceToBSpacePos(a: Node, b: Node) {
        var pos = v3(0, 0, 0)
        var worldPos = this.getWorldPos(a)
        var uiTransform = b.getComponent(UITransform)
        if (uiTransform) {
            pos = uiTransform.convertToNodeSpaceAR(worldPos)
        }
        return pos
    }
    /**
     * 修改spine 骨骼坐标点
     * @param spine 
     * @param boneName 
     * @param pos 
     */
    static setSpineBonePos(spine: sp.Skeleton, boneName: string, pos: Vec3) {
        var bone = spine.findBone(boneName)
        if (bone) {
            bone.x = pos.x
            bone.y = pos.y
            bone.updateWorldTransform()
        }
    }
    /**
     * 获取本地玩家头像路径
     * @param faceId 
     * @returns 
     */
    static getPlayerHeadPath(faceId: number, bSquare: boolean = false): string {
        //服务器下发得可能是0
        faceId = faceId == 0 ? 1 : faceId
        
        if(bSquare)
        {//如果是方形头像
            return `head/sq/touxiang_${faceId}/spriteFrame`
        }

        return `head/touxiang_${faceId}/spriteFrame`
    }

    /**
     * 获取玩家头像
     * @param faceId 
     * @param onComplete 
     * @param bundleName 
     * @param bSquare  
     */
    static getPlayerSpriteFrame(faceId: number, onComplete: (error, sprite: SpriteFrame) => void, bundleName: string = "resources", bSquare: boolean = false) {
        let path = this.getPlayerHeadPath(faceId, bSquare)
        XKit.res.load(bundleName, path, SpriteFrame, (error, sprite: SpriteFrame) => {
            onComplete?.(error, sprite)
        })
    }
    //#endregion
    /**
     * 深拷贝
     * @param obj 
     * @returns 
     */
    static deepCopy(obj) {

        if (typeof obj !== "object" || obj == null) {
            return obj
        }

        let res = Array.isArray(obj) ? [] : {}
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                res[key] = this.deepCopy(obj[key])
            }
        }
        return res
    }

    /**
     * 获取当前屏幕方向
     * @returns 
     */
    static getOrientation(): Dirction {
        return this.curDir;
    }
    /**
     * 当前屏幕方向
     */
    protected static curDir: Dirction = Dirction.LANDSCAPE
    /**
     * 设计尺寸
     */
    protected static designSize: Size = null
    /**
     * 改变屏幕方向
     * @param orientation   
     */
    //https://github.com/cocos/cocos-awesome-tech-solutions/tree/3.6.x-release/demo/Creator3.6.2_2D_ScreenSwitch
    static changeScreenOrientation(orientation: Dirction,isLobby:boolean = true) {
        if (this.curDir == orientation) //当前方向和要改变的方向一致
        {
            return
        }
        this.curDir = orientation
        let frameSize = screen.windowSize;
        if (this.designSize == null)//保存下当前设计分辨率
        {
            this.designSize = view.getDesignResolutionSize();
        }

        if (NATIVE)//原生平台 暂时屏蔽
        {
            if (sys.os == sys.OS.ANDROID)
            {
                //根据appConfig.bStorePackage判断是否为商店包
                // let className = appConfig.bStorePackage ? 'com/game/utils/ApplicationUtil' : 'com/cocos/game/AppActivity'
                // native.reflection.callStaticMethod(className, 'setOrientation', '(Ljava/lang/String;)V', orientation == Dirction.PORTRAIT ? 'V' : 'H')
            }
            else if (sys.os == sys.OS.IOS)
                native.reflection.callStaticMethod('AppDelegate', 'setOrientation:', orientation == Dirction.PORTRAIT ? 'V' : 'H')
        }
        // else if(sys.isMobile && sys.isBrowser)
        // {
        //     //部分设备会报错，暂时不用
        //     console.log(`cur orientation ${window.screen.orientation.angle}`)
        // }
        if (this.curDir == Dirction.PORTRAIT) { //竖屏
            view.setOrientation(macro.ORIENTATION_PORTRAIT)
            if (frameSize.width > frameSize.height)
                screen.windowSize = new Size(frameSize.height, frameSize.width)
            view.setDesignResolutionSize(this.designSize.height, this.designSize.width, ResolutionPolicy.FIXED_WIDTH)
        }
        else if (this.curDir == Dirction.LANDSCAPE) //横屏
        {
            view.setOrientation(macro.ORIENTATION_LANDSCAPE)
            if (frameSize.height > frameSize.width)
                screen.windowSize = new Size(frameSize.height, frameSize.width)
            view.setDesignResolutionSize(this.designSize.width, this.designSize.height, ResolutionPolicy.FIXED_HEIGHT);
        }

        // 手机浏览器切换
        if (sys.platform == sys.Platform.MOBILE_BROWSER) {
            window.dispatchEvent(new Event('resize'));
        } 
        else if (sys.platform == sys.Platform.DESKTOP_BROWSER) {
            // 修改canvas大小
            var customEvent = new CustomEvent('changeCanvasSize', {
                detail: {orientation:orientation,isLobby:isLobby}
            });

            // 触发事件
            window.dispatchEvent(customEvent);
            window.dispatchEvent(new Event('resize'));
        }

        
    }

    //获取当前运行平台代码
    public static get SysPlatformCode(): number {
        if (sys.isNative) {
            let platformCode = 2

            switch (sys.platform) {
                case sys.Platform.ANDROID:
                    platformCode = 1
                    break
                case sys.Platform.IOS:
                    platformCode = 0
                    break
            }

            return platformCode
        }
        else if (sys.isBrowser) {
            return 4
        }
    }





    
    
    /**
     * 十六进制颜色 转 Color
     * @param hex 
     * @returns 
     */
    public static colorFromHex(hex: string): Color {
        return new Color().fromHEX(hex);
    }

    /**
     * 复制到剪贴板
     * @param text 
     */
    public static copyTextToClipboard(text: string) {
        let copySuccessHandler = () => {
            XKit.gui.toast("复制成功")
        }
        if (NATIVE) {
            native.copyTextToClipboard(text)
            copySuccessHandler()
        }
        else if (HTML5) {

            if (navigator.clipboard && navigator.clipboard.writeText) {
                // 浏览器支持 navigator.clipboard.writeText，可以使用它来复制文本到剪贴板
                navigator.clipboard.writeText(text)
                .then(function () {
                    copySuccessHandler()
                })
                .catch(function (error) {

                });
            } else {
                // 浏览器不支持，提供备用方法或提示用户手动复制
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    // 尝试执行复制操作
                    const successful = document.execCommand('copy');
                    copySuccessHandler()
                } catch (err) {
                    XKit.log.logBusiness('copy err :', err);
                }
                document.body.removeChild(textArea)
            }
            
        }
    }

    /**
     * 获取系统粘贴板内容
     * @param handler 
     */
    public static getClipBoardText( handler:(content:string)=>void ): void {
        if (NATIVE) {
            //获取原生系统 粘贴板文本
            var text = ""//NativeFun.getClipboardText()
            handler?.(text)
        }
        else if (HTML5) {
            if (navigator.clipboard && navigator.clipboard.readText) {
                navigator.clipboard.readText().then(clipText => {
                    handler?.(clipText)
                })
                .catch(function (error) {
                    console.warn('clipText err :', error);
                    handler?.('')
                });
            }
            else
            {
                handler?.('')
            }
        }
        else
        {
            handler?.('')
        }
    }

    /**
     * 判断是否下载指定游戏
     * @param gameID 
     * @returns 
     */
    public static isDownloadGame(gameID: number): boolean {
        if (sys.isBrowser) {
            return false
        }

        //todo 检查本地游戏资源目录 是否具有指定ID游戏资源

        return false
    }

    /**
     * 删除游戏资源
     * @param gameID 
     */
    public static deleteGame(gameID: number) {
        console.log(`deleteGame ${gameID}`)
    }

    /**
     * 打开浏览器网址
     * @param url 
     */
    public static openUrl(url: string) {
        sys.openURL(url)
    }
    /**
     * 时间戳转日期
     * @param time 
     * @returns 
     */
    static formatDate(timestamp: number): string {
        // 将时间戳转换为毫秒
        var date = new Date(timestamp * 1000);

        // 获取年、月和日
        var year = date.getFullYear();
        var month = ("0" + (date.getMonth() + 1)).slice(-2);
        var day = ("0" + date.getDate()).slice(-2);

        // 获取小时、分钟和秒
        var hours = ("0" + date.getHours()).slice(-2);
        var minutes = ("0" + date.getMinutes()).slice(-2);
        var seconds = ("0" + date.getSeconds()).slice(-2);

        // 返回格式化后的日期和时间
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
    }


    /**
     * @description: 时间戳转时分秒
     * @param {number} timestamp 时间戳
     * @param {TDateStyle} _style 格式 h|hh 小时 s||ss 秒 d||dd 分钟 ,e.g. hh:dd:ss
     * @param {TDateSplit} _split 分隔符
     * @return {string} 格式化后的日期和时间
     */
    static formatTime2HMS(timestamp: number,_style = "hh:dd:ss",_split:TDateSplit = ":"): string {

        const date = new Date(timestamp);
        // 获取小时、分钟和秒
        const dateArr = _style.split(_split);
        let dateStr = "";
        for(let one of dateArr){
            let cur;
            switch(one){
                case "hh": case "h":
                    cur = date.getHours().toString();
                    break;
                case "dd": case "d":
                    cur = date.getMinutes().toString();
                    break;
                case "ss": case "s":
                    cur = date.getSeconds().toString();
                    break;
            }
            cur = one.length > cur.length ? "0"+cur : cur;
            dateStr += dateStr.length > 0 ? _split+cur : cur;
        }

        // 返回格式化后的日期和时间
        return dateStr
    }

    /**
     * 设置游戏title
     * @param title 
     */
    static setGameTitle(title: string) {
        //浏览器修改游戏标题
        if(sys.isBrowser)
        {
            document.title = title
        }
    }

    /**
     * 图片资源转为SpriteFrame
     * @param asset 
     * @returns 
     */
    static transImageAsset2SpriteFrame(asset:ImageAsset):SpriteFrame
    {
        if(asset == null) return null
        
        let texture = new Texture2D();
        texture.image = asset;
        let sp = new SpriteFrame()
        sp.texture = texture
        return sp
    }

    /**
     * 检查两个时间戳是否是同一天
     * @param ts1 
     * @param ts2 
     * @returns 
     */
    static isSameDay( ts1:number, ts2:number )
    {
        let date1 = new Date(ts1)
        let date2 = new Date(ts2)

        return (date1.getFullYear() == date2.getFullYear()) && (date1.getMonth() == date2.getMonth()) && (date1.getDate() == date2.getDate())
    }

    /**
     * 请求全屏
     */
    static reqFullScreen()
    {
        //是手机以浏览器&&不是全屏状态&&支持全屏
        if(sys.platform == sys.Platform.MOBILE_BROWSER && screen.supportsFullScreen && !screen.fullScreen())
        {   
            screen.requestFullScreen().catch((err) => {
                console.log(`reqFullScreen err:}`,err)
            })
        }
    }
    /**
     * httpGet
     * @param url 
     * @param callBack 
     * @param outTime 超时时间：默认5秒（单位：秒） 
     */
    static httpGet(url:string,callBack:(isError:boolean,response?:any)=>void, outTime:number = 5)
    {   
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4 ) {
                if(xhr.status >= 200 && xhr.status < 300)
                {
                    callBack?.(false, xhr.response);
                    callBack = null
                }
                else
                {
                    callBack?.(true, null)
                    callBack = null
                }
                
            }
        }
        xhr.onerror = function (err) {
            callBack?.(true, null)
            callBack = null
        };
        xhr.ontimeout = function () {
            callBack?.(true, null)
            callBack = null
        };
        xhr.onabort = function () {
            callBack?.(true, null)
            callBack = null
        }
        xhr.open("GET", url, true);

        //设置超时时间:不低于3秒
        outTime = Math.max(outTime, 3)
        outTime*=1000

        xhr.timeout = outTime;

        xhr.send();

    }

    /**
     * 根据按钮是否可用 更新子节点状态
     * @param lable 
     */
    static updateBtnChildStatus(btn:Button)
    {
        if(btn)
        {
            //lable 改变透明度
            var labes = btn.node.getComponentsInChildren(Label)
            for(let lable of labes)
            {
                var orginColor = lable.color
                lable.color = new Color(orginColor.r,orginColor.g,orginColor.b,btn.interactable?255:150)
            }
            //图片设置gray
            var Sprites = btn.node.getComponentsInChildren(Sprite)
            for(let sprite of Sprites)
            {
                if(sprite.node!=btn.node)
                {
                    sprite.color = btn.interactable?Color.WHITE:Color.GRAY
                }
                
            }
        }
    }

    /**
     * 转换本地坐标点到世界坐标
     * @param root 
     * @param nodePoint 
     * @param out 
     * @returns 
     */
    public static converToWorldSpace( root:Node, nodePoint:Vec3, out?:Vec3 ):Vec3
    {
        let _mat4_temp = new Mat4()
        root.getWorldMatrix(_mat4_temp)
        if(!out)
        {
            out = new Vec3()
        }

        return Vec3.transformMat4(out, nodePoint, _mat4_temp)
    }

    /**
     * 计算向量表示的角度
     * @param direction 方向向量(需归一化处理)
     * @param out 计算的角度值
     * @param axis 要计算的轴：1 表示该轴需计算方向，否则不计算
     * @returns 该向量表示的旋转角度
     */
    public static FromDirectionToEuler(direction:Vec3, out:Vec3, axis:Vec3 = Vec3.ONE):Vec3
    {
        //向量归一化
        direction = direction.normalize()
        //计算旋转角度
        out.x = (axis.x == 1)?Math.atan2(direction.z, direction.y)*180/Math.PI:0
        out.y = (axis.y == 1)?Math.atan2(direction.x, direction.z)*180/Math.PI:0
        out.z = (axis.z == 1)?Math.atan2(direction.y, direction.x)*180/Math.PI:0

        return out
    }

    public static FromEulerToDirection(euler:Vec3, out:Vec3, axis:Vec3 = Vec3.ONE):Vec3
    {
        //基于欧拉角计算四元数
        let quat = new Quat()
        Quat.fromEuler(quat, euler.x, euler.y, euler.z)
        //计算方向向量
        Vec3.transformQuat( out, axis, quat )

        return out
    }


    /**
     * 硬币找零算法(动态规划)
     * @param coins 硬币类型数组
     * @param amount 金额
     * @returns 硬币组合（凑成金额） 如果长度为0表示无法凑成
     */
    public static coinChange( coins:number[], amount:number ):number[]
    {
        const dp:number[] = new Array(amount + 1).fill(amount + 1);
        dp[0] = 0;
        const coinCombination:number[][] = new Array(amount + 1).fill([]);
        for (let i = 1; i <= amount; i++) {
            for (const coin of coins) {
                if (coin <= i) {
                    if (dp[i - coin] + 1 < dp[i]) {
                        dp[i] = dp[i - coin] + 1;
                        coinCombination[i] = coinCombination[i - coin].concat(coin)
                        //[...coinCombination[i - coin], coin];
                    }
                }
            }
        }

        return dp[amount] > amount ? [] : coinCombination[amount];
    }

    /**
     * 硬币找零（贪心算法:复杂度低，但可能不是最优解）
     * @param coins 硬币类型:要求升序（从小到大）
     * @param amount 找零金额
     * @param findCoinsCount 找零检查：是否满足该条件,输入参数为：硬币面额 返回实际拥有个数
     * @param isKeyType 返回找零表的key是否为硬币类型（而非面额）
     * @param bNumber 强制找零（宁多毋缺）
     * @returns 找零组合
     */
    public static minCoinChange( coins:number[]|Readonly<number[]>, amount:number, findCoinsCount?:( coinAmount:number, coinType:number )=>number, isKeyType:boolean = true, bNumber:boolean = true ):Map<number, number>
    {
        if(coins == null || coins.length == 0) return null
        else if(amount <= 0) return null

        //获取最小面额硬币
        let minCoin = coins[0]
        //使用给定的coins硬币组合成amount 尽量用少的硬币数量 
        let coinCombination:Map<number, number> = new Map<number, number>()
        let curAmount = amount
        let leftAmount = amount
        //从大到小 尝试找零
        for(let cType=coins.length-1;cType>=0;cType--)
        {
            let curCoin = coins[cType]
            //计算使用当前硬币找零后的余额
            leftAmount = curAmount%curCoin
            //强制找零 或 余额大于最小值 或 余额为零 才尝试使用该硬币找零
            if( bNumber || leftAmount > minCoin || leftAmount == 0)
            {
                let count = Math.floor(curAmount/curCoin)
                //强制要求找零&最后余额除不尽时，则多增加一个最小面额的硬币进行找零（宁多毋缺）
                if( bNumber && curCoin == minCoin && leftAmount > 0)
                {
                    count++
                    leftAmount = 0
                }
                //没有有效数量 跳到下一个
                if(count == 0)
                {
                    continue
                }

                if(findCoinsCount != null)
                {
                    let existCount = findCoinsCount(curCoin, cType)
                    //个数不足，取实际拥有个数
                    count = Math.min( count, existCount )
                    //重新更新余额
                    leftAmount = curAmount - count*curCoin
                }

                if(isKeyType)
                {
                    //记录找零：使用 类型硬币 count个
                    coinCombination.set( cType, count )
                }
                else
                {
                    //记录找零：使用 面额curCoin count个
                    coinCombination.set( curCoin, count )
                }
                //如果找零完成，则跳出
                if(leftAmount == 0) break

                curAmount = leftAmount
            }
        }

        if(!bNumber && leftAmount > 0)
        {
            XKit.log.logBusiness(`change coins failed,leftamount = ${leftAmount}`)
            return null
        }

        return coinCombination
    }

    /**
     * 邮箱是否有效
     * @param email 
     * @returns 
     */
    public static checkEmailValid(email:string):boolean
    {
        if(!email || email.length==0) return false

        let reg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/
        return reg.test(email)
    }





    /**
     * 解压zip到指定目录
     * @param zipPath 
     * @param targetPath 
     * @param callFun
     * @returns 
     */
    public static decompressZip(zipPath:string,targetPath:string,callFun:(b:boolean)=>void)
    {
        //  my_ns.MyUtils.uncompressDir(zipPath, targetPath,callFun)
    }
    /**
     * 根据文件路径获取目录
     * @param url 
     * @returns 
     */
    public static getDirByUrl(url: string): string {
        var arr = url.split("/")
        var path = ""
        if (arr.length > 1) {
            for (var i = 0; i < arr.length - 1; i++) {
                var tempdir = arr[i]
                if (i == 0) {
                    path = tempdir

                }
                else {
                    path = path + "/" + tempdir
                }
            }
        }
        else {
            path = arr[0]
        }
        path = path + "/"
        return path
    }

    /**
     * 添加到主屏幕
     * @param onFinish 
     */
    public static add2HomeScreen(onFinish?:Function)
    {
        if(sys.isBrowser)
        {
            if(globalThis.dfdPrompt)
            {
                globalThis.dfdPrompt.prompt()
                globalThis.dfdPrompt.userChoice.then(function (choiceResult) {
                    if (choiceResult.outcome === 'dismissed') {
                        onFinish?.(false)
                    }
                    else {
                        onFinish?.(true)
                    }
                });
            }
        }
    }

    /**
     * 防抖函数
     * @param func 
     * @param wait 
     * @param immediate 
     * @returns 
     */
   public static debounce(func:Function, wait:number, immediate:boolean = false) {
        let timeout:any;
        return function() {
            let context = this, args = arguments;
            let later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        }
    }





    /**
     * 获取2点之间的角度
     * @param pos1 
     * @param pos2 
     */
    static getAngle(pos1:Vec3,pos2:Vec3):number
    {
        let dir = pos2.clone().subtract(pos1).normalize()
        let angle = Math.atan2(dir.y, dir.x) * 180 / Math.PI
        return angle
    }

    /**
     * 比较两个版本号字符串
     * @param {string} v1 第一个版本号（如 "1.2.3"）
     * @param {string} v2 第二个版本号（如 "1.10.0"）
     * @returns {number} 1: v1 > v2 | -1: v1 < v2 | 0: 相等
     */
    static compareVersions(v1, v2) {
        // 分割版本号并转换为数字数组
        const parseVersion = (version) => {
            return version.split('.').map(part => {
            // 提取数字部分（忽略字母和符号）
            const num = part.match(/^\d+/);
            return num ? parseInt(num[0], 10) : 0;
            });
        };
        
        const parts1 = parseVersion(v1);
        const parts2 = parseVersion(v2);
        
        // 逐级比较版本号
        const maxLength = Math.max(parts1.length, parts2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const num1 = parts1[i] || 0;
            const num2 = parts2[i] || 0;
            
            if (num1 > num2) return 1;
            if (num1 < num2) return -1;
        }
        
        return 0; // 版本号相等
    }
    /**
     * HTML 转为 RichText的字符串
     * @param html  HTML 字符串
     * @param clickFunName 点击事件名称字符串
     * @returns 
     */
     public static convertHtmlToRichText(html: string,clickFunName?:string): string {
        if (!html) return "";

        // 1. 预处理：解码常见 HTML 实体
        let text = this.decodeHtmlEntities(html);

        // 2. 预处理：统一换行符
        // 将 <br>, <br/>, <br /> 替换为占位符或直接保留，RichText 支持 <br/>
        text = text.replace(/<br\s*\/?>/gi, '<br/>');
        // 将块级元素 p, div 结尾替换为换行 (可视情况调整)
        text = text.replace(/<\/p>/gi, '<br/>').replace(/<\/div>/gi, '<br/>');

        // 3. 解析与转换
        return this.parseHtmlToRichText(text,clickFunName);
    }

    private static parseHtmlToRichText(html: string,clickFunName?:string): string {
        let result = "";
        
        // 这里的栈用于存储需要闭合的 RichText 标签后缀
        // 例如遇到 <span style="color:red">，栈里压入 "</color>"
        const tagStack: string[] = [];

        // 正则：匹配标签 (<tag...>) 或 非标签文本
        const regex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
        let match;
        let lastTagName = ""
        while ((match = regex.exec(html)) !== null) {
            const isTag = !!match[1] || !!match[2]; // 是否是标签
            
            if (isTag) {
                const isCloseTag = match[1] === '/';
                const tagName = match[2].toLowerCase();
                lastTagName = tagName
                const attributes = match[3];

                if (!isCloseTag) {
                    // --- 处理开始标签 ---
                    const { openTags, closeTags } = this.getRichTextTags(tagName, attributes,clickFunName);
                    result += openTags;
                    // 将对应的闭合标签按顺序压入栈 (先进后出)
                    // 注意：如果是多个标签组合（如 span 既有 color 又有 size），closeTags 可能是 "</size></color>"
                    if (closeTags) {
                        tagStack.push(closeTags);
                    }
                } else {
                    // --- 处理结束标签 ---
                    // 遇到 </span>, </b> 等，从栈中弹出一组闭合标签
                    // 注意：这里是一个简单的对应机制，假设 HTML 结构是良构的
                    if (['span', 'font', 'b', 'strong', 'i', 'em', 'u'].includes(tagName)) {
                        const closeTag = tagStack.pop();
                        if (closeTag) {
                            result += closeTag;
                        }
                    }
                }
            } else {
                // --- 处理纯文本 ---
                let  content = match[4];
                if(lastTagName === "a")
                {
                    content = `<u>${content}</u>`
                }
                result += content;
            }
        }

        // 清理栈中剩余的标签（防止 HTML 未闭合）
        while (tagStack.length > 0) {
            result += tagStack.pop();
        }
        return result;
    }

    /**
     * 根据 HTML 标签和属性，生成 Cocos RichText 的头标签和尾标签
     */
    private static getRichTextTags(tagName: string, attrString: string,clickFunName?:string): { openTags: string, closeTags: string } {
        let openTags = "";
        let closeTags = "";

        // 解析属性字典
        const attrs = this.parseAttributes(attrString);
        // 解析 Style 属性字典
        const styles = this.parseStyles(attrs['style'] || "");

        //超链接
        if(tagName === "a")
        {
            openTags = `<on click=\"${clickFunName}\" param="${attrs['href']}">`;
            closeTags = "</on>"+closeTags;
        }

        // 1. 处理 <b>, <strong>
        if (tagName === 'b' || tagName === 'strong' || styles['font-weight'] === 'bold') {
            openTags += "<b>";
            closeTags = "</b>" + closeTags;
        }

        // 2. 处理 <i>, <em>
        if (tagName === 'i' || tagName === 'em' || styles['font-style'] === 'italic') {
            openTags += "<i>";
            closeTags = "</i>" + closeTags;
        }

        // 3. 处理 <u>
        if (tagName === 'u' || styles['text-decoration'] === 'underline') {
            openTags += "<u>";
            closeTags = "</u>" + closeTags;
        }

        // 4. 处理 Color (Font 标签的 color 属性 或 Style 的 color)
        let color = attrs['color'] || styles['color'];
        if (color) {
            // Cocos 需要 hex 格式，如果是 rgb(r,g,b) 需要转换，这里假设输入多为 hex 或 color name
            openTags += `<color=${color}>`;
            closeTags = "</color>" + closeTags;
        }

        // 5. 处理 Size (Font 标签的 size 属性 或 Style 的 font-size)
        // 注意：HTML <font size="3"> 是级数，CSS font-size 是 px。
        // 这里简单处理：如果是数字直接用，如果是 px 去掉 px
        let size = attrs['size'] || styles['font-size'];
        if (size) {
            size = size.toString().replace("px", "");
            if (!isNaN(Number(size))) {
                openTags += `<size=${size}>`;
                closeTags = "</size>" + closeTags;
            }
        }
        // 7. 处理换行 (显式保留)
        if (tagName === 'br') {
            openTags += "<br/>";
        }

        return { openTags, closeTags };
    }

    /**
     * 解析 HTML 属性字符串，如: src="a.png" width=100
     */
    private static parseAttributes(attrString: string): { [key: string]: string } {
        const attrs: { [key: string]: string } = {};
        if (!attrString) return attrs;

        // 简单的正则匹配 key="value" 或 key='value' 或 key=value
        const regex = /(\w+)=["']?([^"'\s]+)["']?/g;
        let match;
        while ((match = regex.exec(attrString)) !== null) {
            attrs[match[1].toLowerCase()] = match[2];
        }
        return attrs;
    }

    /**
     * 解析 CSS Style 字符串，如: "color: red; font-size: 20px;"
     */
    private static parseStyles(styleString: string): { [key: string]: string } {
        const styles: { [key: string]: string } = {};
        if (!styleString) return styles;

        const items = styleString.split(';');
        for (let item of items) {
            const [key, value] = item.split(':');
            if (key && value) {
                styles[key.trim().toLowerCase()] = value.trim();
            }
        }
        return styles;
    }

    /**
     * 解码 HTML 实体
     */
    private static decodeHtmlEntities(str: string): string {
        return str
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    }
}


//分隔符
type TDateSplit = ":" | "-"


