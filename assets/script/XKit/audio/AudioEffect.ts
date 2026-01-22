/*
 * @Author: dgflash
 * @Date: 2022-09-01 18:00:28
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-05-10 15:57:21
 */
import { AudioClip, AudioSource, error, _decorator } from 'cc';
import { XKit } from '../XKit';

const { ccclass, menu } = _decorator;

/**
 * 注：用playOneShot播放的音乐效果，在播放期间暂时没办法即时关闭音乐
 */

/** 游戏音效 */
@ccclass('AudioEffect')
export class AudioEffect extends AudioSource {
    /**
     * 播放完成回调
     */
    private onAudioEnd:Function = null
    /**
     * 加载音效并播放
     * @param url           音效资源地址
     * @param bundleName   加载音效bundle
     * @param onAudioEndCall      播放完成回调
     */
    load(url: string, bundleName:string, onAudioEndCall?: Function, bLoop:boolean = false) {
        XKit.res.load(bundleName,url, AudioClip, (err: Error | null, clip: AudioClip) => {
            if (err != null) {
                error(err)
                return
            }

            this.enabled = true;
            this.loop =  bLoop
            this.clip = clip;
            this.play()
            this.onAudioEnd = onAudioEndCall
        });
    }

    /**
     * 播放音频片段
     * @param clip 音频片段
     * @param onAudioEndCall 
     * @param bLoop 
     */
    playClip( clip:AudioClip, onAudioEndCall?: Function, bLoop:boolean = false )
    {
        if(clip == null)
        {
            onAudioEndCall?.(this)
            return
        }

        this.enabled = true;
        this.loop =  bLoop
        this.clip = clip;
        this.play()
        this.onAudioEnd = onAudioEndCall
    }

 
    update(dt: number) {
        if (this.playing == false) {
            this.enabled = false
            this.onAudioEnd?.(this)
            this.onAudioEnd = null
        }
    }
}
