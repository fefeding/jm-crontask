import BaseModel from "./model";

export default class Message extends BaseModel {
    /**
     * 标题
     */
    title: string;
    /**
     * 内容
     */
    content: string;
    /**
     * 发送消息的应用id
     */
    appId?: string; 

    /**
     * 消息跳转链接
     */
    url?: string;

    /**
     * 发送的企业id, 优先级没有appid高
     */
    companyId?: string;

    /**
     * 接受消息的员工id，多人用 | 分隔
     */
    toStaff: string;
}