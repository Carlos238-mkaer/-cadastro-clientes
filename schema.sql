-- Tabela de clientes
-- Rode este SQL uma vez no seu banco Postgres da Vercel
-- (dashboard do provedor, ex: Neon -> aba "Query" / "SQL Editor")

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  criado_em TIMESTAMP DEFAULT NOW()
);
