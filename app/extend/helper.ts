import Message from '@jv/jv-models/baseServer/message';
import { IHelper } from 'egg';

export default {
    
    /**
     * {
        "msgtype": "markdown",
        "markdown": {
            "content": "实时新增用户反馈<font color=\"warning\">132例</font>，请相关同事注意。\n
            >类型:<font color=\"comment\">用户反馈</font>
            >普通用户反馈:<font color=\"comment\">117例</font>
            >VIP用户反馈:<font color=\"comment\">15例</font>"
        }
    }
     */
    postTaskMessage: async function(this: IHelper, msg: Message) {
        const data = {
            "msgtype": "markdown",
            "mentioned_list": "",
            "markdown": {
                "content": `<font color="warning">${msg.title}</font>\n>异常信息:<font color="comment">${msg.content}</font>\n>查看详情:[${msg.url}](${msg.url})`
            }
        };
        if(msg.toStaff) {

        }
	// 这里可以post给企微机器人等
	return;
        return await this.curl({
            url: '',
            data
        });
    }
};
