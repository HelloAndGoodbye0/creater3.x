
import path from 'path';
import fs from 'fs';
import { IBuildTaskOption, BuildHook, IBuildResult } from '../@types';
import ChildProcess from 'child_process';


interface IOptions {
    width: number;
    height: number;
    obfuscate: boolean;
}

const PACKAGE_NAME = 'h5_adpter';
const projectPath = Editor.Project.path; //项目路径

interface ITaskOptions extends IBuildTaskOption {
    packages: {
        'cocos-plugin-template': IOptions;
    };
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}

let allAssets = [];

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onBeforeBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    log(`${PACKAGE_NAME}.webTestOption`, 'onBeforeBuild');
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    const pkgOptions = options.packages[PACKAGE_NAME];
    if (pkgOptions.webTestOption) {
        // console.debug('webTestOption', true);
    }
    // Todo some thing
    // console.debug('get settings test', result.settings);
};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options: ITaskOptions, result: IBuildResult) {
    // Todo some thing
    // console.log('webTestOption', 'onAfterCompressSettings');
};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: ITaskOptions, result: IBuildResult) {
    // change the uuid to test

    const pkgOptions: IOptions = options.packages[PACKAGE_NAME];
    log(`${PACKAGE_NAME}.webTestOption`, 'onAfterBuild====' + result.dest);

    dealHtml(result.dest, pkgOptions);

    //localConfig.json add  build version
    const localConfigPath = path.join(result.dest, "localConfig.json");
    if (fs.existsSync(localConfigPath)) {
        let data = fs.readFileSync(localConfigPath, "utf8");
        let jsonData = JSON.parse(data);

        //获取assets svn版本号
        let assetsPath = path.join(Editor.Project.path, "assets");
        jsonData.assetsVersion = getSvnVersion(assetsPath);
        fs.writeFileSync(localConfigPath, JSON.stringify(jsonData, null, 2));
    }

    //javascript-obfuscator 混淆代码
    //获取目录下面所有的js文件 只有win32会混淆
    let getJSFiles = (dirPath: string, arryFiles: string[] = []) => {
        // 读取目录中的文件和子目录  
        fs.readdirSync(dirPath).forEach(function (file) {
            // 构建文件的完整路径  
            const filePath = path.join(dirPath, file);

            // 如果是文件，检查是否是 .js 文件  
            if (fs.statSync(filePath).isFile()) {
                if (path.extname(filePath) === '.js') {
                    arryFiles.push(filePath);
                    //找到index.js 加上localtion.reload(true)
                    const jsFilePath = path.join(result.dest, "index");
                    if (filePath.indexOf(jsFilePath) >= 0) {
                        //替换index.js里面的  console.error(err); 为 console.error(err);location.reload(true)
                        let data = fs.readFileSync(filePath, "utf8");
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
                        fs.writeFileSync(filePath, data);
                    }
                }
            } else {
                // 如果是目录，则递归处理  
                arryFiles = getJSFiles(filePath, arryFiles);
            }
        });

        return arryFiles;
    }
    const srcFiles = getJSFiles(result.dest);
    if (pkgOptions.obfuscate) {
        let bWindows = process.platform === 'win32';
        let obfuscatedExe = bWindows?path.join(__dirname, "../obfuscatedFile.exe"):path.join(__dirname, "../obfuscatedFile");
        if(!bWindows)
        {   
            //mac 需要加权限
            let cmd = `chmod +x ${obfuscatedExe}`
            ChildProcess.execSync(cmd)
        }
        for (let i = srcFiles.length - 1; i >= 0; i--) {
            var fileName = srcFiles[i];
            if (fileName.endsWith('.js')) {
                console.log(`${PACKAGE_NAME}javascript_obfuscator=${fileName}`)
                let cmd = `${obfuscatedExe} ${fileName} ${fileName}`
                ChildProcess.execSync(cmd)
            }
        }
    }

    //
    //获取项目下面的配置，判断是否基于v6 构建出来的web 修改settings.json
    let v6_path = getV6Config();
    if (v6_path && v6_path.length > 0) {
        console.log(`v6_path:${v6_path}`);
        //本地settings.json路径
        let srcFolder = path.join(projectPath, 'build/web-mobile/src');
        let settingFileName = findSettingFile(srcFolder);
        let settingPath = path.join(srcFolder, settingFileName);
        //v6的settings.json路径
        let v6src = path.join(v6_path, 'build/web-mobile/src')
        let v6SettingsFileName = findSettingFile(v6src);
        let v6SettingsPath = path.join(v6src, v6SettingsFileName);
        if(v6SettingsPath!=null && v6SettingsPath.length>0)
        {
            mergeSubgameSettings(v6SettingsPath, settingPath)
        }
        else{
            console.warn(`v6_path settings file not found:${v6SettingsPath}`);
        }
        

        //合并remote
        let v6RemotePath = path.join(v6_path, 'build/web-mobile/remote');
        let nowRemotePath = path.join(projectPath, 'build/web-mobile/remote');
        if (fs.existsSync(v6RemotePath)) {
            if (!fs.existsSync(nowRemotePath)) {
                fs.mkdirSync(nowRemotePath);
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
};

export const unload: BuildHook.unload = async function () {
    console.log(`[${PACKAGE_NAME}] Unload cocos plugin example in builder.`);
};

export const onError: BuildHook.onError = async function (options, result) {
    // Todo some thing
    console.warn(`${PACKAGE_NAME} run onError`);
};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {
    console.log(`onBeforeMake: root: ${root}, options: ${options}`);
};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {
    console.log(`onAfterMake: root: ${root}, options: ${options}`);
};


/**
 * 获取项目下面v6_path配置
 */
function getV6Config(): string {
    let buildConfigJsonPath = path.join(projectPath, 'buildConfig.json');
    if (fs.existsSync(buildConfigJsonPath)) {
        let buildConfigData = JSON.parse(fs.readFileSync(buildConfigJsonPath, 'utf-8'))
        return buildConfigData?.v6_path
    }
    else {
        return ""
    }
}

/**
* 复制文件夹到目标文件夹
* @param {*} source 
* @param {*} target 
*/
function copyFolderSync(source: string, target: string) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);

    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);

        if (fs.lstatSync(sourcePath).isDirectory()) {
            copyFolderSync(sourcePath, targetPath);
        } else {
            fs.copyFileSync(sourcePath, targetPath);
        }
    });
}

