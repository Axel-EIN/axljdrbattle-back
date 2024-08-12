import { Combat } from "../models/index.js"; // Importation de l'Objet Combat initialisé et connecté à la base de données Sequelize

const recupererCombats = async (requete, reponse, next) => {
  try {
    const toutCombats = await Combat.findAll();
    reponse.status(200).json(toutCombats);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la récupération des combats !" } );
  }
};

const recupererUnCombat = async (requete, reponse, next) => {
    try {
        const combatTrouve = await Combat.findByPk( requete.params.id );
        if (!combatTrouve)
            return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

        reponse.status(200).json(combatTrouve);
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json( { error: "Erreur interne lors de la récupération d'un combat !" } );
    }
}

const ajouterCombat = async (requete, reponse, next) => {
  try {
    await Combat.create(requete.body);
    reponse.status(201).json( { message: "Le combat a bien été ajouté !" } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la création du combat !" } );
  }
};

const modifierCombat = async (requete, reponse, next) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id); // Récupère un combat par son ID

    if (!combatTrouve)
        return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

    await combatTrouve.update(requete.body);
    reponse.status(200).json( { message: "Le combat a bien été modifié !", combatTrouve } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la modification du combat !" } );
  }
};

const supprimerCombat = async (requete, reponse, next) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id); // Récupère un combat par son ID

    if (!combatTrouve)
      return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

    await combatTrouve.destroy();
    reponse.status(200).json( { message: "Le combat a bien été supprimé !", combatTrouve } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la suppression du combat !" } );
  }
};

export {
    recupererCombats,
    recupererUnCombat,
    ajouterCombat,
    modifierCombat,
    supprimerCombat
};
