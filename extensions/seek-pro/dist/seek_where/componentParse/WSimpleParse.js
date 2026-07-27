"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleParse = void 0;
const WBaseComParse_1 = require("./WBaseComParse");
class SimpleParse extends WBaseComParse_1.BaseComParse {
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
            //cc.PrefabInfo
            'asset',
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
     * @param fatherJson 整个预制件的Json
     * @param fullUuid 完整的Uuid
     * @param compressedUuid 压缩后的uuid
     * @returns 返回丢失了uuid的属性的名字
   */
    async parse(json, fatherJson, fullUuid, compressedUuid) {
        this.comName = json.__type__;
        let ret = [];
        //检测单个Key
        for (let simpleKey of this._simpleKeys) {
            if (json[simpleKey]) {
                let uuid = json[simpleKey].__uuid__;
                if (uuid) {
                    if (uuid.includes(fullUuid) || uuid.includes(compressedUuid)) {
                        ret.push(simpleKey);
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
                    if (uuid.includes(fullUuid) || uuid.includes(compressedUuid)) {
                        ret.push(arrayKey + '[' + i + ']');
                    }
                }
            }
        }
        return ret;
    }
}
exports.SimpleParse = SimpleParse;
