import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { env } from './config.js';

const app = express();

// MIDDLEWARES 
app.use(express.json()); // Pour lire les données JSON
app.use(cookieParser()); // Pour parser les cookies
app.use(cors()); // Pour gérer la protection des CORS

import './src/models/index.js'; // Connexion à la base de données

// LANCEMENT DU SERVEUR
const PORT = env.port;
app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur http://localhost:${PORT}`);
});