"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticleParse = void 0;
const BaseComParse_1 = require("./BaseComParse");
class ParticleParse extends BaseComParse_1.BaseComParse {
    constructor() {
        super(...arguments);
        this.comName = 'cc.ParticleSystem';
    }
    /**
     * 解析预制件数组里的单个项目
     * @param json 预制件数组里的一个项目
     * @param uuidSeekedMap 已经找到了的uuid的名字
     * @param fatherJson 整个预制件的Json
     * @returns 返回丢失了uuid的属性的名字
    */
    async parse(json, uuidSeekedMap, fatherJson) {
        let ret = [];
        let _materials = json._materials;
        if (_materials && _materials[0]) {
            let uuid = _materials[0].__uuid__;
            if (uuid) {
                if (!uuidSeekedMap.has(uuid)) {
                    let url = await Editor.Message.request('asset-db', 'query-url', uuid);
                    if (url) {
                        uuidSeekedMap.set(uuid, true);
                    }
                    else {
                        ret.push('renderer.particleMaterial');
                    }
                }
            }
        }
        if (_materials && _materials[1]) {
            let uuid = _materials[1].__uuid__;
            if (uuid) {
                if (!uuidSeekedMap.has(uuid)) {
                    let url = await Editor.Message.request('asset-db', 'query-url', uuid);
                    if (url) {
                        uuidSeekedMap.set(uuid, true);
                    }
                    else {
                        ret.push('renderer.trailMaterial');
                    }
                }
            }
        }
        if (json.renderer && json.renderer.__id__) {
            let renderer = fatherJson[json.renderer.__id__];
            let _mesh = renderer._mesh;
            if (_mesh) {
                let uuid = _mesh.__uuid__;
                if (uuid) {
                    if (!uuidSeekedMap.has(uuid)) {
                        let url = await Editor.Message.request('asset-db', 'query-url', uuid);
                        if (url) {
                            uuidSeekedMap.set(uuid, true);
                        }
                        else {
                            ret.push('renderer.trailMaterial');
                        }
                    }
                }
            }
        }
        return ret;
    }
}
exports.ParticleParse = ParticleParse;
