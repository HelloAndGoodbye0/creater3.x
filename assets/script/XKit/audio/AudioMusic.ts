
import { AudioClip, AudioSource, error, _decorator } from 'cc';
import { XKit } from '../XKit';
const { ccclass, menu } = _decorator;

/** 背景音乐 */
@ccclass('AudioMusic')
export class AudioMusic extends AudioSource {
    /** 背景音乐播放完成回调 */
    onComplete: Function | null = null;

    private _progress: number = 0;
    private _url: string = null!;
    private _isPlay: boolean = false;


    /** 获取音乐播放进度 */
    get progress(): number {
        if(this.clip != null)
        {
            //计算当前播放进度
            this._progress = (this.duration > 0)?this.currentTime / this.duration:0;
        }
        else
        {
            //没有音频资源 默认进度为0
            this._progress = 0
        }
        return this._progress;
    }
    /**
     * 设置音乐当前播放进度
     * @param value     进度百分比0到1之间
     */
    set progress(value: number) {
        if(this.clip != null)
        {
            this._progress = value;
            this.currentTime = value * this.duration;
        }
        else
        {
            this._progress = 0
            this.currentTime = 0
        }
    }

    /**
     * 加载音乐并播放
     * @param url          音乐资源地址
     * @param bundleName   加载音效bundle
     * @param onLoadComplete     加载完成回调
     */
    public load(url: string, bundleName:string,onLoadComplete?: Function, bLoop:boolean = true) {
        XKit.res.load(bundleName,url, AudioClip, (err: Error | null, data: AudioClip) => {
            if (err) {
                error(err);
                return
            }

            if (this.playing) {
                this._isPlay = false;
                this.stop();
                XKit.res.release(this._url);
            }

            this.loop =  bLoop
            this.clip = data;
            this.enabled = true;

            // 注：事件定义在这里，是为了在播放前设置初始播放位置数据
            onLoadComplete?.();

            this.play();

            this._url = url;
        });
    }

    /** cc.Component 生命周期方法，验证背景音乐播放完成逻辑，建议不要主动调用 */
    update(dt: number) {
        if (this.currentTime > 0) {
            this._isPlay = true;
        }

        if (this._isPlay && this.playing == false) {
            this._isPlay = false;
            this.enabled = false

            this.onComplete?.()
        }
    }

    /** 释放当前背景音乐资源 */
    release() {
        if (this._url) {
            XKit.res.release(this._url);
            this._url = null!;
        }
    }
}
