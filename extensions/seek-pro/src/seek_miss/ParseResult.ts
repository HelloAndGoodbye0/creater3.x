export class ComInfo {
  public comName: string = '';
  public propertyName: string = '';
};

export class NodeInfo {
  public nodePath: string = '';
  public coms: Array<ComInfo> = [];
};

export class PrefabInfo {

  public PATH: string = ''

  public URL: string = '';

  public UUID: string = '';

  public nodes: Map<string, NodeInfo> = new Map<string, NodeInfo>();

  public async initURLAndUUID(fullPath: string) {
    this.PATH = fullPath;
    this.UUID = await Editor.Message.request('asset-db', 'query-uuid', this.PATH) as string;
    this.URL = await Editor.Message.request('asset-db', 'query-url', this.UUID) as string;
  }

  public putNodesInfo(nodePath: string, comInfo: ComInfo) {
    if (!this.nodes.has(nodePath)) {
      let nodeInfo = new NodeInfo;
      nodeInfo.nodePath = nodePath;
      this.nodes.set(nodePath, nodeInfo);
    }

    let nodeInfo: NodeInfo = this.nodes.get(nodePath) as NodeInfo;
    nodeInfo.coms.push(comInfo);
  }

  public dump() {
    console.log('[seek miss] ' + this.URL);
    for (let ele of this.nodes) {
      console.log('[seek miss] ----->' + ele[0]);
      let v = ele[1];

      for (let comInfo of v.coms) {
        console.log('[seek miss] ------------>' + comInfo.comName + " => " + comInfo.propertyName);
      }
    }
  }
}


export class ParseResult {
  public _uuidMissedMap: Map<string, PrefabInfo> = new Map<string, PrefabInfo>();

  async getPrefabInfoByFullPath(fullPath: string) {
    if (!this._uuidMissedMap.has(fullPath)) {
      let prefabInfo: PrefabInfo = new PrefabInfo();
      await prefabInfo.initURLAndUUID(fullPath)
      this._uuidMissedMap.set(fullPath, prefabInfo);
    }

    return this._uuidMissedMap.get(fullPath);
  }
}
