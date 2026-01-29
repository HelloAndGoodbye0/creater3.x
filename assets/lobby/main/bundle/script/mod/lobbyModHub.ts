import { PModuleID } from "../PModule";
import { lobbyMod } from "./lobbyMod";
type lobbModConstructor  = {new(...a:any):lobbyMod, ID:number}
export class lobbyModHub {
    
    
    private static instance: lobbyModHub = null;

    public static getInstance() {
        if (this.instance == null) {
            this.instance = new lobbyModHub();
        }
        return this.instance;
    }
    //模块ID与模块映射 (存储继承lobbyMod的类构造函数)
    private id2Mod: Map<PModuleID,lobbModConstructor > = new Map();

    //大厅模块 (存储已创建的模块实例)
    private modules:Map<PModuleID, lobbyMod> = new Map<PModuleID, lobbyMod>()
    /**
     * 注册模块
     * @param id 
     * @param mod 
     */
    public registerModule(id:PModuleID,mod: lobbModConstructor) {
        this.id2Mod.set(id, mod);
    }

        /**
     * 通过ID进入模块
     * @param id 
     * @param args 
     */
    enterByModID( id:PModuleID, ...args:any )
    {
        if(this.modules.has(id))
        {
            let mod = this.modules.get( id )
            mod.onEnter( ...args )
        }
        else
        {
            let ctor = this.id2Mod.get( id )
            if(ctor != null)
            {
                this.enter( ctor, ...args )
            }
            else
            {
                console.error( "lobbyModHub enterByModID error, id:", id )
            }
        }
    }

    exitByModID( id:PModuleID, ...args:any )
    {
        if(this.modules.has(id))
        {
            let instance = this.modules.get( id )
            instance.onExit( ...args )
        }
        else
        {
            let ctor = this.id2Mod[id]
            if(ctor != null)
            {
                this.exit( ctor, ...args )
            }
            else
            {
                console.error( "lobbyModHub exitByModID error, id:", id )
            }
        }
    }

    enter( ctor:lobbModConstructor, ...args:any )
    {
        if(this.modules.has(ctor.ID))
        {
            let mod = this.modules.get( ctor.ID )
            mod.onEnter( ...args )
        }
        else
        {
            let mod = new ctor()
            //初始化
            mod.init( )
            mod.onEnter( ...args )
            //保存模块
            this.modules.set( ctor.ID, mod )
        }
    }

    exit( ctor:lobbModConstructor, ...args:any )
    {
        if(this.modules.has(ctor.ID))
        {
            let instance = this.modules.get( ctor.ID )
            instance.onExit( ...args )
        }
    }


}