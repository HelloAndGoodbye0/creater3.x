/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-08-03 08:47:41
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-08-04 14:59:46
 * @FilePath: \cocos_framework_base\extensions\publish_res\src\main.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// @ts-ignore
import packageJSON from '../package.json';
/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openPanel() {
        Editor.Panel.open(packageJSON.name);
    },
    log(...args){console.log(...args)},
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
    // console.log('load');
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
    // console.log('unload');
}




