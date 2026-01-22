import { Component } from "cc";
import { AudioEffect } from "./AudioEffect";
import { AudioMusic } from "./AudioMusic";
import { AudioSource } from "cc";
import { AudioClip } from "cc";
import { XKit } from "../XKit";

const LOCAL_STORE_KEY = "game_audio";

/** 
 * 音频管理
 * @example 
// 模块功能通过 oops.audio 调用
播放bg音效
oops.audio.playMusic("audios/nocturne");
播放一般音效
var soundId = oops.audio.playEffect("xxxx");
停止一般音效
oops.audio.stopEffect(soundId)
 */
export class AudioManager extends Component {
    private local_data: any = {};

    private music!: AudioMusic;
    // private effect!: AudioEffect;

    private _volume_music: number = 1;
    private _volume_effect: number = 1;
    private _switch_music: boolean = true;
    private _switch_effect: boolean = true;

    private max_size = 10 //缓存池最大容量
    //音效组件缓存池
    private ae_com_pool:AudioEffect[] = []
    //记录当前正在播放的音效
    private playing_effect_map:Map<string,AudioEffect> = new Map<string,AudioEffect>

    /**
     * 设置背景音乐播放完成回调
     * @param onCompleteCall 背景音乐播放完成回调
     */
    setMusicComplete(onCompleteCall: Function | null = null) {
        this.music.onComplete = onCompleteCall;
    }

    /**
     * 恢复bg音效音量
     */
    revertBgVolume()
    {
        //没有正在播放的音效，则恢复背景音乐音量
        if(Object.keys(this.playing_effect_map).length==0)
        {
            this.music.volume = this.volumeMusic
        }
    }
    /**
     * 播放音效
     * @param url        资源地址
     * @param loop       是否循环
     * @param bundleName    音效资源所在bundleName
     */
    playEffect(url: string ,bundleName:string = "resources", soundId?:string,bLoop?:boolean):string {
        if (this._switch_effect) {
            //如果音效音量为0(接近)，则降低音量
            if(this._volume_effect>0.01)
            {
                this.music.volume =  this.volumeMusic*0.75
            }

            if(soundId == null)
            {
                soundId = url + Date.now()
            }
            
            var effect  = this.getAudioEffect()
            //播放的时候设置音量 因为可能设置了静音
            effect.volume = this._volume_effect
            effect.load(url,bundleName,(com:AudioEffect)=>{
                if(this.playing_effect_map.get(soundId))
                {
                    this.playing_effect_map.delete(soundId)
                    this.tryCacheAudioEffect(com)
                }
                //尝试恢复bg音效音量
                this.revertBgVolume()
    
            },bLoop);
            this.playing_effect_map.set(soundId,effect) 
        }

        return soundId
    }

    /**
     * 播放音效（通过AudioClip）
     * @param clip 音频片段
     * @returns 
     */
    playEffectClip( clip:AudioClip ):string {
        if(clip == null) return ''

        let soundId:string = ''
        if (this._switch_effect) {
            //如果音效音量为0(接近)，则降低音量
            if(this._volume_effect>0.01)
            {
                this.music.volume =  this.volumeMusic*0.75
            }

            soundId = clip.name +Date.now()

            var effect  = this.getAudioEffect()
            //播放的时候设置音量 因为可能设置了静音
            effect.volume = this._volume_effect
            //放入播放列表
            this.playing_effect_map.set(soundId,effect)
            //播放音频
            effect.playClip( clip, (com:AudioEffect)=>{
                if(this.playing_effect_map.get(soundId))
                {
                    this.playing_effect_map.delete(soundId)
                    this.tryCacheAudioEffect(com)
                }
                //尝试恢复bg音效音量
                this.revertBgVolume()
            })
        }

        return soundId
    }

    /**
     * 停止匹配name的所有音效
     * @param name 
     */
    stopEffectByName(name:string)
    {
        this.dispatchEffect((audio:AudioEffect,key:string)=>{
            if (key.indexOf(name) != -1)//找到了
            {
                audio.stop()
                audio.enabled = false
                this.playing_effect_map.delete(key)
                this.tryCacheAudioEffect(audio)
                //尝试恢复bg音效音量
                this.revertBgVolume()
            }
        })
    }

    /**
     * 停止音效
     * @param soundID 
     */
    stopEffect(soundID:string )
    {   
        if(this.playing_effect_map.has(soundID))
        {
            let ae = this.playing_effect_map.get(soundID)
            if(ae != null)
            {
                ae.stop()
                ae.enabled = false
                this.tryCacheAudioEffect(ae)
            }
            this.playing_effect_map.delete(soundID)
            //尝试恢复bg音效音量
            this.revertBgVolume()
        }
    }

    /**
     * 播放背景音乐
     * @param url        资源地址
     * @param callback   音乐播放完成事件
     * @param bundleName  加载资源bundleName
     */
    playMusic(url: string, callback?: Function,bundleName:string = "resources") {
        if (this._switch_music) {
            this.music.load(url,bundleName, callback);
        }
    }

