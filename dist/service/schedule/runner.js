"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunnerService = void 0;
const core_1 = require("@midwayjs/core");
const moment = require("moment");
const ip = require("ip");
const base_service_1 = require("../../base/base.service");
const taskConst_1 = require("../../model/taskConst");
const task_1 = require("../task");
const taskInstance_1 = require("../taskInstance");
const taskLock_1 = require("../taskLock");
let RunnerService = class RunnerService extends base_service_1.BaseService {
    taskService;
    instanceService;
    taskLockService;
    async init() {
        this.master(); // 启动主任务
        this.subTask(); // 启动子任务
    }
    runningTaskCount = 0; // 当前正在跑的task个数
    maxRunningCount = 5; // 最多同时多少个task
    // 任务分配主进程
    async master() {
        try {
            //     const manager = await this.app.getApplicationContext().getAsync(TypeORMDataSourceManager) as any;
            //     const dataSource = manager.getDataSource(manager.getDefaultDataSourceName()) as DataSource;
            //     const queryInner = dataSource.createQueryRunner();
            // 在锁的事务中执行
            await this.taskLockService.runLock(taskConst_1.TaskLockKeys.master, async (queryInner) => {
                // 先停掉超时的任务
                await this.instanceService.stopTimeoutTasks(queryInner);
                // 先获取可以执行的任务
                const tasks = await this.taskService.getCurrentTimeNeedRunTasks(queryInner);
                // 生成执行实例
                for (const task of tasks) {
                    await this.instanceService.createTaskInstance(task, queryInner);
                }
            });
        }
        catch (e) {
            console.error(e);
        }
        finally {
            await this.sleep(2000); // 每2秒跑一次
            this.master();
        }
    }
    // 子任务处理逻辑
    async subTask() {
        try {
            if (this.runningTaskCount >= this.maxRunningCount)
                return; // 超过个数则不处理
            this.run();
        }
        catch (e) {
            console.error(e);
        }
        finally {
            await this.sleep(2000);
            this.subTask();
        }
    }
    // 任务执行主体，继承的类只要写这个函数即可
    async run() {
        try {
            this.runningTaskCount++;
            // 任务开始前队列锁，多个线程等待取运行实例
            const taskInstance = await this.taskLockService.runLock(taskConst_1.TaskLockKeys.task, async (queryInner) => {
                // 从实例队列中取一个可以执行的
                const instance = await this.instanceService.getCanOneRun(queryInner);
                if (instance) {
                    instance.status = taskConst_1.TaskStatus.running; // 把实例标记为正在执行，其它任务不再获取它
                    instance.execStartTime = moment().format('YYYY-MM-DD HH:mm:ss');
                    instance.execServer = ip.address();
                    await this.instanceService.save(instance, queryInner);
                }
                return instance;
            });
            // 事务完后，执行任务
            taskInstance && await this.instanceService.runTask(taskInstance); // 开始执行
        }
        catch (e) {
            console.error(e);
            this.ctx?.logger?.error(e);
        }
        finally {
            this.runningTaskCount--;
        }
    }
    // 等待一定时间
    async sleep(time = 10) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", task_1.default)
], RunnerService.prototype, "taskService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", taskInstance_1.default)
], RunnerService.prototype, "instanceService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", taskLock_1.default)
], RunnerService.prototype, "taskLockService", void 0);
__decorate([
    (0, core_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RunnerService.prototype, "init", null);
RunnerService = __decorate([
    (0, core_1.Autoload)(),
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], RunnerService);
exports.RunnerService = RunnerService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVubmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3NlcnZpY2Uvc2NoZWR1bGUvcnVubmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFrRjtBQUVsRixpQ0FBaUM7QUFDakMseUJBQXlCO0FBQ3pCLDBEQUFzRDtBQUN0RCxxREFBaUU7QUFDakUsa0NBQWtDO0FBQ2xDLGtEQUE4QztBQUM5QywwQ0FBMEM7QUFLbkMsSUFBTSxhQUFhLEdBQW5CLE1BQU0sYUFBYyxTQUFRLDBCQUFXO0lBRzFDLFdBQVcsQ0FBYztJQUd6QixlQUFlLENBQWtCO0lBR2pDLGVBQWUsQ0FBa0I7SUFHM0IsQUFBTixLQUFLLENBQUMsSUFBSTtRQUNOLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBLFFBQVE7UUFFdEIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUEsUUFBUTtJQUMzQixDQUFDO0lBRUQsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUEsZUFBZTtJQUNwQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYztJQUVuQyxVQUFVO0lBQ1YsS0FBSyxDQUFDLE1BQU07UUFDUixJQUFJO1lBQ0osd0dBQXdHO1lBQ3hHLGtHQUFrRztZQUNsRyx5REFBeUQ7WUFHckQsV0FBVztZQUNYLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsd0JBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQXVCLEVBQUUsRUFBRTtnQkFDdEYsV0FBVztnQkFDWCxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBRXhELGFBQWE7Z0JBQ2IsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLDBCQUEwQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RSxTQUFTO2dCQUNULEtBQUksTUFBTSxJQUFJLElBQUksS0FBSyxF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