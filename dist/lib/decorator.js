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
    try {
        const value = (0, core_1.getPropertyMetadata)(decorator_1.default.apiTokenMetadataKey, target, propertyKey);
        return value;
    }
    catch (e) {
        console.log(e);
        return false;
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVjb3JhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2xpYi9kZWNvcmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEseUNBQTJFO0FBQzNFLHFFQUErRDtBQUUvRDs7OztHQUlHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQUksR0FBRyxJQUFJO0lBQ3JDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUU7UUFDM0IsU0FBUztRQUNULElBQUEsMkJBQW9CLEVBQ2hCLG1CQUFVLENBQUMsbUJBQW1CLEVBQzlCLElBQUksRUFDSixNQUFNLEVBQ04sV0FBVyxDQUNkLENBQUM7SUFDTixDQUFDLENBQUM7QUFDTixDQUFDO0FBVkQsc0NBVUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZ0IsV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXO0lBQzNDLElBQUk7UUFDQSxNQUFNLEtBQUssR0FBRyxJQUFBLDBCQUFtQixFQUM3QixtQkFBVSxDQUFDLG1CQUFtQixFQUM5QixNQUFNLEVBQ04sV0FBVyxDQUNkLENBQUM7UUFDRixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELE9BQU0sQ0FBQyxFQUFFO1FBQ0wsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0FBQ0wsQ0FBQztBQWJELGtDQWFDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLFVBQVUsQ0FBQyxJQUFJLEdBQUcsSUFBSTtJQUNsQyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFO1FBQzNCLFNBQVM7UUFDVCxJQUFBLDJCQUFvQixFQUNoQixtQkFBVSxDQUFDLGtCQUFrQixFQUM3QixJQUFJLEVBQ0osTUFBTSxFQUNOLFdBQVcsQ0FDZCxDQUFDO0lBQ04sQ0FBQyxDQUFDO0FBQ04sQ0FBQztBQVZELGdDQVVDO0FBRUQ7Ozs7R0FJRztBQUNILFNBQWdCLGFBQWEsQ0FBQyxNQUFNLEVBQUUsV0FBVztJQUM3QyxNQUFNLEtBQUssR0FBRyxJQUFBLDBCQUFtQixFQUM3QixtQkFBVSxDQUFDLGtCQUFrQixFQUM3QixNQUFNLEVBQ04sV0FBVyxDQUNkLENBQUM7SUFDRixPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBUEQsc0NBT0MifQ==