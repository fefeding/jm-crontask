// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportBaseORM from '../../../app/model/baseORM';
import ExportTask from '../../../app/model/task';
import ExportTaskConfig from '../../../app/model/taskConfig';
import ExportTaskConst from '../../../app/model/taskConst';
import ExportTaskInstance from '../../../app/model/taskInstance';
import ExportTaskLock from '../../../app/model/taskLock';
import ExportInterfaceEnumType from '../../../app/model/interface/enumType';
import ExportInterfaceMessage from '../../../app/model/interface/message';
import ExportInterfaceModel from '../../../app/model/interface/model';
import ExportInterfacePagination from '../../../app/model/interface/pagination';
import ExportInterfacePublishLog from '../../../app/model/interface/publishLog';
import ExportInterfaceRequest from '../../../app/model/interface/request';
import ExportInterfaceResponse from '../../../app/model/interface/response';

declare module 'egg' {
  interface IModel {
    BaseORM: ReturnType<typeof ExportBaseORM>;
    Task: ReturnType<typeof ExportTask>;
    TaskConfig: ReturnType<typeof ExportTaskConfig>;
    TaskConst: ReturnType<typeof ExportTaskConst>;
    TaskInstance: ReturnType<typeof ExportTaskInstance>;
    TaskLock: ReturnType<typeof ExportTaskLock>;
    Interface: {
      EnumType: ReturnType<typeof ExportInterfaceEnumType>;
      Message: ReturnType<typeof ExportInterfaceMessage>;
      Model: ReturnType<typeof ExportInterfaceModel>;
      Pagination: ReturnType<typeof ExportInterfacePagination>;
      PublishLog: ReturnType<typeof ExportInterfacePublishLog>;
      Request: ReturnType<typeof ExportInterfaceRequest>;
      Response: ReturnType<typeof ExportInterfaceResponse>;
    }
  }
}
