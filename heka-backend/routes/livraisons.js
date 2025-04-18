const express = require('express');
const router = express.Router();
const db = require('../db');
const verifierToken = require('../middleware/auth');

// 📦 GET /api/livraisons → livraisons du livreur connecté
router.get('/', verifierToken, async (req, res) => {
  const livreurId = req.utilisateur.id;

  try {
    const result = await db.query(`
      SELECT * FROM Livraison_
      WHERE livreur_id = $1
      ORDER BY date_prevue DESC
    `, [livreurId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération livraisons :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des livraisons' });
  }
});

// ✅ PATCH /api/livraisons/:id/livree → marquer comme livrée
router.patch('/:id/livree', verifierToken, async (req, res) => {
  const { id } = req.params;
  const livreurId = req.utilisateur.id;
  const dateRealisee = new Date();

  try {
    const result = await db.query(
      `UPDATE Livraison_ 
       SET statut = 'Livrée', date_realisee = $1 
       WHERE id = $2 AND livreur_id = $3 RETURNING *`,
      [dateRealisee, id, livreurId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Livraison non trouvée ou non autorisée" });
    }

    res.json({ message: 'Livraison mise à jour', livraison: result.rows[0] });
  } catch (err) {
    console.error('Erreur mise à jour livraison :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour' });
  }
});

module.exports = router;
