"use strict";
/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-08-03 16:09:41
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-08-03 16:25:07
 * @FilePath: \cocos_framework_base\extensions\publish_res\src\panels\default\configManager.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/**
 * 数据保存
 */
class ConfigManager {
    constructor() {
        this.configPath = path_1.default.join(Editor.Project.path, 'settings/publish_res.json');
    }
    static get Instance() {
        return ConfigManager._instance || (ConfigManager._instance = new ConfigManager());
    }
    /**
     * 获取数据
     * @returns
     */
    getData() {
        let data = {
            rootUrl: '',
            incrementalUpdate: false,
            generateZip: false,
            subGamePublish: false,
            selectAll: false,
            customerJoinUpdate: false,
            subGames: {},
            publishLan: {},
            selectAllLan: false,
            customerUrl: ""
        };
        if (!fs_1.default.existsSync(this.configPath)) {
            return data;
        }
        else {
            var jsonData = fs_1.default.readFileSync(this.configPath, 'utf-8');
            if (jsonData.length > 0) {
                data = JSON.parse(jsonData);
            }
            return data;
        }
    }
    /**
     * 保存数据
     * @param data
     */
    saveData(data) {
        fs_1.default.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }
}
exports.ConfigManager = ConfigManager;
