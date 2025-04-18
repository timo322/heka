const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ GET /api/utilisateurs?type=Patient|Pharmacien|Livreur
router.get('/utilisateurs', async (req, res) => {
  const { type } = req.query;
  try {
    const result = await db.query(
      'SELECT id, nom FROM Utilisateur_ WHERE type = $1',
      [type]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur chargement utilisateurs' });
  }
});

// ✅ GET /api/produits
router.get('/produits', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, nom FROM Produit_ ORDER BY nom'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur chargement produits' });
  }
});

module.exports = router;
