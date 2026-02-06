import { LayerUI } from "./LayerUI";
import { UIBase } from "./UIBase";
import { UIConfig } from "./UIConfig";


export class LayerDialog extends LayerUI { 
    


    protected _now: UIConfig =  null; // 当前
    async add<T extends UIBase>(data: UIConfig): Promise<T | null> {
        if(this._now ==null) //当前没有弹框
        { 
            this._now = data
            return  await super.add(data);
        }
        else //当前有弹框 保存到队列中
        {
            this._queue.push(data);
        }

    }

    remove(data: UIConfig, bDestory: boolean = false, bSkipAnim: boolean = false, callback?: (com: UIBase) => void) {
        super.remove(data, bDestory, bSkipAnim, (_com: UIBase)=>{
            let hasDialog = this._queue.length > 0
            this._now = null
            if(hasDialog)
            {
                let next = this._queue.shift();
                this.add(next!);
            }
            else
            {
                callback?.(_com)
            }
            
        });
    }
}