/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.7-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: crm_project
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Activities`
--

DROP TABLE IF EXISTS `Activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Activities` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Note` text NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `CustomerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `CustomerId` (`CustomerId`),
  CONSTRAINT `Activities_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Activities_ibfk_2` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Activities`
--

LOCK TABLES `Activities` WRITE;
/*!40000 ALTER TABLE `Activities` DISABLE KEYS */;
INSERT INTO `Activities` VALUES
(1,'Initial contact with customer.','2025-10-13 12:01:31',1,1),
(2,'Follow-up call scheduled.','2025-10-13 12:01:31',1,2),
(3,'Sent a proposal.','2025-10-13 12:01:31',1,3),
(4,'Meeting to discuss the project.','2025-10-13 12:01:31',1,4),
(5,'Customer raised a support ticket.','2025-10-13 12:01:31',1,5),
(6,'Onboarding session completed.','2025-10-13 12:01:31',1,6),
(7,'Checked in with the client.','2025-10-13 12:01:31',1,7),
(8,'Payment reminder sent.','2025-10-13 12:01:31',1,8),
(9,'User training session.','2025-10-13 12:01:31',1,9),
(10,'Contract negotiation notes.','2025-10-13 12:01:31',1,10),
(11,'Utworzono nowe zadanie: dodaj nowa umowe','2025-10-13 15:01:07',2,2),
(12,'Utworzono nowe zadanie: test zadaniee','2025-10-16 16:37:30',2,2),
(13,'Utworzono nowe zadanie: Nowe zadanie 1','2025-10-27 22:23:21',1,2),
(14,'Utworzono nowe zadanie: aaa','2025-10-28 11:26:26',1,10),
(15,'Utworzono nowe zadanie: dfdfd','2025-11-04 11:20:54',1,10),
(16,'Utworzono nowe zadanie: 5','2025-11-04 15:53:13',1,14),
(17,'Utworzono nowe zadanie: 6','2025-11-04 15:56:52',1,14),
(18,'Utworzono nowe zadanie: test','2025-11-12 22:24:25',1,14);
/*!40000 ALTER TABLE `Activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CalendarEvents`
--

DROP TABLE IF EXISTS `CalendarEvents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CalendarEvents` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `StartTime` datetime NOT NULL,
  `EndTime` datetime NOT NULL,
  `AllDay` tinyint(1) DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `CalendarEvents_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CalendarEvents`
--

LOCK TABLES `CalendarEvents` WRITE;
/*!40000 ALTER TABLE `CalendarEvents` DISABLE KEYS */;
INSERT INTO `CalendarEvents` VALUES
(1,'Project Kick-off Meeting','Initial meeting with JK Company','2025-11-05 10:00:00','2025-11-05 11:00:00',0,1,'2025-10-13 12:01:31'),
(2,'Sales Follow-up','Call with Anna Nowak','2025-11-06 14:00:00','2025-11-06 14:30:00',0,1,'2025-10-13 12:01:31'),
(3,'Team Sync - Marketing','Weekly sync with the marketing team','2025-11-07 09:00:00','2025-11-07 10:00:00',0,1,'2025-10-13 12:01:31'),
(4,'Development Sprint Planning','Planning for the next sprint','2025-11-10 11:00:00','2025-11-10 13:00:00',0,1,'2025-10-13 12:01:31'),
(6,'Company All-Hands','All-hands meeting for all employees','2025-11-15 10:00:00','2025-11-15 11:30:00',0,1,'2025-10-13 12:01:31'),
(7,'Holiday Party','Annual company holiday party','2025-12-19 18:00:00','2025-12-19 22:00:00',0,1,'2025-10-13 12:01:31'),
(8,'Client Demo','Demo of new features for PW Solutions','2025-11-18 13:00:00','2025-11-18 14:00:00',0,1,'2025-10-13 12:01:31'),
(9,'Support Team Training','Training on new support software','2025-11-20 09:30:00','2025-11-20 12:00:00',0,1,'2025-10-13 12:01:31'),
(13,'test',NULL,'2025-11-25 00:00:00','2025-11-25 00:00:00',0,1,'2025-11-04 10:47:15'),
(14,'5',NULL,'2025-11-11 00:00:00','2025-11-11 00:00:00',0,1,'2025-11-04 14:55:12');
/*!40000 ALTER TABLE `CalendarEvents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ContractServices`
--

DROP TABLE IF EXISTS `ContractServices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ContractServices` (
  `ContractId` int(11) NOT NULL,
  `ServiceId` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT NULL,
  PRIMARY KEY (`ContractId`,`ServiceId`),
  KEY `ServiceId` (`ServiceId`),
  CONSTRAINT `ContractServices_ibfk_1` FOREIGN KEY (`ContractId`) REFERENCES `Contracts` (`Id`),
  CONSTRAINT `ContractServices_ibfk_2` FOREIGN KEY (`ServiceId`) REFERENCES `Services` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContractServices`
--

LOCK TABLES `ContractServices` WRITE;
/*!40000 ALTER TABLE `ContractServices` DISABLE KEYS */;
INSERT INTO `ContractServices` VALUES
(2,9,1),
(8,8,1),
(8,9,1),
(8,10,1),
(9,9,1),
(10,1,1),
(10,2,1),
(10,8,24),
(10,9,1),
(10,10,1),
(16,9,1),
(16,10,1);
/*!40000 ALTER TABLE `ContractServices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ContractTags`
--

DROP TABLE IF EXISTS `ContractTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ContractTags` (
  `ContractId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL,
  PRIMARY KEY (`ContractId`,`TagId`),
  KEY `TagId` (`TagId`),
  CONSTRAINT `ContractTags_ibfk_1` FOREIGN KEY (`ContractId`) REFERENCES `Contracts` (`Id`),
  CONSTRAINT `ContractTags_ibfk_2` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ContractTags`
--

LOCK TABLES `ContractTags` WRITE;
/*!40000 ALTER TABLE `ContractTags` DISABLE KEYS */;
/*!40000 ALTER TABLE `ContractTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Contracts`
--

DROP TABLE IF EXISTS `Contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Contracts` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `SignedAt` datetime DEFAULT NULL,
  `CustomerId` int(11) NOT NULL,
  `ContractNumber` varchar(100) DEFAULT NULL,
  `PlaceOfSigning` varchar(255) DEFAULT NULL,
  `ScopeOfServices` text DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `NetAmount` decimal(65,30) DEFAULT NULL,
  `PaymentTermDays` int(11) DEFAULT NULL,
  `CreatedByUserId` int(11) DEFAULT NULL,
  `ResponsibleGroupId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_contracts_customer_id` (`CustomerId`),
  KEY `idx_contracts_signed_at` (`SignedAt`),
  KEY `idx_contracts_start_date` (`StartDate`),
  KEY `idx_contracts_end_date` (`EndDate`),
  KEY `idx_contracts_responsible_group` (`ResponsibleGroupId`),
  CONSTRAINT `Contracts_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Contracts`
--

LOCK TABLES `Contracts` WRITE;
/*!40000 ALTER TABLE `Contracts` DISABLE KEYS */;
INSERT INTO `Contracts` VALUES
(1,'Contract for Services A','2025-10-13 12:01:09',1,'CON/2025/01','Warszawa','Standard service package','2025-11-01 00:00:00','2026-11-01 00:00:00',5000.000000000000000000000000000000,30,1,1),
(2,'Contract for Consulting','2025-10-13 00:00:00',2,'CON/2025/02','Kraków','Business consulting','2025-11-01 00:00:00','2026-05-01 00:00:00',50.000000000000000000000000000000,14,1,2),
(3,'Website Development Contract','2025-10-13 12:01:09',3,'CON/2025/03','Gdańsk','Full website development','2025-11-15 00:00:00','2026-02-15 00:00:00',8500.000000000000000000000000000000,30,1,4),
(4,'Marketing Agreement','2025-10-13 12:01:09',4,'CON/2025/04','Poznań','Social media marketing campaign','2025-12-01 00:00:00','2026-06-01 00:00:00',7500.000000000000000000000000000000,21,NULL,2),
(5,'Support & Maintenance','2025-10-13 12:01:09',5,'CON/2025/05','Wrocław','24/7 technical support','2026-01-01 00:00:00','2027-01-01 00:00:00',6000.000000000000000000000000000000,30,1,3),
(6,'Software License Agreement','2025-10-13 12:01:09',6,'CON/2025/06','Łódź','License for CRM software','2025-10-15 00:00:00','2028-10-15 00:00:00',15000.000000000000000000000000000000,45,1,1),
(7,'HR Services Contract','2025-10-13 12:01:09',7,'CON/2025/07','Szczecin','Recruitment and HR support','2025-11-05 00:00:00','2026-11-05 00:00:00',4000.000000000000000000000000000000,30,NULL,6),
(8,'Financial Audit Agreement','2025-10-13 00:00:00',8,'CON/2025/08','Bydgoszcz','Annual financial audit','2026-02-01 00:00:00','2026-03-01 00:00:00',425.000000000000000000000000000000,14,1,7),
(9,'QA Testing Services','2025-10-13 00:00:00',9,'CON/2025/09','Lublin','Manual and automated testing','2025-11-20 00:00:00','2026-05-20 00:00:00',50.000000000000000000000000000000,30,1,9),
(10,'General Operations Support','2025-10-13 00:00:00',9,'CON/2025/10','Katowice','General operational support','2026-01-01 00:00:00','2026-07-01 00:00:00',12525.000000000000000000000000000000,30,NULL,10),
(16,'nowa kontrakt test','2025-11-04 00:00:00',14,'6',NULL,NULL,'2025-11-06 00:00:00','2025-11-29 00:00:00',125.000000000000000000000000000000,14,1,NULL);
/*!40000 ALTER TABLE `Contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `CustomerTags`
--

DROP TABLE IF EXISTS `CustomerTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `CustomerTags` (
  `CustomerId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL,
  PRIMARY KEY (`CustomerId`,`TagId`),
  KEY `TagId` (`TagId`),
  CONSTRAINT `CustomerTags_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`),
  CONSTRAINT `CustomerTags_ibfk_2` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CustomerTags`
--

LOCK TABLES `CustomerTags` WRITE;
/*!40000 ALTER TABLE `CustomerTags` DISABLE KEYS */;
INSERT INTO `CustomerTags` VALUES
(4,2),
(6,2),
(7,2),
(1,4),
(3,4),
(8,4),
(15,4),
(2,5),
(5,5),
(9,5),
(10,5);
/*!40000 ALTER TABLE `CustomerTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customers`
--

DROP TABLE IF EXISTS `Customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Customers` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Phone` varchar(50) DEFAULT NULL,
  `Company` varchar(255) DEFAULT NULL,
  `Address` text DEFAULT NULL,
  `NIP` varchar(50) DEFAULT NULL,
  `RepresentativeUserId` int(11) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `AssignedGroupId` int(11) DEFAULT NULL,
  `AssignedUserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Customers_users_RepresentativeUserId` (`RepresentativeUserId`),
  KEY `idx_customers_email` (`Email`),
  KEY `idx_customers_company` (`Company`),
  KEY `idx_customers_created_at` (`CreatedAt`),
  KEY `idx_customers_assigned_group` (`AssignedGroupId`),
  KEY `idx_customers_assigned_user` (`AssignedUserId`),
  CONSTRAINT `FK_Customers_users_RepresentativeUserId` FOREIGN KEY (`RepresentativeUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customers`
--

LOCK TABLES `Customers` WRITE;
/*!40000 ALTER TABLE `Customers` DISABLE KEYS */;
INSERT INTO `Customers` VALUES
(1,'Jan Kowalski','jan.kowalski@example.com','123456789','JK Company','ul. Prosta 1, Warszawa','123-456-78-90',NULL,'2025-10-13 12:00:28',12,1),
(2,'Anna Nowak','anna.nowak@example.com','987654321','AN Services','ul. Krzywa 2, Kraków','098-765-43-21',NULL,'2025-10-13 12:00:28',12,1),
(3,'Piotr Wiśniewski','piotr.wisniewski@example.com','555666777','PW Solutions','ul. Długa 3, Gdańsk','555-666-77-77',NULL,'2025-10-13 12:00:28',12,NULL),
(4,'Katarzyna Wójcik','katarzyna.wojcik@example.com','111222333','KW Consulting','ul. Krótka 4, Poznań','111-222-33-33',NULL,'2025-10-13 12:00:28',11,1),
(5,'Maria Lewandowska','maria.lewandowska@example.com','444555666','ML Corporation','ul. Szeroka 5, Wrocław','444-555-66-66',NULL,'2025-10-13 12:00:28',11,NULL),
(6,'Krzysztof Kamiński','krzysztof.kaminski@example.com','999888777','KK Innovations','ul. Wąska 6, Łódź','999-888-77-77',NULL,'2025-10-13 12:00:28',12,1),
(7,'Agnieszka Zielińska','agnieszka.zielinska@example.com','222333444','AZ Group','ul. Nowa 7, Szczecin','222-333-44-44',NULL,'2025-10-13 12:00:28',11,1),
(8,'Tomasz Szymański','tomasz.szymanski@example.com','777888999','TS Enterprises','ul. Stara 8, Bydgoszcz','777-888-99-99',3,'2025-10-13 12:00:28',12,NULL),
(9,'Barbara Dąbrowska','barbara.dabrowska@example.com','666555122','BD Holdings','ul. Zielona 9, Lublin','666-555-44-44',NULL,'2025-10-13 12:00:28',12,1),
(10,'Andrzej Jankowski','andrzej.jankowski@example.com','333224888','AJ Industries','Warszawa , ul Wlodka 13/14. 03-262','333-222-11-13',3,'2025-10-13 12:00:28',12,1),
(14,'5testNowy','pawel.paciorkowski21@gmail.com','5','5',NULL,NULL,1,'2025-11-04 14:52:01',NULL,NULL),
(15,'6sasasas','6@wp.pl','6','6','6','6',NULL,'2025-11-04 14:57:20',NULL,NULL);
/*!40000 ALTER TABLE `Customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Groups`
--

DROP TABLE IF EXISTS `Groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Groups` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Groups`
--

LOCK TABLES `Groups` WRITE;
/*!40000 ALTER TABLE `Groups` DISABLE KEYS */;
INSERT INTO `Groups` VALUES
(11,'Sales','Zespół sprzedaży i obsługi klienta'),
(12,'Customer Service','Zespół obługi klienta ');
/*!40000 ALTER TABLE `Groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InvoiceItems`
--

DROP TABLE IF EXISTS `InvoiceItems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `InvoiceItems` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `InvoiceId` int(11) NOT NULL,
  `ServiceId` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `UnitPrice` decimal(65,30) DEFAULT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `TaxRate` decimal(65,30) NOT NULL,
  `NetAmount` decimal(65,30) NOT NULL,
  `TaxAmount` decimal(65,30) NOT NULL,
  `GrossAmount` decimal(65,30) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `InvoiceId` (`InvoiceId`),
  KEY `ServiceId` (`ServiceId`),
  CONSTRAINT `InvoiceItems_ibfk_1` FOREIGN KEY (`InvoiceId`) REFERENCES `Invoices` (`Id`),
  CONSTRAINT `InvoiceItems_ibfk_2` FOREIGN KEY (`ServiceId`) REFERENCES `Services` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InvoiceItems`
--

LOCK TABLES `InvoiceItems` WRITE;
/*!40000 ALTER TABLE `InvoiceItems` DISABLE KEYS */;
INSERT INTO `InvoiceItems` VALUES
(1,1,1,1,200.000000000000000000000000000000,'Business Consulting',23.000000000000000000000000000000,200.000000000000000000000000000000,46.000000000000000000000000000000,246.000000000000000000000000000000),
(2,2,2,1,5000.000000000000000000000000000000,'Website Development',23.000000000000000000000000000000,5000.000000000000000000000000000000,1150.000000000000000000000000000000,6150.000000000000000000000000000000),
(3,2,5,1,100.000000000000000000000000000000,'Technical Support (hourly)',23.000000000000000000000000000000,100.000000000000000000000000000000,23.000000000000000000000000000000,123.000000000000000000000000000000),
(4,3,3,1,150.000000000000000000000000000000,'Graphic Design',23.000000000000000000000000000000,150.000000000000000000000000000000,34.500000000000000000000000000000,184.500000000000000000000000000000),
(5,4,4,1,800.000000000000000000000000000000,'Social Media Management',23.000000000000000000000000000000,800.000000000000000000000000000000,184.000000000000000000000000000000,984.000000000000000000000000000000),
(6,5,5,1,100.000000000000000000000000000000,'Technical Support (hourly)',23.000000000000000000000000000000,100.000000000000000000000000000000,23.000000000000000000000000000000,123.000000000000000000000000000000),
(7,6,6,1,1200.000000000000000000000000000000,'Software License - Basic',23.000000000000000000000000000000,1200.000000000000000000000000000000,276.000000000000000000000000000000,1476.000000000000000000000000000000),
(8,7,7,1,2500.000000000000000000000000000000,'Software License - Pro',23.000000000000000000000000000000,2500.000000000000000000000000000000,575.000000000000000000000000000000,3075.000000000000000000000000000000),
(9,8,8,1,300.000000000000000000000000000000,'Bookkeeping Service',8.000000000000000000000000000000,300.000000000000000000000000000000,24.000000000000000000000000000000,324.000000000000000000000000000000),
(10,9,9,1,50.000000000000000000000000000000,'Medical Supplies',8.000000000000000000000000000000,50.000000000000000000000000000000,4.000000000000000000000000000000,54.000000000000000000000000000000),
(11,10,10,1,75.000000000000000000000000000000,'Educational Materials',5.000000000000000000000000000000,75.000000000000000000000000000000,3.750000000000000000000000000000,78.750000000000000000000000000000),
(13,12,1,100,200.000000000000000000000000000000,'Business Consulting',23.000000000000000000000000000000,20000.000000000000000000000000000000,460000.000000000000000000000000000000,480000.000000000000000000000000000000),
(14,11,1,10,200.000000000000000000000000000000,'Business Consulting',23.000000000000000000000000000000,2000.000000000000000000000000000000,46000.000000000000000000000000000000,48000.000000000000000000000000000000),
(18,13,10,1,75.000000000000000000000000000000,'Educational Materials',5.000000000000000000000000000000,75.000000000000000000000000000000,375.000000000000000000000000000000,450.000000000000000000000000000000),
(19,13,9,1,50.000000000000000000000000000000,'Medical Supplies',8.000000000000000000000000000000,50.000000000000000000000000000000,400.000000000000000000000000000000,450.000000000000000000000000000000),
(20,13,7,1,2500.000000000000000000000000000000,'Software License - Pro',23.000000000000000000000000000000,2500.000000000000000000000000000000,57500.000000000000000000000000000000,60000.000000000000000000000000000000),
(21,13,10,1,75.000000000000000000000000000000,'Educational Materials',5.000000000000000000000000000000,75.000000000000000000000000000000,375.000000000000000000000000000000,450.000000000000000000000000000000);
/*!40000 ALTER TABLE `InvoiceItems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `InvoiceTags`
--

DROP TABLE IF EXISTS `InvoiceTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `InvoiceTags` (
  `InvoiceId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL,
  PRIMARY KEY (`InvoiceId`,`TagId`),
  KEY `TagId` (`TagId`),
  CONSTRAINT `InvoiceTags_ibfk_1` FOREIGN KEY (`InvoiceId`) REFERENCES `Invoices` (`Id`),
  CONSTRAINT `InvoiceTags_ibfk_2` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `InvoiceTags`
--

LOCK TABLES `InvoiceTags` WRITE;
/*!40000 ALTER TABLE `InvoiceTags` DISABLE KEYS */;
/*!40000 ALTER TABLE `InvoiceTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Invoices`
--

DROP TABLE IF EXISTS `Invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Invoices` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Number` varchar(100) NOT NULL,
  `CustomerId` int(11) NOT NULL,
  `IssuedAt` datetime DEFAULT NULL,
  `DueDate` datetime DEFAULT NULL,
  `IsPaid` tinyint(1) DEFAULT NULL,
  `TotalAmount` decimal(65,30) DEFAULT NULL,
  `AssignedGroupId` int(11) DEFAULT NULL,
  `CreatedByUserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_invoices_customer_id` (`CustomerId`),
  KEY `idx_invoices_issued_at` (`IssuedAt`),
  KEY `idx_invoices_due_date` (`DueDate`),
  KEY `idx_invoices_is_paid` (`IsPaid`),
  KEY `idx_invoices_assigned_group` (`AssignedGroupId`),
  KEY `idx_invoices_number` (`Number`),
  CONSTRAINT `Invoices_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoices`
--

LOCK TABLES `Invoices` WRITE;
/*!40000 ALTER TABLE `Invoices` DISABLE KEYS */;
INSERT INTO `Invoices` VALUES
(1,'FV/2025/10/1',1,'2025-10-03 12:03:29','2025-11-02 12:03:29',1,246.000000000000000000000000000000,NULL,1),
(2,'FV/2025/10/2',2,'2025-10-04 12:03:29','2025-11-03 12:03:29',0,6273.000000000000000000000000000000,NULL,1),
(3,'FV/2025/10/3',3,'2025-10-05 12:03:29','2025-11-04 12:03:29',1,184.500000000000000000000000000000,NULL,1),
(4,'FV/2025/10/4',4,'2025-10-06 12:03:29','2025-11-05 12:03:29',0,984.000000000000000000000000000000,NULL,1),
(5,'FV/2025/10/5',5,'2025-10-07 12:03:29','2025-11-06 12:03:29',1,123.000000000000000000000000000000,NULL,1),
(6,'FV/2025/10/6',6,'2025-10-08 12:03:29','2025-11-07 12:03:29',1,1476.000000000000000000000000000000,NULL,1),
(7,'FV/2025/10/7',7,'2025-10-09 12:03:29','2025-11-08 12:03:29',1,3075.000000000000000000000000000000,NULL,1),
(8,'FV/2025/10/8',8,'2025-10-10 12:03:29','2025-11-09 12:03:29',1,324.000000000000000000000000000000,NULL,1),
(9,'FV/2025/10/9',9,'2025-10-11 12:03:29','2025-11-10 12:03:29',1,54.000000000000000000000000000000,NULL,1),
(10,'FV/2025/10/10',10,'2025-10-12 12:03:29','2025-11-11 12:03:29',1,78.750000000000000000000000000000,NULL,1),
(11,'FV/2025',1,'2025-10-28 11:15:50','2025-10-31 00:00:00',0,48000.000000000000000000000000000000,NULL,1),
(12,'aasasasas',2,'2025-10-28 11:16:41','2025-11-02 00:00:00',0,480000.000000000000000000000000000000,NULL,1),
(13,'3451234',14,'2025-11-04 15:54:45','2025-11-06 00:00:00',0,61350.000000000000000000000000000000,NULL,1);
/*!40000 ALTER TABLE `Invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `LoginHistory`
--

DROP TABLE IF EXISTS `LoginHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `LoginHistory` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) NOT NULL,
  `LoginTime` datetime DEFAULT NULL,
  `IpAddress` varchar(45) DEFAULT NULL,
  `UserAgent` text DEFAULT NULL,
  `Success` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_login_history_user_id` (`UserId`),
  KEY `idx_login_history_login_time` (`LoginTime`),
  CONSTRAINT `LoginHistory_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `LoginHistory`
--

LOCK TABLES `LoginHistory` WRITE;
/*!40000 ALTER TABLE `LoginHistory` DISABLE KEYS */;
INSERT INTO `LoginHistory` VALUES
(1,1,'2025-10-13 13:54:31','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(2,1,'2025-10-13 13:54:42','127.0.0.1','curl/8.12.1',1),
(3,1,'2025-10-12 12:02:12','192.168.1.10','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1),
(4,1,'2025-10-11 12:02:12','89.12.34.56','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1),
(5,1,'2025-10-10 12:02:12','212.55.66.77','Mozilla/5.0 (X11; Linux x86_64)',1),
(6,1,'2025-10-09 12:02:12','192.168.1.10','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',0),
(7,1,'2025-10-08 12:02:12','10.0.0.5','Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',1),
(8,1,'2025-10-07 12:02:12','89.12.34.56','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1),
(9,1,'2025-10-06 12:02:12','212.55.66.77','Mozilla/5.0 (X11; Linux x86_64)',1),
(10,1,'2025-10-05 12:02:12','192.168.1.10','Mozilla/5.0 (Windows NT 10.0; Win64; x64)',1),
(11,1,'2025-10-04 12:02:12','10.0.0.5','Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',1),
(12,1,'2025-10-03 12:02:12','89.12.34.56','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',1),
(13,1,'2025-10-13 14:57:43','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(14,2,'2025-10-13 15:00:41','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(15,2,'2025-10-13 15:07:07','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(16,1,'2025-10-13 15:09:40','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(17,2,'2025-10-13 15:09:48','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(18,1,'2025-10-13 15:12:18','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(19,1,'2025-10-13 15:17:32','127.0.0.1','curl/8.12.1',1),
(20,1,'2025-10-13 15:33:47','127.0.0.1','curl/8.12.1',1),
(21,1,'2025-10-13 17:18:25','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(22,1,'2025-10-16 16:31:16','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(23,2,'2025-10-16 16:35:04','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(24,1,'2025-10-16 16:35:24','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(25,2,'2025-10-16 16:35:53','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(26,1,'2025-10-16 16:38:15','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(27,3,'2025-10-16 16:38:46','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(28,1,'2025-10-16 16:38:58','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(29,1,'2025-10-20 22:00:39','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(30,1,'2025-10-20 22:14:14','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(31,1,'2025-10-21 09:13:03','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(32,1,'2025-10-27 11:03:30','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(33,1,'2025-10-27 13:46:34','127.0.0.1','okhttp/4.9.2',0),
(34,2,'2025-10-27 14:51:45','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(35,1,'2025-10-27 14:51:54','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(36,1,'2025-10-27 22:21:29','127.0.0.1','okhttp/4.9.2',0),
(37,1,'2025-10-27 22:21:31','127.0.0.1','okhttp/4.9.2',0),
(38,1,'2025-10-27 22:21:38','127.0.0.1','okhttp/4.9.2',0),
(39,1,'2025-10-27 22:21:47','127.0.0.1','okhttp/4.9.2',1),
(40,1,'2025-10-27 22:23:52','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(41,1,'2025-10-28 11:14:05','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(42,4,'2025-10-28 11:26:06','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(43,1,'2025-10-28 11:26:12','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(44,1,'2025-10-28 11:33:47','127.0.0.1','okhttp/4.9.2',0),
(45,1,'2025-10-28 11:33:55','127.0.0.1','okhttp/4.9.2',1),
(46,1,'2025-10-28 11:48:45','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',1),
(47,1,'2025-11-03 15:37:49','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(48,1,'2025-11-03 16:00:30','127.0.0.1','okhttp/4.9.2',1),
(49,2,'2025-11-03 16:32:28','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(50,1,'2025-11-04 11:02:54','127.0.0.1','okhttp/4.9.2',1),
(51,1,'2025-11-04 11:06:57','127.0.0.1','okhttp/4.9.2',0),
(52,1,'2025-11-04 11:07:06','127.0.0.1','okhttp/4.9.2',1),
(53,1,'2025-11-04 11:14:47','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(54,1,'2025-11-04 11:19:14','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(55,1,'2025-11-04 11:36:22','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(56,1,'2025-11-04 11:37:20','127.0.0.1','okhttp/4.9.2',1),
(57,1,'2025-11-04 11:50:34','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(58,1,'2025-11-04 12:09:20','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(59,1,'2025-11-04 12:12:02','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(60,1,'2025-11-04 13:19:38','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(62,1,'2025-11-04 13:27:18','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(63,1,'2025-11-04 13:32:53','127.0.0.1','okhttp/4.9.2',1),
(64,1,'2025-11-04 13:34:37','127.0.0.1','okhttp/4.9.2',1),
(65,1,'2025-11-04 14:43:35','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(66,1,'2025-11-04 14:49:09','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(67,1,'2025-11-04 15:10:31','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(68,1,'2025-11-04 15:12:36','127.0.0.1','okhttp/4.9.2',1),
(69,1,'2025-11-04 15:32:11','127.0.0.1','okhttp/4.9.2',1),
(70,1,'2025-11-04 15:45:11','127.0.0.1','okhttp/4.9.2',1),
(71,1,'2025-11-04 15:49:43','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(72,1,'2025-11-04 15:50:37','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(73,1,'2025-11-04 15:56:19','127.0.0.1','okhttp/4.9.2',1),
(74,1,'2025-11-12 14:05:16','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(75,1,'2025-11-12 14:44:37','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(76,1,'2025-11-12 14:51:20','127.0.0.1','okhttp/4.9.2',1),
(77,1,'2025-11-12 21:48:41','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',0),
(78,1,'2025-11-12 21:48:50','127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',1),
(79,1,'2025-11-12 22:24:01','127.0.0.1','okhttp/4.9.2',1);
/*!40000 ALTER TABLE `LoginHistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `MeetingTags`
--

DROP TABLE IF EXISTS `MeetingTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `MeetingTags` (
  `MeetingId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL,
  PRIMARY KEY (`MeetingId`,`TagId`),
  KEY `TagId` (`TagId`),
  CONSTRAINT `MeetingTags_ibfk_1` FOREIGN KEY (`MeetingId`) REFERENCES `Meetings` (`Id`),
  CONSTRAINT `MeetingTags_ibfk_2` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `MeetingTags`
--

LOCK TABLES `MeetingTags` WRITE;
/*!40000 ALTER TABLE `MeetingTags` DISABLE KEYS */;
/*!40000 ALTER TABLE `MeetingTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Meetings`
--

DROP TABLE IF EXISTS `Meetings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Meetings` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Topic` varchar(255) NOT NULL,
  `ScheduledAt` datetime NOT NULL,
  `CustomerId` int(11) NOT NULL,
  `AssignedGroupId` int(11) DEFAULT NULL,
  `CreatedByUserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `CustomerId` (`CustomerId`),
  KEY `CreatedByUserId` (`CreatedByUserId`),
  KEY `idx_meetings_scheduled_at` (`ScheduledAt`),
  KEY `idx_meetings_assigned_group` (`AssignedGroupId`),
  CONSTRAINT `Meetings_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`),
  CONSTRAINT `Meetings_ibfk_2` FOREIGN KEY (`AssignedGroupId`) REFERENCES `Groups` (`Id`),
  CONSTRAINT `Meetings_ibfk_3` FOREIGN KEY (`CreatedByUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Meetings`
--

LOCK TABLES `Meetings` WRITE;
/*!40000 ALTER TABLE `Meetings` DISABLE KEYS */;
INSERT INTO `Meetings` VALUES
(11,'Spotkanie z nowym klientem','2025-10-13 15:02:00',3,NULL,2),
(14,'test','2025-11-04 13:50:00',10,NULL,1);
/*!40000 ALTER TABLE `Meetings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Messages` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Subject` varchar(255) NOT NULL,
  `Body` text NOT NULL,
  `SenderUserId` int(11) NOT NULL,
  `RecipientUserId` int(11) NOT NULL,
  `SentAt` datetime DEFAULT NULL,
  `IsRead` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `SenderUserId` (`SenderUserId`),
  KEY `RecipientUserId` (`RecipientUserId`),
  CONSTRAINT `Messages_ibfk_1` FOREIGN KEY (`SenderUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Messages_ibfk_2` FOREIGN KEY (`RecipientUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Messages`
--

LOCK TABLES `Messages` WRITE;
/*!40000 ALTER TABLE `Messages` DISABLE KEYS */;
INSERT INTO `Messages` VALUES
(1,'Welcome!','Welcome to the new CRM system.',1,1,'2025-10-13 11:02:12',1),
(2,'Project Update','Just a quick update on the project status.',1,1,'2025-10-13 10:02:12',1),
(3,'Meeting Reminder','Reminder about our meeting tomorrow at 10 AM.',1,1,'2025-10-13 09:02:12',1),
(4,'Can you check this?','Please review the attached document.',1,1,'2025-10-13 08:02:12',0),
(5,'Re: Your Question','Here is the answer to your question.',1,1,'2025-10-13 07:02:12',0),
(6,'Lunch today?','Are you free for lunch today?',1,1,'2025-10-13 06:02:12',1),
(7,'Important Announcement','Please read the latest company announcement.',1,1,'2025-10-13 05:02:12',0),
(8,'New Task Assigned','A new task has been assigned to you.',1,1,'2025-10-13 04:02:12',0),
(9,'System Maintenance','There will be system maintenance tonight.',1,1,'2025-10-13 03:02:12',1),
(10,'Happy Friday!','Have a great weekend!',1,1,'2025-10-13 02:02:12',1),
(11,'test wiadomosci','test, siema dzien dobry ',1,2,'2025-10-16 14:35:48',1),
(12,'spotkanie','nowe spotkanie , tesr 2',1,2,'2025-11-03 15:32:24',1);
/*!40000 ALTER TABLE `Messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notes`
--

DROP TABLE IF EXISTS `Notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notes` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Content` text NOT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `CustomerId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `CustomerId` (`CustomerId`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Notes_ibfk_1` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`),
  CONSTRAINT `Notes_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notes`
--

LOCK TABLES `Notes` WRITE;
/*!40000 ALTER TABLE `Notes` DISABLE KEYS */;
INSERT INTO `Notes` VALUES
(11,'zadzwonić i omówić nową umowę','2025-10-13 13:03:31',1,2),
(12,'test Andrzej','2025-10-20 20:01:11',10,1),
(15,'kmimk','2025-11-04 10:46:46',8,1);
/*!40000 ALTER TABLE `Notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications`
--

LOCK TABLES `Notifications` WRITE;
/*!40000 ALTER TABLE `Notifications` DISABLE KEYS */;
INSERT INTO `Notifications` VALUES
(1,'A new task has been assigned to you: \"Prepare Q4 Report\"',1,'2025-10-13 12:04:39',1),
(2,'Your meeting \"Project Kick-off\" is starting in 15 minutes.',1,'2025-10-13 12:04:39',1),
(3,'Invoice #FV/2025/10/1 has been paid.',1,'2025-10-13 12:04:39',1),
(4,'A new comment was added to contract \"Website Development Contract\"',1,'2025-10-13 12:04:39',1),
(5,'Your reminder \"Follow up with Jan Kowalski\" is due now.',1,'2025-10-13 12:04:39',1),
(6,'The system will undergo maintenance tonight at 11 PM.',1,'2025-10-13 12:04:39',1),
(7,'A new customer \"Example Corp\" has been assigned to you.',1,'2025-10-13 12:04:39',1),
(8,'Password will expire in 7 days.',1,'2025-10-13 12:04:39',1),
(9,'Welcome to the team!',1,'2025-10-13 12:04:39',1),
(10,'Your export of \"Customer List\" is ready for download.',1,'2025-10-13 12:04:39',1),
(11,'Utworzono nowe zadanie: dodaj nowa umowe',1,'2025-10-13 13:01:07',2),
(12,'Nowa wiadomość od admin: test wiadomosci',1,'2025-10-16 14:35:48',2),
(13,'Utworzono nowe zadanie: test zadaniee',1,'2025-10-16 14:37:30',2),
(14,'Utworzono nowe zadanie: Nowe zadanie 1',1,'2025-10-27 21:23:21',1),
(15,'Utworzono nowe zadanie: aaa',1,'2025-10-28 10:26:26',1),
(16,'Nowa wiadomość od admin: spotkanie',1,'2025-11-03 15:32:24',2),
(17,'Utworzono nowe zadanie: dfdfd',1,'2025-11-04 10:20:54',1),
(18,'Utworzono nowe zadanie: 5',1,'2025-11-04 14:53:13',1),
(19,'Utworzono nowe zadanie: 6',1,'2025-11-04 14:56:52',1),
(20,'Utworzono nowe zadanie: test',1,'2025-11-12 21:24:25',1);
/*!40000 ALTER TABLE `Notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Payments`
--

DROP TABLE IF EXISTS `Payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Payments` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `InvoiceId` int(11) NOT NULL,
  `PaidAt` datetime NOT NULL,
  `Amount` decimal(65,30) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_payments_invoice_id` (`InvoiceId`),
  KEY `idx_payments_paid_at` (`PaidAt`),
  CONSTRAINT `Payments_ibfk_1` FOREIGN KEY (`InvoiceId`) REFERENCES `Invoices` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Payments`
--

LOCK TABLES `Payments` WRITE;
/*!40000 ALTER TABLE `Payments` DISABLE KEYS */;
INSERT INTO `Payments` VALUES
(1,1,'2025-10-03 12:05:05',246.000000000000000000000000000000),
(2,2,'2025-10-05 12:05:05',3000.000000000000000000000000000000),
(3,3,'2025-10-05 12:05:05',184.500000000000000000000000000000),
(4,4,'2025-10-07 12:05:05',500.000000000000000000000000000000),
(5,5,'2025-10-07 12:05:05',123.000000000000000000000000000000),
(6,6,'2025-10-09 12:05:05',1476.000000000000000000000000000000),
(7,7,'2025-10-10 12:05:05',3075.000000000000000000000000000000),
(8,8,'2025-10-10 12:05:05',324.000000000000000000000000000000),
(9,9,'2025-10-12 12:05:05',54.000000000000000000000000000000),
(10,10,'2025-10-13 12:05:05',78.750000000000000000000000000000),
(11,10,'2025-10-20 22:16:58',25.000000000000000000000000000000),
(14,12,'2025-11-04 13:34:02',6000.000000000000000000000000000000);
/*!40000 ALTER TABLE `Payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Reminders`
--

DROP TABLE IF EXISTS `Reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Reminders` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Note` text NOT NULL,
  `RemindAt` datetime NOT NULL,
  `UserId` int(11) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  CONSTRAINT `Reminders_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Reminders`
--

LOCK TABLES `Reminders` WRITE;
/*!40000 ALTER TABLE `Reminders` DISABLE KEYS */;
INSERT INTO `Reminders` VALUES
(1,'Follow up with Jan Kowalski about the new proposal.','2025-10-20 09:00:00',1),
(2,'Prepare slides for the Q4 Financial Review.','2025-11-10 10:00:00',1),
(3,'Send birthday wishes to Anna Nowak.','2025-11-15 09:00:00',1),
(5,'Book flights for the management offsite.','2025-10-25 11:00:00',1),
(6,'Renew domain \"example.com\"','2025-12-01 09:00:00',1),
(7,'Submit monthly expense report.','2025-10-31 17:00:00',1),
(8,'Call Piotr Wiśniewski to discuss contract renewal.','2025-11-05 15:00:00',1),
(9,'Finalize marketing budget for next year.','2025-11-20 12:00:00',1),
(10,'Water the office plants.','2025-10-17 10:00:00',1),
(13,'tets nowe','2025-10-21 07:14:00',1),
(14,'Test teraz','2025-10-27 21:23:00',1),
(15,'test','2025-11-03 14:46:00',1),
(16,'hello','2025-11-04 10:56:00',1);
/*!40000 ALTER TABLE `Reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Services`
--

DROP TABLE IF EXISTS `Services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Services` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Price` decimal(65,30) DEFAULT NULL,
  `TaxRate` decimal(65,30) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Services`
--

LOCK TABLES `Services` WRITE;
/*!40000 ALTER TABLE `Services` DISABLE KEYS */;
INSERT INTO `Services` VALUES
(1,'Business Consulting',200.000000000000000000000000000000,23.000000000000000000000000000000),
(2,'Website Development',5000.000000000000000000000000000000,23.000000000000000000000000000000),
(3,'Graphic Design',150.000000000000000000000000000000,23.000000000000000000000000000000),
(4,'Social Media Management',800.000000000000000000000000000000,23.000000000000000000000000000000),
(5,'Technical Support (hourly)',100.000000000000000000000000000000,23.000000000000000000000000000000),
(6,'Software License - Basic',1200.000000000000000000000000000000,23.000000000000000000000000000000),
(7,'Software License - Pro',2500.000000000000000000000000000000,23.000000000000000000000000000000),
(8,'Bookkeeping Service',300.000000000000000000000000000000,8.000000000000000000000000000000),
(9,'Medical Supplies',50.000000000000000000000000000000,8.000000000000000000000000000000),
(10,'Educational Materials',75.000000000000000000000000000000,5.000000000000000000000000000000);
/*!40000 ALTER TABLE `Services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Settings`
--

DROP TABLE IF EXISTS `Settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Settings` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Key` varchar(100) NOT NULL,
  `Value` text DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Key` (`Key`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Settings`
--

LOCK TABLES `Settings` WRITE;
/*!40000 ALTER TABLE `Settings` DISABLE KEYS */;
INSERT INTO `Settings` VALUES
(1,'CompanyName','Moja Firma IT Sp. z o.o.'),
(2,'CompanyNIP','123-456-78-90'),
(3,'CompanyAddress','ul. Przykładowa 1, 00-001 Warszawa'),
(4,'CompanyBankAccount','PL 11 2222 3333 4444 5555 6666 7775'),
(5,'app_name','CRM Pro'),
(6,'app_logo','/path/to/logo.png'),
(7,'default_currency','PLN'),
(8,'default_timezone','Europe/Warsaw'),
(9,'email_notifications_enabled','true'),
(10,'sms_notifications_enabled','false'),
(11,'session_timeout_minutes','30'),
(12,'maintenance_mode','false'),
(13,'default_language','pl'),
(14,'max_upload_size_mb','25');
/*!40000 ALTER TABLE `Settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `SystemLogs`
--

DROP TABLE IF EXISTS `SystemLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `SystemLogs` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Level` varchar(20) NOT NULL,
  `Message` text NOT NULL,
  `Source` varchar(255) DEFAULT NULL,
  `Details` text DEFAULT NULL,
  `Timestamp` datetime DEFAULT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `idx_system_logs_timestamp` (`Timestamp`),
  KEY `idx_system_logs_level` (`Level`),
  CONSTRAINT `SystemLogs_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `SystemLogs`
--

LOCK TABLES `SystemLogs` WRITE;
/*!40000 ALTER TABLE `SystemLogs` DISABLE KEYS */;
INSERT INTO `SystemLogs` VALUES
(1,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 13:54:31',1),
(2,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-10-13 13:54:42',1),
(3,'INFO','User logged in successfully.','AuthService','User ID 1 logged in from IP 192.168.1.10','2025-10-13 12:06:25',1),
(4,'WARN','API endpoint /api/v1/legacy is deprecated.','API','A call was made to a deprecated endpoint.','2025-10-13 11:06:25',1),
(5,'ERROR','Failed to connect to payment gateway.','PaymentService','Connection timed out after 30 seconds.','2025-10-13 10:06:25',NULL),
(6,'INFO','Invoice #FV/2025/10/1 created.','InvoiceService','Invoice created for customer 1.','2025-10-13 09:06:25',1),
(7,'DEBUG','Running database query: SELECT * FROM Customers WHERE Id=5','DataAccess','Query executed in 15ms.','2025-10-13 08:06:25',1),
(8,'INFO','User updated their profile.','UserService','User ID 1 updated their email address.','2025-10-13 07:06:25',1),
(9,'FATAL','Database connection lost.','PrimaryDataStore','Cannot reconnect to the primary database.','2025-10-13 06:06:25',NULL),
(10,'WARN','Disk space is running low.','SystemMonitor','Disk space on /var/log is at 92%.','2025-10-13 05:06:25',NULL),
(11,'INFO','Nightly backup job completed successfully.','BackupService','Backup completed in 15 minutes.','2025-10-13 04:06:25',NULL),
(12,'ERROR','Email could not be sent.','EmailService','SMTP server rejected the connection.','2025-10-13 03:06:25',1),
(13,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 14:57:43',1),
(14,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:00:41',2),
(15,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"dodaj nowa umowe\", \"dueDate\": \"2025-10-15T00:00:00.000Z\"}','2025-10-13 15:01:07',2),
(16,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:07:07',2),
(17,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:09:40',1),
(18,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:09:48',2),
(19,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:12:18',1),
(20,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:17:32',1),
(21,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-10-13 15:33:47',1),
(22,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-13 17:18:25',1),
(23,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:31:16',1),
(24,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:35:04',2),
(25,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:35:24',1),
(26,'Information','Wiadomość została wysłana','Python.Backend.MessagesController','{\"recipient\": \"jkowalski\", \"subject\": \"test wiadomosci\"}','2025-10-16 16:35:48',1),
(27,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:35:53',2),
(28,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"test zadaniee\", \"dueDate\": \"2025-10-24T00:00:00.000Z\"}','2025-10-16 16:37:30',2),
(29,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:38:15',1),
(30,'Information','Użytkownik akowalska zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:38:46',3),
(31,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-16 16:38:58',1),
(32,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-20 22:00:39',1),
(33,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-20 22:14:14',1),
(34,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-21 09:13:03',1),
(35,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-27 11:03:30',1),
(36,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-27 14:51:45',2),
(37,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-27 14:51:54',1),
(38,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-10-27 22:21:47',1),
(39,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"Nowe zadanie 1\", \"dueDate\": \"None\"}','2025-10-27 22:23:21',1),
(40,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-27 22:23:52',1),
(41,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-28 11:14:05',1),
(42,'Information','Użytkownik user1 zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-28 11:26:06',4),
(43,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-28 11:26:12',1),
(44,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"aaa\", \"dueDate\": \"2025-10-31T00:00:00.000Z\"}','2025-10-28 11:26:26',1),
(45,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-10-28 11:33:55',1),
(46,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-10-28 11:48:45',1),
(47,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-03 15:37:50',1),
(48,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-03 16:00:30',1),
(49,'Information','Wiadomość została wysłana','Python.Backend.MessagesController','{\"recipient\": \"jkowalski\", \"subject\": \"spotkanie\"}','2025-11-03 16:32:24',1),
(50,'Information','Użytkownik jkowalski zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-03 16:32:28',2),
(51,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:02:54',1),
(52,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:07:06',1),
(53,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:14:47',1),
(54,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:19:14',1),
(55,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"dfdfd\", \"dueDate\": \"2025-11-29T00:00:00.000Z\"}','2025-11-04 11:20:54',1),
(56,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:36:22',1),
(57,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:37:20',1),
(58,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 11:50:34',1),
(59,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 12:09:20',1),
(60,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 12:12:02',1),
(61,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 13:19:38',1),
(62,'Information','Użytkownik aaaaaaa zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 13:27:11',NULL),
(63,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 13:27:18',1),
(64,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 13:32:53',1),
(65,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 13:34:37',1),
(66,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 14:43:35',1),
(67,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 14:49:10',1),
(68,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:10:31',1),
(69,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:12:36',1),
(70,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:32:11',1),
(71,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:45:11',1),
(72,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:49:43',1),
(73,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:50:37',1),
(74,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"5\", \"dueDate\": \"2025-11-06T00:00:00.000Z\"}','2025-11-04 15:53:13',1),
(75,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-04 15:56:19',1),
(76,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"6\", \"dueDate\": \"None\"}','2025-11-04 15:56:52',1),
(77,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-12 14:05:16',1),
(78,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-12 14:44:37',1),
(79,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-12 14:51:21',1),
(80,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Linux - Chrome\", \"ip\": \"127.0.0.1\"}','2025-11-12 21:48:50',1),
(81,'Information','Użytkownik admin zalogował się','Python.Backend.AuthController','{\"device\": \"Desktop - Unknown - Unknown\", \"ip\": \"127.0.0.1\"}','2025-11-12 22:24:01',1),
(82,'Information','Zadanie zostało utworzone','Python.Backend.TasksController','{\"title\": \"test\", \"dueDate\": \"None\"}','2025-11-12 22:24:25',1);
/*!40000 ALTER TABLE `SystemLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tags`
--

DROP TABLE IF EXISTS `Tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tags` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Color` varchar(7) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tags`
--

LOCK TABLES `Tags` WRITE;
/*!40000 ALTER TABLE `Tags` DISABLE KEYS */;
INSERT INTO `Tags` VALUES
(2,'Nowy klient','#335c33','Tag for new clients in their first month.'),
(4,'Ryzykowany','#FFA500','Customer might be at risk of churning.'),
(5,'VIP','#800080','VIP customer with special attention.');
/*!40000 ALTER TABLE `Tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaskTags`
--

DROP TABLE IF EXISTS `TaskTags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaskTags` (
  `TaskId` int(11) NOT NULL,
  `TagId` int(11) NOT NULL,
  PRIMARY KEY (`TaskId`,`TagId`),
  KEY `TagId` (`TagId`),
  CONSTRAINT `TaskTags_ibfk_1` FOREIGN KEY (`TaskId`) REFERENCES `Tasks` (`Id`),
  CONSTRAINT `TaskTags_ibfk_2` FOREIGN KEY (`TagId`) REFERENCES `Tags` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaskTags`
--

LOCK TABLES `TaskTags` WRITE;
/*!40000 ALTER TABLE `TaskTags` DISABLE KEYS */;
/*!40000 ALTER TABLE `TaskTags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tasks`
--

DROP TABLE IF EXISTS `Tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tasks` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Title` varchar(255) NOT NULL,
  `Description` text DEFAULT NULL,
  `DueDate` datetime DEFAULT NULL,
  `Completed` tinyint(1) DEFAULT NULL,
  `UserId` int(11) NOT NULL,
  `CustomerId` int(11) DEFAULT NULL,
  `AssignedGroupId` int(11) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `idx_tasks_user_id` (`UserId`),
  KEY `idx_tasks_customer_id` (`CustomerId`),
  KEY `idx_tasks_due_date` (`DueDate`),
  KEY `idx_tasks_completed` (`Completed`),
  KEY `idx_tasks_assigned_group` (`AssignedGroupId`),
  CONSTRAINT `Tasks_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Tasks_ibfk_2` FOREIGN KEY (`CustomerId`) REFERENCES `Customers` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tasks`
--

LOCK TABLES `Tasks` WRITE;
/*!40000 ALTER TABLE `Tasks` DISABLE KEYS */;
INSERT INTO `Tasks` VALUES
(1,'Prepare Q4 Sales Report','Compile sales data from all regions for the Q4 report.','2025-11-15 16:00:00',1,1,NULL,1),
(2,'Follow up with Customer #2','Call Anna Nowak to discuss the new proposal.','2025-10-20 10:00:00',1,1,2,1),
(3,'Fix login page bug','The \"Remember Me\" checkbox is not working on the login page.','2025-10-25 10:00:00',0,1,NULL,4),
(4,'Design new marketing brochure','Create a new brochure for the upcoming trade show.','2025-11-01 17:00:00',0,1,NULL,2),
(5,'Onboard Customer #6','Complete the onboarding process for KK Innovations.','2025-10-19 00:00:00',1,1,6,1),
(6,'Review contract with Customer #10','Review the legal terms of the new contract for AJ Industries.','2025-10-22 09:00:00',0,1,10,8),
(7,'Plan team offsite event','Organize the annual team offsite for the management team.','2025-11-10 17:00:00',0,1,NULL,5),
(8,'Update support documentation','Add a new section to the support docs about the latest feature.','2025-10-28 18:00:00',0,1,NULL,3),
(9,'Test new API endpoints','Perform QA testing on the new v2 API endpoints.','2025-11-05 17:00:00',0,1,NULL,9),
(11,'dodaj nowa umowe','nowa umowa ','2025-10-15 00:00:00',0,2,2,NULL),
(12,'test zadanie','opis zadania','2025-10-21 00:00:00',0,2,2,NULL),
(16,'5','5','2025-11-06 00:00:00',0,1,14,NULL),
(18,'test','test',NULL,0,1,14,NULL);
/*!40000 ALTER TABLE `Tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `TaxRates`
--

DROP TABLE IF EXISTS `TaxRates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `TaxRates` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Rate` decimal(5,2) NOT NULL,
  `IsActive` tinyint(1) DEFAULT NULL,
  `CreatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `TaxRates`
--

LOCK TABLES `TaxRates` WRITE;
/*!40000 ALTER TABLE `TaxRates` DISABLE KEYS */;
INSERT INTO `TaxRates` VALUES
(1,'Standard',23.00,1,'2025-10-13 12:02:54'),
(2,'Reduced 8%',8.00,1,'2025-10-13 12:02:54'),
(3,'Reduced 5%',5.00,1,'2025-10-13 12:02:54'),
(4,'Zero',0.00,1,'2025-10-13 12:02:54'),
(5,'Exempt',0.00,1,'2025-10-13 12:02:54'),
(6,'Old Standard 22%',22.00,0,'2024-10-13 12:02:54'),
(7,'Old Reduced 7%',7.00,0,'2024-10-13 12:02:54'),
(8,'Special Rate A',12.00,1,'2025-10-13 12:02:54'),
(9,'Special Rate B',15.00,1,'2025-10-13 12:02:54'),
(10,'Export Rate',0.00,1,'2025-10-13 12:02:54');
/*!40000 ALTER TABLE `TaxRates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Templates`
--

DROP TABLE IF EXISTS `Templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Templates` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `FileName` varchar(255) NOT NULL,
  `FilePath` varchar(255) NOT NULL,
  `UploadedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Templates`
--

LOCK TABLES `Templates` WRITE;
/*!40000 ALTER TABLE `Templates` DISABLE KEYS */;
INSERT INTO `Templates` VALUES
(14,'wzor_umowy_3','wzor_umowy_3.docx','/home/pacior/Pulpit/inzynier/backend-python/app/uploads/templates/20251112_220648_wzor_umowy_3.docx','2025-11-12 22:06:48');
/*!40000 ALTER TABLE `Templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserGroups`
--

DROP TABLE IF EXISTS `UserGroups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserGroups` (
  `UserId` int(11) NOT NULL,
  `GroupId` int(11) NOT NULL,
  PRIMARY KEY (`UserId`,`GroupId`),
  KEY `GroupId` (`GroupId`),
  CONSTRAINT `UserGroups_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `users` (`id`),
  CONSTRAINT `UserGroups_ibfk_2` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserGroups`
--

LOCK TABLES `UserGroups` WRITE;
/*!40000 ALTER TABLE `UserGroups` DISABLE KEYS */;
INSERT INTO `UserGroups` VALUES
(2,11),
(3,12);
/*!40000 ALTER TABLE `UserGroups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(1,'Admin','Administrator systemu z pełnymi uprawnieniami'),
(2,'Sprzedaż','Sprzedawca, obsługa klienta'),
(3,'Magazynier','obsługa zamówień');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'admin','admin@crm.local','scrypt:32768:8:1$0rcGRPAa3gmlJHlr$2f6063889f89df654e6765c131d719e014f14f815451b387bfa6730e139334ca52dfef598aaa7c3f84e519c70fec0e0b7b6b4c9849a5fe653b342ef3ac2a2927',1),
(2,'jkowalski','jan.kowalski@wp.pl','scrypt:32768:8:1$CRyseQGVTDJstOtF$8933fc9613cfca2347edf5cbeac145b0f24e336c77d8c98c3c2858920cc2df97e091659ef6f779ce4b3ffde76fc8105151368328c62b0163cf05de3e73fbd382',2),
(3,'akowalska','kowalska@wp.pl','scrypt:32768:8:1$SzTGW0tngXwuqUJd$296ea6c786e84849aa55078cae681d18fb56aeb581fa77611ba86306679c45b5961f08d2ecbbaba86448cc84bfbcb845f072d1a0c77e40e5d2e6f558994aeed5',3),
(4,'user1','pawel.aaaaaaaa@wp.pl','scrypt:32768:8:1$mGDaXJoPV2nm7yzi$8427a04532244be21ea6671ecff9181e9f249be24ee053ce0d9c3c0e90e781a49dcf43e21095389a0952341627c2b8ca3c9bf4872c93d4dc39cf9464148288ac',3);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_customer_invoice_summary`
--

DROP TABLE IF EXISTS `v_customer_invoice_summary`;
/*!50001 DROP VIEW IF EXISTS `v_customer_invoice_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_customer_invoice_summary` AS SELECT
 1 AS `CustomerId`,
  1 AS `CustomerName`,
  1 AS `CustomerEmail`,
  1 AS `CustomerCompany`,
  1 AS `TotalInvoices`,
  1 AS `TotalInvoiceValue`,
  1 AS `PaidInvoiceValue`,
  1 AS `UnpaidInvoiceValue`,
  1 AS `PaidInvoicesCount`,
  1 AS `UnpaidInvoicesCount`,
  1 AS `TotalContracts`,
  1 AS `TotalTasks` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_group_statistics`
--

DROP TABLE IF EXISTS `v_group_statistics`;
/*!50001 DROP VIEW IF EXISTS `v_group_statistics`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_group_statistics` AS SELECT
 1 AS `GroupId`,
  1 AS `GroupName`,
  1 AS `GroupDescription`,
  1 AS `TotalMembers`,
  1 AS `TotalCustomers`,
  1 AS `TotalInvoices`,
  1 AS `TotalInvoiceValue`,
  1 AS `PaidInvoicesCount`,
  1 AS `UnpaidInvoicesCount`,
  1 AS `TotalContracts`,
  1 AS `TotalTasks`,
  1 AS `CompletedTasksCount`,
  1 AS `PendingTasksCount`,
  1 AS `TotalMeetings` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `v_invoice_details`
--

DROP TABLE IF EXISTS `v_invoice_details`;
/*!50001 DROP VIEW IF EXISTS `v_invoice_details`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `v_invoice_details` AS SELECT
 1 AS `InvoiceId`,
  1 AS `InvoiceNumber`,
  1 AS `IssuedAt`,
  1 AS `DueDate`,
  1 AS `TotalAmount`,
  1 AS `IsPaid`,
  1 AS `CreatedByUserId`,
  1 AS `AssignedGroupId`,
  1 AS `CustomerId`,
  1 AS `CustomerName`,
  1 AS `CustomerEmail`,
  1 AS `CustomerCompany`,
  1 AS `CustomerPhone`,
  1 AS `PaidAmount`,
  1 AS `RemainingAmount`,
  1 AS `PaymentsCount`,
  1 AS `PaymentStatus` */;
SET character_set_client = @saved_cs_client;

--
-- Dumping routines for database 'crm_project'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calculate_invoice_total` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `fn_calculate_invoice_total`(p_net_amount DECIMAL(65, 30),
    p_tax_rate DECIMAL(5, 2)
) RETURNS decimal(65,30)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_gross_amount DECIMAL(65, 30);
    SET v_gross_amount = p_net_amount * (1 + COALESCE(p_tax_rate, 0.23));
    RETURN v_gross_amount;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_format_date_polish` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `fn_format_date_polish`(p_date DATETIME
) RETURNS varchar(50) CHARSET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci
    READS SQL DATA
    DETERMINISTIC
BEGIN
    IF p_date IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN DATE_FORMAT(p_date, '%d.%m.%Y %H:%i');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_is_invoice_overdue` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `fn_is_invoice_overdue`(p_invoice_id INT
) RETURNS tinyint(1)
    READS SQL DATA
BEGIN
    DECLARE v_due_date DATETIME;
    DECLARE v_is_paid BOOLEAN;
    DECLARE v_is_overdue BOOLEAN DEFAULT 0;
    
    SELECT DueDate, IsPaid INTO v_due_date, v_is_paid
    FROM Invoices
    WHERE Id = p_invoice_id;
    
    IF v_due_date IS NOT NULL AND v_due_date < NOW() AND v_is_paid = 0 THEN
        SET v_is_overdue = 1;
    END IF;
    
    RETURN v_is_overdue;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_create_invoice` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_create_invoice`(
    IN p_invoice_number VARCHAR(100),
    IN p_customer_id INT,
    IN p_issued_at DATETIME,
    IN p_due_date DATETIME,
    IN p_assigned_group_id INT,
    IN p_created_by_user_id INT,
    OUT p_invoice_id INT
)
BEGIN
    DECLARE v_total_amount DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_item_count INT DEFAULT 0;
    
    
    INSERT INTO Invoices (Number, CustomerId, IssuedAt, DueDate, TotalAmount, IsPaid, AssignedGroupId, CreatedByUserId)
    VALUES (p_invoice_number, p_customer_id, p_issued_at, p_due_date, 0, 0, p_assigned_group_id, p_created_by_user_id);
    
    SET p_invoice_id = LAST_INSERT_ID();
    
    
    SELECT COALESCE(SUM(GrossAmount), 0), COUNT(*)
    INTO v_total_amount, v_item_count
    FROM InvoiceItems
    WHERE InvoiceId = p_invoice_id;
    
    
    UPDATE Invoices
    SET TotalAmount = v_total_amount
    WHERE Id = p_invoice_id;
    
    SELECT p_invoice_id AS invoice_id, v_total_amount AS total_amount, v_item_count AS items_count;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_generate_sales_report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_generate_sales_report`(
    IN p_date_from DATE,
    IN p_date_to DATE,
    IN p_group_id INT
)
BEGIN
    SELECT 
        i.Id AS InvoiceId,
        i.Number AS InvoiceNumber,
        i.IssuedAt,
        i.TotalAmount,
        i.IsPaid,
        c.Name AS CustomerName,
        c.Company AS CustomerCompany,
        g.Name AS GroupName,
        COALESCE(SUM(p.Amount), 0) AS PaidAmount,
        (i.TotalAmount - COALESCE(SUM(p.Amount), 0)) AS RemainingAmount
    FROM Invoices i
    INNER JOIN Customers c ON i.CustomerId = c.Id
    LEFT JOIN Groups g ON i.AssignedGroupId = g.Id
    LEFT JOIN Payments p ON i.Id = p.InvoiceId
    WHERE i.IssuedAt BETWEEN p_date_from AND p_date_to
      AND (p_group_id IS NULL OR i.AssignedGroupId = p_group_id)
    GROUP BY i.Id, i.Number, i.IssuedAt, i.TotalAmount, i.IsPaid, c.Name, c.Company, g.Name
    ORDER BY i.IssuedAt DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_update_invoice_payment_status` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb3 */ ;
/*!50003 SET character_set_results = utf8mb3 */ ;
/*!50003 SET collation_connection  = utf8mb3_uca1400_ai_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `sp_update_invoice_payment_status`(
    IN p_invoice_id INT
)
BEGIN
    DECLARE v_total_paid DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_invoice_amount DECIMAL(65, 30) DEFAULT 0;
    DECLARE v_is_paid BOOLEAN DEFAULT 0;
    
    
    SELECT TotalAmount INTO v_invoice_amount
    FROM Invoices
    WHERE Id = p_invoice_id;
    
    
    SELECT COALESCE(SUM(Amount), 0) INTO v_total_paid
    FROM Payments
    WHERE InvoiceId = p_invoice_id;
    
    
    IF v_total_paid >= v_invoice_amount THEN
        SET v_is_paid = 1;
    ELSE
        SET v_is_paid = 0;
    END IF;
    
    
    UPDATE Invoices
    SET IsPaid = v_is_paid
    WHERE Id = p_invoice_id;
    
    SELECT p_invoice_id AS invoice_id, v_total_paid AS paid_amount, v_invoice_amount AS invoice_amount, v_is_paid AS is_paid;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_customer_invoice_summary`
--

/*!50001 DROP VIEW IF EXISTS `v_customer_invoice_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_customer_invoice_summary` AS select `c`.`Id` AS `CustomerId`,`c`.`Name` AS `CustomerName`,`c`.`Email` AS `CustomerEmail`,`c`.`Company` AS `CustomerCompany`,count(distinct `i`.`Id`) AS `TotalInvoices`,coalesce(sum(`i`.`TotalAmount`),0) AS `TotalInvoiceValue`,coalesce(sum(case when `i`.`IsPaid` = 1 then `i`.`TotalAmount` else 0 end),0) AS `PaidInvoiceValue`,coalesce(sum(case when `i`.`IsPaid` = 0 then `i`.`TotalAmount` else 0 end),0) AS `UnpaidInvoiceValue`,count(distinct case when `i`.`IsPaid` = 1 then `i`.`Id` else NULL end) AS `PaidInvoicesCount`,count(distinct case when `i`.`IsPaid` = 0 then `i`.`Id` else NULL end) AS `UnpaidInvoicesCount`,count(distinct `ct`.`Id`) AS `TotalContracts`,count(distinct `t`.`Id`) AS `TotalTasks` from (((`Customers` `c` left join `Invoices` `i` on(`c`.`Id` = `i`.`CustomerId`)) left join `Contracts` `ct` on(`c`.`Id` = `ct`.`CustomerId`)) left join `Tasks` `t` on(`c`.`Id` = `t`.`CustomerId`)) group by `c`.`Id`,`c`.`Name`,`c`.`Email`,`c`.`Company` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_group_statistics`
--

/*!50001 DROP VIEW IF EXISTS `v_group_statistics`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_group_statistics` AS select `g`.`Id` AS `GroupId`,`g`.`Name` AS `GroupName`,`g`.`Description` AS `GroupDescription`,count(distinct `ug`.`UserId`) AS `TotalMembers`,count(distinct `c`.`Id`) AS `TotalCustomers`,count(distinct `i`.`Id`) AS `TotalInvoices`,coalesce(sum(`i`.`TotalAmount`),0) AS `TotalInvoiceValue`,count(distinct case when `i`.`IsPaid` = 1 then `i`.`Id` else NULL end) AS `PaidInvoicesCount`,count(distinct case when `i`.`IsPaid` = 0 then `i`.`Id` else NULL end) AS `UnpaidInvoicesCount`,count(distinct `ct`.`Id`) AS `TotalContracts`,count(distinct `t`.`Id`) AS `TotalTasks`,count(distinct case when `t`.`Completed` = 1 then `t`.`Id` else NULL end) AS `CompletedTasksCount`,count(distinct case when `t`.`Completed` = 0 then `t`.`Id` else NULL end) AS `PendingTasksCount`,count(distinct `m`.`Id`) AS `TotalMeetings` from ((((((`Groups` `g` left join `UserGroups` `ug` on(`g`.`Id` = `ug`.`GroupId`)) left join `Customers` `c` on(`g`.`Id` = `c`.`AssignedGroupId`)) left join `Invoices` `i` on(`g`.`Id` = `i`.`AssignedGroupId`)) left join `Contracts` `ct` on(`g`.`Id` = `ct`.`ResponsibleGroupId`)) left join `Tasks` `t` on(`g`.`Id` = `t`.`AssignedGroupId`)) left join `Meetings` `m` on(`g`.`Id` = `m`.`AssignedGroupId`)) group by `g`.`Id`,`g`.`Name`,`g`.`Description` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_invoice_details`
--

/*!50001 DROP VIEW IF EXISTS `v_invoice_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_uca1400_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`%` SQL SECURITY DEFINER */
/*!50001 VIEW `v_invoice_details` AS select `i`.`Id` AS `InvoiceId`,`i`.`Number` AS `InvoiceNumber`,`i`.`IssuedAt` AS `IssuedAt`,`i`.`DueDate` AS `DueDate`,`i`.`TotalAmount` AS `TotalAmount`,`i`.`IsPaid` AS `IsPaid`,`i`.`CreatedByUserId` AS `CreatedByUserId`,`i`.`AssignedGroupId` AS `AssignedGroupId`,`c`.`Id` AS `CustomerId`,`c`.`Name` AS `CustomerName`,`c`.`Email` AS `CustomerEmail`,`c`.`Company` AS `CustomerCompany`,`c`.`Phone` AS `CustomerPhone`,coalesce(sum(`p`.`Amount`),0) AS `PaidAmount`,`i`.`TotalAmount` - coalesce(sum(`p`.`Amount`),0) AS `RemainingAmount`,count(distinct `p`.`Id`) AS `PaymentsCount`,case when `i`.`DueDate` < curdate() and `i`.`IsPaid` = 0 then 'Overdue' when `i`.`IsPaid` = 1 then 'Paid' else 'Pending' end AS `PaymentStatus` from ((`Invoices` `i` join `Customers` `c` on(`i`.`CustomerId` = `c`.`Id`)) left join `Payments` `p` on(`i`.`Id` = `p`.`InvoiceId`)) group by `i`.`Id`,`i`.`Number`,`i`.`IssuedAt`,`i`.`DueDate`,`i`.`TotalAmount`,`i`.`IsPaid`,`i`.`CreatedByUserId`,`i`.`AssignedGroupId`,`c`.`Id`,`c`.`Name`,`c`.`Email`,`c`.`Company`,`c`.`Phone` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-11-12 22:51:25
