import { ENV } from './config.js';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Importation des routes
import routeurUtilisateur from './src/routes/utilisateur.route.js';
import routeurPersonnage from './src/routes/personnage.route.js';
import routeurCombat from './src/routes/combat.route.js';

// Importation et connexion de la base de données
import './src/models/index.js'; 

// Lancement d'express
const app = express();

// Implémentation des middlewares
app.use(express.json()); // Pour lire les données JSON
app.use(cookieParser()); // Pour parser les cookies
app.use(cors()); // Pour gérer la protection des CORS

// Middleware to route
app.use("/api/utilisateur", routeurUtilisateur);
app.use("/api/personnage", routeurPersonnage);
app.use("/api/combat", routeurCombat);

// Lancement de l'écoute du serveur
const PORT = ENV.port;
app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur http://localhost:${PORT}`);
});