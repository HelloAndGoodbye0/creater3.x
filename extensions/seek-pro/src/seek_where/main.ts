import { Utils } from "../Utils";
import Path = require("path");
import { PrefabParse } from "./componentParse/WPrefabParse";
import { ParseResult } from "../seek_miss/ParseResult";

export async function seek_where(uuid: string) {

  let fileList: Array<string> = Utils.findAllFile((path: string) => {
    let ext = Path.extname(path);
    return ext == '.prefab' || ext == '.scene';
  });

  let compressedUuid: string = Editor.Utils.UUID.compressUUID(uuid, false);
  console.log('compressedUuid', compressedUuid);
  let prefabParse: PrefabParse = new PrefabParse();
  for (let path of fileList) {
    await prefabParse.testPrefab(path, uuid, compressedUuid);
  }
  let result: ParseResult = prefabParse.getResult();
  return result;
}

