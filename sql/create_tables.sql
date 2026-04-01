--
-- Database : 'formulario'
-- PostgreSQL
--
-- --------------------------------------------------------
--
-- Extension 'pg_trgm' for similarity
--
CREATE EXTENSION IF NOT EXISTS pg_trgm;
--
-- Table structure for table 'users'
--
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  foto_profilo VARCHAR(255) NOT NULL
);
--
-- Table structure for table 'formulari'
--
CREATE TABLE IF NOT EXISTS formulari (
  id SERIAL PRIMARY KEY,
  beautiful_id VARCHAR(255) NOT NULL UNIQUE,
  titolo VARCHAR(30) NOT NULL,
  owner_uid VARCHAR(255) NOT NULL,
  author_uid VARCHAR(255) NOT NULL,
  anno VARCHAR(255) NOT NULL,
  descrizione VARCHAR(255) NOT NULL,
  visibility INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0
);
--
-- Table structure for table 'capitoli'
--
CREATE TABLE IF NOT EXISTS capitoli (
  id SERIAL PRIMARY KEY,
  beautiful_id VARCHAR(255) NOT NULL UNIQUE,
  titolo VARCHAR(255) NOT NULL,
  formulario VARCHAR(255) NOT NULL REFERENCES formulari(beautiful_id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL
);
--
-- Table structure for table 'argomenti'
--
CREATE TABLE IF NOT EXISTS argomenti (
  id SERIAL PRIMARY KEY,
  beautiful_id VARCHAR(255) NOT NULL UNIQUE,
  titolo VARCHAR(255) NOT NULL,
  capitolo VARCHAR(255) NOT NULL REFERENCES capitoli(beautiful_id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT ''
);
--
-- Table structure for table 'preferiti'
--
CREATE TABLE IF NOT EXISTS preferiti (
  id SERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  formulario_id VARCHAR(255) NOT NULL REFERENCES formulari(beautiful_id) ON DELETE CASCADE,
  UNIQUE(user_uid, formulario_id)
);