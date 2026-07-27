"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seek_miss = void 0;
const Utils_1 = require("../Utils");
const Path = require("path");
const PrefabParse_1 = require("./componentParse/PrefabParse");
async function seek_miss(log = false) {
    let fileList = Utils_1.Utils.findAllFile((path) => {
        let ext = Path.extname(path);
        return ext == '.prefab' || ext == '.scene';
    });
    log && console.log('[seek miss]seek miss is working! Please Wait');
    let prefabParse = new PrefabParse_1.PrefabParse();
    for (let path of fileList) {
        // console.log('[seek-pro]正在查找： ' + path);
        await prefabParse.testPrefab(path);
    }
    //输出得到的结果
    let result = prefabParse.getResult();
    if (result._uuidMissedMap.size && log) {
        for (let ele of result._uuidMissedMap) {
            console.log("[seek miss]==================================================Split line==================================================");
            let prefabInfo = ele[1];
            prefabInfo.dump();
        }
    }
    return result;
}
exports.seek_miss = seek_miss;
