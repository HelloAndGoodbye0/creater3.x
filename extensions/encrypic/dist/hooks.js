"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAfterMake = exports.onBeforeMake = exports.onError = exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const utils_1 = require("./utils");
const PACKAGE_NAME = 'encrypic';
const projectPath = Editor.Project.path;
function log(...arg) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
let allAssets = [];
exports.throwError = true;
const load = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
        allAssets = yield Editor.Message.request('asset-db', 'query-assets');
    });
};
exports.load = load;
const onBeforeBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
        //修改代码里面的加密秘钥
        var file = `${projectPath}/assets/webGame/Config/decrypt_plugin.js`;
        //判断文件是否存在
        if (fs_1.default.existsSync(file)) {
            var data = fs_1.default.readFileSync(file, 'utf-8');
            var param = options.packages[PACKAGE_NAME];
            var encodeKey = param.encodeKey;
            //替换文件里面的encryptKey=整数
            const newData = data.replace(/encryptKey=\d+/g, `encryptKey=${encodeKey}`);
            fs_1.default.writeFileSync(file, newData);
        }
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgOptions = options.packages[PACKAGE_NAME];
        if (pkgOptions.webTestOption) {
            console.debug('webTestOption', true);
        }
        // Todo some thing
        console.debug('get settings test', result.settings);
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.log('webTestOption', 'onAfterCompressSettings');
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        log(`${PACKAGE_NAME}`, 'onAfterBuild result.paths' + JSON.stringify(result.paths));
        log(`${PACKAGE_NAME}`, 'onAfterBuild result.settings' + JSON.stringify(result.settings));
        log(`${PACKAGE_NAME}`, 'onAfterBuild result.dest' + JSON.stringify(result.dest));
        //图片加密
        yield EncryPic(options, result);
        // Editor.Message.broadcast("onAfterBuild");
        //如果是安卓平台删除data中的proj文件夹
        var platform = result.settings.engine.platform;
        if (platform == "android") {
            var projFolderr = path_1.default.join(result.dest, "data/proj");
            if (fs_1.default.existsSync(projFolderr)) {
                fs_1.default.rmdirSync(projFolderr, { recursive: true });
            }
        }
        //生成资源清单文件
        yield generateVersionFile(options, result);
        //接入firebae构建后修改 安卓的gradle.properties、build.gradle 
        yield modifyGradleProperties(options, result);
        //判断是否配置v6_path 如果配置了  说明构建的时候就从v6合并了子游戏settings.json
        let v6_path = getV6Config();
        if (v6_path && v6_path.length > 0) {
            let settingJsonPath = path_1.default.join(projectPath, `build/${platform}/data/src/settings.json`);
            let v6SettingJsonPath = path_1.default.join(v6_path, `build/${platform}/data/src/settings.json`);
            yield mergeSubgameSettings(v6SettingJsonPath, settingJsonPath);
        }
    });
};
exports.onAfterBuild = onAfterBuild;
const unload = function () {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
    });
};
exports.unload = unload;
const onError = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        console.warn(`${PACKAGE_NAME} run onError`);
    });
};
exports.onError = onError;
const onBeforeMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`onBeforeMake: root: ${root}, options: ${options}`);
    });
};
exports.onBeforeMake = onBeforeMake;
const onAfterMake = function (root, options) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`onAfterMake: root: ${root}, options: ${options}`);
    });
};
exports.onAfterMake = onAfterMake;
/**
 * 获取项目下面v6_path配置
 */
function getV6Config() {
    let buildConfigJsonPath = path_1.default.join(projectPath, 'buildConfig.json');
    if (fs_1.default.existsSync(buildConfigJsonPath)) {
        let buildConfigData = JSON.parse(fs_1.default.readFileSync(buildConfigJsonPath, 'utf-8'));
        return buildConfigData === null || buildConfigData === void 0 ? void 0 : buildConfigData.v6_path;
    }
    else {
        return "";
    }
}
/**
 * 合并v6的子游戏配置到当前的项目的settings.json
 * @param {*} v6SettingsJsonPath
 * @param {*} dstSettingsJsonPath
 */
