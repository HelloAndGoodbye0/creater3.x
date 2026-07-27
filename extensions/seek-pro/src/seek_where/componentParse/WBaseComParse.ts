export class BaseComParse {


  public comName: string = 'component';
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
    return [];
  }





}