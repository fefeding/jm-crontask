#!/bin/sh
set -e

DEPLOY_PKG_DIR="$HOME/npm-packages/tars-deploy/node_modules/@jt/tars-deploy"
echo "打包名字：$PKG_DEPLOY_NAME $DEPLOY_PKG_DIR"
npm run build

echo "删除web文件夹，防止postinstall进去下载"
rm -rf ./web

echo "删除非生产环境的包"
npm prune --production

if which tars-deploy &>/dev/null; then
    which tars-deploy
    echo "全局tars-deploy命令找到"
    tars-deploy $PKG_DEPLOY_NAME
else
    echo "全局tars-deploy命令找不到，有可能是没有全局安装，也有可能是当前node版本下不是默认bin，是别的node版本"
    # 检查本地是否有tars-deploy，并且其中是否存在 node_modules/@jt/tars-deploy
    if [ -d $DEPLOY_PKG_DIR ]
    then
        echo "在本地目录 $DEPLOY_PKG_DIR 中找到 tars-deploy"
    else
        echo "本地目录 $DEPLOY_PKG_DIR 中未找到 tars-deploy"
        mkdir -p $HOME/npm-packages/tars-deploy
        npm i @jt/tars-deploy -C $HOME/npm-packages/tars-deploy
    fi
    $HOME/npm-packages/tars-deploy/node_modules/@jt/tars-deploy/bin/tars-deploy $PKG_DEPLOY_NAME
fi

echo ”查看包大小“
ls -lh "$PKG_DEPLOY_NAME.tgz"


