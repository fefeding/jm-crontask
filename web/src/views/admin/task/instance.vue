<template>
  <div>
        <el-row class="clear">
          <el-form :inline="true">
            <el-form-item label="任务ID">
                <el-input class="search-input" clearable v-model="taskQueryRequest.taskId" placeholder="任务ID"></el-input>
            </el-form-item>
             <el-form-item label="状态">
                <el-select  v-model="taskQueryRequest.status" placeholder="状态" style="width: 200px; margin-right: 20px">
                  <el-option key="0"
                            label="所有"
                            :value="0">
                  </el-option>
                  <el-option key="1"
                            label="运行中"
                            :value="1">
                  </el-option>
                  <el-option key="2"
                            label="成功"
                            :value="2">
                  </el-option>
                  <el-option key="3"
                            label="失败"
                            :value="3">
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
              <el-button class="search-button" type="primary" @click="()=>{taskQueryRequest.page=1;query()}">查询</el-button>

            </el-form-item>
        </el-form>
        </el-row>
      <el-table
        :data="instanceData.data"
        element-loading-text="拼命加载中"
        border
        style="width: 100%;">
        <el-table-column
          prop="taskName"
          label="名称">
        </el-table-column>
        <el-table-column
          prop="taskId"
          label="任务ID">
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          width="100">
          <template #default="scope">
            {{ getTaskStatusName(scope.row.status)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="execServer"
          label="服务器">
        </el-table-column>
        <el-table-column
          prop="execStartTime"
          label="执行起始时间">
        </el-table-column>
        <el-table-column
          prop="execEndTime"
          label="执行结束时间">
        </el-table-column>
        <el-table-column
            prop="updater"
            label="最近修改人">
            <template #default="scope">
                <StaffUserName :id="scope.row.updater" domain=""
        style="max-height: 30px;"></StaffUserName>
              </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200">
          <template #default="scope">
            <el-button type="success" size="small" @click="router.push({name: 'task_log', query: {id:scope.row.id}})">查看日志</el-button>
            <el-button type="error" v-if="scope.row.status == 1" size="small" @click="setFailed(scope.row.id)">作废</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px">
          <el-pagination
              :page-size="taskQueryRequest.size"
              :current-page.sync="taskQueryRequest.page"
              @current-change="query"
              layout="prev, next, jumper"
              :total="instanceData.total">
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
import {TaskState, TaskTimeSize, TaskStatus} from '../../../base/taskConst';
import { request } from '../../../service/base';
import StaffUserName from './staffUserName.vue';
  const router = useRouter();
  const taskQueryRequest = ref({
        taskId: "",
        status: 0,
        timeSize: 0,
        page: 1,
        size: 15
    });
  const instanceData = ref({
        data: [],
        total: 0
    } as any);

    onMounted(async () => {    
        taskQueryRequest.value.taskId = router.currentRoute.value.query.taskId as string || '';
        query();
    });

    // 查询任务配置
    async function query() {
        const data = await request('/api/instance/query', taskQueryRequest.value,);
        console.log(data);
        if(data.ret == 0) {
            instanceData.value = data;
        }
        else {
          ElMessage.error(data.msg);
        }
    }

    // 废弃实例
    async function setFailed(id: number) {
        if(await ElMessageBox.confirm(`确定要废弃当前实例吗？，已经在运行时不会起作用，这里主要用于清理异常数据。`) != 'confirm') return;

        const data = await request('/api/instance/updateStatus', {
                id: id,
                status: TaskStatus.failed
        });
        console.log(data);
        if(data.ret == 0) {
          ElMessage.success('操作成功');
          query();
        }
        else {
          ElMessage.error('操作失败');
        }
    }

    // 获取执行方式文案
    function getTaskStatusName(v: number) {
        switch(v) {
            case TaskStatus.init: {
                return '等待执行';
            }
            case TaskStatus.running: {
                return `执行中`;
            }
            case TaskStatus.success: {
                return `成功`;
            }
            case TaskStatus.failed: {
                return `失败`;
            }
        }
        return '';
    }
</script>
