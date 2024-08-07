import { Sequelize } from "sequelize";
import { env } from '../../config.js';

// Création de l'objet pour la connexion à la base de donnée avec Sequelize
const connexionBDD = new Sequelize(
    env.dbName,
    env.dbUser,
    env.dbPassword,
    {
        host: env.dbHost,
        dialect: 'mysql'
    }
);

try { // Exécution de la connexion
    await connexionBDD.authenticate();
    console.log('La connexion a été établie avec succès !');
} catch (erreur) {
    console.error('Impossible de se connecter à la base de données:', erreur);
}