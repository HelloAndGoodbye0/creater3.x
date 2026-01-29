import { AudioManager } from "./audio/AudioManager";
import { EventManager } from "./event/EventManager";
import { LayerManager } from "./GUI/LayerManager";
import { PopupManager } from "./GUI/PopupManager";
import { HttpRequest } from "./http/HttpRequest";
import { Language } from "./language/Language";
import { Logger } from "./log/Logger";
import { ResLoader } from "./res/ResLoader";
import { StorageManager } from "./storage/StorageManager";

/**
 * Xkit框架
 */
export  class XKit {
    // 全局GUI管理器
    public static gui:LayerManager = null
    // 全局资源加载器
    public static res:ResLoader = new ResLoader();
    /** 游戏音乐管理 */
    public static audio: AudioManager;
    /** 日志管理 */
    public static log = Logger;
    /** 本地存储 */
    public static storage: StorageManager = new StorageManager();
    /** 全局消息 */
    public static message: EventManager = EventManager.instance
    /** 全局弹框管理 */
    public static popManager:PopupManager = null
    /** 全局http请求 */
    public static http:HttpRequest = new HttpRequest();
    /** 全局语言管理 */
    public static language: Language = new Language();
}