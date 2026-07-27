"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleParse = void 0;
const BaseComParse_1 = require("./BaseComParse");
class SimpleParse extends BaseComParse_1.BaseComParse {
    constructor() {
        super(...arguments);
        this._simpleKeys = [
            //cc.Sprite
            '_customMaterial',
            '_atlas',
            '_spriteFrame',
            //cc.Label
            '_font',
            //cc.Button
            '_normalSprite',
            '_hoverSprite',
            '_pressedSprite',
            '_disabledSprite',
            //meshrender
            '_mesh',
            //animation
            '_defaultClip',
            //audioSources
            '_clip',
            //richText
            '_imageAtlas',
            //dragonBones.ArmatureDisplay
            '_dragonAsset',
            '_dragonAtlasAsset',
            //cc.Billboard
            '_texture',
            //particleSystem2D
            '_file',
            //BoxCollider
            '_material',
            //spine
            '_skeletonData',
            //tiledMap
            '_tmxFile',
            //editBox
            '_backgroundImage',
            // CCPropertyOverrideInfo
            'value',
        ];
        this._arrayKeys = [
            '_materials',
            '_clips',
        ];
        this.comName = '';
    }
    /**
    * 解析预制件数组里的单个项目
    * @param json 预制件数组里的一个项目
    * @param uuidSeekedMap 已经找到了的uuid的名字
    * @returns 返回丢失了uuid的属性的名字
   */
    async parse(json, uuidSeekedMap, fatherJson) {
        this.comName = json.__type__;
        let ret = [];
        //检测单个Key
        for (let simpleKey of this._simpleKeys) {
            if (json[simpleKey]) {
                let uuid = json[simpleKey].__uuid__;
                if (uuid) {
                    if (!uuidSeekedMap.has(uuid)) {
                        let url = await Editor.Message.request('asset-db', 'query-url', uuid);
                        if (url) {
                            uuidSeekedMap.set(uuid, true);
                        }
                        else {
                            ret.push(simpleKey);
                        }
                    }
                }
            }
        }
        for (let arrayKey of this._arrayKeys) {
            if (json[arrayKey]) {
                let i = -1;
                for (let ele of json[arrayKey]) {
                    i++;
                    if (!ele)
                        continue;
                    let uuid = ele.__uuid__;
                    if (!uuid)
                        continue;
                    if (!uuidSeekedMap.has(uuid)) {
                        let url = await Editor.Message.request('asset-db', 'query-url', uuid);
                        if (url) {
                            uuidSeekedMap.set(uuid, true);
                        }
                        else {
                            ret.push(arrayKey + '[' + i + ']');
                        }
                    }
                }
            }
        }
        return ret;
    }
}
exports.SimpleParse = SimpleParse;
