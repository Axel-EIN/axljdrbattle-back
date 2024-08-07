// Importation de l'Objet Utilisateur initialisé avec la base de données Sequelize
import { Utilisateur } from "../models/index.js";

// Importation de la bibliothèque bcrypt pour crypter le mot de passe
import bcrypt from "bcrypt";

// Fonction pour inscrire l'utilisateur
const inscrireUtilisateur = async (requete, reponse, next) => {
    try {
        const motDePasseHache = await bcrypt.hash(requete.body.mdp, 10); // Hachage du mot de passe

        await Utilisateur.create({ ...requete.body, mdp: motDePasseHache, role: 'user' }); // Création d'un nouvelle utilisateur via sequelize

        reponse.status(201).json("L'Utilisateur a bien été inscrit !");
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la création de l'utilisateur !" });
    }
}

// Fonction pour récupérer tout les utilisateurs
const recupererUtilisateurs = async (requete, reponse, next) => {
    try {
        const toutLesUtilisateurs = await Utilisateur.findAll(); // Récupère tous les utilisateurs

        if (toutLesUtilisateurs.length == 0)
            return reponse.status(200).json("Il n'y a pas encore d'utilisateur !");

        reponse.status(200).json(toutLesUtilisateurs);
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la récupération des utilisateurs !" });
    }
}

// Fonction pour modifier un utilisateur
const modifierUtilisateur = async (requete, reponse, next) => {
    try {
        console.log('test');
        const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id); // Récupère un utilisateur par ID

        if (!utilisateurTrouve)
            return reponse.status(404).json("Cette utilisateur n'existe pas !");

        await utilisateurTrouve.update(requete.body); // Modifie l'utilisateur
        
        reponse.status(200).json({
            message: "L'utilisateur a bien été modifié !",
            utilisateurTrouve,
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la modification de l'utilisateur !" });
    }
}

// Fonction pour supprimer un utilisateur
const supprimerUtilisateur = async (requete, reponse, next) => {
    try {
        const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id); // Récupère un utilisateur par ID

        if (!utilisateurTrouve)
            return utilisateurTrouve.status(404).json("Cette utilisateur n'existe pas !");

        await utilisateurTrouve.destroy();
        
        reponse.status(200).json({
            message: "L'utilisateur a bien été supprimé !"
        });
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la suppression de l'utilisateur !" });
    }
}

export {
    inscrireUtilisateur,
    recupererUtilisateurs,
    modifierUtilisateur,
    supprimerUtilisateur
}