function mergeSubgameSettings(v6SettingsJsonPath, dstSettingsJsonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`merge settings.json start`);
        if (!fs_1.default.existsSync(v6SettingsJsonPath) || !fs_1.default.existsSync(dstSettingsJsonPath)) {
            console.log("v6 settingsJson or dstSettingsJson not exists");
            return;
        }
        let v6Settings = JSON.parse(fs_1.default.readFileSync(v6SettingsJsonPath, 'utf-8'));
        let dstSettings = JSON.parse(fs_1.default.readFileSync(dstSettingsJsonPath, 'utf-8'));
        // 处理bundleVers
        let v6_bundleVers = v6Settings.assets.bundleVers;
        let dst_bundleVers = dstSettings.assets.bundleVers;
        //遍历v6_bundleVers中的每个子游戏
        for (let key in v6_bundleVers) {
            let value = v6_bundleVers[key];
            if (!key.startsWith("icons_")) //不是icons_
             {
                let gameidStr = key.includes("_") ? key.split("_")[0] : key;
                let gameid = Number(gameidStr);
                if (gameid >= 10000) {
                    dst_bundleVers[key] = value;
                }
            }
        }
        // 处理projectBundles
        let v6_projectBundles = v6Settings.assets.projectBundles;
        let dst_projectBundles = dstSettings.assets.projectBundles;
        for (let key in v6_projectBundles) {
            // console.log(`处理projectBundles:${key}`);
            let value = v6_projectBundles[key];
            if (!key.startsWith("icons_")) //不是icons_
             {
                let gameid = value.includes("_") ? value.split("_")[0] : value;
                gameid = Number(gameid);
                if (gameid >= 10000) {
                    dst_projectBundles.push(value);
                }
            }
        }
        //处理remoteBundles
        let v6_remoteBundles = v6Settings.assets.remoteBundles;
        let dst_remoteBundles = dstSettings.assets.remoteBundles;
        for (let key in v6_remoteBundles) {
            // console.log(`处理projectBundles:${key}`);
            let value = v6_remoteBundles[key];
            if (!key.startsWith("icons_")) //不是icons_
             {
                let gameid = value.includes("_") ? value.split("_")[0] : value;
                gameid = Number(gameid);
                if (gameid >= 10000) {
                    dst_remoteBundles.push(value);
                }
            }
        }
        // 写入dstJsonPath
        fs_1.default.writeFileSync(dstSettingsJsonPath, JSON.stringify(dstSettings), 'utf-8');
        console.log(`merge settings.json finish: ${dstSettingsJsonPath}`);
    });
}
/**
 * 获取字符串MD5
 * @param {*} str
 * @returns
 */
function MD5(str) {
    return crypto_1.default.createHash('md5').update(str).digest('hex').substring(0, 8);
}
/**
 * 文件夹修改名称
 * @param {*} dirPath
 * @param {*} packageID
 */
function renameFolders(dirPath, packageID, excludeDir) {
    let files = fs_1.default.readdirSync(dirPath, { withFileTypes: true });
    files.forEach(file => {
        if (file.isDirectory() && !excludeDir.includes(file.name)) {
            // console.log("file==",file.name)
            const oldFolderPath = path_1.default.join(dirPath, file.name);
            // 计算MD5值，这里使用文件夹名称和packageID"  
            const md5Input = `${file.name}${packageID}`;
            const hash = MD5(md5Input);
            // 构建新的文件夹名称  
            const newFolderName = `${hash}`;
            const newFolderPath = path_1.default.join(dirPath, newFolderName);
            // 重命名文件夹  
            console.log(`rename folder: ${oldFolderPath} -> ${newFolderPath}`);
            fs_1.default.renameSync(oldFolderPath, newFolderPath);
            // // 递归处理新的子文件夹  
            // renameFolders(newFolderPath,packageID,excludeDir);
        }
    });
}
/**
 * 加密图片
 * @param dirPath
 */
