"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComParse = void 0;
class BaseComParse {
    constructor() {
        this.comName = 'component';
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
        return [];
    }
}
exports.BaseComParse = BaseComParse;
