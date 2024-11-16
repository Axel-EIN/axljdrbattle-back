import { Personnage } from "../models/index.js"; // Importation de l'Objet Personnage initialisé et connecté à la base de données Sequelize
import { Utilisateur } from "../models/index.js"; // Importation de l'Objet Utilisateur initialisé et connecté à la base de données Sequelize
import { removeFile } from "../utils/managefiles.js"; // Importation de la fonction utilisate pour effacer des fichiers images

const recupererPersonnages = async (requete, reponse, next) => {
  try {
    const toutPersonnages = await Personnage.findAll({ include: Utilisateur });
    reponse.status(200).json(toutPersonnages);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la récupération des personnages !" } );
  }
};

const recupererUnPersonnage = async (requete, reponse, next) => {
  try {
    const personnageTrouve = await Personnage.findByPk( requete.params.id, { include: Utilisateur } );
    if (!personnageTrouve)
      return reponse.status(404).json({ error: "Ce personnage n'existe pas !" });

    reponse.status(200).json(personnageTrouve);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la récupération d'un personnage !" } );
  }
};

const ajouterPersonnage = async (requete, reponse, next) => {
  try {
    if (requete.files && requete.files.length > 0) // Si des fichiers images sont présents par multer
      requete.files.forEach( (file) => requete.body[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename ); // Pour chaque élément prépare la requete

    const utilisateurTrouve = await Utilisateur.findByPk( requete.body.utilisateur_id );

    if (utilisateurTrouve)
      await utilisateurTrouve.createPersonnage(requete.body);
    else
      await Personnage.create(requete.body);

    reponse.status(201).json( { message: "Le personnage a bien été ajouté !" } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la création du personnage !" } );
  }
};

const modifierPersonnage = async (requete, reponse, next) => {
  try {
    const personnageTrouve = await Personnage.findByPk(requete.params.id); // Récupère un personnage par son ID

    if (!personnageTrouve)
        return reponse.status(404).json( { error: "Ce personnage n'existe pas !" } );

    if (requete.files && requete.files.length > 0) // Si des fichiers images sont présents par multer
        requete.files.forEach( (file) => requete.body[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename ); // Pour chaque élément prépare la requete

    let ancienPortrait;
    if (requete.body.portrait && personnageTrouve.portrait)
      ancienPortrait = personnageTrouve.portrait;

    let ancienneIllustration;
    if (requete.body.illustration && personnageTrouve.illustration)
      ancienneIllustration = personnageTrouve.illustration;

    await personnageTrouve.update(requete.body);

    if (ancienPortrait)
      removeFile(ancienPortrait);

    if (ancienneIllustration)
      removeFile(ancienneIllustration);

    reponse.status(200).json( { message: "Le personnage a bien été modifié !", personnageTrouve } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la modification du personnage !" } );
  }
};

const supprimerPersonnage = async (requete, reponse, next) => {
  try {
    const personnageTrouve = await Personnage.findByPk(requete.params.id); // Récupère un personnage par ID

    if (!personnageTrouve)
        return reponse.status(404).json( { error: "Ce personnage n'existe pas !" } );

    await personnageTrouve.destroy();

    if (personnageTrouve.portrait && personnageTrouve.portrait != "")
      removeFile(personnageTrouve.portrait);
    if (personnageTrouve.illustration && personnageTrouve.illustration != "")
      removeFile(personnageTrouve.illustration);

    reponse.status(200).json( { message: "Le personnage a bien été supprimé !", personnageTrouve } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la suppression du personnage !" } );
  }
};

export {
    recupererPersonnages,
    recupererUnPersonnage,
    ajouterPersonnage,
    modifierPersonnage,
    supprimerPersonnage,
};