const encryptType = [".png", ".webp", ".jpg", ".pkm", ".astc"]; //加密类型
const EncryPic = (options, result) => __awaiter(void 0, void 0, void 0, function* () {
    var dirPath = path_1.default.join(result.dest, "data");
    var param = options.packages[PACKAGE_NAME];
    var encodeKey = param.encodeKey;
    console.log("encodeKey", encodeKey);
    if (encodeKey > 0) //需要加密
     {
        //遍历目录下面的文件
        let allFiles = utils_1.myUtils.listFiles(dirPath);
        //看文件是不是在加密类型里面
        let encryptFiles = []; //需要加密的文件
        allFiles.forEach((filePath) => {
            let extname = path_1.default.extname(filePath);
            if (encryptType.indexOf(extname) != -1) {
                //加密文件
                encryptFiles.push(filePath);
            }
        });
        console.log("encryptFiles", encryptFiles.length);
        for (let i = 0; i < encryptFiles.length; i++) {
            let filePath = encryptFiles[i];
            yield encryptFile(filePath, encodeKey);
        }
        //如果是原生平台，需要修改image.cpp 里面的解密key
        var platform = result.settings.engine.platform;
        if (platform == "android" || platform == "ios") {
            var EditorPath = Editor.App.path.replace("app.asar", "");
            var imageCppPath = path_1.default.join(EditorPath, "resources/3d/engine/native/cocos/platform/Image.cpp");
            if (fs_1.default.existsSync(imageCppPath)) {
                var data = fs_1.default.readFileSync(imageCppPath, 'utf-8');
                //替换文件里面的encryptKey=整数
                const newData = data.replace(/decodeKey=\d+/g, `decodeKey=${encodeKey}`);
                fs_1.default.writeFileSync(imageCppPath, newData);
            }
        }
    }
    else {
        console.log("no need encrypt");
    }
});
/**
 * 加密文件
 * @param filePath
 * @param encodeKey
 */
const encryptFile = (filePath, encodeKey) => {
    console.log("encryptFile", filePath);
    return new Promise((resolve, reject) => {
        //异步读写文件
        fs_1.default.readFile(filePath, (err, data) => {
            if (!err) {
                var arrayBuffer = new Uint8Array(data);
                //每个数据异或
                for (let i = 0; i < arrayBuffer.length; i++) {
                    arrayBuffer[i] = arrayBuffer[i] ^ encodeKey;
                }
                fs_1.default.writeFile(filePath, arrayBuffer, (err) => {
                    let bSuccess = false;
                    if (!err) {
                        bSuccess = true;
                    }
                    else {
                        console.log("writeFile error", filePath);
                    }
                    resolve(bSuccess);
                });
            }
            else {
                console.log("readFile error", filePath);
                reject(false);
            }
        });
    });
};
/**
 * 在文本文件中指定字符串前插入内容
 * @param {string} originalText - 原始文本内容
 * @param {string} targetString - 要查找的目标字符串
 * @param {string} stringToInsert - 要插入的字符串
 * @returns {string} 处理后的文本内容
 */
function insertBeforeString(originalText, targetString, stringToInsert) {
    // 检查参数是否有效
    if (typeof originalText !== 'string' || typeof targetString !== 'string' || typeof stringToInsert !== 'string') {
        throw new Error('所有参数必须是字符串');
    }
    // 如果目标字符串为空，直接返回原文本
    if (targetString === '') {
        return originalText;
    }
    // 查找目标字符串的位置
    const index = originalText.indexOf(targetString);
    // 如果没找到目标字符串，返回原文本
    if (index === -1) {
        return originalText;
    }
    // 在目标字符串前插入新内容
    return originalText.slice(0, index) + stringToInsert + originalText.slice(index);
}
/**
 * 替换文件中的指定字符串为特定字符串
 * @param {string} filePath - 文件路径
 * @param {string} targetString - 要替换的目标字符串
 * @param {string} newString - 替换后的新字符串
 */
const replaceFileContent = (filePath, targetString, newString) => {
    if (fs_1.default.existsSync(filePath)) {
        var content = fs_1.default.readFileSync(filePath, 'utf-8');
        var newContent = content.replace(targetString, newString);
        fs_1.default.writeFileSync(filePath, newContent);
    }
};
/**
 * 修改gradle.properties文件
 */
