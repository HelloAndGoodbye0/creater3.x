"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetHandlers = exports.configs = exports.unload = exports.load = void 0;
const load = function () {
    console.debug(`${PACKAGE_NAME} load`);
};
exports.load = load;
const unload = function () {
    console.debug(`${PACKAGE_NAME} unload`);
};
exports.unload = unload;
const PACKAGE_NAME = 'h5_adpter';
const webMobileOption = {
    width: {
        label: '设计分辨率:宽',
        default: 750,
        render: {
            ui: 'ui-num-input'
        }
    },
    height: {
        label: '设计分辨率:高',
        default: 1334,
        render: {
            ui: 'ui-num-input'
        }
    },
    obfuscate: {
        label: "是否开启代码混淆",
        default: true,
        render: {
            ui: 'ui-checkbox'
        }
    }
};
exports.configs = {
    'web-mobile': {
        hooks: './hooks',
        doc: 'editor/publish/custom-build-plugin.html',
        options: webMobileOption,
        verifyRuleMap: {
            ruleTest: {
                message: `i18n:${PACKAGE_NAME}.options.ruleTest_msg`,
                func(val, buildOptions) {
                    if (val === 'cocos') {
                        return true;
                    }
                    return false;
                },
            },
        },
    },
};
exports.assetHandlers = './asset-handlers';
