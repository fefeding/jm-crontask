-- 0001_init.sql
-- 初始化 CronTask 核心表结构（幂等，可重复执行）
-- 由 data/db_crontask.sql 提取三张表生成；使用 IF NOT EXISTS，不会删除已有表，
-- 故在已存在数据的生产库上重复执行也安全。

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
  `Fstate` smallint NOT NULL DEFAULT '0' COMMENT '任务执行时间单位',
  `Ftime_value` varchar(255) NOT NULL DEFAULT '' COMMENT '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Flast_run_time` varchar(255) NOT NULL DEFAULT '' COMMENT '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Fwatcher` varchar(64) NOT NULL DEFAULT '' COMMENT '任务关注人，staffid|staffid|...',
  `Ftimeout` int NOT NULL DEFAULT '1800' COMMENT '超时时间，单位秒',
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
