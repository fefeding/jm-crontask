// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportTask from '../../../app/model/task';
import ExportTaskConfig from '../../../app/model/taskConfig';
import ExportTaskConst from '../../../app/model/taskConst';
import ExportTaskInstance from '../../../app/model/taskInstance';
import ExportTaskLock from '../../../app/model/taskLock';

declare module 'egg' {
  interface IModel {
    Task: ReturnType<typeof ExportTask>;
    TaskConfig: ReturnType<typeof ExportTaskConfig>;
    TaskConst: ReturnType<typeof ExportTaskConst>;
    TaskInstance: ReturnType<typeof ExportTaskInstance>;
    TaskLock: ReturnType<typeof ExportTaskLock>;
  }
}
