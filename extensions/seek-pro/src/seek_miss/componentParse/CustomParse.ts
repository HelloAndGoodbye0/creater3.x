import { BaseComParse } from "./BaseComParse";

export class CustomParse extends BaseComParse {

  async parse(json: any, uuidSeekedMap: Map<string, boolean>, fatherJson: Array<any>): Promise<Array<string>> {

    let walkedMap: Map<number, boolean> = new Map();
    let ret: Array<string> = [];
    if (Editor.Utils.UUID.isUUID(json.__type__)) {
      let uuid = Editor.Utils.UUID.decompressUUID(json.__type__);
      let assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
      this.comName = assetInfo?.name || json.__type__;
      if (!assetInfo) {
        ret.push(json.__type__);
      }
    }
    else {
      this.comName = json.__type__;
    }

    await this.walk(json, ret, '', uuidSeekedMap, fatherJson, walkedMap);
    return ret;
  }

  async walk(json: any, ret: Array<string>, propPath: string, uuidSeekedMap: Map<string, boolean>, fatherJson: Array<any>, walkedMap: Map<number, boolean>) {
    if (json instanceof Array) {
      for (let i = 0; i < json.length; i++) {
        let ele = json[i];
        if (ele)
          await this.walk(ele, ret, propPath + '[' + i + ']', uuidSeekedMap, fatherJson, walkedMap);
      }
    }
    else if (json instanceof Object) {
      if (json.__uuid__) {
        let uuid = json.__uuid__;
        if (!uuidSeekedMap.has(uuid)) {
          let url = await Editor.Message.request('asset-db', 'query-url', uuid);
          if (url) {
            uuidSeekedMap.set(uuid, true);
          }
          else {
            ret.push(propPath);
          }
        }
      }
      else if (json.__id__) {
        //引用了其他的json元素
        let otherJson = fatherJson[json.__id__];
        if (otherJson && !walkedMap.has(json.__id__) && otherJson.__type__ != 'cc.Node') {
          walkedMap.set(json.__id__, true);
          await this.walk(otherJson, ret, propPath, uuidSeekedMap, fatherJson, walkedMap);
        }
      }
      else {
        //迭代
        for (let k in json) {
          if (json[k]) {
            await this.walk(json[k], ret, propPath + '.' + k, uuidSeekedMap, fatherJson, walkedMap);
          }
        }
      }
    }
  }




}