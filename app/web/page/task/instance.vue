<template>
  <div>
        <el-row class="clear">
          <el-form :inline="true">
            <el-form-item label="任务ID">
                <el-input class="search-input" clearable v-model="taskQueryRequest.taskId" placeholder="任务ID"></el-input>
            </el-form-item>
             <el-form-item label="状态">
                <el-select  v-model="taskQueryRequest.status" placeholder="状态">
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
              <el-button class="search-button" type="primary" @click="()=>{this.taskQueryRequest.page=1;this.query()}">查询</el-button>
                         
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
          <template slot-scope="props">
            {{ getTaskStatusName(props.row.status)}}
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
        </el-table-column>
        <el-table-column
          label="操作"
          width="200">
          <template slot-scope="props">
            <el-button type="success" size="small" @click="$router.push('/task/log?id=' + props.row.id)">查看日志</el-button>  
            <el-button type="error" v-if="props.row.status == 1" size="small" @click="setFailed(props.row.id)">作废</el-button>             
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 16px">        
          <el-pagination
              :page-size="taskQueryRequest.size"
              :current-page.sync="taskQueryRequest.page"
              @current-change="query"
              layout="total, prev, pager, next, jumper"
              :total="instanceData.total">
          </el-pagination>
      </div>
  </div>
</template>
<style>
</style>
<script lang="ts" src="./instance.ts">
</script>