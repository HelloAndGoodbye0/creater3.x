

/*
 * @Author: Lee 497232807@qq.com
 * @Date: 2023-08-03 16:38:47
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-08-04 17:59:41
 * @FilePath: \cocos_framework_base\extensions\publish_res\src\panels\default\utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import path from "path";
import fs from "fs";
import ChildProcess from 'child_process';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import fsExtra from 'fs-extra'
export class myUtils {


    static getPlatform(): string {
        var platform = "";
        if (process.platform == 'darwin') {
            platform = "ios"
        }
        if (process.platform == 'win32') {
            platform = "android";
        }
        //    if(process.platform == 'linux'){
        //         console.log('这是linux系统');
        //    }
        return platform
    }

    /**
    * 创建目录
    * @param dirPath 
    */
    static mkdirSync(dirPath: string) {
        fs.mkdirSync(dirPath, { recursive: true });

    }
    /**
     * 删除文件夹
     * @param {*} path 
     */
    static deleteFolderRecursive(path: string) {
        fsExtra.removeSync(path)
    }

    //获取目录下面一级文件夹
    static getDirList(path: string): string[] {
        if(!fs.existsSync(path)) //不存在直接返回[]
        {
            return []
        }
        var files = fs.readdirSync(path, { withFileTypes: true });
        const folders = files.filter(file => file.isDirectory()).map(folder => folder.name);
        return folders;
    }
    /**
     * 获取目录svn版本号
     * @param folder 
     * 
     */
    static getSvnVersion(folder: string): number {
        if(fs.existsSync(folder) == false){
            return 0
        }
        var cmd = `svn info ${folder}  --show-item last-changed-revision`
        // var projectPath = Editor.Project.path
        // var gitPath = path.join(projectPath, "/.git")
        // var dstPath = folder.replace(Editor.Project.path + "/", "")
        // var cmd = `git  --git-dir=${gitPath} rev-parse --short HEAD:${dstPath}`
        // console.log("cmd", cmd)
        var str = ChildProcess.execSync(cmd).toString("utf8").trim()
        return parseInt(str)
    }

    /**
    * 复制文件夹到目标文件夹
    * @param {*} source 
    * @param {*} target 
    */
    static copyFolderSync(source: string, target: string) {
        if (!fs.existsSync(target)) {
            this.mkdirSync(target);
        }

        const files = fs.readdirSync(source);

        files.forEach(file => {
            const sourcePath = path.join(source, file);
            const targetPath = path.join(target, file);

            if (fs.lstatSync(sourcePath).isDirectory()) {
                this.copyFolderSync(sourcePath, targetPath);
            } else {
                fs.copyFileSync(sourcePath, targetPath);
            }
        });
    }

    /**
     * zip 文件夹
     * @param path 
     * @param zipFolderName
     * @param zipName
     */
    static zipFolder(path: string, zipFolderName: string | undefined, zipName: string,filter?: RegExp | ((filename: string) => boolean)) {
        const zip = new AdmZip();
        zip.addLocalFolder(path, zipFolderName,filter);
        zip.writeZip(zipName);
    }

    /**
    * 获取目录内所有文件
    * @param assetPath 
    * @returns 
    */
    static listFiles(assetPath: string): string[]{
        var fileList = [];
        var stat = fs.statSync(assetPath);
        if (stat.isDirectory()) {
            var subpaths = fs.readdirSync(assetPath);
            for (var i = 0; i < subpaths.length; i++) {
                var subpath = subpaths[i];
                if (subpath[0] === '.') {
                    continue;
                }
                subpath = path.join(assetPath, subpath);
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
    static readFile(path: string) {
        if (fs.existsSync(path)) {
            return fs.readFileSync(path, 'utf-8')
        }
        else {
            return null
        }

    }
    /**
     * 写文件
     * @param {*} path 
     * @param {*} data 
     */
    static writeFile(path: string, data: string) {
        fs.writeFileSync(path, data)
    }

    static getAllFiles(dirPath: string,fileArray:string[]): string[]
     {
        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const filePath = path.join(dirPath, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // 如果是文件夹，递归遍历文件夹内的文件
                this.getAllFiles(filePath, fileArray);
            } else {
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
    static getFolderFilesMd5(folderPath: string): string {
        let isNativeFolder:boolean = folderPath.indexOf('native') != -1;// 是否是native文件夹
        var md5String:string[] = []
        var allFiles:string[] = [];
        this.getAllFiles(folderPath, allFiles);

        // 打印所有文件的路径
        allFiles.forEach((file) => {
           
            let md5 = this.getFileMd5(file)
            if(isNativeFolder)
            {
                //获取相对native文件夹的路径
                let relativePath = path.relative(folderPath, file);
                md5+=relativePath
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
    static getFileMd5(filePath: string): string {
        if (fs.existsSync(filePath)) {
            return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
        }
        else {
            return ""
        }
    }

    /**
     * 获取字符串md5
     * @param str 
     */
    static getStringMD5(str: string): string {
        const hash = crypto.createHash('md5');
        hash.update(str, 'utf8');
        return hash.digest('hex');
    }

    /**
     * add zip文件
     * @param zipPath 
     * @param filePath 
     * @param data 
     */
    static addZipFile(zipPath: string, filePath: string, data: string) {

        const zip = new AdmZip(zipPath);
        zip.addFile(filePath,Buffer.from(data));
        zip.writeZip(zipPath);

    }

    /**
     * 获取文件大小
     * @param filePath 
     * @returns 
     */
    static getFileSize(filePath: string) {
        const stats = fs.statSync(filePath);
        return stats.size;
    }

}