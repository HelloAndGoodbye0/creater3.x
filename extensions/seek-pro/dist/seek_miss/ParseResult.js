"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseResult = exports.PrefabInfo = exports.NodeInfo = exports.ComInfo = void 0;
class ComInfo {
    constructor() {
        this.comName = '';
        this.propertyName = '';
    }
}
exports.ComInfo = ComInfo;
;
class NodeInfo {
    constructor() {
        this.nodePath = '';
        this.coms = [];
    }
}
exports.NodeInfo = NodeInfo;
;
class PrefabInfo {
    constructor() {
        this.PATH = '';
        this.URL = '';
        this.UUID = '';
        this.nodes = new Map();
    }
    async initURLAndUUID(fullPath) {
        this.PATH = fullPath;
        this.UUID = await Editor.Message.request('asset-db', 'query-uuid', this.PATH);
        this.URL = await Editor.Message.request('asset-db', 'query-url', this.UUID);
    }
    putNodesInfo(nodePath, comInfo) {
        if (!this.nodes.has(nodePath)) {
            let nodeInfo = new NodeInfo;
            nodeInfo.nodePath = nodePath;
            this.nodes.set(nodePath, nodeInfo);
        }
        let nodeInfo = this.nodes.get(nodePath);
        nodeInfo.coms.push(comInfo);
    }
    dump() {
        console.log('[seek miss] ' + this.URL);
        for (let ele of this.nodes) {
            console.log('[seek miss] ----->' + ele[0]);
            let v = ele[1];
            for (let comInfo of v.coms) {
                console.log('[seek miss] ------------>' + comInfo.comName + " => " + comInfo.propertyName);
            }
        }
    }
}
exports.PrefabInfo = PrefabInfo;
class ParseResult {
    constructor() {
        this._uuidMissedMap = new Map();
    }
    async getPrefabInfoByFullPath(fullPath) {
        if (!this._uuidMissedMap.has(fullPath)) {
            let prefabInfo = new PrefabInfo();
            await prefabInfo.initURLAndUUID(fullPath);
            this._uuidMissedMap.set(fullPath, prefabInfo);
        }
        return this._uuidMissedMap.get(fullPath);
    }
}
exports.ParseResult = ParseResult;
