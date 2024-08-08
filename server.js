import { ENV } from './config.js';
import express from 'express'; // Module pour gérer les routes
import cookieParser from 'cookie-parser'; // Module pour pouvoir lire les cookie
// import cors from 'cors'; // cette manière de faire fonctionner les cors ne semble pas marcher sur Firefox

// Importation des routes
import routeurUtilisateur from './src/routes/utilisateur.route.js';
import routeurPersonnage from './src/routes/personnage.route.js';
import routeurCombat from './src/routes/combat.route.js';

// Importation et connexion de la base de données
import './src/models/index.js'; 

// Lancement du serveur express
const app = express();

// Implémentation des middlewares
app.use(express.json()); // Pour lire les données JSON
app.use(cookieParser()); // Pour parser les cookies
// app.use(cors({
//     origin: "*"
// })); // Pour gérer la protection des CORS, cette manière de faire fonctionner les cors ne semble pas marcher sur Firefox

app.use((requete, reponse, next) => { // Autre methode pour faire fonctionner les cors
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

// Lancement de l'écoute du serveur
const PORT = ENV.PORT;
app.listen(PORT, () => {
    console.log(`Serveur à l'écoute sur http://localhost:${PORT}`);
});