const modifyGradleProperties = (options, result) => __awaiter(void 0, void 0, void 0, function* () {
    //是安卓平台
    var platform = result.settings.engine.platform;
    if (platform == "android") {
        //是否是385构建的
        let is385Engine = result.settings.CocosEngine == "3.8.5";
        //构建后的gradle.properties
        var gradlePropertiesPath = path_1.default.join(result.dest, "proj/gradle.properties");
        if (fs_1.default.existsSync(gradlePropertiesPath)) {
            //读取文件
            var data = fs_1.default.readFileSync(gradlePropertiesPath, 'utf-8');
            //判断文件里面是否有USE_FIREBASE_PLUGINS
            if (data.indexOf("USE_FIREBASE_PLUGINS") == -1) {
                //追加USE_FIREBASE_PLUGINS=false
                fs_1.default.appendFileSync(gradlePropertiesPath, "\nUSE_FIREBASE_PLUGINS=false");
            }
        }
        //构建后的build.gradle
        var buildGradlePath = path_1.default.join(result.dest, "proj/build.gradle");
        if (fs_1.default.existsSync(buildGradlePath)) {
            //读取文件
            var data = fs_1.default.readFileSync(buildGradlePath, 'utf-8');
            //判断文件里面是否有USE_FIREBASE_PLUGINS
            if (data.indexOf("USE_FIREBASE_PLUGINS") == -1) {
                //增加安卓 firebase 插件
                let addString = is385Engine ? "if (project.hasProperty('USE_FIREBASE_PLUGINS') && USE_FIREBASE_PLUGINS.toBoolean()) {\n\t\t\tclasspath \"com.google.gms:google-services:4.4.2\"\n\t\t\tclasspath \"com.google.firebase:firebase-crashlytics-gradle:3.0.3\"\n\t\t}\n\t\t" : "if (project.hasProperty('USE_FIREBASE_PLUGINS') && USE_FIREBASE_PLUGINS.toBoolean()) {\n\t\t\tclasspath \"com.google.gms:google-services:4.3.10\"\n\t\t\tclasspath \"com.google.firebase:firebase-crashlytics-gradle:2.5.0\"\n\t\t}\n\t\t";
                let modifyText = insertBeforeString(data, "// NOTE: Do not place your application dependencies here; they belong", addString);
                //写入文件
                fs_1.default.writeFileSync(buildGradlePath, modifyText);
            }
        }
        //385引擎
        if (is385Engine) {
            const gradleWrapperPath = path_1.default.join(result.dest, "proj/gradle/wrapper/gradle-wrapper.properties");
            if (fs_1.default.existsSync(gradleWrapperPath)) {
                // 修改gradle-wrapper.properties中的版本 8.0.2 -> 8.6
                replaceFileContent(gradleWrapperPath, "8.0.2", "8.6");
                // 需要build:gradl版本  8.0.2 -> 8.4.0
                replaceFileContent(buildGradlePath, "8.0.2", "8.4.0");
            }
            //复制build-templates\android\proj到安卓构建目录
            var buildProjFolder = path_1.default.join(result.dest, "proj");
            if (fs_1.default.existsSync(buildProjFolder)) {
                var templateFolder = path_1.default.join(projectPath, "build-templates/android/proj");
                utils_1.myUtils.copyFolderSync(templateFolder, buildProjFolder);
            }
        }
    }
});
/**
 * 生成资源清单文件到build目录
 * @param options
 * @param result
 */
