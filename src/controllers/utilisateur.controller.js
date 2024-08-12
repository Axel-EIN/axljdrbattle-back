import { Utilisateur } from "../models/index.js"; // Modèle Utilisateur initialisé et connecté à la base données Sequelize
import bcrypt from "bcrypt"; // Bibliothèque bcrypt pour crypter le mot de passe
import jwt from "jsonwebtoken"; // Bibliothèque jwt pour créer le cookie/token
import { ENV } from "./../../config.js";
import userFieldCheck from "../utils/userfieldcheck.js";
import { removeFile } from "../utils/managefiles.js";

const recupererUtilisateurs = async (requete, reponse, next) => {
  try {
    const toutLesUtilisateurs = await Utilisateur.findAll();
    reponse.status(200).json(toutLesUtilisateurs);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la récupération des utilisateurs !"} );
  }
};

const recupererUnUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id);
    if (!utilisateurTrouve)
      return reponse.status(404).json({error: "Cette utilisateur n'existe pas !"});

    reponse.status(200).json(utilisateurTrouve);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la récupération d'un utilisateur !"} );
  }
};

const modifierUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id);

    if (!utilisateurTrouve)
      return reponse.status(404).json({error: "Cette utilisateur n'existe pas !"});

    const requeteBodyNettoye = userFieldCheck(requete.body); // utilitaire pour enlever les prop. vide ou null et met un avatar par défaut

    if (requeteBodyNettoye.mdp) // Si un changement de mdp est disponible
      requeteBodyNettoye.mdp = await bcrypt.hash(requeteBodyNettoye.mdp, 10); // On hache le mdp

    const ancienAvatar = utilisateurTrouve.avatar; // On stock une copie de l'ancien avatar
    if (requete.files && requete.files[0])
      requeteBodyNettoye.avatar = 'images/' + requete.files[0].fieldname + 's/' + requete.files[0].filename;

    await utilisateurTrouve.update(requeteBodyNettoye);

    if (ancienAvatar)
      removeFile(ancienAvatar); // On efface le fichier de l'ancien avatar

    reponse.status(200).json( {message: "L'utilisateur a bien été modifié !", utilisateurTrouve, });
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la modification de l'utilisateur !"} );
  }
};

const supprimerUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findByPk(requete.params.id);

    if (!utilisateurTrouve)
      return reponse.status(404).json({error: "Cette utilisateur n'existe pas !"});

    if (utilisateurTrouve.id == requete.user.id)
      return reponse.status(403).json( {error: "Vous ne pouvez vous supprimez !" });
    
    const ancienAvatar = utilisateurTrouve.avatar; // On stock une copie de l'ancien avatar
    await utilisateurTrouve.destroy();

    if (ancienAvatar)
      removeFile(ancienAvatar);

    reponse.status(200).json("L'utilisateur a bien été supprimé !");
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( {error: "Erreur interne lors de la suppression de l'utilisateur !"} );
  }
};

const connecterUtilisateur = async (requete, reponse, next) => {
  try {
    const utilisateurTrouve = await Utilisateur.findOne( {where: { identifiant: requete.body.identifiant }} ); // Recherche de l'utilisateur via son identifiant
    if (!utilisateurTrouve)
      return reponse.status(404).json({error: "Cette utilisateur n'existe pas !"});

    const comparaisonDuMDP = await bcrypt.compare( requete.body.mdp, utilisateurTrouve.mdp );
    if (!comparaisonDuMDP)
      return reponse.status(400).json({error: "Les identifiants sont inccorects !"});

    const token = jwt.sign( { id: utilisateurTrouve.id }, ENV.TOKEN, { expiresIn: "24h" } ); // Création du web token jwt
    reponse
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true, // true in production only
        sameSite: 'None', // can be 'strict' or 'lax or None'
      }) // renvoi du cookier access token jwt
      .status(200).json(utilisateurTrouve); // renvoi de l'utilisateur en objet
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la connection !" });
  }
};

const deconnecterUtilisateur = async (requete, reponse, next) => {
  try {
    if (!requete.user) // requete.user est censé exister si l'utilisateur est connecté
      return reponse.status(403).json({error: "Vous devez être connecté pour pouvoir vous deconnecter !"});

    reponse.clearCookie("access_token", { httpOnly: true }) // on détruit le cookie
      .status(200).json("L'utilisateur a bien été déconnecté !");
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la déconnection !" });
  }
};

const recupererUtilisateurCourant = (requete, reponse) => {
  return reponse.json(requete.user); // requete.user est censé exister si l'utilisateur s'est déjà connecté
};

export {
  inscrireUtilisateur,
  creerUtilisateur,
  recupererUtilisateurs,
  recupererUnUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  connecterUtilisateur,
  deconnecterUtilisateur,
  recupererUtilisateurCourant,
};
