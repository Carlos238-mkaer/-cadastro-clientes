// Cria uma conta nova. A senha NUNCA é salva como texto puro --
// o bcrypt transforma ela num "hash" (uma sequência embaralhada
// que não dá pra reverter), e é isso que vai pro banco.

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });

  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
    }
    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha precisa ter pelo menos 6 caracteres.' });
    }

    // 10 = quantidade de "voltas" de embaralhamento. 10 é um bom padrão.
    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await sql`
      INSERT INTO usuarios (nome, email, senha_hash)
      VALUES (${nome}, ${email}, ${senhaHash})
      RETURNING id, nome, email;
    `;

    return res.status(201).json({ mensagem: 'Conta criada com sucesso!', usuario: resultado.rows[0] });
  } catch (erro) {
    if (erro.code === '23505') {
      return res.status(409).json({ erro: 'Já existe uma conta com esse email.' });
    }
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no servidor.' });
  }
}
