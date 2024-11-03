import { Combat } from "../models/index.js"; // Importation de l'Objet Combat initialisé et connecté à la base de données Sequelize
import { Participation } from "../models/index.js"; // Importation de l'Objet Participation initialisé et connecté à la base de données Sequelize
import { Personnage } from "../models/index.js"; // Importation de l'Objet Participation initialisé et connecté à la base de données Sequelize

// ====================
// === RETRIEVE ALL ===
// ====================

const recupererCombats = async (requete, reponse, next) => {
  try {
    const toutCombats = await Combat.findAll({ include: [Personnage] });
    reponse.status(200).json(toutCombats);
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la récupération des combats !" } );
  }
};


// ====================
// === RETRIEVE ONE ===
// ====================

const recupererUnCombat = async (requete, reponse, next) => {
    try {
        const combatTrouve = await Combat.findByPk( requete.params.id, { include: [Personnage, Participation]} );

        if (!combatTrouve)
            return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

        reponse.status(200).json(combatTrouve);
    } catch (erreur) {
        console.log(erreur);
        reponse.status(500).json( { error: "Erreur interne lors de la récupération d'un combat !" } );
    }
}


// ==================
// === CREATE ONE ===
// ==================

const ajouterCombat = async (requete, reponse, next) => {
  try {
    if ( ['waiting', 'started', 'finished'].includes(requete.body.statut) == false )
      requete.body.statut = 'waiting';
    const nouveauCombat = await Combat.create(requete.body);

    // Add Participations
    const ajouterParticipation = (requeteTeam, teamNumber) => {
      requeteTeam.forEach( async (uneParticipation) => {
          if (uneParticipation.value != '' && uneParticipation.value > 0)
            await nouveauCombat.createParticipation( { PersonnageId: uneParticipation.value, team: teamNumber } );
      });
    }

    if (requete.body.teamA)
      ajouterParticipation(requete.body.teamA, 1);

    if (requete.body.teamB)
      ajouterParticipation(requete.body.teamB, 2);

    reponse.status(201).json( { message: "Le combat et les participations ont bien été ajouté !" } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la création du combat !" } );
  }
};


// ==================
// === UPDATE ONE ===
// ==================

const modifierCombat = async (requete, reponse, next) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id); // Récupère un combat par son ID
    if (!combatTrouve)
        return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );
    if ( ['waiting', 'started', 'finished'].includes(requete.body.statut) == false )
      delete requete.body.statut;
    await combatTrouve.update(requete.body);
    reponse.status(200).json( { message: "Le combat a bien été modifié !", combatTrouve } );
  } catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la modification du combat !" } );
  }
};


// ==================
// === DELETE ONE ===
// ==================

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
