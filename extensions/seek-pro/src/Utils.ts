import Path = require("path");
import * as fse from 'fs-extra';

export class Utils {

  static findAllFile(filter: Function): Array<string> {
    let _mapDir = (path: string, fileList: Array<string>) => {
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
    }

    let rootPath = Path.join(Editor.Project.path, 'assets');
    let fileList: Array<string> = [];
    _mapDir(rootPath, fileList);

    return fileList;
  }



}