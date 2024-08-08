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
    }
}
