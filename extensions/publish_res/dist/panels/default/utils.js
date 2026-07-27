"use strict";
/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-08-03 16:38:47
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-08-04 17:59:41
 * @FilePath: \cocos_framework_base\extensions\publish_res\src\panels\default\utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myUtils = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = __importDefault(require("child_process"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const crypto_1 = __importDefault(require("crypto"));
const fs_extra_1 = __importDefault(require("fs-extra"));
class myUtils {
    static getPlatform() {
        var platform = "";
        if (process.platform == 'darwin') {
            platform = "ios";
        }
        if (process.platform == 'win32') {
            platform = "android";
        }
        //    if(process.platform == 'linux'){
        //         console.log('这是linux系统');
        //    }
        return platform;
    }
    /**
    * 创建目录
    * @param dirPath
    */
    static mkdirSync(dirPath) {
        fs_1.default.mkdirSync(dirPath, { recursive: true });
    }
    /**
     * 删除文件夹
     * @param {*} path
     */
    static deleteFolderRecursive(path) {
        fs_extra_1.default.removeSync(path);
    }
    //获取目录下面一级文件夹
    static getDirList(path) {
        if (!fs_1.default.existsSync(path)) //不存在直接返回[]
         {
            return [];
        }
        var files = fs_1.default.readdirSync(path, { withFileTypes: true });
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        return folders;
    }
    /**
     * 获取目录svn版本号
     * @param folder
     *
     */
    static getSvnVersion(folder) {
        if (fs_1.default.existsSync(folder) == false) {
            return 0;
        }
        var cmd = `svn info ${folder}  --show-item last-changed-revision`;
        // var projectPath = Editor.Project.path
        // var gitPath = path.join(projectPath, "/.git")
        // var dstPath = folder.replace(Editor.Project.path + "/", "")
        // var cmd = `git  --git-dir=${gitPath} rev-parse --short HEAD:${dstPath}`
        // console.log("cmd", cmd)
        var str = child_process_1.default.execSync(cmd).toString("utf8").trim();
        return parseInt(str);
    }
    /**
    * 复制文件夹到目标文件夹
    * @param {*} source
    * @param {*} target
    */
    static copyFolderSync(source, target) {
        if (!fs_1.default.existsSync(target)) {
            this.mkdirSync(target);
        }
        const files = fs_1.default.readdirSync(source);
        files.forEach(file => {
            const sourcePath = path_1.default.join(source, file);
            const targetPath = path_1.default.join(target, file);
            if (fs_1.default.lstatSync(sourcePath).isDirectory()) {
                this.copyFolderSync(sourcePath, targetPath);
            }
            else {
                fs_1.default.copyFileSync(sourcePath, targetPath);
            }
        });
    }
    /**
     * zip 文件夹
     * @param path
     * @param zipFolderName
     * @param zipName
     */
    static zipFolder(path, zipFolderName, zipName, filter) {
        const zip = new adm_zip_1.default();
        zip.addLocalFolder(path, zipFolderName, filter);
        zip.writeZip(zipName);
    }
    /**
    * 获取目录内所有文件
    * @param assetPath
    * @returns
    */
    static listFiles(assetPath) {
        var fileList = [];
        var stat = fs_1.default.statSync(assetPath);
        if (stat.isDirectory()) {
            var subpaths = fs_1.default.readdirSync(assetPath);
            for (var i = 0; i < subpaths.length; i++) {
                var subpath = subpaths[i];
                if (subpath[0] === '.') {
                    continue;
                }
                subpath = path_1.default.join(assetPath, subpath);
                fileList.push(...this.listFiles(subpath));
            }
        }
        else if (stat.isFile()) {
            fileList.push(assetPath);
        }
        return fileList;
    }
    /**
     * 读文件
     * @param {*} path
     * @returns
     */
    static readFile(path) {
        if (fs_1.default.existsSync(path)) {
            return fs_1.default.readFileSync(path, 'utf-8');
        }
        else {
            return null;
        }
    }
    /**
     * 写文件
     * @param {*} path
     * @param {*} data
     */
    static writeFile(path, data) {
        fs_1.default.writeFileSync(path, data);
    }
    static getAllFiles(dirPath, fileArray) {
        const files = fs_1.default.readdirSync(dirPath);
        files.forEach((file) => {
            const filePath = path_1.default.join(dirPath, file);
            const stat = fs_1.default.statSync(filePath);
            if (stat.isDirectory()) {
                // 如果是文件夹，递归遍历文件夹内的文件
                this.getAllFiles(filePath, fileArray);
            }
            else {
                // 如果是文件，将其添加到文件数组中
                fileArray.push(filePath);
            }
        });
        return fileArray;
    }
    /**
     * 获取文件夹下面的所有文件md5
     * @param folderPath
     */
    static getFolderFilesMd5(folderPath) {
        let isNativeFolder = folderPath.indexOf('native') != -1; // 是否是native文件夹
        var md5String = [];
        var allFiles = [];
        this.getAllFiles(folderPath, allFiles);
        // 打印所有文件的路径
        allFiles.forEach((file) => {
            let md5 = this.getFileMd5(file);
            if (isNativeFolder) {
                //获取相对native文件夹的路径
                let relativePath = path_1.default.relative(folderPath, file);
                md5 += relativePath;
            }
            md5String.push(md5);
            // console.log("getFileMd5", file,md5)
        });
        // console.log("md5String", folderPath,md5String.join('\n'))
        return md5String.join('\n');
    }
    /**
     * 获取文件md5
     * @param filePath
     */
    static getFileMd5(filePath) {
        if (fs_1.default.existsSync(filePath)) {
            return crypto_1.default.createHash('md5').update(fs_1.default.readFileSync(filePath)).digest('hex');
        }
        else {
            return "";
        }
    }
    /**
     * 获取字符串md5
     * @param str
     */
    static getStringMD5(str) {
        const hash = crypto_1.default.createHash('md5');
        hash.update(str, 'utf8');
        return hash.digest('hex');
    }
    /**
     * add zip文件
     * @param zipPath
     * @param filePath
     * @param data
     */
    static addZipFile(zipPath, filePath, data) {
        const zip = new adm_zip_1.default(zipPath);
        zip.addFile(filePath, Buffer.from(data));
        zip.writeZip(zipPath);
    }
    /**
     * 获取文件大小
     * @param filePath
     * @returns
     */
    static getFileSize(filePath) {
        const stats = fs_1.default.statSync(filePath);
        return stats.size;
    }
}
exports.myUtils = myUtils;
