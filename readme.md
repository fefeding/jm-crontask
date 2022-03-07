# 计划任务系统

* 部署
```js
> git clone https://github.com/jiamao/jm-crontask.git
> cd jm-crontask
> npm i
```

> 修改 `config/config.local.ts`中的数据配置库

> 如果初次运行，需要创建表，可以把DB配置中的 `synchronize: false`,  设为`true`，会自动创建表。当发布上线后请把它置为`false`，以免不必要的修改。

> `npm run dev` 即可启动


* 登录态
 > 现写死在 `app/middleware/access.ts` 中，请自行处理

* 任务编写请关注：`app/service/taskIntance.ts` 中的 `runTask` 函数。

