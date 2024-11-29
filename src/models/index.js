import { ENV } from '../../config.js'; // Import des variables d'environement
import { Sequelize } from "sequelize"; // Import Sequelize

// Import des modèles
import userModel from "./user.model.js";
import characterModel from "./character.model.js";
import battleModel from "./battle.model.js";
import participationModel from "./participation.model.js";

// Création de l'objet pour la connexion à la base de donnée avec Sequelize
const connectionDB = new Sequelize(
    ENV.DB_NAME,
    ENV.DB_USER,
    ENV.DB_PASSWORD,
    {
        host: ENV.DB_HOST,
        dialect: 'mysql'
    }
);

// Authentification pour la connexion à la BDD
if (ENV.NODE_ENV === 'test') {
    console.log('Running in TEST mode - Database connection skipped.');
} else {
    try {
        await connectionDB.authenticate();
        console.log('La connexion à la base de données a été établie avec succès !');
    } catch (error) {
        console.error('Impossible de se connecter à la base de données :', error);
    }
}

// Mise en relation et initialisation des modèles avec la connexion BDD
userModel(connectionDB, Sequelize);
characterModel(connectionDB, Sequelize);
battleModel(connectionDB, Sequelize);
participationModel(connectionDB, Sequelize);

const { User, Character, Battle, Participation } = connectionDB.models; // Récupération des modèles initialisés par destructuration de la propriété .models

// Relations entre modèles et cardinalités
User.hasMany(Character, {foreignKey: 'user_id'});
Character.belongsTo(User,  {foreignKey: 'user_id'});
Battle.belongsTo(Character, {as: 'CurrentTurn', foreignKey: 'current_turn_character_id' });

Battle.hasMany(Participation, {foreignKey: 'battle_id' });
Participation.belongsTo(Battle, {foreignKey: 'battle_id' });

Character.hasMany(Participation, {foreignKey: 'character_id' });
Participation.belongsTo(Character, {foreignKey: 'character_id' });

// Synchronisation des tables de la BDD
if (ENV.NODE_ENV === 'test') {
    console.log('Running in TEST mode - Database sync skipped.');
} else {
    await connectionDB.sync({ alter: true });
    console.log("Synchronisation de la base de données OK !");
}

// export des Modèles initiés
export {
    User,
    Character,
    Battle,
    Participation,
};
