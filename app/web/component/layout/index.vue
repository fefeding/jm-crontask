<template>
    <html v-if="isNode">
        <head>
            <title>{{ title }}</title>
            <meta name="keywords" :content="keywords" />
            <meta name="description" :content="description" />
            <meta http-equiv="content-type" content="text/html;charset=utf-8" />
            <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
            <link rel="shortcut icon" href="//jtcospublic.ciccten.com/config-server/1606270244440608411/logo.png" type="image/x-icon" />
            <link rel="stylesheet" href="../asset/css/bootstrap.min.css" />
        </head>
        <body class="admin">
            <div id="app">
                <MainLayout
                    ><div slot="main"><slot></slot></div
                ></MainLayout>
            </div>
        </body>
    </html>
    <div v-else-if="!isNode" id="app">
        <MainLayout v-if="!justContent">
                    <div slot="main"><slot></slot></div>
                </MainLayout>
                <div v-else>
                    <div slot="main"><slot></slot></div>
                </div>
    </div>
</template>
<style></style>
<script lang="ts" src="./index.ts"></script>
