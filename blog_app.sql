CREATE DATABASE  IF NOT EXISTS `blog_app` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `blog_app`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: blog_app
-- ------------------------------------------------------
-- Server version	8.4.7

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
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Category_name_key` (`name`),
  UNIQUE KEY `Category_slug_key` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Technology','technology'),(2,'Design','design'),(3,'Productivity','productivity'),(4,'Lifestyle','lifestyle');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `postId` int NOT NULL,
  `authorId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Comment_postId_idx` (`postId`),
  KEY `Comment_authorId_idx` (`authorId`),
  CONSTRAINT `Comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (1,'This was exactly what I needed — thanks for the clear walkthrough!',1,2,'2026-06-05 09:30:35.746'),(2,'Great point about httpOnly cookies. Switched my project over.',1,1,'2026-06-05 09:30:35.746'),(3,'Insightful read, thanks!',5,2,'2026-06-05 09:32:27.661'),(4,'great .....',5,2,'2026-06-05 09:51:47.160'),(5,'amazing.....',5,2,'2026-06-05 09:52:20.486');
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `excerpt` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `coverImage` text COLLATE utf8mb4_unicode_ci,
  `status` enum('DRAFT','PUBLISHED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `views` int NOT NULL DEFAULT '0',
  `authorId` int NOT NULL,
  `categoryId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Post_slug_key` (`slug`),
  KEY `Post_authorId_idx` (`authorId`),
  KEY `Post_categoryId_idx` (`categoryId`),
  CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (1,'Building a Full-Stack Blog with Next.js and Prisma','building-a-full-stack-blog-with-nextjs-and-prisma','A practical walkthrough of wiring up Next.js API routes, Prisma and MySQL into a production-ready blog.','Modern web development has never been more approachable. In this article we explore how to combine Next.js with Prisma to ship a real product.\n\n## Why this stack?\n\nNext.js gives you both the frontend and the backend in a single codebase. Prisma turns your database into a type-safe, ergonomic client. Together they remove a huge amount of boilerplate.\n\n## Setting up the database\n\nWe model users, posts and comments. Relations are declared once in the schema and Prisma generates the client for you.\n\n> The best code is the code you never have to write twice.\n\n## Authentication\n\nWe store a signed JWT in an httpOnly cookie. This keeps tokens out of JavaScript\'s reach while remaining easy to use across API routes.\n\nWrap up: with a clear schema, a few API routes and Redux Toolkit for state, you can build something genuinely useful in an afternoon.','https://picsum.photos/seed/nextjs/1200/600','PUBLISHED',370,1,1,'2026-06-05 09:30:35.676','2026-06-05 09:30:35.676'),(2,'Designing Dark Interfaces That Don\'t Strain the Eyes','designing-dark-interfaces-that-dont-strain-the-eyes','Dark mode is more than inverting colors. Here is how to build a calm, legible dark UI.','Dark interfaces are everywhere, but many of them are harsh and hard to read. Good dark design is about contrast control.\n\n## Avoid pure black\n\nPure black backgrounds create too much contrast with white text. Use a very dark grey instead — it feels softer and more premium.\n\n## Use accent colors sparingly\n\nA single vivid accent (we use a calm green) draws the eye to the things that matter: primary actions and active states.\n\n## Mind your elevation\n\nLighter surfaces read as \"closer\" to the user. Layer your greys to communicate depth without harsh borders.','https://picsum.photos/seed/darkui/1200/600','PUBLISHED',389,1,2,'2026-06-05 09:30:35.687','2026-06-05 11:28:44.965'),(3,'The Two-List System for Staying Productive','the-two-list-system-for-staying-productive','Forget complicated apps. A simple two-list method keeps you focused on what actually matters.','Productivity systems often collapse under their own complexity. The two-list system is deliberately minimal.\n\n## List one: today\n\nNo more than five items. If it doesn\'t fit, it isn\'t today\'s problem.\n\n## List two: someday\n\nEverything else lives here. Review it weekly and promote items to \"today\" as space frees up.\n\n> Constraints create focus.\n\nThat\'s it. The power is in the limit, not the tooling.','https://picsum.photos/seed/productivity/1200/600','PUBLISHED',315,1,3,'2026-06-05 09:30:35.699','2026-06-05 11:28:45.146'),(4,'Slow Mornings: A Case for Doing Less Before Noon','slow-mornings-a-case-for-doing-less-before-noon','What happens when you stop optimizing your mornings and start enjoying them.','Hustle culture sold us the 5am miracle morning. But for many people, slow mornings are the real productivity hack.\n\n## Protect the first hour\n\nNo email, no feeds. Let your brain warm up on its own terms.\n\n## Single-task on purpose\n\nMake coffee and just make coffee. The ritual is the point.\n\nA calmer morning sets a calmer tone for the entire day.','https://picsum.photos/seed/morning/1200/600','PUBLISHED',356,1,4,'2026-06-05 09:30:35.711','2026-06-05 09:30:35.711'),(5,'State Management in 2026: When Do You Actually Need Redux?','state-management-in-2026-when-do-you-actually-need-redux','Redux Toolkit and RTK Query make state predictable — but not every app needs them. A balanced take.','Redux earned a reputation for boilerplate years ago. Redux Toolkit changed that story completely.\n\n## RTK Query handles your server state\n\nCaching, invalidation and loading flags come for free. This alone removes most of the data-fetching code you\'d otherwise hand-roll.\n\n## Slices for everything else\n\nUI state like a sidebar toggle or auth status fits neatly into small slices.\n\n## When to skip it\n\nTiny apps with little shared state are fine with local state and context. Reach for Redux when many distant components care about the same data.','https://picsum.photos/seed/redux/1200/600','PUBLISHED',39,1,1,'2026-06-05 09:30:35.724','2026-06-05 11:53:20.697');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Kartik Admin','admin@juju.com','$2a$10$Xg0lFIVliZW4qw9CUUq73Opy8.k2JIH0dq3c6Sg5GZaalz7CcWaSu','ADMIN',NULL,'Editor-in-chief at JuJu.','2026-06-05 09:30:35.550','2026-06-05 11:11:28.558'),(2,'Jamie Reader','reader@juju.com','$2a$10$oF8kGvw9SEnJYN36cAfbwuXrwWuGD6rBgzBq0uALsGdcL3bMLBRVK','USER',NULL,NULL,'2026-06-05 09:30:35.611','2026-06-05 11:11:28.571');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'blog_app'
--

--
-- Dumping routines for database 'blog_app'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-06  5:45:27
