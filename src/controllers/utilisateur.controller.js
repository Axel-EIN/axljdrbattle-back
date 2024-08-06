import { Utilisateur } from "../models/index.js"; // Importation du Modèle Utilisateur initialisé connecté à la base données Sequelize
import bcrypt from "bcrypt"; // Importation de la bibliothèque bcrypt pour crypter le mot de passe
import jwt from "jsonwebtoken"; // Importation de la bibliothèque jwt pour créer le cookie/token
import { ENV } from "./../../config.js";

// Inscrire l'utilisateur
const inscrireUtilisateur = async (requete, reponse, next) => {
  try {
    const motDePasseHache = await bcrypt.hash(requete.body.mdp, 10); // Hachage du mot de passe

    await Utilisateur.create( {...requete.body, mdp: motDePasseHache, role: "user"} ); // Création nouvelle utilisateur. On force le role user

    reponse.status(201).json("L'Utilisateur a bien été inscrit !");
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de l'inscription de l'utilisateur !" });
  }
};

// Creer un utilisateur
const creerUtilisateur = async (requete, reponse, next) => {
  try {
    const motDePasseHache = await bcrypt.hash(requete.body.mdp, 10); // Hachage du mot de passe

    await Utilisateur.create({ ...requete.body, mdp: motDePasseHache });

    reponse.status(201).json("L'Utilisateur a bien été crée !");
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la création de l'utilisateur !" });
  }
};

// Récupérer tout les utilisateurs
const recupererUtilisateurs = async (requete, reponse, next) => {
  try {
    const toutLesUtilisateurs = await Utilisateur.findAll();
    reponse.status(200).json(toutLesUtilisateurs);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la récupération des utilisateurs !"} );
  }
};

// Modifier un utilisateur
const modifierUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id); // Récupère un utilisateur par ID dans les paramètres de la requete

    if (!utilisateurTrouve)
      return reponse.status(404).json("Cette utilisateur n'existe pas !");

    await utilisateurTrouve.update(requete.body); // Modifie l'utilisateur

    reponse.status(200).json( {message: "L'utilisateur a bien été modifié !", utilisateurTrouve, });
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la modification de l'utilisateur !"} );
  }
};

// Supprimer un utilisateur
const supprimerUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id);

    if (!utilisateurTrouve)
      return reponse.status(404).json("Cette utilisateur n'existe pas !");

    await utilisateurTrouve.destroy(); // Supprime l'utilisateur

    reponse.status(200).json( {message: "L'utilisateur a bien été supprimé !"} );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la suppression de l'utilisateur !"} );
  }
};

// Connecte l'utilisateur en vérifiant ses identifiants, crée un cookie jwt access_token, puis renvoie l'objet utilisateur
const connecterUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findOne( {where: { identifiant: requete.body.identifiant }} ); // Recherche de l'utilisateur via son identifiant

    if (!utilisateurTrouve)
      return reponse.status(404).json("L'utilisateur n'a pas été trouvé !");

    // Comparaison du MDP crypté avec la version tapé par l'utilisateur
    const comparaisonDuMDP = await bcrypt.compare( requete.body.mdp, utilisateurTrouve.mdp );

    if (!comparaisonDuMDP)
      return reponse.status(400).json("L'identifiant ou le mot de passe est inccorect !");

    
    const token = jwt.sign( { id: utilisateurTrouve.id }, ENV.TOKEN, { expiresIn: "24h" } ); // Création du web token jwt

    reponse
      .cookie("access_token", token, { httpOnly: true }) // renvoi du cookier access token jwt
      .status(200).json(utilisateurTrouve); // renvoi de l'utilisateur en objet
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la connection !" });
  }
};

// Déconnecte l'utilisateur en supprimant le Cookie
const deconnecterUtilisateur = async (requete, reponse, next) => {
  try {
    if (!requete.user) // requete.user est censé exister si l'utilisateur est connecté
      return reponse.status(403).json("Vous devez être connecté pour  vous deconnecter !");

    reponse.clearCookie("access_token", { httpOnly: true }) // on détruit le cookie
      .status(200).json("L'utilisateur a bien été déconnecté !");
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la déconnection !" });
  }
};

// Récupère l'utilisateur déjà authentifié via requete.user qui a été rempli par verifyToken)
const recupererUtilisateurCourant = (requete, reponse) => {
  return reponse.json(requete.user);
};

export {
  inscrireUtilisateur,
  creerUtilisateur,
  recupererUtilisateurs,
  modifierUtilisateur,
  supprimerUtilisateur,
  connecterUtilisateur,
  deconnecterUtilisateur,
  recupererUtilisateurCourant,
};
