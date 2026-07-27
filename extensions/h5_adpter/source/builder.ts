
import { BuildPlugin } from '../@types';

export const load: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} load`);
};

export const unload: BuildPlugin.load = function() {
    console.debug(`${PACKAGE_NAME} unload`);
};

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
    obfuscate:{
        label: "是否开启代码混淆",
        default: true,
        render: {
            ui: 'ui-checkbox'
        }
    }

};
export const configs: BuildPlugin.Configs = {
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

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
