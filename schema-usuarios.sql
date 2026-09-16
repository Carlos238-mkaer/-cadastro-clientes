-- Tabela de usuários (login da loja)
-- Rode isso no SQL Editor do Neon, igual você fez com a tabela clientes.
-- É uma tabela DIFERENTE de "clientes" -- essa aqui é pra quem faz login no site.

CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);
