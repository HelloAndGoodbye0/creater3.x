"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = __importStar(require("path"));
const fs_1 = __importDefault(require("fs"));
const vue_1 = require("vue");
const configManager_1 = require("./configManager");
const utils_1 = require("./utils");
const electron_1 = __importDefault(require("electron"));
const child_process_1 = __importDefault(require("child_process"));
const panelDataMap = new WeakMap();
/**
 * md5文件名称
 */
const versionFileName = "version.txt";
/**
 * 主包多语言配置文件
 */
const versionLanFileName = "version_lan.txt";
/**
 * customer 版本清单文件
 */
const csVersionFileName = "version_customer.txt";
/**
 * 项目目录
 */
const projectPath = Editor.Project.path;
/**
 * 发布目录名称
 */
const publishDirName = "publish";
/**
 * 发布目录
 */
const publishPath = path_1.default.join(projectPath, publishDirName);
/**
 * 远程主包配置文件
 */
const remoteConfigPath = `${publishPath}/remoteConfig.json`;
/**
 * 子游戏版本目录名称
 */
const gameDir = "remote";
/**
 * 子游戏配置文件
 */
const subGameConfigPath = `${publishPath}/gameConfig.json`;
/**
 * 当前平台  mac 发布ios windows 发布android
 */
let platform = "android";
if (!fs_1.default.existsSync(publishPath)) {
    fs_1.default.mkdirSync(publishPath);
}
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
    },
    methods: {
        hello() {
            console.log('[cocos-panel-html.default]: hello');
        },
    },
    ready() {
        if (this.$.app) {
            const app = (0, vue_1.createApp)({
                methods: {
                    /**
                     * 打开发布目录
                     */
                    openPublishDir() {
                        electron_1.default.shell.openPath(publishPath);
                    },
                    /**
                     * 构建按钮点击
                     */
                    onBuild() {
                        let exePath = path_1.default.join(Editor.App.path, '../../CocosCreator.exe');
                        let command = `${exePath} --project  ${Editor.Project.path} --build platform=${platform}`;
                        // console.log(command)
                        let cmd = `start cmd /k "${command}`;
                        child_process_1.default.exec(cmd);
                    },
                    /**
                     * 发布按钮点击
                     */
                    onPublish() {
                        // console.log('根url===',this.rootUrl);
                        // console.log('是否增量更新===',this.incrementalUpdate)
                        // console.log('生成zip===',this.generateZip)
                        // console.log('发布过滤===',this.subGamePublish)
                        // console.log('选择所有子游戏===',this.selectAll)
                        //发布主包
                        if (this.rootUrl.length == 0) {
                            Editor.Dialog.warn("请填写热更新根目录");
                            return;
                        }
                        console.log('发布开始:' + platform);
                        let publicDir = path_1.default.join(projectPath, `build/${platform}/data`);
                        console.log('发布目录:' + publicDir);
                        if (!fs_1.default.existsSync(publicDir)) {
                            Editor.Dialog.warn(`${platform}还没有构建,请先构建`);
                            return;
                        }
                        var mainVersion = utils_1.myUtils.getSvnVersion(`${projectPath}/assets`);
                        this.publishMain(mainVersion.toString());
                        //发布子游戏
                        let subGameInfo = {
                            baseUrl: this.rootUrl,
                            subgames: {},
                            icons: {}
                        };
                        let gamesIDs = []; //保存要发布子游戏id
                        if (this.subGamePublish) {
                            for (let key in this.subGames) {
                                const b = this.subGames[key];
                                if (b) {
                                    this.publishSubGame(key, mainVersion, subGameInfo);
                                    gamesIDs.push(key);
                                }
                            }
                        }
                        //发布icons
                        this.publishIcons(mainVersion, subGameInfo);
                        //写入子游戏配置
                        utils_1.myUtils.writeFile(subGameConfigPath, JSON.stringify(subGameInfo));
                        //增量主版本
                        // console.log("增量主版本",this.incrementalUpdate)
                        // console.log("选择",this.incrementSelect)
                        if (this.incrementalUpdate) {
                            var basePath = this.incrementOption[this.incrementSelect]; //要对比的基础版本路径
                            this.buildIncremental(mainVersion, basePath, gamesIDs);
                        }
                        //发布大厅模块多语言
                        this.publishLobbyLan(mainVersion);
                        //判断是否配置v6_path 如果配置了  说明构建的时候就从v6合并了子游戏信息
                        let v6_path = this.getV6Config();
                        if (v6_path && v6_path.length > 0) {
                            console.log('检测到v6_path配置，合并子游戏信息', v6_path);
                            //合并v6 publish下面的gameConfig.json中子游戏的配置
                            let v6GameJsonPath = path_1.default.join(v6_path, `publish/gameConfig.json`);
                            let nowGameJsonPath = path_1.default.join(projectPath, `publish/gameConfig.json`);
                            this.mergeGameConfig(v6GameJsonPath, nowGameJsonPath);
                            //去v6最新构建的verison_xx 复制remote下面的子游戏资源
                            this.copyGameRes(v6_path, mainVersion);
                            console.log('v6_path合并子游戏信息完成');
                        }
                        //生成zip
                        if (this.generateZip) {
                            //本次的版本文件夹
                            var versionFolder = `${publishPath}/${platform}/version_${mainVersion}`;
                            utils_1.myUtils.zipFolder(versionFolder, undefined, `${versionFolder}.zip`);
                        }
                        console.log('发布结束');
                        Editor.Dialog.info("发布结束");
                    },
                    /**
                     * 获取项目下面v6_path配置
                     */
                    getV6Config() {
                        let buildConfigJsonPath = path_1.default.join(projectPath, 'buildConfig.json');
                        if (fs_1.default.existsSync(buildConfigJsonPath)) {
                            let buildConfigData = JSON.parse(fs_1.default.readFileSync(buildConfigJsonPath, 'utf-8'));
                            return buildConfigData === null || buildConfigData === void 0 ? void 0 : buildConfigData.v6_path;
                        }
                        else {
                            return "";
                        }
                    },
                    /**
                     * 从v6发布的最新版本下面的remote目录复制子游戏资源到本次发布的remote目录
                     */
                    copyGameRes(v6_path, mainVersion) {
                        console.log("copyGameRes start");
                        let v6RemoteJsonPath = path_1.default.join(v6_path, `publish/remoteConfig.json`);
                        if (fs_1.default.existsSync(v6RemoteJsonPath)) {
                            let v6RemoteConfig = JSON.parse(fs_1.default.readFileSync(v6RemoteJsonPath, 'utf-8'));
                            let scriptVersion = v6RemoteConfig.scriptVersion;
                            //v6 最新版本的文件夹
                            let v6_remote = path_1.default.join(v6_path, `publish/${platform}/version_${scriptVersion}/remote`);
                            //当前发布的版本文件夹
                            let now_remote = path_1.default.join(projectPath, `publish/${platform}/version_${mainVersion}/remote`);
                            if (fs_1.default.existsSync(v6_remote)) {
                                if (!fs_1.default.existsSync(now_remote)) {
                                    fs_1.default.mkdirSync(now_remote);
                                }
                                console.log(`copy ${v6_remote}===> ${now_remote}`);
                                this.copyRemote(v6_remote, now_remote);
                            }
                            else {
                                console.log(`${v6_remote} not exists`);
                            }
                        }
                        else {
                            console.log('v6 publish/remoteConfig.json不存在');
                        }
                        console.log("copyGameRes finish");
                    },
                    /**
                     * 复制remote资源
                     * @param {*} srcRemote
                     * @param {*} destRemote
                     */
                    copyRemote(srcRemote, destRemote) {
                        //复制srcRemote目录下面的所有文件夹到destRemote目录下面 除了icons_开头的文件夹
                        let files = fs_1.default.readdirSync(srcRemote);
                        files.forEach((file) => {
                            let srcFile = path_1.default.join(srcRemote, file);
                            let destFile = path_1.default.join(destRemote, file);
                            if (fs_1.default.statSync(srcFile).isDirectory()) {
                                if (file.startsWith('icons_')) {
                                    return;
                                }
                                //是多语言文件夹
                                if (file.includes("_")) {
                                    let data = file.split('_');
                                    let lan = data.length == 2 ? data[1] : `${data[1]}_${data[2]}`;
                                    if (this.publishLan[lan]) //多语言在选中状态
                                     {
                                        if (!fs_1.default.existsSync(destFile)) {
                                            fs_1.default.mkdirSync(destFile);
                                        }
                                        console.log(`copy ${srcFile} ===> ${destFile}`);
                                        this.copyRemote(srcFile, destFile);
                                    }
                                }
                                else //不是多语言文件夹
                                 {
                                    if (!fs_1.default.existsSync(destFile)) {
                                        fs_1.default.mkdirSync(destFile);
                                    }
                                    console.log(`copy ${srcFile} ===> ${destFile}`);
                                    this.copyRemote(srcFile, destFile);
                                }
                            }
                            else {
                                fs_1.default.copyFileSync(srcFile, destFile);
                            }
                        });
                    },
                    /**
                     * 合并gameConfig.json
                     * @param v6GameJsonPath
                     * @param dstGameJsonPath
                     */
                    mergeGameConfig(v6GameJsonPath, dstGameJsonPath) {
                        console.log("merge gameConfig.json start");
                        if (!fs_1.default.existsSync(v6GameJsonPath) || !fs_1.default.existsSync(dstGameJsonPath)) {
                            console.log("v6 gameConfigJson or dstGameJson not exists");
                            return;
                        }
                        let v6GameConfig = JSON.parse(fs_1.default.readFileSync(v6GameJsonPath, 'utf-8'));
                        let dstGameConfig = JSON.parse(fs_1.default.readFileSync(dstGameJsonPath, 'utf-8'));
                        dstGameConfig.subgames = v6GameConfig.subgames;
                        fs_1.default.writeFileSync(dstGameJsonPath, JSON.stringify(dstGameConfig));
                        console.log("merge gameConfig.json finish", dstGameJsonPath);
                    },
                    /**
                     * 发布大厅模块多语言
                     * @param scriptVersion
                     */
                    publishLobbyLan(scriptVersion) {
                        console.log('发布大厅模块多语言 start');
                        let assetsRootPath = "";
                        if (platform == "android") {
                            assetsRootPath = path_1.default.join(projectPath, 'build/android/data');
                        }
                        else if (platform == "ios") {
                            assetsRootPath = path_1.default.join(projectPath, 'build/ios/data');
                        }
                        //版本文件夹
                        var versionFolder = `${publishPath}/${platform}/version_${scriptVersion}`;
                        //build目录下面的remote目录
                        let buildRemoteFolder = path_1.default.join(assetsRootPath, gameDir);
                        //发布目录下面的assets文件夹
                        let assetsFolder = path_1.default.join(versionFolder, 'assets');
                        //发布目录下面的remote文件夹
                        //let remoteFolder = path.join(versionFolder, gameDir)
                        let bRFolder = utils_1.myUtils.getDirList(buildRemoteFolder); //build目录下面的remote目录
                        let bRLanMap = new Map();
                        bRFolder.forEach(folder => {
                            // console.log("folder",folder)
                            let index = folder.indexOf("_");
                            if (index > -1) {
                                let lan = folder.substring(index + 1);
                                let id = folder.substring(0, index);
                                if (parseInt(id) < 999) {
                                    let data = bRLanMap.get(lan);
                                    if (data == null) {
                                        data = [];
                                    }
                                    data.push(folder);
                                    bRLanMap.set(lan, data);
                                }
                            }
                        });
                        let aFolder = utils_1.myUtils.getDirList(assetsFolder); //发布assets文件夹下面的文件夹
                        //let rfolder = myUtils.getDirList(remoteFolder)//发布remote文件夹下面的文件夹
                        let lanFolders = new Map();
                        let packageLan = []; //包内语言列表
                        aFolder.forEach(folder => {
                            // console.log("folder",folder)
                            let index = folder.indexOf("_");
                            if (index > -1) {
                                let lan = folder.substring(index + 1);
                                let data = lanFolders.get(lan);
                                if (data == null) {
                                    data = [];
                                }
                                let folderPath = path_1.default.join(assetsFolder, folder);
                                // console.log("folderPath",folderPath)
                                data.push(folderPath);
                                lanFolders.set(lan, data);
                                packageLan.push(lan);
                            }
                        });
                        //发布一个语言的版本清单文件
                        let publishFun = (lan) => {
                            console.log('发布=>', lan);
                            let folderPaths = lanFolders.get(lan);
                            let lanVersion = {
                                scriptVersion: "0",
                                files: {}
                            };
                            if (folderPaths && folderPaths.length > 0) {
                                let allMD5 = ""; //所有的md5
                                for (let i = 0; i < folderPaths.length; i++) {
                                    let folderPath = folderPaths[i];
                                    let fileinfo = fs_1.default.readdirSync(folderPath);
                                    for (let j = 0; j < fileinfo.length; j++) {
                                        let file = fileinfo[j];
                                        let filePath = path_1.default.join(folderPath, file);
                                        let index = filePath.indexOf("assets");
                                        if (index == -1) {
                                            index = filePath.indexOf("remote");
                                        }
                                        let key = filePath.substring(index).replace(/\\/g, "/");
                                        let stat = fs_1.default.statSync(filePath);
                                        if (stat.isDirectory()) {
                                            //压缩文件夹
                                            const folderMd5 = utils_1.myUtils.getFolderFilesMd5(filePath);
                                            utils_1.myUtils.zipFolder(filePath, file, `${filePath}.zip`);
                                            let size = utils_1.myUtils.getFileSize(`${filePath}.zip`);
                                            let md5 = utils_1.myUtils.getStringMD5(folderMd5);
                                            lanVersion.files[`${key}.zip`] = {
                                                size: size,
                                                md5: md5
                                            };
                                            utils_1.myUtils.deleteFolderRecursive(filePath);
                                            allMD5 += md5;
                                        }
                                        else { //文件
                                            let size = utils_1.myUtils.getFileSize(filePath);
                                            let md5 = utils_1.myUtils.getFileMd5(filePath);
                                            lanVersion.files[`${key}`] = {
                                                size: size,
                                                md5: md5
                                            };
                                            allMD5 += md5;
                                        }
                                    }
                                }
                                lanVersion.scriptVersion = utils_1.myUtils.getStringMD5(allMD5);
                                let lanVersionFilePath = path_1.default.join(versionFolder, `version_${lan}.txt`);
                                fs_1.default.writeFileSync(lanVersionFilePath, JSON.stringify(lanVersion));
                            }
                            else {
                                console.log(`没找到====>${lan}资源`);
                            }
                        };
                        //遍历this.publishIcons
                        for (let key in this.publishLan) {
                            const b = this.publishLan[key];
                            if (b) {
                                publishFun(key);
                            }
                        }
                        //保存本包内置语言的版本文件
                        let packaheLanConfig = {};
                        for (let j = 0; j < packageLan.length; j++) {
                            let lan = packageLan[j];
                            let lanFilePath = path_1.default.join(versionFolder, `version_${lan}.txt`);
                            if (fs_1.default.existsSync(lanFilePath)) {
                                let data = JSON.parse(fs_1.default.readFileSync(lanFilePath, "utf-8"));
                                packaheLanConfig[lan] = data;
                            }
                        }
                        //复制到项目的version_lan.txt
                        var versionLanText = `${projectPath}/assets/resources/${versionLanFileName}`;
                        fs_1.default.writeFileSync(versionLanText, JSON.stringify(packaheLanConfig));
                        //找到构建后的version_lan文件
                        let versionLanMeta = `${Editor.Project.path}/assets/resources/${versionLanFileName}.meta`;
                        if (fs_1.default.existsSync(versionLanMeta)) {
                            let uuid = JSON.parse(fs_1.default.readFileSync(versionLanMeta, "utf-8")).uuid;
                            var dst = `${Editor.Project.path}/build/${platform}/data/assets/resources`;
                            const srcFiles = utils_1.myUtils.listFiles(dst);
                            for (let i = srcFiles.length - 1; i >= 0; i--) {
                                var fileName = srcFiles[i];
                                if (fileName.indexOf(uuid) >= 0) {
                                    var oldData = JSON.parse(fs_1.default.readFileSync(fileName, 'utf-8'));
                                    oldData[5][0][2] = JSON.stringify(packaheLanConfig);
                                    fs_1.default.writeFileSync(fileName, JSON.stringify(oldData));
                                    break;
                                }
                            }
                        }
                        else {
                            console.log("version_lan.meta 不存在");
                        }
                        console.log('发布大厅模块多语言 end');
                    },
                    /**
                     * 增量更新
                     * @param mainVersion
                     * @param basePath
                     * @param gamesIDs
                     */
                    buildIncremental(mainVersion, basePath, gamesIDs) {
                        const regex = /version_(.*)/;
                        const match = regex.exec(basePath);
                        var baseVersion = "";
                        if (match) {
                            baseVersion = match[1];
                        }
                        else {
                            console.log("增量更新失败，未找到版本号");
                            return;
                        }
                        var directoryPath = `${publishPath}/${platform}/version_${mainVersion}`;
                        var newConfig = `${directoryPath}/${versionFileName}`; //新版本配置
                        var oldConfig = `${basePath}/${versionFileName}`; //旧版本配置
                        //旧数据
                        var oldConfigData = JSON.parse(fs_1.default.readFileSync(oldConfig, 'utf-8'));
                        //新数据
                        var newConfigData = JSON.parse(fs_1.default.readFileSync(newConfig, 'utf-8'));
                        //判断新旧数据的差异文件
                        var diffFiles = [];
                        for (const key in newConfigData.files) {
                            const newFile = newConfigData.files[key];
                            const oldFile = oldConfigData.files[key];
                            if (!oldFile || newFile.md5 != oldFile.md5) {
                                // console.log("差异文件",key)
                                diffFiles.push(key);
                            }
                        }
                        // customer增量
                        const oldCustomerConfig = `${basePath}/${csVersionFileName}`; //老版本customer配置
                        const newCustomerConfig = `${directoryPath}/${csVersionFileName}`; //新版本customer配置
                        if (fs_1.default.existsSync(newCustomerConfig)) {
                            let newCustomerConfigData = JSON.parse(fs_1.default.readFileSync(newCustomerConfig, 'utf-8'));
                            let oldCustomerConfigData = fs_1.default.existsSync(oldCustomerConfig) ? JSON.parse(fs_1.default.readFileSync(oldCustomerConfig, 'utf-8')) : { files: {} };
                            for (const key in newCustomerConfigData.files) {
                                const newFile = newCustomerConfigData.files[key];
                                const oldFile = oldCustomerConfigData.files[key];
                                if (!oldFile || newFile.md5 != oldFile.md5) {
                                    // console.log("差异文件",key)
                                    diffFiles.push(key);
                                }
                            }
                        }
                        //创建差异文件夹
                        var destDir = `${publishPath}/${platform}/version_${baseVersion}_${mainVersion}`;
                        utils_1.myUtils.mkdirSync(destDir);
                        //复制差异文件
                        // console.log("差异文件数量",diffFiles.length)
                        diffFiles.forEach((o) => {
                            var src = path_1.default.join(directoryPath, o);
                            var target = path_1.default.join(destDir, o);
                            var temp = path_1.default.dirname(target);
                            utils_1.myUtils.mkdirSync(temp);
                            fs_1.default.copyFileSync(src, target);
                        });
                        //复制最新配置文件
                        fs_1.default.copyFileSync(newConfig, `${destDir}/${versionFileName}`);
                        //子游戏增量
                        if (gamesIDs.length > 0) {
                            gamesIDs.forEach((game) => {
                                this.buildSubGameIncremental(game, mainVersion, baseVersion);
                            });
                        }
                        //zip 
                        if (this.generateZip) {
                            utils_1.myUtils.zipFolder(destDir, undefined, `${destDir}.zip`);
                        }
                        console.log(`增量完成=====》${baseVersion}_${mainVersion}`);
                    },
                    /**
                     * 差异子游戏
                     * @param game
                     * @param mainVersion
                     * @param baseVersion
                     */
                    buildSubGameIncremental(game, mainVersion, baseVersion) {
                        var newGameDir = `${publishPath}/${platform}/version_${mainVersion}/${gameDir}/${game}`; //新生成子游戏目录
                        var baseDir = `${publishPath}/${platform}/version_${baseVersion}/${gameDir}/${game}`; //基础子游戏目录
                        var newConfig = `${newGameDir}/${versionFileName}`; //新版本配置
                        var oldConfig = `${baseDir}/${versionFileName}`; //旧版本配置
                        //旧数据
                        const oldConfigData = JSON.parse(fs_1.default.readFileSync(oldConfig, 'utf-8'));
                        //新数据
                        const newConfigData = JSON.parse(fs_1.default.readFileSync(newConfig, 'utf-8'));
                        //判断新旧数据的差异文件
                        var diffFiles = [];
                        for (const key in newConfigData.files) {
                            const newFile = newConfigData.files[key];
                            const oldFile = oldConfigData.files[key];
                            if (!oldFile || newFile.md5 != oldFile.md5) {
                                // console.log("差异文件",key)
                                diffFiles.push(key);
                            }
                        }
                        // 多语言差异文件
                        if (newConfigData.lan) {
                            for (let key in newConfigData.lan) {
                                const newFiles = newConfigData.lan[key].files;
                                const oldFiles = oldConfigData.lan ? oldConfigData.lan[key].files : {};
                                for (const key in newFiles) {
                                    const newFile = newFiles[key];
                                    const oldFile = oldFiles[key];
                                    if (!oldFile || newFile.md5 != oldFile.md5) {
                                        diffFiles.push(key);
                                    }
                                }
                            }
                        }
                        //创建差异文件夹
                        var destDir = `${publishPath}/${platform}/version_${baseVersion}_${mainVersion}/${gameDir}/${game}`;
                        utils_1.myUtils.mkdirSync(destDir);
                        //复制差异文件
                        // console.log("差异文件数量",diffFiles.length)
                        let srcDir = `${publishPath}/${platform}/version_${mainVersion}`;
                        diffFiles.forEach((o) => {
                            var src = path_1.default.join(srcDir, o);
                            var target = path_1.default.join(destDir, o);
                            var temp = path_1.default.dirname(target);
                            utils_1.myUtils.mkdirSync(temp);
                            // console.log("复制文件",src,target)
                            fs_1.default.copyFileSync(src, target);
                        });
                        //复制最新配置文件
                        fs_1.default.copyFileSync(newConfig, `${destDir}/${versionFileName}`);
                    },
                    /**
                     * 发布主包
                     * @param scriptVersion
                     */
                    publishMain(scriptVersion) {
                        let assetsRootPath = path_1.default.join(projectPath, `build/${platform}/data`);
                        let versionData = {
                            scriptVersion: scriptVersion.toString(),
                            files: {}
                        };
                        // 构建后默认资源目录
                        var assetsPaths = ['src', 'assets'];
                        //本次的版本文件夹
                        var versionFolder = path_1.default.join(publishPath, `${platform}/version_${scriptVersion}`);
                        utils_1.myUtils.deleteFolderRecursive(versionFolder);
                        utils_1.myUtils.mkdirSync(versionFolder);
                        //复制src assets 文件夹到本次版本文件夹
                        assetsPaths.forEach((o) => {
                            var src = path_1.default.join(assetsRootPath, o);
                            var target = path_1.default.join(versionFolder, o);
                            utils_1.myUtils.copyFolderSync(src, target);
                        });
                        //获取项目下面的配置，是否主要加入热更新清单
                        let isMainJoinUpdate = true; //是否主要加入热更新清单
                        //assets下面忽略发布的bundles名称数组
                        let ignoreBundlesInAssets = [];
                        let buildConfigJsonPath = path_1.default.join(projectPath, 'buildConfig.json');
                        if (fs_1.default.existsSync(buildConfigJsonPath)) {
                            let builConfigStr = fs_1.default.readFileSync(buildConfigJsonPath, 'utf-8');
                            try {
                                let buildConfig = JSON.parse(builConfigStr);
                                isMainJoinUpdate = buildConfig.mainJoinUpdate;
                                if ((buildConfig === null || buildConfig === void 0 ? void 0 : buildConfig.ignoreBundlesInAssets.length) > 0) {
                                    ignoreBundlesInAssets = buildConfig.ignoreBundlesInAssets;
                                }
                            }
                            catch (e) {
                                console.log("buildConfig.json 解析失败");
                            }
                        }
                        //删除版本文件夹下面的主包
                        let mainFolder = path_1.default.join(versionFolder, "assets/main");
                        if (!isMainJoinUpdate && fs_1.default.existsSync(mainFolder)) {
                            utils_1.myUtils.deleteFolderRecursive(mainFolder);
                            console.log("删除main", mainFolder);
                        }
                        //删除版本文件夹下面assets下面的ignoreBundles
                        if (ignoreBundlesInAssets && ignoreBundlesInAssets.length > 0) {
                            for (let i = 0; i < ignoreBundlesInAssets.length; i++) {
                                let dirPath = path_1.default.join(versionFolder, `assets/${ignoreBundlesInAssets[i]}`);
                                if (fs_1.default.existsSync(dirPath)) {
                                    utils_1.myUtils.deleteFolderRecursive(dirPath);
                                    console.log("删除ignoreBundles", dirPath);
                                }
                            }
                        }
                        //resources 66移动到外面customer
                        const customerFolders = ["66", "resources"];
                        const customerDir = path_1.default.join(versionFolder, "customer");
                        if (this.customerJoinUpdate && this.customerurl && this.customerurl.length > 0) //新的customer 发布流程
                         {
                            if (!fs_1.default.existsSync(customerDir)) {
                                fs_1.default.mkdirSync(customerDir);
                            }
                            customerFolders.forEach((o) => {
                                var src = path_1.default.join(`${versionFolder}/assets`, o);
                                var target = path_1.default.join(customerDir, o);
                                utils_1.myUtils.copyFolderSync(src, target);
                                utils_1.myUtils.deleteFolderRecursive(src);
                            });
                        }
                        //把assets子文件夹下面的import文件夹压缩成zip
                        let assetsFolder = `${versionFolder}/assets`;
                        var dirList = utils_1.myUtils.getDirList(assetsFolder);
                        var verisonFilePath = `${Editor.Project.path}/assets/resources/${versionFileName}.meta`;
                        let versionFileUUID = JSON.parse(fs_1.default.readFileSync(verisonFilePath).toString()).uuid;
                        //多语的version_txt
                        let versionLanMeta = `${Editor.Project.path}/assets/resources/${versionLanFileName}.meta`;
                        let versionLanUUID = JSON.parse(fs_1.default.readFileSync(versionLanMeta).toString()).uuid;
                        //customer配置
                        let customerMeta = `${Editor.Project.path}/assets/resources/${csVersionFileName}.meta`;
                        let customerUUID = JSON.parse(fs_1.default.readFileSync(customerMeta).toString()).uuid;
                        let tempMd5 = {};
                        let dir = dirList.pop();
                        while (dir) {
                            let index = dir.indexOf("_");
                            if (index == -1 || dir.startsWith("icons")) //不是多语言包
                             {
                                var src = path_1.default.join(assetsFolder, `${dir}/import`);
                                if (fs_1.default.existsSync(src)) {
                                    const folderMd5 = utils_1.myUtils.getFolderFilesMd5(src);
                                    tempMd5[`${src}.zip`] = utils_1.myUtils.getStringMD5(folderMd5);
                                    utils_1.myUtils.zipFolder(src, "import", `${src}.zip`, (fileName) => { return fileName.indexOf(versionFileUUID) == -1 && fileName.indexOf(versionLanUUID) == -1 && fileName.indexOf(customerUUID) == -1; });
                                    utils_1.myUtils.deleteFolderRecursive(src);
                                }
                                src = path_1.default.join(assetsFolder, `${dir}/native`);
                                if (fs_1.default.existsSync(src)) {
                                    const folderMd5 = utils_1.myUtils.getFolderFilesMd5(src);
                                    tempMd5[`${src}.zip`] = utils_1.myUtils.getStringMD5(folderMd5);
                                    utils_1.myUtils.zipFolder(src, "native", `${src}.zip`);
                                    utils_1.myUtils.deleteFolderRecursive(src);
                                }
                            }
                            else //多语言包 判断是否是选中的多语言包
                             {
                                let lan = dir.substring(index + 1);
                                if (!this.publishLan[lan]) {
                                    let folderPath = path_1.default.join(assetsFolder, dir);
                                    utils_1.myUtils.deleteFolderRecursive(folderPath);
                                }
                            }
                            dir = dirList.pop();
                        }
                        //获取文件夹
                        var assetsList = [];
                        assetsPaths.forEach((o) => {
                            assetsList.push(...utils_1.myUtils.listFiles(path_1.default.join(versionFolder, o)));
                        });
                        //过滤掉assetsList中  66、resources bundle包
                        if (!this.customerJoinUpdate) {
                            assetsList = assetsList.filter(asset => {
                                var url = asset;
                                if (platform == "android") {
                                    return !(url.indexOf("assets\\66") >= 0 || url.indexOf("assets\\resources") >= 0);
                                }
                                else {
                                    return !(url.indexOf("assets/66") >= 0 || url.indexOf("assets/resources") >= 0);
                                }
                            });
                        }
                        //填充files
                        assetsList.forEach((assetStat) => {
                            var md5 = "";
                            let filePath = assetStat;
                            if (tempMd5[filePath]) {
                                md5 = tempMd5[filePath];
                            }
                            else {
                                md5 = utils_1.myUtils.getFileMd5(filePath);
                            }
                            var assetUrl = path_1.default.relative(assetsRootPath, filePath);
                            assetUrl = assetUrl.replace(/\\/g, '/');
                            assetUrl = encodeURI(assetUrl);
                            assetUrl = assetUrl.replace(`../../../${publishDirName}/${platform}/version_${scriptVersion}/`, ``);
                            //主包过滤掉多语言的文件
                            if (assetUrl.indexOf("_") == -1 || assetUrl.startsWith("assets/icons_")) {
                                versionData.files[assetUrl] = {
                                    size: utils_1.myUtils.getFileSize(filePath),
                                    md5: md5,
                                };
                            }
                        });
                        //写入本次的版本配置到版本文件夹
                        var verisonFile = `${versionFolder}/${versionFileName}`;
                        utils_1.myUtils.writeFile(verisonFile, JSON.stringify(versionData));
                        //复制当前版本到项目目录
                        var projectVersionFolder = `${projectPath}/assets/resources/${versionFileName}`;
                        fs_1.default.copyFileSync(verisonFile, projectVersionFolder);
                        //有上一次的数据 拿上一次的 forcedBinaryVersions banchannels marketUrl覆盖最新的
                        var localConfig = utils_1.myUtils.readFile(remoteConfigPath);
                        //@ts-ignore
                        let remoteData = {};
                        if (localConfig == null) {
                            //写入最新的版本号到配置
                            remoteData = {
                                scriptVersion: scriptVersion,
                                baseUrl: this.rootUrl,
                                configFile: versionFileName,
                                channels: [],
                                supportBinarys: [],
                                forcedBinaryVersions: [],
                                marketUrl: new Map(),
                                banchannels: [],
                                csVersion: "",
                                csUrl: this.customerUrl
                            };
                        }
                        else {
                            //更新配置文件
                            remoteData = JSON.parse(localConfig);
                            remoteData.scriptVersion = scriptVersion;
                            remoteData.baseUrl = this.rootUrl;
                            remoteData.csUrl = this.customerUrl;
                            remoteData.configFile = versionFileName;
                            //检查必须字段是否存在
                            if (remoteData.forcedBinaryVersions == null) {
                                remoteData.forcedBinaryVersions = [];
                            }
                            if (remoteData.banchannels == null) {
                                remoteData.banchannels = [];
                            }
                            if (remoteData.marketUrl == null) {
                                remoteData.marketUrl = new Map();
                            }
                        }
                        //customer包处理
                        let customerConfig = {
                            scriptVersion: '',
                            files: {}
                        };
                        if (this.customerJoinUpdate && this.customerurl && this.customerurl.length > 0) //生成customer包清单文件
                         {
                            var customerList = fs_1.default.readdirSync(customerDir);
                            let dir = customerList.pop();
                            while (dir) {
                                let folderName = path_1.default.join(customerDir, dir);
                                let info = fs_1.default.readdirSync(folderName);
                                info.forEach((o) => {
                                    let filePath = path_1.default.join(folderName, o);
                                    let stat = fs_1.default.statSync(filePath);
                                    let key = `customer/${dir}/${o}`;
                                    if (stat.isDirectory()) { //文件夹
                                        const folderMd5 = utils_1.myUtils.getFolderFilesMd5(filePath);
                                        utils_1.myUtils.zipFolder(filePath, o, `${filePath}.zip`, (fileName) => { return fileName.indexOf(versionFileUUID) == -1 && fileName.indexOf(versionLanUUID) == -1 && fileName.indexOf(customerUUID) == -1; });
                                        let size = utils_1.myUtils.getFileSize(`${filePath}.zip`);
                                        let md5 = utils_1.myUtils.getStringMD5(folderMd5);
                                        customerConfig.files[`${key}.zip`] = {
                                            size: size,
                                            md5: md5
                                        };
                                        utils_1.myUtils.deleteFolderRecursive(filePath);
                                    }
                                    else { //文件
                                        let size = utils_1.myUtils.getFileSize(filePath);
                                        let md5 = utils_1.myUtils.getFileMd5(filePath);
                                        customerConfig.files[`${key}`] = {
                                            size: size,
                                            md5: md5
                                        };
                                    }
                                });
                                dir = customerList.pop();
                            }
                            //获取customer版本号
                            const resourcesPath = path_1.default.join(Editor.Project.path, "assets/resources");
                            let resourcesVersion = utils_1.myUtils.getSvnVersion(resourcesPath);
                            const customerPath = path_1.default.join(Editor.Project.path, "assets/webGame/Lobby/customer");
                            let customerVersion = utils_1.myUtils.getSvnVersion(customerPath);
                            const allVersion = `${resourcesVersion}${customerVersion}`;
                            customerConfig.scriptVersion = allVersion;
                            //保存版本文件customer 配置文件
                            const customerConfigPath = path_1.default.join(versionFolder, csVersionFileName);
                            fs_1.default.writeFileSync(customerConfigPath, JSON.stringify(customerConfig));
                            //保存版本文件到项目目录
                            var projectVersionFolder = `${projectPath}/assets/resources/${csVersionFileName}`;
                            fs_1.default.copyFileSync(customerConfigPath, projectVersionFolder);
                            //更新remote配置中的csVersion
                            remoteData.csVersion = allVersion;
                        }
                        utils_1.myUtils.writeFile(remoteConfigPath, JSON.stringify(remoteData));
                        //版本文件同步到build目录
                        if (fs_1.default.existsSync(verisonFilePath)) {
                            var dst = `${Editor.Project.path}/build/${platform}/data/assets/resources`;
                            const srcFiles = utils_1.myUtils.listFiles(dst);
                            for (let i = srcFiles.length - 1; i >= 0; i--) {
                                var fileName = srcFiles[i];
                                if (fileName.indexOf(versionFileUUID) >= 0) {
                                    var oldData = JSON.parse(fs_1.default.readFileSync(fileName, 'utf-8'));
                                    oldData[5][0][2] = JSON.stringify(versionData);
                                    fs_1.default.writeFileSync(fileName, JSON.stringify(oldData));
                                    break;
                                }
                            }
                        }
                        //同步customer清单文件到build目录
                        if (fs_1.default.existsSync(customerMeta)) {
                            var dst = `${Editor.Project.path}/build/${platform}/data/assets/resources`;
                            const srcFiles = utils_1.myUtils.listFiles(dst);
                            for (let i = srcFiles.length - 1; i >= 0; i--) {
                                var fileName = srcFiles[i];
                                if (fileName.indexOf(customerUUID) >= 0) {
                                    var oldData = JSON.parse(fs_1.default.readFileSync(fileName, 'utf-8'));
                                    oldData[5][0][2] = JSON.stringify(customerConfig);
                                    fs_1.default.writeFileSync(fileName, JSON.stringify(oldData));
                                    break;
                                }
                            }
                        }
                        console.log("发布主包完成==============》", scriptVersion);
                        return scriptVersion;
                    },
                    /**
                     * 发布子游戏
                     * @param game
                     * @param mainVersion
                     */
                    publishSubGame(game, mainVersion, subGameInfo) {
                        //版本生成目录
                        var gameFolder = `${publishPath}/${platform}/version_${mainVersion}/${gameDir}/${game}`;
                        // 获取子游戏版本号
                        var gameFloderPath = `${projectPath}/assets/Game/${game}`;
                        var gameVersion = utils_1.myUtils.getSvnVersion(gameFloderPath);
                        var buildVersion = gameVersion;
                        let buildGamePath = ""; //导出子游戏目录
                        let assetsRootPath = "";
                        if (platform == "android") {
                            buildGamePath = path_1.default.join(projectPath, `build/android/data/${gameDir}/${game}`);
                            assetsRootPath = path_1.default.join(projectPath, 'build/android/data');
                        }
                        else if (platform == "ios") {
                            buildGamePath = path_1.default.join(projectPath, `build/ios/data/${gameDir}/${game}`);
                            assetsRootPath = path_1.default.join(projectPath, 'build/ios/data');
                        }
                        //文件夹不存在 return
                        if (fs_1.default.existsSync(buildGamePath) == false) {
                            return;
                        }
                        //删除文件夹
                        utils_1.myUtils.deleteFolderRecursive(gameFolder);
                        utils_1.myUtils.copyFolderSync(buildGamePath, gameFolder);
                        //根据选择的语言 复制 游戏的多语言bundle到发布目录
                        let lanFolder = [];
                        for (let lan in this.publishLan) {
                            const b = this.publishLan[lan];
                            if (b) {
                                //复制文件夹
                                let srcFolder = `${buildGamePath}_${lan}`;
                                if (fs_1.default.existsSync(srcFolder)) {
                                    let dstFolder = `${gameFolder}_${lan}`;
                                    utils_1.myUtils.copyFolderSync(srcFolder, dstFolder);
                                    lanFolder.push(lan);
                                }
                            }
                        }
                        //子游戏多语言 import native文件夹压缩zip
                        let lanMD5Map = new Map();
                        lanFolder.forEach(lan => {
                            let dstFolder = `${gameFolder}_${lan}`;
                            let fileinfo = fs_1.default.readdirSync(dstFolder);
                            //语言配置
                            let lanConfig = {
                                scriptVersion: '',
                                files: {}
                            };
                            let allMD5 = "";
                            fileinfo.forEach(file => {
                                let filePath = `${dstFolder}/${file}`;
                                let index = filePath.indexOf("remote");
                                let key = filePath.substring(index).replace(/\\/g, "/");
                                let stat = fs_1.default.statSync(filePath);
                                if (stat.isDirectory()) //目录
                                 {
                                    const folderMd5 = utils_1.myUtils.getFolderFilesMd5(filePath); //获取目录MD5
                                    utils_1.myUtils.zipFolder(filePath, file, `${filePath}.zip`); //压缩zip
                                    let size = utils_1.myUtils.getFileSize(`${filePath}.zip`);
                                    let md5 = utils_1.myUtils.getStringMD5(folderMd5);
                                    lanConfig.files[`${key}.zip`] = {
                                        size: size,
                                        md5: md5
                                    };
                                    allMD5 += md5;
                                    utils_1.myUtils.deleteFolderRecursive(filePath);
                                }
                                else //文件
                                 {
                                    let size = utils_1.myUtils.getFileSize(filePath);
                                    let md5 = utils_1.myUtils.getFileMd5(filePath);
                                    lanConfig.files[`${key}`] = {
                                        size: size,
                                        md5: md5
                                    };
                                    allMD5 += md5;
                                }
                            });
                            let bundlePath = path_1.default.join(gameFloderPath, `bundle_lan/bundle_${lan}`);
                            lanConfig.scriptVersion = utils_1.myUtils.getSvnVersion(bundlePath).toString(); //myUtils.getStringMD5(allMD5)
                            lanMD5Map.set(lan, lanConfig);
                        });
                        //子游戏import文件夹 压缩成zip
                        var zipFolder = ["import", "native"];
                        let tempMd5 = {};
                        zipFolder.forEach((o) => {
                            var src = path_1.default.join(gameFolder, o);
                            if (fs_1.default.existsSync(src)) {
                                const folderMd5 = utils_1.myUtils.getFolderFilesMd5(src);
                                tempMd5[`${src}.zip`] = utils_1.myUtils.getStringMD5(folderMd5);
                                utils_1.myUtils.zipFolder(src, o, `${src}.zip`);
                                utils_1.myUtils.deleteFolderRecursive(src);
                            }
                        });
                        let versionConfig = {
                            scriptVersion: buildVersion.toString(),
                            files: {},
                            lan: {}
                        };
                        //md5
                        var assetsList = utils_1.myUtils.listFiles(gameFolder);
                        assetsList.forEach((assetStat) => {
                            var md5 = "";
                            if (tempMd5[assetStat]) {
                                md5 = tempMd5[assetStat];
                            }
                            else {
                                md5 = utils_1.myUtils.getFileMd5(assetStat);
                            }
                            var assetUrl = path_1.default.relative(assetsRootPath, assetStat);
                            assetUrl = assetUrl.replace(/\\/g, '/');
                            assetUrl = encodeURI(assetUrl);
                            assetUrl = assetUrl.replace(`../../../${publishDirName}/${platform}/version_${mainVersion}/`, ``);
                            versionConfig.files[assetUrl] = {
                                size: utils_1.myUtils.getFileSize(assetStat),
                                md5: md5,
                            };
                        });
                        //子游戏多语言md5加入到游戏配置中
                        let lanVersion = {};
                        lanMD5Map.forEach((value, key) => {
                            if (versionConfig.lan == null) {
                                versionConfig.lan = {};
                            }
                            versionConfig.lan[key] = value;
                            lanVersion[key] = value.scriptVersion;
                        });
                        //写入本次的版本配置
                        utils_1.myUtils.mkdirSync(gameFolder);
                        var verisonFile = `${gameFolder}/${versionFileName}`;
                        utils_1.myUtils.writeFile(verisonFile, JSON.stringify(versionConfig));
                        subGameInfo.subgames[game] = {
                            ID: parseInt(game),
                            version: buildVersion.toString(),
                            lan: lanVersion
                        };
                        console.log("发布子游戏完成===========》", game, buildVersion);
                    },
                    /**
                     * 发布icons或者大厅子功能
                     * @param mainVersion
                     */
                    publishIcons(mainVersion, subGameInfo) {
                        console.log(`发布icons 开始`);
                        //icons 父目录
                        let iconsParentDir = platform == "android" ? path_1.default.join(projectPath, `build/android/data/${gameDir}`) : path_1.default.join(projectPath, `build/ios/data/${gameDir}`);
                        //获取目录下面 以icon_开头的文件夹
                        let dirList = utils_1.myUtils.getDirList(iconsParentDir);
                        dirList = dirList.filter((o) => {
                            return o.startsWith("icons_");
                        });
                        // console.log("dirList",dirList)
                        //生成spine的版本号
                        dirList.forEach((iconName) => {
                            var iconPath = path_1.default.join(iconsParentDir, iconName); //导出的icon目录
                            var projectIconPath = path_1.default.join(projectPath, `assets/gameIcon/${iconName}`); //项目的icon目录
                            let publishIconDir = `${publishPath}/${platform}/version_${mainVersion}/${gameDir}/${iconName}`; //发布的icon目录
                            //删除文件夹
                            utils_1.myUtils.deleteFolderRecursive(publishIconDir);
                            //复制文件夹
                            utils_1.myUtils.copyFolderSync(iconPath, publishIconDir);
                            //获取版本号
                            var iconVersion = utils_1.myUtils.getSvnVersion(projectIconPath);
                            subGameInfo.icons[iconName] = {
                                ID: iconName.toString(),
                                version: iconVersion.toString()
                            };
                            console.log(`发布icons ${iconName} ==》 ${iconVersion}`);
                            //压缩 iconPath里面的import、native文件夹
                            var zipFolders = ["import", "native"];
                            zipFolders.forEach((o) => {
                                var src = path_1.default.join(publishIconDir, o);
                                if (fs_1.default.existsSync(src)) {
                                    utils_1.myUtils.zipFolder(src, o, `${src}.zip`);
                                    utils_1.myUtils.deleteFolderRecursive(src);
                                }
                            });
                        });
                        console.log(`发布icons 结束`);
                    },
                    /**
                     * 是否全选子游戏
                     * @param event
                     */
                    onSelectAll(event) {
                        for (const key in this.subGames) {
                            this.subGames[key] = this.selectAll;
                        }
                    },
                    /**
                     * 选择所有语言
                     * @param event
                     */
                    onSelectAllLan(event) {
                        for (const key in this.publishLan) {
                            this.publishLan[key] = this.selectAllLan;
                        }
                    },
                    /**
                     * 选择当前平台
                     * @param value
                     */
                    onPlatformChange(value) {
                        platform = value;
                    },
                    /**
                     * 获取游戏列表
                     */
                    getGameList() {
                        const directoryPath = path_1.default.join(Editor.Project.path, 'assets/Game');
                        if (!fs_1.default.existsSync(directoryPath)) {
                            return {};
                        }
                        // 读取目录下所有文件和子目录
                        let filenames = fs_1.default.readdirSync(directoryPath);
                        const gameList = filenames.filter(file => {
                            return fs_1.default.statSync(path_1.default.join(directoryPath, file)).isDirectory() && /^\d+$/.test(file);
                        });
                        let data = {};
                        for (const key in gameList) {
                            var gameName = gameList[key];
                            data[gameName] = false;
                        }
                        return data;
                    },
                    /**
                     * 获取发布语言列表
                     */
                    getPublishLan() {
                        let data = {};
                        let configPath = path_1.default.join(Editor.Project.path, 'jenkinsConfig.txt');
                        if (fs_1.default.existsSync(configPath)) {
                            let text = fs_1.default.readFileSync(configPath).toString();
                            let lans = text.split(",");
                            lans.forEach(element => {
                                data[element] = true;
                            });
                        }
                        return data;
                    },
                    /**
                * 获取增量选项
                * @returns
                */
                    getIncrementOption() {
                        var directoryPath = `${publishPath}/${platform}`;
                        let gameList = [];
                        if (fs_1.default.existsSync(directoryPath)) {
                            let filenames = fs_1.default.readdirSync(directoryPath);
                            gameList = filenames.filter(file => {
                                return fs_1.default.statSync(path_1.default.join(directoryPath, file)).isDirectory() && /^version_(.*)$/.test(file);
                            });
                            for (const key in gameList) {
                                var pathDir = gameList[key];
                                gameList[key] = path_1.default.join(directoryPath, pathDir);
                            }
                        }
                        return gameList;
                    },
                },
                /**
                 * 进入的时候初始化数据
                 */
                beforeMount() {
                    this.publishLan = (0, vue_1.reactive)(this.getPublishLan());
                    this.subGames = (0, vue_1.reactive)(this.getGameList());
                    this.incrementOption = this.getIncrementOption();
                    const data = configManager_1.ConfigManager.Instance.getData();
                    this.rootUrl = data.rootUrl;
                    this.customerUrl = data.customerUrl;
                    this.incrementalUpdate = data.incrementalUpdate;
                    this.generateZip = data.generateZip;
                    this.subGamePublish = data.subGamePublish;
                    this.selectAll = data.selectAll;
                    this.selectAllLan = data.selectAllLan;
                    this.customerJoinUpdate = data.customerJoinUpdate;
                    var subGames = data.subGames;
                    for (const key in subGames) {
                        const element = subGames[key];
                        if (this.subGames[key] != null) {
                            this.subGames[key] = element;
                        }
                    }
                    var publishLan = data.publishLan;
                    for (const key in publishLan) {
                        const element = publishLan[key];
                        this.publishLan[key] = element;
                    }
                },
                /**
                 * 退出保存数据
                 */
                beforeUnmount() {
                    configManager_1.ConfigManager.Instance.saveData(this.$data);
                },
                data() {
                    return {
                        rootUrl: '',
                        generateZip: false,
                        incrementalUpdate: false,
                        incrementOption: [],
                        incrementSelect: (0, vue_1.ref)(0),
                        subGamePublish: false,
                        selectAll: false,
                        subGames: {},
                        customerJoinUpdate: false,
                        publishLan: {},
                        customerUrl: "",
                        currentSelectionPlatform: "android" //当前选择的平台 android/ios
                    };
                }
            });
            app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
            app.mount(this.$.app);
            panelDataMap.set(this, app);
        }
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    },
});
