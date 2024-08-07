// Import des variables d'environement
import { env } from '../../config.js'; 

// Import Sequelize
import { Sequelize } from "sequelize";

// Import des modèles
import modeleUtilisateur from "./utilisateur.model.js";
import modelePersonnage from "./personnage.model.js";

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
    console.log('La connexion à la base de données a été établie avec succès !');
} catch (erreur) {
    console.error('Impossible de se connecter à la base de données :', erreur);
}

// Mise en relation entre les modèles prédéfini et la connexion BDD
modeleUtilisateur(connexionBDD, Sequelize);
modelePersonnage(connexionBDD, Sequelize);

// Récupération des modèles par destructuration
const { Utilisateur, Personnage } = connexionBDD.models;

// Règles des cardinalités
Utilisateur.hasMany(Personnage);
Personnage.belongsTo(Utilisateur);

// Syncrhonisation de la BDD
await connexionBDD.sync(
    // {alter:true}
);
console.log("Synchronisation de la base de données OK !");

// export des Entités initiés
export {
    Utilisateur,
    Personnage
}
