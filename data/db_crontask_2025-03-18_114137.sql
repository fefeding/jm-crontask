-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: gz-cdb-2hrot0ff.sql.tencentcdb.com    Database: db_crontask
-- ------------------------------------------------------
-- Server version	5.7.18-txsql-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '50caf6dc-24d0-11ef-808e-20906fb4e101:1-1273072';

--
-- Table structure for table `t_task_config`
--

DROP TABLE IF EXISTS `t_task_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_config` (
  `Fvalid` tinyint(4) NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fid` int(11) NOT NULL AUTO_INCREMENT COMMENT '数据唯一健',
  `Fname` varchar(64) NOT NULL COMMENT '任务名称',
  `Fdescription` varchar(128) NOT NULL DEFAULT '' COMMENT '说明文案',
  `Fscript` text NOT NULL COMMENT '运行脚本',
  `Ftime_size` smallint(6) NOT NULL DEFAULT '0' COMMENT '任务执行时间单位',
  `Fstate` smallint(6) NOT NULL DEFAULT '0' COMMENT '任务执行时间单位',
  `Ftime_value` varchar(255) NOT NULL DEFAULT '' COMMENT '执行的具体时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Flast_run_time` varchar(255) NOT NULL DEFAULT '' COMMENT '最后一次执行时间，格式（YYYY-MM-DD hh:mm:ss）',
  `Fwatcher` varchar(64) NOT NULL DEFAULT '' COMMENT '任务关注人，staffid|staffid|...',
  `Ftimeout` int(11) NOT NULL DEFAULT '1800' COMMENT '超时时间，单位秒',
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_task_config`
--

/*!40000 ALTER TABLE `t_task_config` DISABLE KEYS */;
INSERT INTO `t_task_config` VALUES (1,'','1009','2024-08-19 20:46:34','2025-02-10 17:29:50',1,'test','','\nawait sleep(10000000);\nconsole.log(1);',1,3,'10','2024-08-20 15:57:49','',1800),(1,'','1009','2024-08-20 15:53:19','2025-03-09 10:19:56',2,'task','','const axios = modules.axios.create();\n\nconst res = await axios.get(\'https://www.baidu.com\', {\n    responseType: \'text\'\n});\n\nconsole.log(res.data);',1,3,'1','2024-08-20 19:21:26','',1800),(1,'','1009','2024-08-20 15:58:25','2024-08-20 17:23:55',3,'','','',0,3,'','','',1800),(1,'','1009','2024-08-20 16:00:43','2024-08-20 17:24:08',4,'bbbbb','','1111',1,3,'1111','','',1800),(1,'','1009','2024-08-20 16:02:44','2024-08-20 17:24:11',5,'999999999999999','','23432423',1,3,'12','','',1800),(1,'','1009','2024-08-20 17:23:44','2025-01-12 11:06:28',6,'定时抓取资讯','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?app_id=5\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}\nfinally {\n    \n    const buildRes = await axios.get(\'http://tools.jm47.com/build-article\');\n\n    console.log(buildRes.data);\n}\n\n',2,2,'10','2025-01-12 11:02:34','',1800),(1,'','1009','2024-11-07 20:03:28','2025-03-17 23:46:17',7,'定时向百度提交链接','','const url = \'http://data.zz.baidu.com/urls?site=https://www.aigcwhere.com&token=TDHGsdB2I4Ds4EAH\';\r\n\r\nconst axios = modules.axios.create();\r\n\r\n\r\nconst res = await axios.post(url, \'https://www.aigcwhere.com/articles.xml\', {\r\n  Headers: {\r\n    \"Content-Type\": \"text/plain\"\r\n  }\r\n});\r\nconsole.log(\'push baidu result\', res.data);',3,1,'12','2025-03-17 23:46:17','',1800),(1,'','1009','2025-01-12 11:04:15','2025-03-18 11:32:02',8,'定时抓取科技新闻','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=tech\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'5','2025-03-18 11:32:02','',1800),(1,'','1009','2025-01-12 11:04:54','2025-03-18 11:34:46',9,'定时抓取游戏新闻','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=game\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'10','2025-03-18 11:34:45','',1800),(1,'','1009','2025-01-12 11:05:32','2025-03-18 11:40:51',10,'定时抓取娱乐新闻','','const axios = modules.axios.create();\n\ntry{\n    let getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=movie\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n    \n    getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=tv\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n    \n    getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=music\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'10','2025-03-18 11:40:51','',1800),(1,'','1009','2025-01-12 11:06:13','2025-03-18 11:32:08',11,'定时抓取体育新闻','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=sport\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'10','2025-03-18 11:32:08','',1800),(1,'','1009','2025-02-07 19:05:18','2025-03-18 11:40:44',12,'定时抓取要闻','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=yaowen\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'5','2025-03-18 11:40:42','',1800),(1,'','1009','2025-02-27 23:08:21','2025-03-18 11:31:57',13,'定时生成TOP资讯','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/build-article\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'10','2025-03-18 11:31:56','',1800),(1,'','1009','2025-02-28 00:35:14','2025-03-18 11:39:59',14,'金融新闻抓取','','const axios = modules.axios.create();\n\ntry{\n    const getRes = await axios.get(\'http://tools.jm47.com/get-articles?types=money\',{\n        timeout: 1800000\n    });\n\n    console.log(getRes.data);\n}\ncatch(e) {\n    console.error(e);\n}',2,1,'10','2025-03-18 11:39:59','',1800);
/*!40000 ALTER TABLE `t_task_config` ENABLE KEYS */;

--
-- Table structure for table `t_task_instance`
--

DROP TABLE IF EXISTS `t_task_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_instance` (
  `Fvalid` tinyint(4) NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fid` int(11) NOT NULL AUTO_INCREMENT COMMENT '数据唯一健',
  `Ftask_id` int(11) NOT NULL COMMENT '关联的任务ID',
  `Fexec_server` varchar(64) DEFAULT NULL COMMENT '运行服务器',
  `Fexec_start_time` varchar(32) DEFAULT NULL COMMENT '运行起始时间',
  `Fexec_end_time` varchar(32) DEFAULT NULL COMMENT '运行结束时间',
  `Fstatus` smallint(6) NOT NULL DEFAULT '0' COMMENT '任务状态',
  `Flog` longtext COMMENT '运行日志',
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB AUTO_INCREMENT=79969 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_task_instance`
--

/*!40000 ALTER TABLE `t_task_instance` DISABLE KEYS */;
INSERT INTO `t_task_instance` VALUES (1,'task','task','2025-03-18 11:29:06','2025-03-18 11:39:57',79959,14,'10.206.0.7','2025-03-18 11:29:55','2025-03-18 11:39:56',2,'[info][79959] 开始执行\n金融新闻抓取\n[error][79959] {\"message\":\"Request failed with status code 504\",\"name\":\"AxiosError\",\"stack\":\"AxiosError: Request failed with status code 504\\n    at settle (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:2015:12)\\n    at IncomingMessage.handleStreamEnd (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:3131:11)\\n    at IncomingMessage.emit (node:events:531:35)\\n    at endReadableNT (node:internal/streams/readable:1696:12)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)\\n    at Axios.request (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:4262:41)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\\n    at async Object.eval (eval at runScript (/data/server/crontask/node_modules/.store/jm-jsruntime@1.0.4/node_modules/jm-jsruntime/index.js:68:17), <anonymous>:6:20)\n 更多日志请移步es查询包含[79959]'),(1,'task','task','2025-03-18 11:30:34','2025-03-18 11:40:39',79960,12,'10.206.0.7','2025-03-18 11:30:36','2025-03-18 11:40:37',2,'[info][79960] 开始执行\n定时抓取要闻\n[error][79960] {\"message\":\"Request failed with status code 504\",\"name\":\"AxiosError\",\"stack\":\"AxiosError: Request failed with status code 504\\n    at settle (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:2015:12)\\n    at IncomingMessage.handleStreamEnd (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:3131:11)\\n    at IncomingMessage.emit (node:events:531:35)\\n    at endReadableNT (node:internal/streams/readable:1696:12)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:82:21)\\n    at Axios.request (/data/server/crontask/node_modules/.store/axios@1.7.4/node_modules/axios/dist/node/axios.cjs:4262:41)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)\\n    at async Object.eval (eval at runScript (/data/server/crontask/node_modules/.store/jm-jsruntime@1.0.4/node_modules/jm-jsruntime/index.js:68:17), <anonymous>:6:20)\n 更多日志请移步es查询包含[79960]'),(1,'task','task','2025-03-18 11:30:47','2025-03-18 11:40:48',79961,10,'172.16.0.15','2025-03-18 11:30:48','2025-03-18 11:40:48',2,'[info][79961] 开始执行\n定时抓取娱乐新闻\n[error][79961] {\"message\":\"Request failed with status code 504\",\"name\":\"AxiosError\",\"stack\":\"AxiosError: Request failed with status code 504\\n    at settle (/data/server/crontask/node_modules/.store/axios@1.7.9/node_modules/axios/dist/node/axios.cjs:2026:12)\\n    at IncomingMessage.handleStreamEnd (/data/server/crontask/node_modules/.store/axios@1.7.9/node_modules/axios/dist/node/axios.cjs:3142:11)\\n    at IncomingMessage.emit (node:events:519:35)\\n    at endReadableNT (node:internal/streams/readable:1696:12)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:90:21)\\n    at Axios.request (/data/server/crontask/node_modules/.store/axios@1.7.9/node_modules/axios/dist/node/axios.cjs:4252:41)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async Object.eval (eval at runScript (/data/server/crontask/node_modules/.store/jm-jsruntime@1.0.7/node_modules/jm-jsruntime/index.js:84:17), <anonymous>:6:\n 更多日志请移步es查询包含[79961]'),(1,'task','task','2025-03-18 11:32:00','2025-03-18 11:32:02',79963,8,'172.16.0.15','2025-03-18 11:32:02','',1,''),(1,'task','task','2025-03-18 11:32:06','2025-03-18 11:32:08',79964,11,'172.16.0.15','2025-03-18 11:32:08','',1,''),(1,'task','task','2025-03-18 11:34:42','2025-03-18 11:34:45',79965,9,'172.16.0.15','2025-03-18 11:34:45','',1,''),(1,'task','task','2025-03-18 11:39:58','2025-03-18 11:39:59',79966,14,'172.16.0.15','2025-03-18 11:39:59','',1,''),(1,'task','task','2025-03-18 11:40:40','2025-03-18 11:40:43',79967,12,'10.206.0.7','2025-03-18 11:40:42','',1,''),(1,'task','task','2025-03-18 11:40:49','2025-03-18 11:40:51',79968,10,'10.206.0.7','2025-03-18 11:40:51','',1,'');
/*!40000 ALTER TABLE `t_task_instance` ENABLE KEYS */;

--
-- Table structure for table `t_task_lock`
--

DROP TABLE IF EXISTS `t_task_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_lock` (
  `Fvalid` tinyint(4) NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fkey` varchar(32) NOT NULL COMMENT '唯一锁',
  `Fname` varchar(64) NOT NULL COMMENT '锁名称',
  PRIMARY KEY (`Fkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_task_lock`
--

/*!40000 ALTER TABLE `t_task_lock` DISABLE KEYS */;
INSERT INTO `t_task_lock` VALUES (1,'task','task','2024-08-08 19:31:20','2024-08-08 19:31:20','master_lock',''),(1,'task','task','2024-08-19 21:04:38','2024-08-19 21:04:38','task_lock','');
/*!40000 ALTER TABLE `t_task_lock` ENABLE KEYS */;

--
-- Dumping routines for database 'db_crontask'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-18 11:41:58
