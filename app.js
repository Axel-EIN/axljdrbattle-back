// ================================
// === DEBUT DU SERVEUR BACKEND === 
// ================================
//
// Le serveur EXPRESS est crée ici puis configurer avec les routeurs, les contrôlleurs, les middleware, les cors
// Mais juste avant de lancer le serveur on export en app.js au service de socket
// Ce service ajoute un serveur websocket en plus à express puis on le renvoie à server.js pour le lancement avec listen
//
// 1 => app.js (création du serveur express et configurations)
// 2 => ./src/services/socket.js (ajout/upgrade du serveur en websocket)
// 3 => server.js (lancement avec .listen)

import express from 'express';
import cookieParser from 'cookie-parser'; // Module pour pouvoir lire les cookies

// Importation des routes
import routeurUtilisateur from './src/routes/utilisateur.route.js';
import routeurPersonnage from './src/routes/personnage.route.js';
import routeurCombat from './src/routes/combat.route.js';

import './src/models/index.js'; // Importation et connexion de la base de données

const app = express(); // Lancement du serveur express

// Implémentation des middlewares
app.use(express.json()); // Pour lire les données JSON
app.use(cookieParser()); // Pour parser les cookies

app.use((requete, reponse, next) => { // Methode pour faire fonctionner les cors
    reponse.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    reponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    reponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    reponse.setHeader("Access-Control-Allow-Credentials", true);
    return next();
});

// Middleware qui rend le dossier /public accessible sur http://localhost:8080/
app.use(express.static('public'));

// Middleware pour connecter les routes
app.use("/api/utilisateur", routeurUtilisateur);
app.use("/api/personnage", routeurPersonnage);
app.use("/api/combat", routeurCombat);

export default app;