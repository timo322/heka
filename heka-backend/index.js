const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json());

const commandesRoutes = require('./routes/commandes');
app.use('/api/commandes', commandesRoutes);

const ordonnancesRoutes = require('./routes/ordonnances');
app.use('/api/ordonnances', ordonnancesRoutes);

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const livraisonsRoutes = require('./routes/livraisons');
app.use('/api/livraisons', livraisonsRoutes);

const dataRoutes = require('./routes/data.routes');
app.use('/api', dataRoutes);





const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
