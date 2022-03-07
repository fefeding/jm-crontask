// This file is created by egg-ts-helper@1.30.2
// Do not modify this file!!!!!!!!!

import 'egg';
type AnyClass = new (...args: any[]) => any;
type AnyFunc<T = any> = (...args: any[]) => T;
type CanExportFunc = AnyFunc<Promise<any>> | AnyFunc<IterableIterator<any>>;
type AutoInstanceType<T, U = T extends CanExportFunc ? T : T extends AnyFunc ? ReturnType<T> : T> = U extends AnyClass ? InstanceType<U> : U;
import ExportBase from '../../../app/service/base';
import ExportTask from '../../../app/service/task';
import ExportTaskInstance from '../../../app/service/taskInstance';
import ExportTaskLock from '../../../app/service/taskLock';

declare module 'egg' {
  interface IService {
    base: AutoInstanceType<typeof ExportBase>;
    task: AutoInstanceType<typeof ExportTask>;
    taskInstance: AutoInstanceType<typeof ExportTaskInstance>;
    taskLock: AutoInstanceType<typeof ExportTaskLock>;
  }
}
