/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-08-03 16:09:41
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-08-03 16:25:07
 * @FilePath: \cocos_framework_base\extensions\publish_res\src\panels\default\configManager.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


import path from "path";
import fs from "fs";

export type ConfigData = {
    rootUrl: string,
    incrementalUpdate: boolean,
    generateZip: boolean,
    subGamePublish: boolean,
    selectAll: boolean,
    customerJoinUpdate:boolean,
    subGames: {
        [key: string]: boolean
    },
    publishLan:{
        [key: string]: boolean
    },
    selectAllLan:boolean,
    customerUrl:string
}

/**
 * 数据保存
 */
export class ConfigManager {

    private configPath: string = path.join(Editor.Project.path, 'settings/publish_res.json');
    private static _instance: ConfigManager;
    public static get Instance() {
        return ConfigManager._instance || (ConfigManager._instance = new ConfigManager());
    }
    /**
     * 获取数据
     * @returns 
     */
    getData(): ConfigData {

        let data: ConfigData = {
            rootUrl: '',
            incrementalUpdate: false,
            generateZip: false,
            subGamePublish: false,
            selectAll: false,
            customerJoinUpdate:false,
            subGames: {},
            publishLan:{},
            selectAllLan:false,
            customerUrl:""
        }
        if (!fs.existsSync(this.configPath)) {
            return data
        }
        else
        {
            var jsonData = fs.readFileSync(this.configPath, 'utf-8');
            if(jsonData.length>0)
            {
                data = JSON.parse(jsonData) as ConfigData;
            }
           
            return data;
            
        }
       

    }
    /**
     * 保存数据
     * @param data 
     */
    saveData(data: ConfigData) {

        fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2));
    }
}