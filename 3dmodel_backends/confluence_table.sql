DROP DATABASE IF EXISTS confluence;
CREATE DATABASE IF NOT EXISTS confluence;
USE confluence;
CREATE TABLE IF NOT EXISTS 3DModels
(
  id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
  name VARCHAR(150) NOT NULL UNIQUE,
  url VARCHAR(300) NOT NULL UNIQUE,
  thumbnail VARCHAR(300) UNICODE,
  tagLabel VARCHAR(300),
  creationDate DATETIME DEFAULT NOW(),
#   autoDisplay TINYINT DEFAULT 1,
  PRIMARY KEY (id)
);

# CREATE TABLE IF NOT EXISTS 3DModelTags
# (
#   id INT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE,
#   tagName VARCHAR(50) NOT NULL,
#   modelId INT UNSIGNED NOT NULL
# );