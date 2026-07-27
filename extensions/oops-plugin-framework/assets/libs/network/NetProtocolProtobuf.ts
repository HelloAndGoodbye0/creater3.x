/*
 * @Author: dgflash
 * @Date: 2022-04-21 13:48:44
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-03-08 09:38:54
 */
import { IProtocolHelper,IRequestProtocol, IResponseProtocol, NetData } from "./NetInterface";
import  b  from 'buffer/index.js';
import { IRequestHeader } from "../../../../../assets/webGame/Net/gameProtocol";
let Buffer = b.Buffer
/** Protobuf.js 数据压缩协议 */
export class NetProtocolProtobuf implements IProtocolHelper {
    getHeadData(msg: Uint8Array): IRequestHeader {
        throw new Error("Method not implemented.");
    }
    getHeadlen(): number {
        return 0;
    }

    getHearbeat(): NetData {
        return "";
    }

    getPackageLen(msg: NetData): number {
        return msg.toString().length;
    }

    checkResponsePackage(respProtocol: IResponseProtocol): boolean {
        return true;
    }
    handlerResponsePackage(msg:IResponseProtocol):any {
       return ""
    }

    handlerRequestPackage(reqProtocol: IRequestProtocol){
        
        return "data";
    }

    getPackageId(responceData:IResponseProtocol): string {
        var rspCmd = "CMD_"+responceData.header.bMainID + "_" + responceData.header.bAssistantID;
        return rspCmd
    }
}