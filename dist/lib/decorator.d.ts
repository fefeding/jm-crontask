/**
 * 判断是否校验token的api装饰器
 * @param need 是否要
 * @returns
 */
export declare function checkApiToken(need?: boolean): MethodDecorator;
/**
 * 获取装饰的是否需要toke验证
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
export declare function getApiToken(target: any, propertyKey: any): any;
/**
 * 判断是否校验登陆态
 * @param need 是否要
 * @returns
 */
export declare function checkLogin(need?: boolean): MethodDecorator;
/**
 * 获取装饰的是否需要校验登陆态
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
export declare function getCheckLogin(target: any, propertyKey: any): any;
