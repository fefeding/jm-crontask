import { savePropertyMetadata, getPropertyMetadata } from '@midwayjs/core';
import decorators from '@fefeding/common/dist/utils/decorator';

/**
 * 判断是否校验token的api装饰器
 * @param need 是否要
 * @returns
 */
export function checkApiToken(need = true): MethodDecorator {
    return (target, propertyKey) => {
        // 只保存元数据
        savePropertyMetadata(
            decorators.apiTokenMetadataKey,
            need,
            target,
            propertyKey
        );
    };
}

/**
 * 获取装饰的是否需要toke验证
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
export function getApiToken(target, propertyKey): any {
    const value = getPropertyMetadata(
        decorators.apiTokenMetadataKey,
        target,
        propertyKey
    );
    return value;
}

/**
 * 判断是否校验登陆态
 * @param need 是否要
 * @returns
 */
export function checkLogin(need = true): MethodDecorator {
    return (target, propertyKey) => {
        // 只保存元数据
        savePropertyMetadata(
            decorators.apiAuthMetadataKey,
            need,
            target,
            propertyKey
        );
    };
}

/**
 * 获取装饰的是否需要校验登陆态
 * @param target 对象
 * @param propertyKey 属性或方法名
 */
export function getCheckLogin(target, propertyKey): any {
    const value = getPropertyMetadata(
        decorators.apiAuthMetadataKey,
        target,
        propertyKey
    );
    return value;
}
