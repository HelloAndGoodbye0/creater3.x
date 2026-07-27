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
exports.Utils = void 0;
const Path = require("path");
const fse = __importStar(require("fs-extra"));
class Utils {
    static findAllFile(filter) {
        let _mapDir = (path, fileList) => {
            let state = fse.statSync(path);
            if (state.isDirectory()) {
                let files = fse.readdirSync(path);
                for (let file of files) {
                    _mapDir(Path.join(path, file), fileList);
                }
            }
            else {
                if (filter(path)) {
                    fileList.push(path);
                }
                // let ext = Path.extname(path);
                // if (ext == '.prefab' || ext == '.scene') {
                //   fileList.push(path);
                // }
            }
        };
        let rootPath = Path.join(Editor.Project.path, 'assets');
        let fileList = [];
        _mapDir(rootPath, fileList);
        return fileList;
    }
}
exports.Utils = Utils;
