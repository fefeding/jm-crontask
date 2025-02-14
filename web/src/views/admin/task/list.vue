<template>
  <div>
        <el-row class="clear">
          <el-form :inline="true">
            <el-form-item label="名称">
                <el-input class="search-input" clearable v-model="taskQueryRequest.name" placeholder="关键字"></el-input>
            </el-form-item>
             <el-form-item label="状态">
                <el-select  v-model="taskQueryRequest.state" placeholder="状态"
                style="width: 200px; margin-right: 20px">
                  <el-option key="0"
                            label="所有"
                            :value="0">
                  </el-option>
                  <el-option key="1"
                            label="已启用"
                            :value="1">
                  </el-option>
                  <el-option key="2"
                            label="已停用"
                            :value="2">
                  </el-option>
                  <el-option key="3"
                            label="已失效"
                            :value="3">
                </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
              <el-button class="search-button" type="primary" @click="()=>{taskQueryRequest.page=1;query()}">查询</el-button>
              <el-button class="add-button" type="success" @click="router.push({name: 'task_edit'})">创建任务</el-button>
            </el-form-item>
        </el-form>
        </el-row>
      <el-table
        :data="taskQueryResponse.data"
        element-loading-text="拼命加载中"
        border
        style="width: 100%;">
        <el-table-column
          prop="id"
          label="ID">
        </el-table-column>
        <el-table-column
          prop="name"
          label="名称">
        </el-table-column>
        <el-table-column
          prop="timeSize"
          label="执行方式">
          <template #default="scope">
            {{ getTimeTypeName(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="timeout"
          label="超时设置(秒)">
        </el-table-column>
        <el-table-column
            label="最近修改人"
            width="100">
            <template #default="scope">
                <StaffUserName
        style="max-height: 30px;" :id="scope.row.updater" domain=""></StaffUserName>
              </template>
        </el-table-column>
        <el-table-column
          prop="lastRunTime"
          label="最近执行时间">
        </el-table-column>
        <el-table-column
          prop="state"
          label="状态"
          width="100">
          <template #default="scope">
            {{ getTaskStateName(scope.row.state)}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="250">
          <template #default="scope">
            <el-button type="success" size="small" v-if="scope.row.state == 0 || scope.row.state == 2 || scope.row.state == 3" @click="setState(scope.row.id, 1, '启用')">启用</el-button>
            <el-button type="warning" size="small" v-if="scope.row.state == 1" @click="setState(scope.row.id, 2, '停用')">停用</el-button>
            <el-button type="warning" size="small" v-if="scope.row.state == 1" @click="runTask(scope.row.id)">立即执行</el-button>
            <router-link :to="{name:'task_edit', query: {id: scope.row.id}}" tag="span">
              <el-button type="primary" size="small">修改</el-button>
            </router-link>
            <el-button type="danger" size="small" icon="delete" v-if="scope.row.state != 3" @click="setState(scope.row.id, 3, '移除')">移除</el-button>
            <el-button type="info" size="small" @click="router.push({name: 'task_instance', query: {taskId: scope.row.id}})">查看执行情况</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px">        
          <el-pagination
              :page-size="taskQueryRequest.size"
              :current-page.sync="taskQueryRequest.page"
              @current-change="query"
              layout="total, prev, pager, next, jumper"
              :total="taskQueryResponse.total">
          </el-pagination>
      </div>
  </div>
</template>
<style>
</style>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter, } from 'vue-router';
import { ElMessageBox ,ElMessage } from 'element-plus';
import {TaskState, TaskTimeSize} from '../../../base/taskConst';
import { request } from '../../../service/base';
import StaffUserName from './staffUserName.vue';

    const router = useRouter();

    const taskQueryRequest = ref({
        name: "",
        state: 0,
        timeSize: 0,
        page: 1,
        size: 40
    });
    const taskQueryResponse = ref({} as any);

    const taskEditDialogTitle = ref('创建任务');
    const taskEditDialogVisible = ref(false);
    // 执行方式列表
    const TaskStateOptions = computed(()=>{
        
        const options = [] as any;
        for(let k in TaskState) {
            const v = Number(k);
            if(isNaN(v)) continue;
            options.push({
                label: getTaskStateName(v),
                value: v
            });
        }
        return options;
    });

    onMounted(()=>{    
        query();
    });

    // 查询任务配置
    async function query() {
        const res = await request('/api/task/query', taskQueryRequest.value);
        console.log(res);
        if(res.ret === 0) taskQueryResponse.value = res.data;
    }

    // 设置状态
    async function setState(id: number, state: number, actionName: string) {
        if(await ElMessageBox.confirm(`确定要${actionName}当前任务吗？`) != 'confirm') return;

        const rsp = await request('/api/task/setState', {
            id,
            state
        });
        
        if(rsp.ret == 0) {
            ElMessage.success(`${actionName}成功`);
            query();
        }
        else {
            ElMessage.error('失败：' + rsp.msg);
        }
    }

    // 立即执行一个任务
    async function runTask(id: number) {
        if(await ElMessageBox.confirm(`如果有实例执行，会导致重复执行。确定立即执行吗？`) != 'confirm') return;

        const rsp = await request('/api/task/run', {
            id
        });
        
        if(rsp.ret == 0) {
            ElMessage.success(`已进入执行队列`);
        }
        else {
            ElMessage.error('失败：' + rsp.msg);
        }
    }

    // 获取执行方式文案
    function getTimeTypeName(row: any) {
        switch(row.timeSize) {
            case TaskTimeSize.single: {
                return `${row.timeValue}执行一次`;
            }
            case TaskTimeSize.second: {
                return `每隔${row.timeValue}秒`;
            }
            case TaskTimeSize.minute: {
                return `每隔${row.timeValue}分`;
            }
            case TaskTimeSize.hour: {
                return `每隔${row.timeValue}小时`;
            }
            case TaskTimeSize.day: {
                return `每天${row.timeValue}`;
            }
            case TaskTimeSize.week: {
                return `每周${row.timeValue}`;
            }
            case TaskTimeSize.month: {
                return `每月${row.timeValue}`;
            }
            case TaskTimeSize.crontab: {
                return `定时规则：${row.timeValue}`;
            }
        }
        return '';
    }    

    // 获取执行方式文案
    function getTaskStateName(v: TaskState) {
        switch(v) {
            case TaskState.init: {
                return '初始化';
            }
            case TaskState.start: {
                return `已启用`;
            }
            case TaskState.stop: {
                return `已停用`;
            }
            case TaskState.disabled: {
                return `已失效`;
            }
        }
        return '';
    }
</script>