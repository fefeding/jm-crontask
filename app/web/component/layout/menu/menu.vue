<template>
    <div class="aside">
        <el-menu
            router
            background-color="#222d32"
            text-color="#fff"
            default-active="1"
            class="menu"
            @open="handleOpen"
            @close="handleClose"
            :collapse="collapse"
        >
            <template v-for="(menu_v, menu_k) in menu">
                <el-submenu v-if="menu_v.children" :index="menu_k" :key="menu_k">
                    <template slot="title">
                        <i :class="menu_v.icon"></i>
                        <span slot="title">{{ menu_v.name }}</span>
                    </template>
                    <el-menu-item
                        v-for="(menuChildren_v, menuChildren_k) in menu_v.children"
                        :key="menuChildren_k"
                        :index="menuChildren_v.path"
                    >
                        <i class="is-children fa fa-circle-o"></i>
                        <span slot="title">{{ menuChildren_v.name }}</span>
                    </el-menu-item>
                </el-submenu>
                <el-menu-item v-else :index="menu_v.path" :key="menu_k">
                    <i :class="menu_v.icon"></i>
                    <span slot="title">{{ menu_v.name }}</span>
                </el-menu-item>
            </template>
        </el-menu>
    </div>
</template>
<script lang="ts" src="./menu.ts"></script>

<style>
.aside {
    position: fixed;
    min-height: calc(100vh - 50px);
    z-index: 5;
    background-color: #222d32;
    height: 100%;
    overflow: auto;
}
.aside .menu {
    margin-top: 50px;
}
</style>
