/*
 * @Author: dgflash
 * @Date: 2022-09-01 18:00:28
 * @LastEditors: Lee 497232807@qq.com
 * @LastEditTime: 2023-03-07 14:55:50
 */

import { IRequestHeader } from "../../../../../assets/webGame/Net/gameProtocol";
import { NetConnectOptions } from "./NetNode";


/*
 * 网络相关接口定义
 */
export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
export type NetCallFunc = (data: any) => void;

/** 请求协议 */
export interface IRequestProtocol {
    /** 动作名 */
    action: string,
    /** 模块名 */
    method: string,
    /** 回调方法名 */
    callback?: string,
    /** 是否压缩 */
    isCompress: boolean,
    /** 渠道编号 */
    channelid: number,
    /** 消息内容 */
    data?: any;
    //头部数据
    header:IRequestHeader;
}

/** 响应协议 */
export interface IResponseProtocol {
    /** 响应协议状态码 */
    code: number,
    /** 数据是否压缩 */
    isCompress: boolean,
    /** 协议数据 */
    data?: any,
    /** 协议回调方法名 */
    callback?: string
    //头部数据
    header:IRequestHeader;
}

/** 回调对象 */
export interface CallbackObject {
    target: any,                // 回调对象，不为null时调用target.callback(xxx)
    callback: NetCallFunc,      // 回调函数
}

/** 请求对象 */
export interface RequestObject {
    buffer: NetData,                   // 请求的Buffer
    rspCmd: string,                    // 等待响应指令
    rspObject: CallbackObject | null,  // 等待响应的回调对象
}

/** 协议辅助接口 */
export interface IProtocolHelper {
    /** 返回包头长度 */
    getHeadlen(): number;
    /** 返回一个心跳包 */
    getHearbeat(): NetData;
    /** 返回整个包的长度 */
    getPackageLen(msg: NetData): number;
    /** 检查包数据是否合法（避免客户端报错崩溃） */
    checkResponsePackage(msg: IResponseProtocol): boolean;
    /** 处理请求包数据 */
    handlerRequestPackage(reqProtocol: IRequestProtocol): any;
    /** 处理响应包数据 */
    handlerResponsePackage(respProtocol: IResponseProtocol): any;
    /** 返回包的id或协议类型 */
    getPackageId(msg: IResponseProtocol): any;

    //获取返回header数据
    getHeadData(msg:Uint8Array): IRequestHeader;
}

export type SocketFunc = (event: any) => void;
export type MessageFunc = (msg: NetData) => void;

/** Socket接口 */
export interface ISocket {
    onConnected: SocketFunc | null;         // 连接回调
    onMessage: MessageFunc | null;          // 消息回调
    onError: SocketFunc | null;             // 错误回调
    onClosed: SocketFunc | null;            // 关闭回调

    connect(options: NetConnectOptions): any;                     // 连接接口
    send(buffer: NetData): number;                  // 数据发送接口
    close(code?: number, reason?: string): void;    // 关闭接口
}

/** 网络提示接口 */
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
    responseErrorCode(code: number): void;
}