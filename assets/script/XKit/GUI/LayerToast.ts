import { LayerUI } from './LayerUI';
import { UIBase } from './UIBase';
import { UIConfig } from './UIConfig';
export class LayerToast extends LayerUI { 
    
    protected _setupUIComponent(comp: UIBase, config: UIConfig): void {
        // let tempConfig  = {...config}
        // tempConfig.prefab = `${tempConfig.prefab}_${Date.now()}`
        // super._setupUIComponent(comp, tempConfig);
    }
}

