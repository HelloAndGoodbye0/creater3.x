//@ts-ignore

import { seek_miss } from './seek_miss/main';
import { AssetInfo } from '../@types/packages/asset-db/@types/public';


let seek_uuid: string = 'HelloWorld';
/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {

  async get_seek_uuid() {
    return seek_uuid;
  },

  async set_seek_uuid(data) {
    seek_uuid = data;
    if (await Editor.Panel.has('seek-pro.wherePanel')) {
      Editor.Message.send('seek-pro', 'refresh-where-panel', seek_uuid);
      Editor.Panel.focus('seek-pro.wherePanel');
    }
    else {
      Editor.Panel.open('seek-pro.wherePanel');
    }
  },

  async open_seek_miss_panel() {
    if (await Editor.Panel.has('seek-pro.missPanel')) {
      Editor.Message.send('seek-pro', 'refresh-miss-panel', seek_uuid);
      Editor.Panel.focus('seek-pro.missPanel');
    }
    else {
      Editor.Panel.open('seek-pro.missPanel');
    }
  },
};

export function onAssetMenu(assetInfo: AssetInfo) {
  return [
    {
      label: '[seek-pro]查找UUID在prefab,scene里的使用',
      click() {
        if (assetInfo && assetInfo.uuid) {
          console.log('[seek-pro] 正在查找，请耐心等待...')
          Editor.Message.send('seek-pro', 'set-seek-uuid', assetInfo.uuid);
        }
        else {
          console.error('[seek-pro] 资源的uuid失效了');
        }
      }
    }
  ]
}


/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = function () { };

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function () { };
