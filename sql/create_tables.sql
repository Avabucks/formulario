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
  foto_profilo VARCHAR(255) NOT NULL,
  data_creazione TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--
-- Table structure for table 'categorie' (categorie personali dell'utente)
--
CREATE TABLE IF NOT EXISTS categorie (
  id SERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  nome VARCHAR(30) NOT NULL,
  colore VARCHAR(7) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uid, nome)
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
  data_creazione TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_modifica TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  descrizione TEXT,
  visibility INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  categoria_id INTEGER REFERENCES categorie(id) ON DELETE SET NULL
);
--
-- Table structure for table 'capitoli'
--
CREATE TABLE IF NOT EXISTS capitoli (
  id SERIAL PRIMARY KEY,
  beautiful_id VARCHAR(255) NOT NULL UNIQUE,
  titolo VARCHAR(255),
  formulario VARCHAR(255) NOT NULL REFERENCES formulari(beautiful_id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL
);
--
-- Table structure for table 'argomenti'
--
CREATE TABLE IF NOT EXISTS argomenti (
  id SERIAL PRIMARY KEY,
  beautiful_id VARCHAR(255) NOT NULL UNIQUE,
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
--
-- Table structure for table 'feedback'
--
CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  testo TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--
-- Table structure for table 'uploads' (immagini su Cloudflare R2)
--
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  user_uid VARCHAR(255) NOT NULL,
  argomento_id VARCHAR(255),
  size INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS uploads_user_uid_idx ON uploads(user_uid);
