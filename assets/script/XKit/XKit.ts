import { AudioManager } from "./audio/AudioManager";
import { MessageManager } from "./event/MessageManager";
import { GUI } from "./GUI/GUI";
import { Logger } from "./log/Logger";
import { ResLoader } from "./res/ResLoader";
import { StorageManager } from "./storage/StorageManager";

/**
 * Xkit框架
 */
export  class XKit {
    // 全局GUI管理器
    public static gui:GUI = null
    // 全局资源加载器
    public static res:ResLoader = new ResLoader();
    /** 游戏音乐管理 */
    static audio: AudioManager;
    /** 日志管理 */
    static log = Logger;
    /** 本地存储 */
    static storage: StorageManager = new StorageManager();
    /** 全局消息 */
    static message: MessageManager = MessageManager.Instance;
}