// 定义层级枚举，顺序决定渲染顺序（越往下越靠前）
export enum UILayer {
    /** 游戏层 */
    Game = 0,
    /** 主界面层 */
    UI ,
    /** 弹窗层 */
    PopUp ,
    /** 模式窗口层 */
    Dialog ,
    /*网络等待*/
    Waiting ,
    /** Toast提示层 */
    Toast,
    /** 跑马灯 */
    Notify ,
    /** 新手引导层 */
    Guide 
}