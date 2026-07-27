import { readFileSync } from 'fs-extra';
import { join } from 'path';
import { createApp } from 'vue';
import { seek_miss } from '../../seek_miss/main';
import { ParseResult, NodeInfo } from '../../seek_miss/ParseResult';


module.exports = Editor.Panel.define({
  listeners: {
    show() { console.log('show'); },
    hide() { console.log('hide'); },
  },
  template: readFileSync(join(__dirname, '../../../static/template/seek_miss_panel/index.html'), 'utf-8'),
  style: readFileSync(join(__dirname, '../../../static/template/seek_miss_panel/index.css'), 'utf-8'),
  $: {
    tip: '#tip',
    container: '#container',
    content: '#content'
  },
  methods: {
    async onRefreshUuid() {
      if (this.$.tip)
        this.$.tip.innerText = '正在查找，请耐心等待..';
      if (this.$.content)
        this.$.content.innerHTML = '';

      let result: ParseResult = await seek_miss();
      if (result._uuidMissedMap.size) {
        if (this.$.tip)
          this.$.tip.innerText = `查找已经完成(共找到${result._uuidMissedMap.size}条)`;
        for (let itor of result._uuidMissedMap) {
          let item = itor[1];
          let htmlItem = document.createElement('div');
          htmlItem.setAttribute('class', "item-miss");

          //ui-asset
          let htmlUIAsset = document.createElement('ui-asset');
          htmlUIAsset.setAttribute('class', "asset");
          htmlUIAsset.setAttribute('droppable', 'cc.Prefab,cc.SceneAsset')
          htmlUIAsset.setAttribute('value', item.UUID);
          htmlItem.appendChild(htmlUIAsset);
          htmlItem.appendChild(document.createElement('br'))

          for (let itor2 of item.nodes) {
            let nodeInfo: NodeInfo = itor2[1];

            let htmlNode = document.createElement('node');
            htmlNode.innerText = '|----' + nodeInfo.nodePath;
            htmlItem.appendChild(htmlNode);
            htmlItem.appendChild(document.createElement('br'))

            for (let com of nodeInfo.coms) {
              let htmlCom = document.createElement('com');
              htmlCom.innerText = '|----' + com.comName + ' ==> ' + com.propertyName;
              htmlItem.appendChild(htmlCom);
              htmlItem.appendChild(document.createElement('br'))
            }
          }
          this.$.content?.appendChild(htmlItem);
        }
      }
      else {
        if (this.$.tip)
          this.$.tip.innerText = '恭喜你，没有查找到丢失了uuid的文件';
      }
    }
  },
  async ready() {
    this.onRefreshUuid();
  },
  beforeClose() { },
  close() { },
});
