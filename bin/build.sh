#!/bin/sh
# 发生错误时终止
set -e

rm -rf web/dist/*

echo '清除web构建目录web/dist的所有文件'

npm run build:vue

cp -r web/dist/public/* src/public/

echo '生成view文件夹，并web/dist/view下的html复制过来'
mkdir -p view
# 多入口复制
cp -f web/dist/view/*.html view/

rm -rf web/dist/*

echo '前端资源打包完成...'

npm run build:midway

echo '后台服务构建完成...'
