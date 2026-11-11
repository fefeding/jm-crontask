import { Inject, Controller, All, Provide, Body, Config } from '@midwayjs/core';
import { BaseController, decorators } from '@cicctencent/midwayjs-base';
import * as path from 'path';
import TaskService from '../service/task';
import TaskInstanceService from '../service/taskInstance';
import DiagnoseService from '../service/diagnose';
import { TaskState, TaskTimeSize, TaskExecType } from '../model/taskConst';
import TaskConfigOrm from '../model/taskConfig';
import { EValid } from '@cicctencent/common/dist/models/base/enumType';
import { executeTask } from '../lib/executor';

const parser = require('@hardik_sharma/cron-parser-all');

@Provide()
@Controller('/api/task')
export class TaskController extends BaseController {
    @Inject()
    taskService: TaskService;
    @Inject()
    taskInstanceService: TaskInstanceService;
    @Inject()
    diagnoseService: DiagnoseService;

    /**
     * 查询任务配置
     * @param ctx
     */
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/query')
    public async query(@Body() params: any): Promise<any> {
        const res = await this.taskService.query(params);
        return res;
    }

    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    @All('/save')
    public async save(@Body() data: any) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        const fields = {} as any;
        if (data.name) {
            fields['name'] = data.name;
        }
        if (data.description) {
            fields['description'] = data.description;
        }
        if (typeof data.timeSize !== 'undefined') {
            fields['timeSize'] = data.timeSize;
        }
        if (data.timeValue) {
            fields['timeValue'] = data.timeValue;
        }
        if (data.timeout) {
            fields['timeout'] = data.timeout;
        }
        if (data.script) {
            fields['script'] = data.script;
        }
        if (data.watcher) {
            fields['watcher'] = data.watcher;
        }
        // 执行器相关
        if (typeof data.execType !== 'undefined') {
            fields['execType'] = data.execType;
        }
        if (typeof data.execCommand !== 'undefined') {
            fields['execCommand'] = data.execCommand;
        }
        if (typeof data.workDir !== 'undefined') {
            fields['workDir'] = data.workDir;
        }
        if (typeof data.envJson !== 'undefined') {
            fields['envJson'] = data.envJson;
        }
        if (typeof data.missPolicy !== 'undefined') {
            fields['missPolicy'] = data.missPolicy;
        }
        if (typeof data.maxRetry !== 'undefined') {
            fields['maxRetry'] = data.maxRetry;
        }
        if (typeof data.retryInterval !== 'undefined') {
            fields['retryInterval'] = data.retryInterval;
        }
        if (typeof data.publishDir !== 'undefined') {
            fields['publishDir'] = data.publishDir;
        }

        // 校验调度配置，避免保存非法配置导致任务永不执行
        this.validateSchedule(
            fields.timeSize ?? data.timeSize,
            fields.timeValue ?? data.timeValue,
            fields.execType ?? data.execType,
            fields.execCommand ?? data.execCommand
        );

