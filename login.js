// Confere email + senha. Se bater, gera um "token" (JWT) --
// tipo um crachá assinado digitalmente que comprova quem é o usuário,
// sem precisar mandar a senha de novo a cada clique.

import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido.' });

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
    }

    const resultado = await sql`
      SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ${email};
    `;
    const usuario = resultado.rows[0];

    // Mensagem genérica de propósito -- não conte pro atacante
    // se foi o email ou a senha que errou.
    if (!usuario) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha incorretos.' });
    }

    // Gera o token, válido por 7 dias. JWT_SECRET é uma variável de
    // ambiente que você vai criar na Vercel (explico embaixo).
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ erro: 'Erro no servidor.' });
  }
}
