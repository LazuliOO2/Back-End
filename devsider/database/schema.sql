CREATE DATABASE  IF NOT EXISTS `devsider` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `devsider`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: devsider
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `campanha_listas`
--

DROP TABLE IF EXISTS `campanha_listas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campanha_listas` (
  `campanha_id` int unsigned NOT NULL,
  `lista_id` int unsigned NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`campanha_id`,`lista_id`),
  KEY `fk_campanha_listas_lista` (`lista_id`),
  CONSTRAINT `fk_campanha_listas_campanha` FOREIGN KEY (`campanha_id`) REFERENCES `campanhas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_campanha_listas_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `campanhas`
--

DROP TABLE IF EXISTS `campanhas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campanhas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `mensagem` text NOT NULL,
  `delay_min_segundos` int NOT NULL,
  `delay_max_segundos` int NOT NULL,
  `status` enum('CRIADA','ATIVA','PAUSADA','ENCERRADA') NOT NULL,
  `data_inicio` datetime DEFAULT NULL,
  `data_fim` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contatos`
--

DROP TABLE IF EXISTS `contatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contatos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(50) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_contatos_telefone` (`telefone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `execucao_fluxo`
--

DROP TABLE IF EXISTS `execucao_fluxo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `execucao_fluxo` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fluxo_id` int unsigned NOT NULL,
  `contato_id` int unsigned NOT NULL,
  `inicio_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ultimo_envio_em` datetime DEFAULT NULL,
  `etapa_atual_ordem` int NOT NULL DEFAULT '0',
  `status` enum('EM_ANDAMENTO','CONCLUIDO','CANCELADO') NOT NULL DEFAULT 'EM_ANDAMENTO',
  `proxima_execucao_em` datetime DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_execucao_fluxo_contato` (`contato_id`),
  KEY `idx_execucao_fluxo_fluxo_contato` (`fluxo_id`,`contato_id`),
  KEY `idx_execucao_fluxo_status` (`status`),
  CONSTRAINT `fk_execucao_fluxo_contato` FOREIGN KEY (`contato_id`) REFERENCES `contatos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_execucao_fluxo_fluxo` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fila_envio`
--

DROP TABLE IF EXISTS `fila_envio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fila_envio` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `contato_id` int unsigned NOT NULL,
  `mensagem` text NOT NULL,
  `tipo` enum('CAMPANHA','FLUXO') NOT NULL,
  `campanha_id` int unsigned DEFAULT NULL,
  `fluxo_id` int unsigned DEFAULT NULL,
  `fluxo_etapa_id` int unsigned DEFAULT NULL,
  `execucao_fluxo_id` int unsigned DEFAULT NULL,
  `agendar_para` datetime NOT NULL,
  `status` enum('PENDENTE','PROCESSANDO','ENVIADO','ERRO') NOT NULL DEFAULT 'PENDENTE',
  `enviado_em` datetime DEFAULT NULL,
  `tentativas` tinyint unsigned NOT NULL DEFAULT '0',
  `erro_msg` text,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_fila_contato` (`contato_id`),
  KEY `fk_fila_campanha` (`campanha_id`),
  KEY `fk_fila_fluxo` (`fluxo_id`),
  KEY `fk_fila_fluxo_etapa` (`fluxo_etapa_id`),
  KEY `idx_fila_status_agenda` (`status`,`agendar_para`),
  KEY `idx_fila_execucao_fluxo` (`execucao_fluxo_id`),
  CONSTRAINT `fk_fila_campanha` FOREIGN KEY (`campanha_id`) REFERENCES `campanhas` (`id`),
  CONSTRAINT `fk_fila_contato` FOREIGN KEY (`contato_id`) REFERENCES `contatos` (`id`),
  CONSTRAINT `fk_fila_execucao_fluxo` FOREIGN KEY (`execucao_fluxo_id`) REFERENCES `execucao_fluxo` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fila_fluxo` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`),
  CONSTRAINT `fk_fila_fluxo_etapa` FOREIGN KEY (`fluxo_etapa_id`) REFERENCES `fluxo_etapas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fluxo_etapas`
--

DROP TABLE IF EXISTS `fluxo_etapas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fluxo_etapas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fluxo_id` int unsigned NOT NULL,
  `ordem` int NOT NULL,
  `mensagem` text NOT NULL,
  `offset_segundos` int NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_fluxo_etapas_fluxo_ordem` (`fluxo_id`,`ordem`),
  CONSTRAINT `fk_fluxo` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fluxo_listas`
--

DROP TABLE IF EXISTS `fluxo_listas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fluxo_listas` (
  `fluxo_id` int unsigned NOT NULL,
  `lista_id` int unsigned NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`fluxo_id`,`lista_id`),
  KEY `fk_fluxo_listas_lista` (`lista_id`),
  CONSTRAINT `fk_fluxo_listas_fluxo` FOREIGN KEY (`fluxo_id`) REFERENCES `fluxos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fluxo_listas_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fluxos`
--

DROP TABLE IF EXISTS `fluxos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fluxos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text,
  `ativo` tinyint(1) NOT NULL DEFAULT '1',
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lista_contatos`
--

DROP TABLE IF EXISTS `lista_contatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lista_contatos` (
  `lista_id` int unsigned NOT NULL,
  `contato_id` int unsigned NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lista_id`,`contato_id`),
  KEY `idx_lista_contatos_contato` (`contato_id`),
  CONSTRAINT `fk_lc_contato` FOREIGN KEY (`contato_id`) REFERENCES `contatos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lc_lista` FOREIGN KEY (`lista_id`) REFERENCES `listas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `listas`
--

DROP TABLE IF EXISTS `listas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-01 10:12:20
