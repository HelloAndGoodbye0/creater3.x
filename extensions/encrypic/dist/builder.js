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
const PACKAGE_NAME = 'encrypic';
const AndroidConfig = {
    hooks: './hooks',
    doc: 'editor/publish/custom-build-plugin.html',
    options: {
        encodeKey: {
            label: '加密图片key(>0生效)',
            default: 0,
            render: {
                ui: 'ui-num-input',
                attributes: {
                    placeholder: '请输入图片加密秘钥(大于0的整数)',
                    step: 1,
                },
            },
            verifyRules: [
                "number"
            ]
        },
    },
};
const IOSConfig = {
    hooks: './hooks',
    doc: 'editor/publish/custom-build-plugin.html',
    options: {
        encodeKey: {
            label: '加密图片key(>0生效)',
            default: 0,
            render: {
                ui: 'ui-num-input',
                attributes: {
                    placeholder: '请输入图片加密秘钥(大于0的整数)',
                    step: 1,
                },
            },
            verifyRules: [
                "number"
            ]
        }
    },
};
exports.configs = {
    'android': AndroidConfig,
    "ios": IOSConfig,
    // "web-mobile": H5buildConfig,
};
exports.assetHandlers = './asset-handlers';
