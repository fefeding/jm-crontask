import { type Session } from '@fefeding/common/dist/models/account/session';

declare module '@midwayjs/koa/dist/interface' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Context {
        /**
         * 当前登陆态
         */
        currentSession?: Session;
        /**
         * 当前登陆态token
         */
        auth_token?: string;
        clientIP?: string; // 客户IP
        detect: {
            IS_MOBILE: boolean,
            IS_MQQ: boolean,
            IS_WEIXIN: boolean,
            IS_WECHATTOOLS: boolean,
            IS_PCWEIXIN: boolean,
            IS_WXWORK: boolean,
            IS_MINA: boolean,
            REQUESTIP: string,
            HOSTNAME: string,
            CLIENTIP: string,
        }
    }
}