const generateVersionFile = (options, result) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("generateVersionFile  start");
    const projectPath = Editor.Project.path;
    var mainVersion = utils_1.myUtils.getSvnVersion(`${projectPath}/assets`); //项目中assets的svn版本号
    let buildDataPath = path_1.default.join(result.dest, "data"); //构建后的data目录
    const versionFileName = `${projectPath}/assets/resources/version.txt`; //version.txt路径
    const versionLanFileName = `${projectPath}/assets/resources/version_lan.txt`; //version_lan路径
    const resourcePath = `${buildDataPath}/assets/resources`; //resources目录
    //version.txt
    var verisonFilePath = `${versionFileName}.meta`;
    let versionFileUUID = JSON.parse(fs_1.default.readFileSync(verisonFilePath).toString()).uuid;
    //version_lan.txt
    let versionLanMeta = `${versionLanFileName}.meta`;
    let versionLanUUID = JSON.parse(fs_1.default.readFileSync(versionLanMeta).toString()).uuid;
    //版本清单
    let versionData = {
        scriptVersion: mainVersion.toString(),
        files: {}
    };
    //多语言版本清单 lan:versionData
    let versionLanData = {};
    //多语言bundle的md5映射
    let lanMd5Map = {};
    //src下面的文件
    let srcFiles = utils_1.myUtils.listFiles(`${buildDataPath}/src`);
    srcFiles.forEach((name) => {
        let key = name.replace(/\\/g, "/");
        let startIndex = key.indexOf("src/");
        key = key.substring(startIndex);
        let md5Str = utils_1.myUtils.getFileMd5(name);
        let size = utils_1.myUtils.getFileSize(name);
        versionData.files[key] = {
            size: size,
            md5: md5Str
        };
    });
    //assets目录下面的文件
    let assetsFolder = `${buildDataPath}/assets`;
    var dirList = utils_1.myUtils.getDirList(assetsFolder);
    let dir = dirList.shift();
    let files = ["cc.config.json", "import", "index.jsc", "native"];
    let isMainJoinUpdate = true; //是否主要加入热更新清单
    //获取项目下面的配置，是否主要加入热更新清单
    let buildConfigJsonPath = `${projectPath}/buildConfig.json`;
    if (fs_1.default.existsSync(buildConfigJsonPath)) {
        let builConfigStr = fs_1.default.readFileSync(buildConfigJsonPath, 'utf-8');
        try {
            let buildConfig = JSON.parse(builConfigStr);
            isMainJoinUpdate = buildConfig.mainJoinUpdate;
        }
        catch (e) {
            console.log("buildConfig.json 解析失败");
        }
    }
    while (dir) {
        if (!isMainJoinUpdate && dir === "main") //main包 不生成清单文件
         {
            dir = dirList.shift();
            continue;
        }
        let index = dir.indexOf("_"); //目录下面有没下划线
        let isLanBundle = index > -1 && !dir.startsWith("icons"); //有下划线 && 不是已icons开头的文件夹
        files.forEach((o) => {
            var src = path_1.default.join(assetsFolder, `${dir}/${o}`);
            if (fs_1.default.existsSync(src)) {
                //去掉路径中的\\ 然后从assets/开始
                let key = src.replace(/\\/g, "/");
                let startIndex = key.indexOf("assets/");
                key = key.substring(startIndex);
                let stat = fs_1.default.statSync(src);
                let isFolder = stat.isDirectory(); //是否是import、native文件夹
                let md5Str = isFolder ? utils_1.myUtils.getStringMD5(utils_1.myUtils.getFolderFilesMd5(src)) : utils_1.myUtils.getFileMd5(src);
                let size = isFolder ? 0 : utils_1.myUtils.getFileSize(src); //目录大小暂时用0
                if (isFolder) //是目录key存为.zip
                 {
                    key += ".zip";
                    //TODO zip压缩目录 删除老的文件夹
                }
                if (isLanBundle) //是多语言bundle
                 {
                    let nowLan = dir.substring(index + 1);
                    if (!versionLanData[nowLan]) {
                        versionLanData[nowLan] = {
                            scriptVersion: "",
                            files: {}
                        };
                    }
                    if (!lanMd5Map[nowLan]) //多语言bundle的md5映射 为空
                     {
                        lanMd5Map[nowLan] = "";
                    }
                    lanMd5Map[nowLan] += md5Str; //累加MD5
                    versionLanData[nowLan].files[key] = {
                        size: size,
                        md5: md5Str
                    };
                }
                else //不是多语言
                 {
                    versionData.files[key] = {
                        size: size,
                        md5: md5Str
                    };
                }
            }
        });
        dir = dirList.shift();
    }
    //更新多语言清单的scriptVersion
    for (let key in versionLanData) {
        let data = versionLanData[key];
        let allMD5 = lanMd5Map[key];
        data.scriptVersion = utils_1.myUtils.getStringMD5(allMD5);
    }
    //保存清单文件到build目录 包括主包的和多语言的
    const resourceFiles = utils_1.myUtils.listFiles(resourcePath); //resources下面的文件
    for (let i = resourceFiles.length - 1; i >= 0; i--) {
        var fileName = resourceFiles[i];
        //保存主包的清单文件
        if (fileName.indexOf(versionFileUUID) >= 0) {
            var oldData = JSON.parse(fs_1.default.readFileSync(fileName, 'utf-8'));
            let strData = JSON.stringify(versionData);
            oldData[5][0][2] = strData;
            fs_1.default.writeFileSync(fileName, JSON.stringify(oldData));
            //保存到项目中
            // fs.writeFileSync(versionFileName,strData)
        }
        //保存多语言的清单文件
        if (fileName.indexOf(versionLanUUID) >= 0) {
            var oldData = JSON.parse(fs_1.default.readFileSync(fileName, 'utf-8'));
            let strData = JSON.stringify(versionLanData);
            oldData[5][0][2] = strData;
            fs_1.default.writeFileSync(fileName, JSON.stringify(oldData));
            //保存到项目中？
            // fs.writeFileSync(versionLanFileName,strData)
        }
    }
    console.log("generateVersionFile  end");
});
