const jwt = require('jsonwebtoken');

const SECRET_KEY = 'heka_secret_2024'; // la même que dans auth.js

function verifierToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1]; // format: Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.utilisateur = decoded; // on ajoute l’utilisateur à la requête
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
}

module.exports = verifierToken;
