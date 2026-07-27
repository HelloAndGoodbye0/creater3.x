"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const main_1 = require("../../seek_where/main");
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.log('show'); },
        hide() { console.log('hide'); },
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/seek_miss_panel/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/seek_miss_panel/index.css'), 'utf-8'),
    $: {
        tip: '#tip',
        container: '#container',
        content: '#content'
    },
    methods: {
        onRefreshUuid(uuid) {
            console.log('onRefreshUuid', uuid);
            this.refreshUI(uuid);
        },
        async refreshUI(uuid) {
            var _a;
            if (this.$.tip)
                this.$.tip.innerText = '正在查找，请耐心等待...';
            if (this.$.content)
                this.$.content.innerHTML = '';
            let result = await (0, main_1.seek_where)(uuid);
            if (result._uuidMissedMap.size) {
                if (this.$.tip)
                    this.$.tip.innerText = `查找已经完成(共找到${result._uuidMissedMap.size}条)`;
                for (let itor of result._uuidMissedMap) {
                    let item = itor[1];
                    let htmlItem = document.createElement('div');
                    htmlItem.setAttribute('class', "item");
                    //ui-asset
                    let htmlUIAsset = document.createElement('ui-asset');
                    htmlUIAsset.setAttribute('class', "asset");
                    htmlUIAsset.setAttribute('droppable', 'cc.Prefab,cc.SceneAsset');
                    htmlUIAsset.setAttribute('value', item.UUID);
                    htmlItem.appendChild(htmlUIAsset);
                    htmlItem.appendChild(document.createElement('br'));
                    for (let itor2 of item.nodes) {
                        let nodeInfo = itor2[1];
                        let htmlNode = document.createElement('node');
                        htmlNode.innerText = '|----' + nodeInfo.nodePath;
                        htmlItem.appendChild(htmlNode);
                        htmlItem.appendChild(document.createElement('br'));
                        for (let com of nodeInfo.coms) {
                            let htmlCom = document.createElement('com');
                            htmlCom.innerText = '|----' + com.comName + ' ==> ' + com.propertyName;
                            htmlItem.appendChild(htmlCom);
                            htmlItem.appendChild(document.createElement('br'));
                        }
                    }
                    (_a = this.$.content) === null || _a === void 0 ? void 0 : _a.appendChild(htmlItem);
                }
            }
            else {
                if (this.$.tip)
                    this.$.tip.innerText = '似乎没有查找到这个uuid的使用(建议右键【查找UUID的使用】再次寻找一下)';
            }
        }
    },
    async ready() {
        let uuid = await Editor.Message.request('seek-pro', "get-seek-uuid");
        this.refreshUI(uuid);
    },
    beforeClose() { },
    close() { },
});
