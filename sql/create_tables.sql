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
  views INTEGER NOT NULL DEFAULT 0
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
-- Table structure for table 'subscriptions'
--
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  paddle_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  paddle_customer_id VARCHAR(255),
  paddle_price_id VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'pro',
  current_period_starts_at TIMESTAMP,
  current_period_ends_at TIMESTAMP,
  canceled_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--
-- Table structure for table 'ai_token_usage'
--
CREATE TABLE IF NOT EXISTS ai_token_usage (
  id SERIAL PRIMARY KEY,
  user_uid VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  period_month DATE NOT NULL,
  provider VARCHAR(50) NOT NULL,
  prompt_tokens BIGINT NOT NULL DEFAULT 0,
  completion_tokens BIGINT NOT NULL DEFAULT 0,
  total_tokens BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_uid, period_month, provider)
);
