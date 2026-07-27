"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefabParse = void 0;
const fse = __importStar(require("fs-extra"));
const ParseResult_1 = require("../../seek_miss/ParseResult");
const WSimpleParse_1 = require("./WSimpleParse");
const WCustomParse_1 = require("./WCustomParse");
const WParticleParse_1 = require("./WParticleParse");
class PrefabParse {
    constructor() {
        /**
         *
         */
        this._uuidMissedResult = new ParseResult_1.ParseResult();
        this._simpleTypes = new Map();
        this._extTypes = new Map();
        this._simpleParse = new WSimpleParse_1.SimpleParse();
        this._customParse = new WCustomParse_1.CustomParse();
        this._particleParse = new WParticleParse_1.ParticleParse();
        this._simpleTypes.set('cc.Sprite', true);
        this._simpleTypes.set('cc.Label', true);
        this._simpleTypes.set('cc.Button', true);
        this._simpleTypes.set('cc.MeshRenderer', true);
        this._simpleTypes.set('cc.SkinnedMeshRenderer', true);
        this._simpleTypes.set('cc.Animation', true);
        this._simpleTypes.set('cc.SkeletalAnimation', true);
        this._simpleTypes.set('cc.AudioSource', true);
        this._simpleTypes.set('cc.Graphics', true);
        this._simpleTypes.set('cc.RichText', true);
        this._simpleTypes.set('dragonBones.ArmatureDisplay', true);
        this._simpleTypes.set('cc.Billboard', true);
        this._simpleTypes.set('cc.Line', true);
        this._simpleTypes.set('cc.MotionStreak', true);
        this._simpleTypes.set('CCPropertyOverrideInfo', true);
        this._simpleTypes.set('cc.PrefabInfo', true);
        //粒子系统需要额外的处理
        // this._simpleTypes.set('cc.ParticleSystem', true);
        this._simpleTypes.set('cc.ParticleSystem2D', true);
        this._simpleTypes.set('cc.UIStaticBatch', true);
        this._simpleTypes.set('cc.SkinnedMeshBatchRenderer', true);
        this._simpleTypes.set('cc.BoxCollider', true);
        this._simpleTypes.set('sp.Skeleton', true);
        this._simpleTypes.set('cc.TiledMap', true);
        this._simpleTypes.set('cc.EditBox', true);
        this._simpleTypes.set('cc.VideoPlayer', true);
        this._extTypes.set('cc.Node', true);
        this._extTypes.set('cc.UITransform', true);
        this._extTypes.set('cc.RenderRoot2D', true);
        this._extTypes.set('cc.BlockInputEvents', true);
        this._extTypes.set('cc.DirectionalLight', true);
        this._extTypes.set('cc.SphereLight', true);
        this._extTypes.set('cc.SpotLight', true);
        this._extTypes.set('cc.SubContextView', true);
        this._extTypes.set('cc.WebView', true);
        this._extTypes.set('cc.RigidBody', true);
        this._extTypes.set('cc.Camera', true);
        this._extTypes.set('cc.Canvas', true);
        this._extTypes.set('cc.LabelOutline', true);
        this._extTypes.set('cc.LabelShadow', true);
        this._extTypes.set('cc.Layout', true);
        this._extTypes.set('cc.Widget', true);
        this._extTypes.set('cc.UIMeshRenderer', true);
        this._extTypes.set('cc.Toggle', true);
        this._extTypes.set('cc.ToggleContainer', true);
        this._extTypes.set('cc.UIOpacity', true);
        this._extTypes.set('cc.TargetInfo', true);
    }
    /**
     * @zh 检测预制件里是否会有丢失的uuid的引用,
     * @param prefabPath 预制件(场景)的完整路径
     */
    async testPrefab(prefabPath, fullUuid, compressedUuid) {
        let string = fse.readFileSync(prefabPath, 'utf-8');
        let fatherJson = JSON.parse(string);
        for (let nodeJson of fatherJson) {
            let type = nodeJson.__type__;
            if (type != 'cc.Node')
                continue;
            let components = nodeJson._components;
            if (!components || components.length <= 0)
                continue;
            for (let each of components) {
                if (each && each.__id__) {
                    let comJson = fatherJson[each.__id__];
                    if (this._extTypes.has(comJson.__type__))
                        continue;
                    let parse;
                    if (this._simpleTypes.has(comJson.__type__)) {
                        parse = this._simpleParse;
                    }
                    else if (comJson.__type__ == 'cc.ParticleSystem') {
                        parse = this._particleParse;
                    }
                    else {
                        // parse = this._simpleParse;
                        parse = this._customParse;
                    }
                    let ret = await parse.parse(comJson, fatherJson, fullUuid, compressedUuid);
                    if (ret.length) {
                        let prefabInfo = await this._uuidMissedResult.getPrefabInfoByFullPath(prefabPath);
                        let fullNodePath = this.findFullNodePath(fatherJson, nodeJson);
                        let comInfo = new ParseResult_1.ComInfo();
                        comInfo.comName = parse.comName;
                        comInfo.propertyName = ret.join(', ');
                        prefabInfo.putNodesInfo(fullNodePath, comInfo);
                    }
                }
            }
        }
    }
    /**
     *
     * @param json prefab的数组json字符串
     * @param element json字符串里的某一项组件
     * @returns 这个组件在预制件里的完整路径
     */
    findFullNodePath(json, nodeJson) {
        let nodeNames = [];
        nodeNames.push(nodeJson._name);
        while (nodeJson._parent) {
            nodeJson = json[nodeJson._parent.__id__];
            nodeNames.push(nodeJson._name);
        }
        nodeNames = nodeNames.reverse();
        return nodeNames.join('/');
    }
    /**
     * 返回测试后所有的丢失了的uuid的路径
     */
    getResult() {
        return this._uuidMissedResult;
    }
}
exports.PrefabParse = PrefabParse;
