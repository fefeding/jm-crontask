declare const _default: () => {
    view: {
        rootDir: {
            default: string;
        };
    };
    koa: {
        globalPrefix: string;
        port: number;
        hostname: string;
    };
    typeorm: {};
    staticFile: {
        dirs: {
            default: {
                prefix: string;
                dir: string;
            };
        };
    };
    baseService: {};
};
export default _default;
