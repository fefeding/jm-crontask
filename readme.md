# my_midway_project

## QuickStart

<!-- add docs here for user -->

see [midway docs][midway] for more detail.

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7001/
```

### Deploy

```bash
$ npm start
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.


[midway]: https://midwayjs.org


### docker-compose 编排

> 开发

todo: 数据库

docker-compose -f dev-docker-compose.yml up

> 生产

todo:还有问题，跑起来就知道了，可以解决

docker-compose -f prod-docker-compose.yml up

在根目录执行
docker-compose -f bin/docker/dev-docker-compose.yml up --build --remove-orphans
