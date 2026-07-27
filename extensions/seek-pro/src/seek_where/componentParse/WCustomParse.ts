import { BaseComParse } from "./WBaseComParse";

export class CustomParse extends BaseComParse {

  /**
   * 解析预制件数组里的单个项目
   * @param json 预制件数组里的一个项目
   * @param uuidSeekedMap 已经找到了的uuid的名字
   * @param fatherJson 整个预制件的Json
   * @param fullUuid 完整的Uuid
   * @param compressedUuid 压缩后的uuid
   * @returns 返回丢失了uuid的属性的名字
  */
  async parse(json: any, fatherJson: Array<any>, fullUuid: string, compressedUuid: string): Promise<Array<string>> {
    let walkedMap: Map<number, boolean> = new Map();
    let ret: Array<string> = [];
    if (Editor.Utils.UUID.isUUID(json.__type__)) {
      let uuid = Editor.Utils.UUID.decompressUUID(json.__type__);
      let assetInfo = await Editor.Message.request('asset-db', 'query-asset-info', uuid);
      this.comName = assetInfo?.name || json.__type__;
      let type = json.__type__ as string;
      if (type.includes(fullUuid) || type.includes(compressedUuid)) {
        ret.push(this.comName);
      }
    }
    else {
      this.comName = json.__type__;
    }

    await this.walk(json, ret, '', fatherJson, fullUuid, compressedUuid, walkedMap);
    return ret;
  }

  async walk(json: any, ret: Array<string>, propPath: string, fatherJson: Array<any>, fullUuid: string, compressedUuid: string, walkedMap: Map<number, boolean>) {
    if (json instanceof Array) {
      for (let i = 0; i < json.length; i++) {
        let ele = json[i];
        if (ele)
          await this.walk(ele, ret, propPath + '[' + i + ']', fatherJson, fullUuid, compressedUuid, walkedMap);
      }
    }
    else if (json instanceof Object) {
      if (json.__uuid__) {
        let uuid = json.__uuid__ as string;
        if (uuid.includes(fullUuid) || uuid.includes(compressedUuid))
          ret.push(propPath);
      }
      else if (json.__id__) {
        //引用了其他的json元素
        let otherJson = fatherJson[json.__id__];
        if (otherJson && !walkedMap.has(json.__id__) && otherJson.__type__ != 'cc.Node') {
          walkedMap.set(json.__id__, true);
          await this.walk(otherJson, ret, propPath, fatherJson, fullUuid, compressedUuid, walkedMap);
        }
      }
      else {
        //迭代
        for (let k in json) {
          if (json[k]) {
            await this.walk(json[k], ret, propPath + '.' + k, fatherJson, fullUuid, compressedUuid, walkedMap);
          }
        }
      }
    }
  }

}