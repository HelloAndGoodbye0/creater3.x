import { Utils } from "../Utils";
import Path = require("path");
import { PrefabParse } from "./componentParse/PrefabParse";
import { ParseResult } from "./ParseResult";

export async function seek_miss(log: boolean = false) {

  let fileList: Array<string> = Utils.findAllFile((path: string) => {
    let ext = Path.extname(path);
    return ext == '.prefab' || ext == '.scene';
  });

  log && console.log('[seek miss]seek miss is working! Please Wait');
  let prefabParse: PrefabParse = new PrefabParse();
  for (let path of fileList) {
    // console.log('[seek-pro]正在查找： ' + path);
    await prefabParse.testPrefab(path);
  }
  //输出得到的结果
  let result: ParseResult = prefabParse.getResult();
  if (result._uuidMissedMap.size && log) {
    for (let ele of result._uuidMissedMap) {
      console.log("[seek miss]==================================================Split line==================================================");
      let prefabInfo = ele[1];
      prefabInfo.dump();

    }
  }

  return result;
} 