const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Clé secrète pour signer les tokens
const SECRET_KEY = 'heka_secret_2024';

router.post('/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;

  try {
    const result = await db.query('SELECT * FROM Utilisateur_ WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Utilisateur introuvable" });
    }

    const user = result.rows[0];

    // Comparaison du mot de passe (ici non chiffré, simplifié)
    if (mot_de_passe !== user.mot_de_passe) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    // Création du token
    const token = jwt.sign({
      id: user.id,
      type: user.type,
      nom: user.nom
    }, SECRET_KEY, { expiresIn: '2h' });

    res.json({ message: "Connexion réussie", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
