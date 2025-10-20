// 生成一个随机的id
const idExists: string[] = [];

const gen = (namespace = '') =>
    namespace +
    '_' +
    Math.random()
        .toString(36)
        .slice(2);

/**
 * @param namespace 使用一个命名空间
 */
export const uniqId = (namespace?: string) => {
    let id;
    while (!id || idExists.includes(id)) {
        id = gen(namespace);
    }
    idExists.push(id);
    return id;
};
