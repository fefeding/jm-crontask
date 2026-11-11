<template>
<div class="datagrid-container">
  <div class="datagrid-inner">
    <table class="table table-light table-striped table-hover">
        <thead class="table-light">
            <tr>
                <th v-for="column in props.columns" :key="column.name" scope="col" class="datagrid-th" :style="column.headerStyle||''" > 
                  <slot :name="column.name+'_header'" :column="column">
                        <span>{{column.text||column.name||''}}</span>
                    </slot>                    
                </th>
            </tr>
        </thead>
        <tbody class="table-group-divider">
            <tr v-for="(row, index) in props.data" :key="index" @click="emits('rowClicked', row, index)" style="cursor: pointer;">
                <td v-for="column in props.columns" :key="column.name" :style="column.style||''">
                    <slot :name="column.name||column" :row="row" :column="column">
                        <component v-if="column.component" :is="column.component"></component>
                        <span v-else>{{ renderDataItem(row, column) }}</span>
                    </slot>                    
                </td>
            </tr>
        </tbody>
        <tfoot>
            <slot name="footer" :columns="props.columns"></slot>   
        </tfoot>
    </table>
    <Loading :isLoading="props.isLoading" :message="props.loadingMessage"></Loading>
  </div>
    <!-- 分页组件 -->
    <Pagination v-if="props.showPagination" :currentPage="props.currentPage" :totalPages="props.totalPages" @pageChanged="pageChanged"></Pagination>
</div>
</template>
  
<script setup lang="ts">
  import { ref, computed, defineComponent, type Component } from 'vue';
  import Loading from '../loading/index.vue';
  import Pagination from './pagination.vue';

  type ColumnType = {
    name: string;
    text?: string;
    component?: Component;
    headerStyle?: string;
    style?: string;
    formatter?: (value: any) => string;
  };
  
  const props = defineProps({
    isLoading: {
      type: Boolean,
      default: false
    },
    loadingMessage: {
      type: String,
      default: '加载中...'
    },
    // 总页数
    totalPages: {
        type: Number,
        default: 1
    },
    currentPage: {
        type: Number,
        default: 1,
    },
    showPagination: {
        type: Boolean,
        default: true
    },
    data: {
        type: Array<any>,
        default: []
    },
    columns: {
        type: Array<ColumnType>,
        default: []
    }
  });

  const emits = defineEmits(['pageChanged', 'rowClicked']);

  function renderDataItem(row: any, column: any) {
    if(typeof column === 'string') return row[column];
    if(column.formatter) {
        return column.formatter(row, column);
    }
    return row[column.name];
  }

  function pageChanged(page: number) {
    emits('pageChanged', page);
  }

</script>
  
<style scoped>
  .datagrid-inner {
    overflow: auto;
    margin-bottom: 10px;
  }
  .datagrid-th {
    min-width: 80px;
    white-space: nowrap;
  }
  /* 表格内的按钮保持单行文字，避免窄列时被压成竖排字符 */
  .datagrid-inner :deep(.btn) {
    white-space: nowrap;
  }
  /* 操作列按钮过多时整体换行，而不是互相挤压 */
  .datagrid-inner :deep(.btn-group) {
    flex-wrap: wrap;
  }
  .datagrid-inner :deep(.btn-group > .btn) {
    flex: 0 0 auto;
  }
</style>  