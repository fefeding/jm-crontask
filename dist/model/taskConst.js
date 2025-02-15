"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLockKeys = exports.TaskStatus = exports.TaskState = exports.TaskTimeSize = void 0;
/** 任务执行粒度 */
var TaskTimeSize;
(function (TaskTimeSize) {
    /** 单次执行 */
    TaskTimeSize[TaskTimeSize["single"] = 0] = "single";
    /** 循环执行的任务 */
    // 秒
    TaskTimeSize[TaskTimeSize["second"] = 1] = "second";
    // 分
    TaskTimeSize[TaskTimeSize["minute"] = 2] = "minute";
    // 小时
    TaskTimeSize[TaskTimeSize["hour"] = 3] = "hour";
    // 按天
    TaskTimeSize[TaskTimeSize["day"] = 4] = "day";
    // 按周
    TaskTimeSize[TaskTimeSize["week"] = 5] = "week";
    // 按月
    TaskTimeSize[TaskTimeSize["month"] = 6] = "month";
    // 定时规则
    TaskTimeSize[TaskTimeSize["crontab"] = 7] = "crontab";
})(TaskTimeSize = exports.TaskTimeSize || (exports.TaskTimeSize = {}));
// 任务当前状态
var TaskState;
(function (TaskState) {
    /** 初始化 */
    TaskState[TaskState["init"] = 0] = "init";
    /** 已启用 */
    TaskState[TaskState["start"] = 1] = "start";
    /** 已停用 */
    TaskState[TaskState["stop"] = 2] = "stop";
    /** 已失效 */
    TaskState[TaskState["disabled"] = 3] = "disabled";
})(TaskState = exports.TaskState || (exports.TaskState = {}));
// 任务当前状态
var TaskStatus;
(function (TaskStatus) {
    /** 初始化 */
    TaskStatus[TaskStatus["init"] = 0] = "init";
    /** 运行中 */
    TaskStatus[TaskStatus["running"] = 1] = "running";
    /** 运行成功 */
    TaskStatus[TaskStatus["success"] = 2] = "success";
    /** 执行失败 */
    TaskStatus[TaskStatus["failed"] = 3] = "failed";
    /** 执行超时 */
    TaskStatus[TaskStatus["timeout"] = 4] = "timeout";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
/** 任务锁 */
var TaskLockKeys;
(function (TaskLockKeys) {
    TaskLockKeys["master"] = "master_lock";
    TaskLockKeys["task"] = "task_lock";
})(TaskLockKeys = exports.TaskLockKeys || (exports.TaskLockKeys = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza0NvbnN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21vZGVsL3Rhc2tDb25zdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxhQUFhO0FBQ2IsSUFBWSxZQWtCWDtBQWxCRCxXQUFZLFlBQVk7SUFDcEIsV0FBVztJQUNYLG1EQUFVLENBQUE7SUFDVixjQUFjO0lBQ2QsSUFBSTtJQUNKLG1EQUFVLENBQUE7SUFDVixJQUFJO0lBQ0osbURBQVUsQ0FBQTtJQUNWLEtBQUs7SUFDTCwrQ0FBUSxDQUFBO0lBQ1IsS0FBSztJQUNMLDZDQUFPLENBQUE7SUFDUCxLQUFLO0lBQ0wsK0NBQVEsQ0FBQTtJQUNSLEtBQUs7SUFDTCxpREFBUyxDQUFBO0lBQ1QsT0FBTztJQUNQLHFEQUFXLENBQUE7QUFDZixDQUFDLEVBbEJXLFlBQVksR0FBWixvQkFBWSxLQUFaLG9CQUFZLFFBa0J2QjtBQUVELFNBQVM7QUFDVCxJQUFZLFNBU1g7QUFURCxXQUFZLFNBQVM7SUFDakIsVUFBVTtJQUNWLHlDQUFRLENBQUE7SUFDUixVQUFVO0lBQ1YsMkNBQVMsQ0FBQTtJQUNULFVBQVU7SUFDVix5Q0FBUSxDQUFBO0lBQ1IsVUFBVTtJQUNWLGlEQUFZLENBQUE7QUFDaEIsQ0FBQyxFQVRXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBU3BCO0FBR0QsU0FBUztBQUNULElBQVksVUFXWDtBQVhELFdBQVksVUFBVTtJQUNsQixVQUFVO0lBQ1YsMkNBQVEsQ0FBQTtJQUNSLFVBQVU7SUFDVixpREFBVyxDQUFBO0lBQ1gsV0FBVztJQUNYLGlEQUFXLENBQUE7SUFDWCxXQUFXO0lBQ1gsK0NBQVUsQ0FBQTtJQUNWLFdBQVc7SUFDWCxpREFBVyxDQUFBO0FBQ2YsQ0FBQyxFQVhXLFVBQVUsR0FBVixrQkFBVSxLQUFWLGtCQUFVLFFBV3JCO0FBRUQsVUFBVTtBQUNWLElBQVksWUFHWDtBQUhELFdBQVksWUFBWTtJQUNwQixzQ0FBc0IsQ0FBQTtJQUN0QixrQ0FBa0IsQ0FBQTtBQUN0QixDQUFDLEVBSFcsWUFBWSxHQUFaLG9CQUFZLEtBQVosb0JBQVksUUFHdkIifQ==