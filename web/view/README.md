# 模板文件使用指南

以 `index.html` 为例，本文档旨在详细介绍模板文件的使用和配置。

## Midway

### 开发环境

- 模板文件路径：`web/view`（config.default.ts）。考虑到复用性及vite的安全限制（无法读取根目录以外的文件），选择此路径。
- 当后端本地服务启动，模板的 `base` 设置会自动更改，指向前端的 `vite` 服务端口。

### 部署环境

- 模板文件路径：`view`（config.prod.ts）。在执行`npm run build`时，文件会从原目录复制到此处，以便后续删除`web`目录。
- `web/dist` 下的 html 文件会被前端打包，并供 Node 在运行时访问。
- 重要提示：执行 `npm run build` 后，`view`目录的内容会更新。切勿提交由此步骤生成的文件。

## 前端

### 开发环境

- 前端服务启动时默认使用的模板。
- 主入口：<script type="module" src="/src/main.ts"></script>。

### 部署环境

- 执行 `npm run build` 会将内容打包到 `dist` 目录，接着复制到 `view` 文件夹。
- 注意：部署后，主入口 <script type="module" src="/src/main.ts"></script> 会被其对应的 js 文件替换。
