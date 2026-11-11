-- 0001_init.sql
-- 初始化 CronTask 核心表结构（幂等，可重复执行）
--
-- 与 src/model 下的实体（taskConfig / taskInstance / taskLock）保持一致，
-- 由 src/lib/__tests__/schema-migration.test.ts 做漂移校验。
--
-- 安全约束：
-- - 一律使用 CREATE TABLE IF NOT EXISTS，不使用 DROP TABLE，
--   在已存在数据的生产库上重复执行也不会清空数据；
-- - 公共字段（Fvalid/Fcreator/Fupdater/Fcreate_time/Fmodify_time）由
--   BaseEntity(@cicctencent/common) 提供，与实体声明保持一致。

CREATE TABLE IF NOT EXISTS `t_task_config` (
  `Fvalid` tinyint NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fid` int NOT NULL AUTO_INCREMENT COMMENT '数据唯一健',
  `Fname` varchar(64) NOT NULL COMMENT '任务名称',
  `Fdescription` varchar(128) NOT NULL DEFAULT '' COMMENT '说明文案',
  `Fscript` text NOT NULL COMMENT '运行脚本',
  `Ftime_size` smallint NOT NULL DEFAULT '0' COMMENT '任务执行时间单位',
  `Fstate` smallint NOT NULL DEFAULT '0' COMMENT '任务状态',
  `Ftimeout` int NOT NULL DEFAULT '1800' COMMENT '超时时间，单位秒',
  `Ftime_value` varchar(255) NOT NULL DEFAULT '' COMMENT '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Flast_run_time` varchar(255) NOT NULL DEFAULT '' COMMENT '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Fwatcher` varchar(64) NOT NULL DEFAULT '' COMMENT '任务关注人，staffid|staffid|...',
  `Fexec_type` smallint NOT NULL DEFAULT '0' COMMENT '执行器类型：0=内联JS 1=外部命令 2=子进程JS 3=shell 4=python',
  `Fexec_command` varchar(512) NOT NULL DEFAULT '' COMMENT '外部命令或脚本入口',
  `Fwork_dir` varchar(512) NOT NULL DEFAULT '' COMMENT '执行工作目录',
  `Fenv_json` text COMMENT '任务环境变量，JSON格式',
  `Fmiss_policy` smallint NOT NULL DEFAULT '0' COMMENT '漏跑补偿策略：0=只补一次 1=全量补跑 2=跳过',
  `Fmax_retry` int NOT NULL DEFAULT '0' COMMENT '失败重试次数',
  `Fretry_interval` int NOT NULL DEFAULT '60' COMMENT '重试间隔，单位秒',
  `Fpublish_dir` varchar(512) NOT NULL DEFAULT '' COMMENT '任务产物目录',
  `Fconsecutive_failures` int NOT NULL DEFAULT '0' COMMENT '连续失败次数',
  `Fmiss_count` int NOT NULL DEFAULT '0' COMMENT '上次检测到的漏跑次数',
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `t_task_instance` (
  `Fvalid` tinyint NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fid` int NOT NULL AUTO_INCREMENT COMMENT '数据唯一健',
  `Ftask_id` int NOT NULL COMMENT '关联的任务ID',
  `Fexec_server` varchar(64) DEFAULT NULL COMMENT '运行服务器',
  `Fexec_start_time` varchar(32) DEFAULT NULL COMMENT '运行起始时间',
  `Fexec_end_time` varchar(32) DEFAULT NULL COMMENT '运行结束时间',
  `Fstatus` smallint NOT NULL DEFAULT '0' COMMENT '任务状态',
  `Flog` longtext COMMENT '运行日志',
  `Fduration` int NOT NULL DEFAULT '0' COMMENT '执行耗时，单位毫秒',
  `Fexit_code` int NOT NULL DEFAULT '0' COMMENT '进程退出码',
  `Fretry_count` int NOT NULL DEFAULT '0' COMMENT '已重试次数',
  `Flog_path` varchar(512) NOT NULL DEFAULT '' COMMENT '日志落盘相对路径',
  `Fpublish_path` varchar(512) NOT NULL DEFAULT '' COMMENT '产物备份相对路径',
  `Ftrigger_type` smallint NOT NULL DEFAULT '0' COMMENT '触发方式：0=定时 1=手动',
  `Fpid` int NOT NULL DEFAULT '0' COMMENT '子进程pid',
  `Fnext_retry_time` varchar(32) NOT NULL DEFAULT '' COMMENT '下次重试时间',
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `t_task_lock` (
  `Fvalid` tinyint NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fkey` varchar(32) NOT NULL COMMENT '唯一锁',
  `Fname` varchar(64) NOT NULL COMMENT '锁名称',
  PRIMARY KEY (`Fkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
