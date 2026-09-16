// Vercel Function - roda no servidor, não no navegador.
// Depois de conectar o Postgres no dashboard (aba Storage), a Vercel
// já injeta as variáveis de ambiente automaticamente, incluindo
// POSTGRES_URL, que o pacote @vercel/postgres usa sozinho.

import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Permite chamar essa API do seu HTML estático
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const { nome, email, telefone } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ erro: 'Nome e email são obrigatórios.' });
      }

      const resultado = await sql`
        INSERT INTO clientes (nome, email, telefone)
        VALUES (${nome}, ${email}, ${telefone || null})
        RETURNING id, nome, email, telefone, criado_em;
      `;

      return res.status(201).json(resultado.rows[0]);
    }

    if (req.method === 'GET') {
      const resultado = await sql`
        SELECT id, nome, email, telefone, criado_em
        FROM clientes
        ORDER BY criado_em DESC;
      `;
      return res.status(200).json(resultado.rows);
    }

    return res.status(405).json({ erro: 'Método não permitido.' });
  } catch (erro) {
    // Email duplicado (violação do UNIQUE)
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Esse email já está cadastrado.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no servidor.' });
  }
}
