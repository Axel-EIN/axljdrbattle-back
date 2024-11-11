import { Combat } from "../models/index.js"; // Importation de l'Objet Combat initialisé et connecté à la base de données Sequelize
import { Participation } from "../models/index.js"; // Importation de l'Objet Participation initialisé et connecté à la base de données Sequelize
import { Personnage } from "../models/index.js"; // Importation de l'Objet Participation initialisé et connecté à la base de données Sequelize
import { io } from "../services/socket.js"; // Importation de la lib IO depuis le service socket

// ====================
// === RETRIEVE ALL ===
// ====================

const recupererCombats = async (requete, reponse) => {
  try {
    const toutCombats = await Combat.findAll({ include: { all: true } });
    reponse.status(200).json(toutCombats); // => REPONSE [combats]
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la récupération des combats !" } );
  }
};


// ====================
// === RETRIEVE ONE ===
// ====================

const recupererUnCombat = async (requete, reponse) => {
    try {
        const combatTrouve = await Combat.findByPk( requete.params.id, { include: { all: true } } );
        if (!combatTrouve)
            return reponse.status(404).json( { error: "Ce combat n'existe pas !" } ); // => 404
        reponse.status(200).json(combatTrouve); // => REPONSE combat
    }
    catch (erreur) {
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

    io.emit('newBattle', nouveauCombat.toJSON()); // Emission d'un signal websocket newBattle avec l'objet crée
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
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation]}); // Récupère un combat par son ID
    if (!combatTrouve)
        return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

    if ( ['waiting', 'started', 'finished'].includes(requete.body.statut) == false )
      delete requete.body.statut;

    await combatTrouve.update(requete.body);

    // Update Participations
    const editerSupprimerAjouterParticipation = async (requeteTeam, teamNumber) => {

      // edit or delete
      for (const participationExistante of combatTrouve.dataValues.Participations) {
        let trouvee = false;
        for (const participationModifiee of requeteTeam) {
          if (participationExistante.PersonnageId == participationModifiee.value) {
            trouvee = true;
            await participationExistante.update({ PersonnageId: participationModifiee.value, team: teamNumber });
            break;
          }
        }
        if (trouvee == false)
          await participationExistante.destroy();
      }

      // Add if not found
      for (const participationModifiee of requeteTeam) {
        let trouvee = false;
        for (const participationExistante of combatTrouve.dataValues.Participations) {
          if (participationModifiee.value == participationExistante) {
            trouvee = true;
            break;
          }
        }
        if (trouvee == false) {
          await combatTrouve.createParticipation({ PersonnageId: participationModifiee.value, team: teamNumber } );
        }
      }
    }

    if (requete.body.teamA)
      editerSupprimerAjouterParticipation(requete.body.teamA, 1);

    if (requete.body.teamB)
      editerSupprimerAjouterParticipation(requete.body.teamB, 2);
 
    io.emit('editedBattle', combatTrouve.toJSON()); // signal websocket événement editedBattle avec objet edité
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
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation]}); // Récupère un combat par son ID
    if (!combatTrouve)
      return reponse.status(404).json( { error: "Ce combat n'existe pas !" } );

    // Delete Participations
    combatTrouve.dataValues.Participations.forEach( async (uneParticipation) => await uneParticipation.destroy() );

    const combatSupprime = {...combatTrouve.dataValues};
    await combatTrouve.destroy();
    io.emit('deletedBattle', combatSupprime); // signal websocket deletedBattle avec l'objet effacé
    reponse.status(200).json( { message: "Le combat a bien été supprimé !", combatSupprime } );
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
