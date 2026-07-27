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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const PACKAGE_NAME = 'h5_adpter';
const projectPath = Editor.Project.path; //项目路径
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
    });
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        const pkgOptions = options.packages[PACKAGE_NAME];
        if (pkgOptions.webTestOption) {
            // console.debug('webTestOption', true);
        }
        // Todo some thing
        // console.debug('get settings test', result.settings);
    });
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // Todo some thing
        // console.log('webTestOption', 'onAfterCompressSettings');
    });
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = function (options, result) {
    return __awaiter(this, void 0, void 0, function* () {
        // change the uuid to test
        const pkgOptions = options.packages[PACKAGE_NAME];
        log(`${PACKAGE_NAME}.webTestOption`, 'onAfterBuild====' + result.dest);
        dealHtml(result.dest, pkgOptions);
        //localConfig.json add  build version
        const localConfigPath = path_1.default.join(result.dest, "localConfig.json");
        if (fs_1.default.existsSync(localConfigPath)) {
            let data = fs_1.default.readFileSync(localConfigPath, "utf8");
            let jsonData = JSON.parse(data);
            //获取assets svn版本号
            let assetsPath = path_1.default.join(Editor.Project.path, "assets");
            jsonData.assetsVersion = getSvnVersion(assetsPath);
            fs_1.default.writeFileSync(localConfigPath, JSON.stringify(jsonData, null, 2));
        }
        //javascript-obfuscator 混淆代码
        //获取目录下面所有的js文件 只有win32会混淆
        let getJSFiles = (dirPath, arryFiles = []) => {
            // 读取目录中的文件和子目录  
            fs_1.default.readdirSync(dirPath).forEach(function (file) {
                // 构建文件的完整路径  
                const filePath = path_1.default.join(dirPath, file);
                // 如果是文件，检查是否是 .js 文件  
                if (fs_1.default.statSync(filePath).isFile()) {
                    if (path_1.default.extname(filePath) === '.js') {
                        arryFiles.push(filePath);
                        //找到index.js 加上localtion.reload(true)
                        const jsFilePath = path_1.default.join(result.dest, "index");
                        if (filePath.indexOf(jsFilePath) >= 0) {
                            //替换index.js里面的  console.error(err); 为 console.error(err);location.reload(true)
                            let data = fs_1.default.readFileSync(filePath, "utf8");
                            data = data.replace("console.error(err);", `console.error(err);
    //上一次reload时间戳
    let lastReloadTime = Number(localStorage.getItem('lastReloadTime'))
    //已经reload次数
    let reloadTime = Number(localStorage.getItem('reloadTime'))
    //当前时间戳
    let currentTime = Date.now();
    if(lastReloadTime==0) //没有reload过 直接保存上次reload时间戳，设置reload次数为1，刷新
    {
        localStorage.setItem('lastReloadTime', currentTime);
        localStorage.setItem('reloadTime', 1);
        location.reload(true);
    }
    else //有reload过
    {
        if((currentTime - lastReloadTime) > (60000*5)) //超过5分钟重置
        {
            localStorage.setItem('lastReloadTime', currentTime);
            localStorage.setItem('reloadTime', 1);
            location.reload(true);
        }
        else//5分钟内
        {
            if(reloadTime<3)
            {
                localStorage.setItem('reloadTime', reloadTime + 1);
                location.reload(true);
            }
        }
    }`);
                            fs_1.default.writeFileSync(filePath, data);
                        }
                    }
                }
                else {
                    // 如果是目录，则递归处理  
                    arryFiles = getJSFiles(filePath, arryFiles);
                }
            });
            return arryFiles;
        };
        const srcFiles = getJSFiles(result.dest);
        if (pkgOptions.obfuscate) {
            let bWindows = process.platform === 'win32';
            let obfuscatedExe = bWindows ? path_1.default.join(__dirname, "../obfuscatedFile.exe") : path_1.default.join(__dirname, "../obfuscatedFile");
            if (!bWindows) {
                //mac 需要加权限
                let cmd = `chmod +x ${obfuscatedExe}`;
                child_process_1.default.execSync(cmd);
            }
            for (let i = srcFiles.length - 1; i >= 0; i--) {
                var fileName = srcFiles[i];
                if (fileName.endsWith('.js')) {
                    console.log(`${PACKAGE_NAME}javascript_obfuscator=${fileName}`);
                    let cmd = `${obfuscatedExe} ${fileName} ${fileName}`;
                    child_process_1.default.execSync(cmd);
                }
            }
        }
        //
        //获取项目下面的配置，判断是否基于v6 构建出来的web 修改settings.json
        let v6_path = getV6Config();
        if (v6_path && v6_path.length > 0) {
            console.log(`v6_path:${v6_path}`);
            //本地settings.json路径
            let srcFolder = path_1.default.join(projectPath, 'build/web-mobile/src');
            let settingFileName = findSettingFile(srcFolder);
            let settingPath = path_1.default.join(srcFolder, settingFileName);
            //v6的settings.json路径
            let v6src = path_1.default.join(v6_path, 'build/web-mobile/src');
            let v6SettingsFileName = findSettingFile(v6src);
            let v6SettingsPath = path_1.default.join(v6src, v6SettingsFileName);
            if (v6SettingsPath != null && v6SettingsPath.length > 0) {
                mergeSubgameSettings(v6SettingsPath, settingPath);
            }
            else {
                console.warn(`v6_path settings file not found:${v6SettingsPath}`);
            }
            //合并remote
            let v6RemotePath = path_1.default.join(v6_path, 'build/web-mobile/remote');
            let nowRemotePath = path_1.default.join(projectPath, 'build/web-mobile/remote');
            if (fs_1.default.existsSync(v6RemotePath)) {
                if (!fs_1.default.existsSync(nowRemotePath)) {
                    fs_1.default.mkdirSync(nowRemotePath);
                }
                copyFolderSync(v6RemotePath, nowRemotePath);
                console.log(`v6_path merge finish`);
            }
            else {
                console.warn(`v6_path remotePath=${v6RemotePath} not exist`);
            }
        }
        else {
            console.log(`buildConfig.json no v6_path config`);
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
* 复制文件夹到目标文件夹
* @param {*} source
* @param {*} target
*/
function copyFolderSync(source, target) {
    if (!fs_1.default.existsSync(target)) {
        fs_1.default.mkdirSync(target, { recursive: true });
    }
    const files = fs_1.default.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path_1.default.join(source, file);
        const targetPath = path_1.default.join(target, file);
        if (fs_1.default.lstatSync(sourcePath).isDirectory()) {
            copyFolderSync(sourcePath, targetPath);
        }
        else {
            fs_1.default.copyFileSync(sourcePath, targetPath);
        }
    });
}
/**
 * 找到一个目录下的settings.xx.json文件的名称
 */
function findSettingFile(dirPath) {
    let files = fs_1.default.readdirSync(dirPath);
    let settingFileName = files.find(file => file.startsWith('settings.') && file.endsWith('.json'));
    return settingFileName;
}
/**
 * 合并v6的子游戏配置到当前的web-mobile的配置
 * @param {*} v6JsonPath
 * @param {*} dstJsonPath
 */
function mergeSubgameSettings(v6JsonPath, dstJsonPath) {
    let v6Settings = JSON.parse(fs_1.default.readFileSync(v6JsonPath, 'utf-8'));
    let dstSettings = JSON.parse(fs_1.default.readFileSync(dstJsonPath, 'utf-8'));
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
    fs_1.default.writeFileSync(dstJsonPath, JSON.stringify(dstSettings, null, 4), 'utf-8');
    console.log(`mergeSubgameSettings finish: ${dstJsonPath}`);
}
/**
 * 获取目录svn版本号
 */
const getSvnVersion = (folder) => {
    if (fs_1.default.existsSync(folder) == false) {
        return 0;
    }
    var cmd = `svn info ${folder}  --show-item last-changed-revision`;
    var str = child_process_1.default.execSync(cmd).toString("utf8").trim();
    return parseInt(str);
};
const dealHtml = function (dst, param) {
    let jsCode = `<script type="text/javascript">
    (function () {
        var userAgent = navigator.userAgent.toLowerCase();
        // isMobile
        var isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
        var gameDiv = document.getElementById('GameDiv');
        var body = document.getElementsByTagName('body')[0];
        let orientation = 2 // 1:portrait 2:landscape
        let isLobby = true 
        //pc browser
        if (!isMobile) {
            function setGameDiv(){
                var clientWidth = document.documentElement.clientWidth;
                var clientHeight = document.documentElement.clientHeight;
                var gameWidth;
                var gameHeight;
               

                if(isLobby) // lobby full screen
                {
                    gameWidth = clientWidth + 'px'
                    gameHeight = clientHeight + 'px'
                }
                else //game
                {
                    if(orientation == 1) //portrait
                    {
                        var widthRatio = clientWidth / ${param.width};
                        var heightRatio = clientHeight /  ${param.height};
                        gameWidth = false ? '100%' :  ${param.width} * heightRatio;
                        gameHeight = false ?  ${param.height} * widthRatio : '100%';
                        if(gameWidth != '100%') {
                            gameWidth += 'px';
                        }
                        if(gameHeight != '100%') {
                            gameHeight += 'px';
                        }
                    }
                    else //landscape
                    {
                        gameWidth = clientWidth + 'px'
                        gameHeight = clientHeight + 'px'
                    }
                    
                }
                
                gameDiv.style.width = gameWidth
                gameDiv.style.height = gameHeight
                body.style.alignItems = 'center';
                body.style.justifyContent = 'center';
            }
            setGameDiv();
            window.onresize = function () {
                setGameDiv();
            }
            //change canvas size
            window.addEventListener('changeCanvasSize', (event)=> {
                orientation = event.detail.orientation;
                isLobby = event.detail.isLobby;
            });
        }
    })();
</script>`;
    //设置html
    const htmlPath = path_1.default.join(dst, "index.html");
    let data = fs_1.default.readFileSync(htmlPath, "utf8");
    const idx = data.indexOf('<script');
    const newStr = data.slice(0, idx) + '\n' + jsCode + '\n' + data.slice(idx - 1);
    fs_1.default.writeFileSync(htmlPath, newStr);
};
