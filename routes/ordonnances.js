const express = require('express'); 
const router = express.Router();
const db = require('../db');

// 📄 GET /api/ordonnances/:id → détails d’une ordonnance
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        o.ID AS ordonnance_id,
        o.date_validation,
        u1.nom AS patient_nom,
        u2.nom AS medecin_nom,
        p.nom AS produit_nom,
        p.description,
        op.quantite,
        p.ID AS produit_id
      FROM Ordonnance_ o
      JOIN Ordonnance_Produit_ op ON o.ID = op.ordonnance_id
      JOIN Produit_ p ON op.produit_id = p.ID
      JOIN Utilisateur_ u1 ON o.patient_id = u1.ID
      JOIN Utilisateur_ u2 ON o.medecin_id = u2.ID
      WHERE o.ID = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ordonnance non trouvée" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🩺 POST /api/ordonnances → créer une ordonnance avec produits
router.post('/', async (req, res) => {
  const { medecin_id, patient_id, produits } = req.body;

  if (!medecin_id || !patient_id || !produits || !Array.isArray(produits)) {
    return res.status(400).json({ error: "Champs requis : medecin_id, patient_id, produits[]" });
  }

  const ordonnanceId = 'O' + Math.floor(Math.random() * 10000);
  const date_validation = new Date();

  try {
    await db.query('BEGIN');

    // Insertion de l’ordonnance
    await db.query(
      'INSERT INTO Ordonnance_ (ID, medecin_id, patient_id, date_validation) VALUES ($1, $2, $3, $4)',
      [ordonnanceId, medecin_id, patient_id, date_validation]
    );

    // Insertion des produits liés à l’ordonnance
    for (const { produit_id, quantite } of produits) {
      await db.query(
        'INSERT INTO Ordonnance_Produit_ (ordonnance_id, produit_id, quantite) VALUES ($1, $2, $3)',
        [ordonnanceId, produit_id, quantite]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: "Ordonnance créée", id: ordonnanceId });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// 📋 GET : toutes les ordonnances d’un patient
router.get('/patient/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        o.ID AS ordonnance_id,
        o.date_validation,
        u2.nom AS medecin_nom
      FROM Ordonnance_ o
      JOIN Utilisateur_ u2 ON o.medecin_id = u2.ID
      WHERE o.patient_id = $1
      ORDER BY o.date_validation DESC
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Aucune ordonnance trouvée pour ce patient" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ PUT /api/ordonnances/:id → modifier une ordonnance
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { produits } = req.body;

  if (!produits || !Array.isArray(produits)) {
    return res.status(400).json({ error: "Produits[] requis" });
  }

  try {
    await db.query('BEGIN');

    // Supprimer les anciens produits
    await db.query('DELETE FROM Ordonnance_Produit_ WHERE ordonnance_id = $1', [id]);

    // Réinsérer les produits mis à jour
    for (const { produit_id, quantite } of produits) {
      await db.query(
        'INSERT INTO Ordonnance_Produit_ (ordonnance_id, produit_id, quantite) VALUES ($1, $2, $3)',
        [id, produit_id, quantite]
      );
    }

    await db.query('COMMIT');
    res.json({ message: 'Ordonnance mise à jour' });
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// 📚 GET /api/ordonnances → liste de toutes les ordonnances (pharmacien)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        o.ID AS ordonnance_id,
        o.date_validation,
        u1.nom AS patient_nom,
        u2.nom AS medecin_nom
      FROM Ordonnance_ o
      JOIN Utilisateur_ u1 ON o.patient_id = u1.ID
      JOIN Utilisateur_ u2 ON o.medecin_id = u2.ID
      ORDER BY o.date_validation DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
