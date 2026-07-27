"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seek_where = void 0;
const Utils_1 = require("../Utils");
const Path = require("path");
const WPrefabParse_1 = require("./componentParse/WPrefabParse");
async function seek_where(uuid) {
    let fileList = Utils_1.Utils.findAllFile((path) => {
        let ext = Path.extname(path);
        return ext == '.prefab' || ext == '.scene';
    });
    let compressedUuid = Editor.Utils.UUID.compressUUID(uuid, false);
    console.log('compressedUuid', compressedUuid);
    let prefabParse = new WPrefabParse_1.PrefabParse();
    for (let path of fileList) {
        await prefabParse.testPrefab(path, uuid, compressedUuid);
    }
    let result = prefabParse.getResult();
    return result;
}
exports.seek_where = seek_where;
