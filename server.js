import { ENV } from './config.js';
import express from 'express';
import cookieParser from 'cookie-parser';
// import cors from 'cors';

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
// app.use(cors({
//     origin: "*"
// })); // Pour gérer la protection des CORS

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", true);
    return next();
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Quelque chose s'est mal passée !";
    return res.status(status).json({
        success: false,
        status,
        message,
    });
});

// Middleware to route
app.use("/api/utilisateur", routeurUtilisateur);
app.use("/api/personnage", routeurPersonnage);
app.use("/api/combat", routeurCombat);

// Lancement de l'écoute du serveur
const PORT = ENV.PORT;
app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur http://localhost:${PORT}`);
});