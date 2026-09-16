// Exemplo de "rota protegida" -- só responde se o token for válido.
// Use esse modelo pra proteger qualquer outra função sua no futuro
// (ex: ver pedidos, editar produtos, etc).

import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization; // formato: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Você precisa estar logado.' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ mensagem: `Bem-vindo(a), ${dados.nome}!`, usuario: dados });
  } catch (erro) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente.' });
  }
}
