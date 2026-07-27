import { BaseComParse } from "./WBaseComParse";

export class ParticleParse extends BaseComParse {

  public comName: string = 'cc.ParticleSystem';
  /**
   * 解析预制件数组里的单个项目
   * @param json 预制件数组里的一个项目
   * @param uuidSeekedMap 已经找到了的uuid的名字
   * @param fatherJson 整个预制件的Json
   * @returns 返回丢失了uuid的属性的名字
  */
  async parse(json: any, fatherJson: Array<any>, fullUuid: string, compressedUuid: string): Promise<Array<string>> {
    let ret: Array<string> = [];

    let _materials = json._materials;
    if (_materials && _materials[0]) {
      let uuid = _materials[0].__uuid__ as string;
      if (uuid) {
        if (uuid.includes(fullUuid) || uuid.includes(compressedUuid))
          ret.push('renderer.particleMaterial');
      }
    }

    if (_materials && _materials[1]) {
      let uuid = _materials[1].__uuid__;
      if (uuid) {
        if (uuid.includes(fullUuid) || uuid.includes(compressedUuid))
          ret.push('renderer.trailMaterial');
      }
    }


    if (json.renderer && json.renderer.__id__) {
      let renderer = fatherJson[json.renderer.__id__];
      let _mesh = renderer._mesh;
      if (_mesh) {
        let uuid = _mesh.__uuid__;
        if (uuid) {
          if (uuid.includes(fullUuid) || uuid.includes(compressedUuid))
            ret.push('renderer._mesh');
        }
      }
    }

    return ret;
  }


}