// Import des variables d'environement
import { ENV } from '../../config.js';

// Import Sequelize
import { Sequelize } from "sequelize";

// Import des modèles
import modeleUtilisateur from "./utilisateur.model.js";
import modelePersonnage from "./personnage.model.js";
import modeleCombat from "./combat.model.js";
import modeleParticipation from "./participation.model.js";

// Création de l'objet pour la connexion à la base de donnée avec Sequelize
const connexionBDD = new Sequelize(
    ENV.DB_NAME,
    ENV.DB_USER,
    ENV.DB_PASSWORD,
    {
        host: ENV.DB_HOST,
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
modeleCombat(connexionBDD, Sequelize);
modeleParticipation(connexionBDD, Sequelize);

// Récupération des modèles par destructuration
const { Utilisateur, Personnage, Combat, Participation } = connexionBDD.models; // Nous sommes obligé d'utilisé la propriété .models

// Règles des cardinalités
Utilisateur.hasMany(Personnage, {foreignKey: 'utilisateur_id'});
Personnage.belongsTo(Utilisateur,  {foreignKey: 'utilisateur_id'});

Personnage.hasMany(Participation, {foreignKey: 'personnage_id' });
Participation.belongsTo(Personnage, {foreignKey: 'personnage_id' });

Combat.hasMany(Participation, {foreignKey: 'combat_id' });
Participation.belongsTo(Combat, {foreignKey: 'combat_id' });

Combat.belongsTo(Participation, { as: "TourCourant"});

// Syncrhonisation de la BDD
await connexionBDD.sync(
    // {alter:true}
);
console.log("Synchronisation de la base de données OK !");

// export des Entités initiés
export {
    Utilisateur,
    Personnage,
    Combat,
    Participation
}
