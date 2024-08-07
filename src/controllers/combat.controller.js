// Importation de l'Objet Utilisateur initialisé et connecté à la base de données Sequelize
import { Combat } from "../models/index.js";

// Fonction pour ajouter un combat
const ajouterCombat = async (requete, reponse, next) => {
    try {
        await Combat.create( requete.body );

        reponse.status(201).json("Le combat a bien été ajouté !");
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la création du combat !" });
    }
}

// Fonction pour récupérer tout les combats
const recupererCombats = async (requete, reponse, next) => {
    try {
        const toutCombats = await Combat.findAll();
        reponse.status(200).json(toutCombats);
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la récupération des combats !" });
    }
}

// Fonction pour modifier un utilisateur
const modifierCombat = async (requete, reponse, next) => {
    try {
        const combatTrouve = await Combat.findByPk(requete.params.id); // Récupère un combat par ID

        if (!combatTrouve)
            return reponse.status(404).json("Ce combat n'existe pas !");

        await combatTrouve.update(requete.body); // Modifie le combat
        
        reponse.status(200).json({
            message: "Le combat a bien été modifié !",
            combatTrouve,
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la modification du combat !" });
    }
}

// Fonction pour supprimer un utilisateur
const supprimerCombat = async (requete, reponse, next) => {
    try {
        const combatTrouve = await Combat.findByPk(requete.params.id); // Récupère un combat par ID

        if (!combatTrouve)
            return reponse.status(404).json("Ce combat n'existe pas !");

        await combatTrouve.destroy(); // Supprime le combat

        reponse.status(200).json({
            message: "Le combat a bien été supprimé !",
            combatTrouve,
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json( { error: "Erreur interne lors de la suppression du combat !" });
    }
}

export {
    ajouterCombat,
    recupererCombats,
    modifierCombat,
    supprimerCombat
}