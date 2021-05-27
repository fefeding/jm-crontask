'use strict';
import Vue from 'vue';
import Vuex from 'vuex';
import RootState from './state';

Vue.use(Vuex);

export default function createStore(initState: any = {}) {
    const state = {
        ...initState,
        collapse: false //菜单默认收缩
     };
    return new Vuex.Store<RootState>({
        state,
        modules: {}
    });
}
