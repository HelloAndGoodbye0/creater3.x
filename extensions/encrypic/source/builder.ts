import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} load`);
};

export const unload: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} unload`);
};

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
}

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
}

export const configs: BuildPlugin.Configs = {
    'android': AndroidConfig,
    "ios": IOSConfig,
    // "web-mobile": H5buildConfig,
};

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
