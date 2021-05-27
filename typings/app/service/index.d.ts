// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBase from '../../../app/service/base';
import ExportTask from '../../../app/service/task';
import ExportTaskInstance from '../../../app/service/taskInstance';
import ExportTaskLock from '../../../app/service/taskLock';

declare module 'egg' {
  interface IService {
    base: ExportBase;
    task: ExportTask;
    taskInstance: ExportTaskInstance;
    taskLock: ExportTaskLock;
  }
}
