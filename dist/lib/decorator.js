"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckLogin = exports.checkLogin = exports.getApiToken = exports.checkApiToken = void 0;
const core_1 = require("@midwayjs/core");
const decorator_1 = require("@fefeding/common/dist/utils/decorator");
/**
 * 判断是否校验token的api装饰器
 * @param need 是否要
 * @returns
 */
function checkApiToken(need = true) {
    return (target, propertyKey) => {
        // 只保存元数据
        (0, core_1.savePropertyMetadata)(decorator_1.default.apiTokenMetadataKey, need, target, propertyKey);
    };
}
exports.checkApiToken = checkApiToken;
/**
 * 获取装饰的是否需要toke验证
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
function getApiToken(target, propertyKey) {
    const value = (0, core_1.getPropertyMetadata)(decorator_1.default.apiTokenMetadataKey, target, propertyKey);
    return value;
}
exports.getApiToken = getApiToken;
/**
 * 判断是否校验登陆态
 * @param need 是否要
 * @returns
 */
function checkLogin(need = true) {
    return (target, propertyKey) => {
        // 只保存元数据
        (0, core_1.savePropertyMetadata)(decorator_1.default.apiAuthMetadataKey, need, target, propertyKey);
    };
}
exports.checkLogin = checkLogin;
/**
 * 获取装饰的是否需要校验登陆态
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
function getCheckLogin(target, propertyKey) {
    const value = (0, core_1.getPropertyMetadata)(decorator_1.default.apiAuthMetadataKey, target, propertyKey);
    return value;
}
exports.getCheckLogin = getCheckLogin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUNBQTJFO0FBQzNFLHFFQUErRDtBQUUvRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQUksR0FBRyxJQUFJO0lBQ3JDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7UUFDM0IsU0FBUztRQUNULElBQUEsMkJBQW9CLEVBQ2hCLG1CQUFVLENBQUMsbUJBQW1CLEVBQzlCLElBQUksRUFDSixNQUFNLEVBQ04sV0FBVyxDQUNkLENBQUM7SUFDTixDQUFDLENBQUM7QUFDTixDQUFDO0FBVkQsc0NBVUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXO0lBQzNDLE1BQU0sS0FBSyxHQUFHLElBQUEsMEJBQW1CLEVBQzdCLG1CQUFVLENBQUMsbUJBQW1CLEVBQzlCLE1BQU0sRUFDTixXQUFXLENBQ2QsQ0FBQztJQUNGLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFQRCxrQ0FPQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixVQUFVLENBQUMsSUFBSSxHQUFHLElBQUk7SUFDbEMsT0FBTyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUMzQixTQUFTO1FBQ1QsSUFBQSwyQkFBb0IsRUFDaEIsbUJBQVUsQ0FBQyxrQkFBa0IsRUFDN0IsSUFBSSxFQUNKLE1BQU0sRUFDTixXQUFXLENBQ2QsQ0FBQztJQUNOLENBQUMsQ0FBQztBQUNOLENBQUM7QUFWRCxnQ0FVQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFnQixhQUFhLENBQUMsTUFBTSxFQUFFLFdBQVc7SUFDN0MsTUFBTSxLQUFLLEdBQUcsSUFBQSwwQkFBbUIsRUFDN0IsbUJBQVUsQ0FBQyxrQkFBa0IsRUFDN0IsTUFBTSxFQUNOLFdBQVcsQ0FDZCxDQUFDO0lBQ0YsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQztBQVBELHNDQU9DIn0=