        if (data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if (!task) throw Error('任务不存在');
            task.fromJSON(fields); // 写入改变
            const res = await this.taskService.save(task);
            return res;
        } else {
            fields['description'] = fields['description'] || '';
            fields['creator'] = fields['updater'];
            const task = new TaskConfigOrm();
            task.fromJSON(fields);
            const res = await this.taskService.insert(task);
            return res;
        }
    }

    /**
     * 校验调度配置
     */
    private validateSchedule(
        timeSize: number,
        timeValue: string,
        execType: number,
        execCommand: string
    ) {
        if (timeSize === undefined || timeSize === null) return;
        const value = String(timeValue || '').trim();

        switch (timeSize) {
            case TaskTimeSize.single: {
                if (!/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(value)) {
                    throw Error('单次执行时间格式应为 YYYY-MM-DD HH:mm:ss');
                }
                break;
            }
            case TaskTimeSize.second:
            case TaskTimeSize.minute:
            case TaskTimeSize.hour: {
                if (!/^\d+$/.test(value) || Number(value) <= 0) {
                    throw Error('执行间隔必须为正整数');
                }
                break;
            }
            case TaskTimeSize.day: {
                if (!/^\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(value)) {
                    throw Error('每天执行时间格式应为 HH:mm:ss');
                }
                break;
            }
            case TaskTimeSize.week: {
                if (!/^[1-7]\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(value)) {
                    throw Error(
                        '每周执行时间格式应为 "星期 HH:mm:ss"，如 "1 10:00:00"'
                    );
                }
                break;
            }
            case TaskTimeSize.month: {
                if (
                    !/^([1-9]|[12]\d|3[01])\s+\d{1,2}:\d{1,2}(:\d{1,2})?$/.test(
                        value
                    )
                ) {
                    throw Error(
                        '每月执行时间格式应为 "几号 HH:mm:ss"，如 "15 10:00:00"'
                    );
                }
                break;
            }
            case TaskTimeSize.crontab: {
                const parts = value.split(' ');
                if (parts.length < 5 || parts.length > 7) {
                    throw Error('定时规则表达式需要 5-7 段');
                }
                try {
                    parser.parseExpression(value);
                } catch (e) {
                    throw Error(`定时规则表达式非法: ${(e as Error).message}`);
                }
                break;
            }
        }

        // 外部执行器必须配置入口
        if (
            execType !== undefined &&
            execType !== TaskExecType.js &&
            !String(execCommand || '').trim()
        ) {
            throw Error('使用外部执行器时必须填写执行入口');
        }
    }

    @All('/setState')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async setState(@Body() data: { id: number; state: TaskState }) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        if (data.id > 0) {
            const task = await this.taskService.getById(data.id);
            if (!task) {
                throw Error('指定的任务不存在');
            }
            switch (data.state) {
                case TaskState.init: {
                    throw Error('不能回到初始化');
                }
            }
            task.state = data.state;
            return await this.taskService.update(task);
        } else {
            throw Error('请指定要修改的任务');
        }
    }

    // 给任务立即执行一次，
    @All('/run')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async run(@Body() data: { id: number }) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }
        if (!data.id) {
            throw new Error('请指定任务');
        }

        const task = await this.taskService.getById(data.id);

        if (task && task.valid === EValid.Valid) {
            // 手动触发，不受任务启用状态限制
            const res = await this.taskInstanceService.createTaskInstance(
                task,
                undefined,
                '',
                1
            );
            return res;
        } else {
            throw new Error('任务不存在');
        }
    }

    /**
     * 试运行脚本，不落库，便于编写任务时自测
     */
    @All('/testScript')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async testScript(@Body() data: any) {
        if (!this.taskService.checkManager()) {
            throw Error('没有权限');
        }

        const timeout = Number(data.timeout) || 30;
        const task = {
            id: 0,
            name: data.name || '试运行',
            description: '',
            script: String(data.script || ''),
            timeSize: data.timeSize ?? TaskTimeSize.second,
            timeValue: data.timeValue || '',
            execType: data.execType ?? TaskExecType.js,
            execCommand: data.execCommand || '',
            workDir: data.workDir || '',
            envJson: data.envJson || '',
        };

        const result = await executeTask({
            task,
            instance: { id: 0 },
            timeout,
            workRoot: this.testWorkRoot,
            requireAllowList: this.executorConfig?.requireAllowList || [],
        });

        return {
            success: result.status === 'success',
            status: result.status,
            message: result.message,
            duration: result.duration,
            exitCode: result.exitCode,
            log: result.log,
        };
    }

    /**
     * 任务健康度诊断
     *
     * 汇总任务配置体检与最近运行表现，输出问题清单与修复建议
     */
    @All('/diagnose')
    @decorators.checkApiToken(false)
    @decorators.checkLogin(true)
    public async diagnose(@Body() data: { id: number }): Promise<any> {
        if (!data?.id) {
            throw new Error('缺少任务ID');
        }
        return await this.diagnoseService.diagnose(Number(data.id));
    }

    @Config('executor')
    executorConfig: { workRoot?: string; requireAllowList?: string[] };

    private get testWorkRoot(): string {
        return (
            this.executorConfig?.workRoot ||
            path.join(
                process.env.TASK_DATA_ROOT || path.join(process.cwd(), 'data'),
                'exec'
            )
        );
    }
}
