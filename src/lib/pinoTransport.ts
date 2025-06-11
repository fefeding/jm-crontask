import pino from 'pino';
import { requestApi } from './request';

export default class RemotePinoLogger {
  private localLogger: pino.Logger;
  private remoteUrl: string;
  private serviceName: string;
  private requestId = '';
  private loginId = '';
  private userId = '';
  private clientIP = '';
  private serverIP = '';

  constructor(options: {
    remoteUrl: string;
    serviceName: string;
    logLevel?: string;
    requestId?: string;
    loginId?: string;
    userId?: string;
    clientIP?: string;
    serverIP?: string;
  }) {
    this.remoteUrl = options.remoteUrl;
    this.serviceName = options.serviceName || process.env.SERVICE_NAME;
    this.requestId = options.requestId || '';
    this.loginId = options.loginId || '';
    this.userId = options.userId || '';
    this.clientIP = options.clientIP || '';
    this.serverIP = options.serverIP || '';

    this.localLogger = pino({
      level: options.logLevel || 'info',
      formatters: {
        level: (label) => ({ level: label }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    });
  }

  async sendLog(level: string, message: string, data?: any) {
    const logEntry = {
     requestId: this.requestId,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      loginId: this.loginId,
      userId: this.userId,
      clientIP: this.clientIP,
      serverIP: this.serverIP,
      level,
      message,
      data,
    };
    
     this.localLogger[level]?.(logEntry);
    
    if (this.remoteUrl) {
      this.sendToRemote(logEntry)
        .catch(err => this.localLogger.error('Failed to send log to remote', err));
    }
  }

  private async sendToRemote(logEntry: any) {
    try {
      await requestApi(this.remoteUrl, {
        method: 'POST',
        data: logEntry
      });
    } catch (error) {
      console.error(`Remote logging failed: `, error);
    }
  }

  info(message: string, data?: any) {
    this.sendLog('info', message, data);
  }

  warn(message: string, data?: any) {
    this.sendLog('warn', message, data);
  }

  error(message: string, data?: any) {
    this.sendLog('error', message, data);
  }

  debug(message: string, data?: any) {
    this.sendLog('debug', message, data);
  }
}  