    /**
     * 停止背景音效
     * @param url 
     */
    stopMusic()
    {
        // if(this.switchMusic)
        {
            this.music.stop()
        }
    }
    /**
     * 尝试再缓存中获取一个AudioEffect组件
     * @returns 
     */
    getAudioEffect():AudioEffect
    {
        var effect:AudioEffect = null
        if(this.ae_com_pool.length>0)
        {
   
            effect = this.ae_com_pool.shift()
        }
        else
        {
            effect = this.node.addComponent(AudioEffect)
            effect.playOnAwake = false
            effect.volume = this._volume_effect
        }
        return effect
    }
    /**
     * 尝试缓存AudioEffect组件
     * @param effect 
     */
    tryCacheAudioEffect(effect:AudioEffect)
    {
        if(this.ae_com_pool.length< this.max_size)
        {
            this.ae_com_pool.push(effect)
        }
        else
        {
            effect.destroy()
        }
        
    }
    /**
     * 获取背景音乐播放进度
     */
    get progressMusic(): number {
        return this.music.progress;
    }
    /**
     * 设置背景乐播放进度
     * @param value     播放进度值
     */
    set progressMusic(value: number) {
        this.music.progress = value;
    }

    /**
     * 获取背景音乐音量
     */
    get volumeMusic(): number {
        return this._volume_music;
    }
    /** 
     * 设置背景音乐音量
     * @param value     音乐音量值
     */
    set volumeMusic(value: number) {
        this._volume_music = value;
        this.music.volume = value;
    }

    /** 
     * 获取背景音乐开关值 
     */
    get switchMusic(): boolean {
        return this._switch_music;
    }
    /** 
     * 设置背景音乐开关值
     * @param value     开关值
     */
    set switchMusic(value: boolean) {
        this._switch_music = value;

        if (value == false)
        {
            this.music.stop();
        }
        else
        {
            this.music.play();
        }
           
    }

 

    /**
     * 分发给正在播放的 AudioSource
     * @param call 
     */
    protected dispatchEffect(call:(audio:AudioEffect,key?:string)=>void)
    {
        this.playing_effect_map.forEach((value: AudioEffect, key: string, map: Map<string, AudioEffect>)=>{
            call(value,key)
        })
    }

    /** 
     * 获取音效音量 
     */
    get volumeEffect(): number {
        return this._volume_effect;
    }
    /**
     * 设置获取音效音量
     * @param value     音效音量值
     */
    set volumeEffect(value: number) {
        this._volume_effect = value;
        // this.effect.volume = value;
        this.dispatchEffect((audio:AudioSource)=>{
            audio.volume = value
        })
    }

    /** 
     * 获取音效开关值 
     */
    get switchEffect(): boolean {
        return this._switch_effect;
    }
    /**
     * 设置音效开关值
     * @param value     音效开关值
     */
    set switchEffect(value: boolean) {
        this._switch_effect = value;
        
        // this.effect.stop();
        this.dispatchEffect((audio:AudioSource)=>{
            if (value == false)
            {
                audio.stop()
            }
            else
            {
                audio.play()
            }
           
        })
    }

    /** 恢复当前暂停的音乐与音效播放 */
    resumeAll() {
        if (this.music) {
            this.music.play();
            // this.effect.play();
            this.dispatchEffect((audio:AudioSource)=>{
                audio.play()
            })
        }
    }

    /** 暂停当前音乐与音效的播放 */
    pauseAll() {
        if (this.music) {
            this.music.pause();
            // this.effect.pause();
            this.dispatchEffect((audio:AudioSource)=>{
                audio.pause()
            })
        }
    }

    /** 停止当前音乐与音效的播放 */
    stopAll() {
        if (this.music) {
            this.music.stop();
            // this.effect.stop();
            this.dispatchEffect((audio:AudioSource)=>{
                audio.stop()
            })
        }
    }

    /** 保存音乐音效的音量、开关配置数据到本地 */
    save() {
        this.local_data.volume_music = this._volume_music;
        this.local_data.volume_effect = this._volume_effect;
        this.local_data.switch_music = this._switch_music;
        this.local_data.switch_effect = this._switch_effect;

        let data = JSON.stringify(this.local_data);
        XKit.storage.set(LOCAL_STORE_KEY, data);
    }


    /** 本地加载音乐音效的音量、开关配置数据并设置到游戏中 */
    load() {
        this.music = this.getComponent(AudioMusic) || this.addComponent(AudioMusic)!;
        // this.effect = this.getComponent(AudioEffect) || this.addComponent(AudioEffect)!;

        let data = XKit.storage.get(LOCAL_STORE_KEY);
        if (data) {
            try {
                this.local_data = JSON.parse(data);
                this._volume_music = this.local_data.volume_music;
                this._volume_effect = this.local_data.volume_effect;
                this._switch_music = this.local_data.switch_music;
                this._switch_effect = this.local_data.switch_effect;
            }
            catch (e) {
                this.local_data = {};
                this._volume_music = 1;
                this._volume_effect = 1;
                this._switch_music = true;
                this._switch_effect = true;
            }

            if (this.music) this.music.volume = this._volume_music;
            // if (this.effect) this.effect.volume = this._volume_effect;
        }
    }
}