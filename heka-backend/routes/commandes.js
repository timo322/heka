const express = require('express');
const router = express.Router();
const db = require('../db');
const verifierToken = require('../middleware/auth');


router.get('/', verifierToken, async (req, res) => {
  // Seuls les utilisateurs connectés peuvent accéder ici
  const user = req.utilisateur;
  console.log('Utilisateur connecté :', user);

  try {
    const result = await db.query('SELECT * FROM Commande_');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST : Créer une nouvelle commande
router.post('/', async (req, res) => {
  const { utilisateur_id, statut, paiement_id, livraison_id } = req.body;

  if (!utilisateur_id || !statut || !paiement_id || !livraison_id) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  const id = 'C' + Math.floor(Math.random() * 10000);
  const date_commande = new Date();

  try {
    await db.query(
      'INSERT INTO Commande_ (ID, utilisateur_id, date_commande, statut, paiement_id, livraison_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, utilisateur_id, date_commande, statut, paiement_id, livraison_id]
    );
    res.status(201).json({ message: 'Commande créée', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET : Récupérer une commande par ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('SELECT * FROM Commande_ WHERE ID = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT : Modifier le statut d'une commande
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  if (!statut) {
    return res.status(400).json({ error: "Le nouveau statut est requis." });
  }

  try {
    const result = await db.query(
      'UPDATE Commande_ SET statut = $1 WHERE ID = $2 RETURNING *',
      [statut, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    res.json({ message: "Commande mise à jour", commande: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE : Supprimer une commande
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM Commande_ WHERE ID = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    res.json({ message: "Commande supprimée", commande: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET : Produits associés à une commande
router.get('/:id/produits', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        p.ID AS produit_id,
        p.nom AS produit_nom,
        p.description,
        cp.quantite
      FROM Commande_Produit_ cp
      JOIN Produit_ p ON cp.produit_id = p.ID
      WHERE cp.commande_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucun produit trouvé pour cette commande" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET /commandes/:id/produits

router.get('/:id/produits', verifierToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT cp.produit_id, p.nom, p.description, cp.quantite
       FROM Commande_Produit_ cp
       JOIN Produit_ p ON p.ID = cp.produit_id
       WHERE cp.commande_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;

