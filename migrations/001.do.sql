CREATE TYPE user_role AS ENUM ('user', 'creator');

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  chat_id VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  lang CHAR(2) NOT NULL DEFAULT 'en',
  role user_role NOT NULL DEFAULT 'user',
  current_action VARCHAR(50),
  current_action_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE retros (
  id SERIAL PRIMARY KEY,
  code VARCHAR(30) UNIQUE,
  name VARCHAR(30) NOT NULL,
  cron VARCHAR(50) NOT NULL,
  google_sheet_id VARCHAR(255) NOT NULL,
  questions JSONB,
  created_by VARCHAR(50) REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_retros (
  user_id VARCHAR(50) REFERENCES users(id),
  retro_id INTEGER REFERENCES retros(id),
  join_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, retro_id)
);
