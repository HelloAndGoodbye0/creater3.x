export class BaseComParse {


  public comName: string = 'component';
  /**
   * 解析预制件数组里的单个项目
   * @param json 预制件数组里的一个项目
   * @param uuidSeekedMap 已经找到了的uuid的名字
   * @param fatherJson 整个预制件的Json
   * @returns 返回丢失了uuid的属性的名字
  */
  async parse(json: any, uuidSeekedMap: Map<string, boolean>, fatherJson: Array<any>): Promise<Array<string>> {
    return [];
  }





}