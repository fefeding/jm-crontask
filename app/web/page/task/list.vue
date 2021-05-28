<template>
  <div>
        <el-row class="clear">
          <el-form :inline="true">
            <el-form-item label="名称">
                <el-input class="search-input" clearable v-model="taskQueryRequest.name" placeholder="关键字"></el-input>
            </el-form-item>
             <el-form-item label="状态">
                <el-select  v-model="taskQueryRequest.state" placeholder="状态">
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
              <el-button class="search-button" type="primary" @click="()=>{this.taskQueryRequest.page=1;this.query()}">查询</el-button>
              <el-button class="add-button" type="success" @click="$router.push('/task/edit?id=0')">创建任务</el-button>
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
          <template slot-scope="props">
            {{ getTimeTypeName(props.row) }}
          </template>
        </el-table-column>
        <el-table-column
            prop="updater"
            label="最近修改人"
            width="100">
        </el-table-column>
        <el-table-column
          prop="lastRunTime"
          label="最近执行时间">
        </el-table-column>
        <el-table-column
          prop="state"
          label="状态"
          width="100">
          <template slot-scope="props">
            {{ getTaskStateName(props.row.state)}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="250">
          <template slot-scope="props">
            <el-button type="success" size="small" v-if="props.row.state == 0 || props.row.state == 2 || props.row.state == 3" @click="setState(props.row.id, 1, '启用')">启用</el-button>
            <el-button type="warning" size="small" v-if="props.row.state == 1" @click="setState(props.row.id, 2, '停用')">停用</el-button>
            <el-button type="warning" size="small" v-if="props.row.state == 1" @click="runTask(props.row.id)">立即执行</el-button>
            <router-link :to="'/task/edit?id=' + props.row.id" tag="span">
              <el-button type="primary" size="small">修改</el-button>
            </router-link>
            <el-button type="danger" size="small" icon="delete" v-if="props.row.state != 3" @click="setState(props.row.id, 3, '移除')">移除</el-button>
            <el-button type="info" size="small" @click="$router.push('/task/instance?taskId=' + props.row.id)">查看执行情况</el-button>
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
<script lang="ts" src="./list.ts">
</script>