/**
 * 找到一个目录下的settings.xx.json文件的名称
 */
function findSettingFile(dirPath) {
    let files = fs.readdirSync(dirPath);
    let settingFileName = files.find(file => file.startsWith('settings.') && file.endsWith('.json'));
    return settingFileName;
}

/**
 * 合并v6的子游戏配置到当前的web-mobile的配置
 * @param {*} v6JsonPath 
 * @param {*} dstJsonPath 
 */
function mergeSubgameSettings(v6JsonPath, dstJsonPath) {
    let v6Settings = JSON.parse(fs.readFileSync(v6JsonPath, 'utf-8'));
    let dstSettings = JSON.parse(fs.readFileSync(dstJsonPath, 'utf-8'));

    // 处理bundleVers
    let v6_bundleVers = v6Settings.assets.bundleVers
    let dst_bundleVers = dstSettings.assets.bundleVers;
    //遍历v6_bundleVers中的每个子游戏
    for (let key in v6_bundleVers) {
        let value = v6_bundleVers[key];
        if (!key.startsWith("icons_"))//不是icons_
        {
            let gameidStr = key.includes("_") ? key.split("_")[0] : key;
            let gameid = Number(gameidStr);
            if (gameid >= 10000) {
                dst_bundleVers[key] = value;
            }
        }
    }

    // 处理projectBundles
    let v6_projectBundles = v6Settings.assets.projectBundles
    let dst_projectBundles = dstSettings.assets.projectBundles;
    for (let key in v6_projectBundles) {
        // console.log(`处理projectBundles:${key}`);
        let value = v6_projectBundles[key];
        if (!key.startsWith("icons_"))//不是icons_
        {
            let gameid = value.includes("_") ? value.split("_")[0] : value;
            gameid = Number(gameid);
            if (gameid >= 10000) {
                dst_projectBundles.push(value)
            }
        }
    }

    //处理remoteBundles
    let v6_remoteBundles = v6Settings.assets.remoteBundles
    let dst_remoteBundles = dstSettings.assets.remoteBundles;
    for (let key in v6_remoteBundles) {
        // console.log(`处理projectBundles:${key}`);
        let value = v6_remoteBundles[key];
        if (!key.startsWith("icons_"))//不是icons_
        {
            let gameid = value.includes("_") ? value.split("_")[0] : value;
            gameid = Number(gameid);
            if (gameid >= 10000) {
                dst_remoteBundles.push(value)
            }
        }
    }
    // 写入dstJsonPath
    fs.writeFileSync(dstJsonPath, JSON.stringify(dstSettings, null, 4), 'utf-8');

    console.log(`mergeSubgameSettings finish: ${dstJsonPath}`);
}

/**
 * 获取目录svn版本号
 */
const getSvnVersion = (folder: string) => {
    if (fs.existsSync(folder) == false) {
        return 0
    }
    var cmd = `svn info ${folder}  --show-item last-changed-revision`
    var str = ChildProcess.execSync(cmd).toString("utf8").trim()
    return parseInt(str)
}

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
    const htmlPath = path.join(dst, "index.html");
    let data = fs.readFileSync(htmlPath, "utf8");
    const idx = data.indexOf('<script');
    const newStr = data.slice(0, idx) + '\n' + jsCode + '\n' + data.slice(idx - 1);
    fs.writeFileSync(htmlPath, newStr);



};

