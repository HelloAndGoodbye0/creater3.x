// 定义层级枚举，顺序决定渲染顺序（越往下越靠前）
export enum UILayer {
    /** 游戏层 */
    Game = "Game",
    /** 主界面层 */
    UI = "UI" ,
    /** 弹窗层 */
    PopUp = "PopUp",
    /** 模式窗口层 */
    Dialog= "Dialog" ,
    /*网络等待*/
    Waiting = "Waiting" ,
    /** 跑马灯 */
    Notify= "Notify" ,
    /** Toast提示层 */
    Toast = "Toast",
    /** 新手引导层 */
    Guide = "Guide",
}