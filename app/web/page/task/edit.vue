<template>
    <div style="width: 80%;">
        <el-form ref="form" v-model="taskData" label-width="80px">        
            <el-form-item label="名称">
                <el-input v-model="taskData.name" minlength="4" maxlength="32" placeholder="请输入任务名称" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="执行方式">
                <el-col :span="4">
                    <el-select v-model="taskData.timeSize" placeholder="请选择">
                        <el-option
                        v-for="item in TimeTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                        :disabled="item.value==5||item.value==6">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col class="line" :span="1">
                    &nbsp;
                </el-col>
                <el-col :span="4">
                    <el-date-picker v-if="taskData.timeSize == 0"
                        v-model="timeValue"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime"
                         placeholder="选择任务执行时间">
                    </el-date-picker>
                    <el-time-picker v-else-if="taskData.timeSize == 4" placeholder="选择每天执行时间" v-model="timeValue"
                        value-format="HH:mm:ss"></el-time-picker>
                    <el-input-number v-else v-model="timeValue" :min="1" :max="100000" label="执行隔间"></el-input-number>
                </el-col>
            </el-form-item>
            <el-form-item label="关注人">
                <el-input v-model="taskData.watcher" maxlength="64" placeholder="输入关注员工ID,用|分隔" show-word-limit></el-input>
            </el-form-item>
            <el-form-item label="脚本">
                <codemirror v-model="taskScript" :options="codeJSONOptions" style="height: 800px;"  />
            </el-form-item>            
            <el-form-item>
                <el-button @click="$router.go(-1)">取消</el-button>
                <el-button type="primary" @click="save()">保存</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<style>
.el-table .unique-row {
    background: #f0f9eb;
}
.vue-codemirror {
    text-align: left;
    line-height: 22px;
    font-size: 14px;
}
.CodeMirror-wrap {
    height: 100%;
}

.jsoneditor{
    border: 1px solid #ccc;
}
</style>
<script lang="ts" src="./edit.ts"></script>
