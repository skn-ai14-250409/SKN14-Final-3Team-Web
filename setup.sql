-- Active: 1753665103106@@127.0.0.1@3306@mysql
DROP DATABASE KB_FinAIssist_db_test;

CREATE DATABASE KB_FinAIssist_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'KB_FinAIssist'@'localhost' IDENTIFIED BY 'KB_FinAIssist_1234';
GRANT ALL PRIVILEGES ON KB_FinAIssist_db_test.* TO 'KB_FinAIssist'@'localhost';
FLUSH PRIVILEGES;


use KB_FinAIssist_db_test;
show tables;

-- f_chatbot 기록 삭제
DELETE FROM django_migrations WHERE app='f_chatbot';

-- f_calendar, f_todo 같은 다른 앱들도 f_user 보다 먼저 들어간 게 있으면 삭제
DELETE FROM django_migrations WHERE app='f_calendar';
DELETE FROM django_migrations WHERE app='f_todo';
DELETE FROM django_migrations WHERE app='f_document';