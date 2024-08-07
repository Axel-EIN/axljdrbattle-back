// Importation de l'Objet Utilisateur initialisé et connecté à la base de données Sequelize
import { Personnage } from "../models/index.js";
import { Utilisateur } from "../models/index.js";

// Fonction pour ajouter un personnage
const ajouterPersonnage = async (requete, reponse, next) => {
    try {
        const utilisateurTrouve = await Utilisateur.findByPk(requete.body.utilisateurID);

        if (utilisateurTrouve) {
            await utilisateurTrouve.createPersonnage( requete.body );
        }
        else {
            await Personnage.create( requete.body );
        }

        reponse.status(201).json("Le personnage a bien été ajouté !");
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la création du personnage !" });
    }
}

// Fonction pour récupérer tout les personnages
const recupererPersonnages = async (requete, reponse, next) => {
    try {
        const toutPersonnages = await Personnage.findAll();

        if (toutPersonnages.length == 0)
            return reponse.status(200).json("Il n'y a pas encore de personnages !");

        reponse.status(200).json(toutPersonnages);
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la récupération des personnages !" });
    }
}

// Fonction pour modifier un utilisateur
const modifierPersonnage = async (requete, reponse, next) => {
    try {
        const personnageTrouve = await Personnage.findByPk(requete.params.id); // Récupère un personnage par ID

        if (!personnageTrouve)
            return reponse.status(404).json("Ce personnage n'existe pas !");

        await personnageTrouve.update(requete.body); // Modifie le personnage
        
        reponse.status(200).json({
            message: "Le personnage a bien été modifié !",
            personnageTrouve,
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la modification du personnage !" });
    }
}

// Fonction pour supprimer un utilisateur
const supprimerPersonnage = async (requete, reponse, next) => {
    try {
        const personnageTrouve = await Personnage.findByPk(requete.params.id); // Récupère un personnage par ID

        if (!personnageTrouve)
            return reponse.status(404).json("Ce personnage n'existe pas !");

        await personnageTrouve.destroy(); // Supprime le personnage

        reponse.status(200).json({
            message: "Le personnage a bien été supprimé !",
            personnageTrouve,
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json( { error: "Erreur interne lors de la suppression du personnage !" });
    }
}

export {
    ajouterPersonnage,
    recupererPersonnages,
    modifierPersonnage,
    supprimerPersonnage
}