// This file is created by egg-ts-helper@1.25.6
// Do not modify this file!!!!!!!!!

import 'egg';
import ExportIndex from '../../../app/controller/index';
import ExportInstance from '../../../app/controller/instance';
import ExportTask from '../../../app/controller/task';

declare module 'egg' {
  interface IController {
    index: ExportIndex;
    instance: ExportInstance;
    task: ExportTask;
  }
}
