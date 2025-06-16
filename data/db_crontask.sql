-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: gz-cynosdbmysql-grp-aux9yzul.sql.tencentcdb.com    Database: db_crontask
-- ------------------------------------------------------
-- Server version	8.0.30-cynos

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

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'f30d19ab-02e8-11f0-969a-00f100004023:1-399290';

--
-- Table structure for table `t_task_config`
--

DROP TABLE IF EXISTS `t_task_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_config` (
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task_instance`
--

DROP TABLE IF EXISTS `t_task_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_instance` (
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
) ENGINE=InnoDB AUTO_INCREMENT=136773 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `t_task_lock`
--

DROP TABLE IF EXISTS `t_task_lock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `t_task_lock` (
  `Fvalid` tinyint NOT NULL DEFAULT '1' COMMENT '是否有效',
  `Fcreator` varchar(64) NOT NULL DEFAULT '' COMMENT '创建人',
  `Fupdater` varchar(64) NOT NULL DEFAULT '' COMMENT '修改人',
  `Fcreate_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `Fmodify_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '修改时间',
  `Fkey` varchar(32) NOT NULL COMMENT '唯一锁',
  `Fname` varchar(64) NOT NULL COMMENT '锁名称',
  PRIMARY KEY (`Fkey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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

-- Dump completed on 2025-06-16 16:14:46
