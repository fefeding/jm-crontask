# 计划任务系统

* 部署
```js
> git clone https://github.com/jiamao/jm-crontask.git
> cd jm-crontask
> npm i
```

> 修改 `config/config.local.ts`中的数据配置库

> `npm run dev` 即可启动，  

> dev环境下会自动生成表，只需配置库名即可


* 登录态
 > 现写死在 `app/middleware/access.ts` 中，请自行处理

* 任务编写请关注：`app/service/taskIntance.ts` 中的 `runTask` 函数。

