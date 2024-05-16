// This file is created by egg-ts-helper@1.35.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

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
