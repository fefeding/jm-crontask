import { Middleware, IMiddleware, Config } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';
import * as ip from 'ip';
import PinoLogger from '../lib/pinoTransport';

@Middleware()
export class PinoLoggerMiddleware implements IMiddleware<Context, NextFunction> {
  @Config('logger')
  loggerConfig: any;
  // 静态文件扩展名列表
  private staticExtensions = [
    '.js', '.css', '.jpg', '.png', '.ico', '.svg', 
    '.woff', '.woff2', '.ttf', '.eot', '.map'
  ];
  ignore(ctx: Context): boolean {
    const isStaticFile = this.staticExtensions.some(ext => 
      ctx.path.toLowerCase().endsWith(ext)
    );
    // 下面的路由将忽略此中间件
    return isStaticFile;
  }
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const logger = new PinoLogger({
        remoteUrl: this.loggerConfig?.remoteUrl,
        serviceName: process.env.SERVICE_NAME,
        logLevel: this.loggerConfig?.level,
        requestId: ctx.request_id || '',
        loginId: ctx.currentSession?.loginId || '',
        userId: (ctx.currentSession?.userId || '').toString(),
        clientIP: ctx.detect?.CLIENTIP || ctx.ip || '',
        serverIP: ip.address() || '',
      });
      // 将logger挂载到ctx上
      ctx.logger = logger;
      
      // 记录请求开始时间
      const startTime = Date.now();
      
      try {
        // 继续处理请求
        const result = await next();
        
        // 记录成功响应
        logger.info('Request completed', {
          requestId: ctx.request_id,
          method: ctx.method,
          url: ctx.url,
          status: ctx.status,
          responseTime: Date.now() - startTime
        });
        
        return result;
      } catch (error) {
        // 记录错误响应
        logger.error('Request failed', {
          requestId: ctx.request_id,
          method: ctx.method,
          url: ctx.url,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          },
          responseTime: Date.now() - startTime
        });
        
        // 将错误继续抛出，由全局异常处理器处理
        throw error;
      }
    };
  }

  static getName(): string {
    return 'logger';
  }
}  