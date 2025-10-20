import { h, render, type Component, type ComponentObjectPropsOptions } from 'vue';

// 渲染组件
export function renderComponent(component: Component, props?: ComponentObjectPropsOptions, target: HTMLElement = document.body) {
    const vnode = h(component, props||null);
    render(vnode, target);
    
    return vnode;
}

// 转自符串为json，主要用于ai返回的json格式问题
export function parseAiJSON(str: string) {
    str = str.trim();
    if(str.startsWith('```json')) str = str.replace('```json', '');
    if(str.startsWith('json')) str = str.replace('json', '');
    if(str.endsWith('```')) str = str.substring(0, str.length - 3);
    try {
        const res = JSON.parse(str);
        return res;
    }
    catch (e) {
        //str = str.replace(/{\s*{/g, '{').replace(/}\s*}/g, '}');
        let jsonIndex = str.indexOf('{');
        let jsonLast = str.lastIndexOf('}');
        if(jsonIndex === -1) jsonIndex = 0;
        if(jsonLast === -1) jsonLast = str.length - 1;
        let jsonStr = str.substring(jsonIndex, jsonLast + 1);
        jsonStr = jsonStr.replace(/\s*\/\/(.*)?\s+/g, '');// 去除注释
        try {
            const result = JSON.parse(jsonStr);
            return result;
        }
        catch(e) {
            console.error(jsonStr);
            return null;
        }
    }
}
