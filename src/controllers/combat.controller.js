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

const ajouterCombat = async (requete, reponse) => {
  try {
    const nouveauCombat = await Combat.create(requete.body); // Create Combat

    const ajouterParticipation = (requeteTeam, teamNumber) => {
      requeteTeam.forEach( async (uneParticipation) => {
          if (uneParticipation.value != '' && uneParticipation.value > 0)
            await nouveauCombat.createParticipation( { PersonnageId: uneParticipation.value, team: teamNumber } ); // Create Participation
      });
    }

    if (requete.body.teamA)
      ajouterParticipation(requete.body.teamA, 1);

    if (requete.body.teamB)
      ajouterParticipation(requete.body.teamB, 2);

    io.emit('newBattle'); // => IO Event
    reponse.status(201).json( { message: "Le combat et les participations ont bien été ajouté !", nouveauCombat } ); // => REPONSE combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la création du combat !" } );
  }
};


// ==================
// === UPDATE ONE ===
// ==================

const modifierCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation]});

    if (!combatTrouve)
        return reponse.status(404).json( { error: "Ce combat n'existe pas !" } ); // => 404

    await combatTrouve.update(requete.body); // Update Combat

    const editerSupprimerAjouterParticipation = async (requeteTeam, teamNumber) => {
      for (const participationExistante of combatTrouve.dataValues.Participations) {
        let trouvee = false;
        for (const participationModifiee of requeteTeam) {
          if (participationExistante.PersonnageId == participationModifiee.value) {
            trouvee = true;
            await participationExistante.update({ PersonnageId: participationModifiee.value, team: teamNumber }); // Update Participation
            break;
          }
        }
        if (trouvee == false)
          await participationExistante.destroy(); // Destroy Participation
      }

      for (const participationModifiee of requeteTeam) {
        let trouvee = false;
        for (const participationExistante of combatTrouve.dataValues.Participations) {
          if (participationModifiee.value == participationExistante) {
            trouvee = true;
            break;
          }
        }
        if (trouvee == false) {
          await combatTrouve.createParticipation({ PersonnageId: participationModifiee.value, team: teamNumber } ); // Create Participation
        }
      }
    }

    if (requete.body.teamA)
      editerSupprimerAjouterParticipation(requete.body.teamA, 1);

    if (requete.body.teamB)
      editerSupprimerAjouterParticipation(requete.body.teamB, 2);
 
    io.emit('editedBattle'); // => IO Event
    reponse.status(200).json( { message: "Le combat a bien été modifié !", combatTrouve } ); // => REPONSE combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la modification du combat !" } );
  }
};


// ==================
// === DELETE ONE ===
// ==================

const supprimerCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation]});

    if (!combatTrouve)
      return reponse.status(404).json( { error: "Ce combat n'existe pas !" } ); // => 404

    await combatTrouve.destroy(); // Destroy Combat and its Participations
    io.emit('deletedBattle'); // => IO Event
    reponse.status(200).json( { message: "Le combat a bien été supprimé !", combatTrouve } ); // => REPONSE combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de la suppression du combat !" } );
  }
};


// =============
// === START ===
// =============

const demarrerCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [
      { model: Participation, include: [ { model: Personnage, as: 'Personnage' } ] },
      { model: Personnage, as: 'tourcourant' },
      { model: Personnage, as: 'Personnages'},
    ]});

    if (!combatTrouve)
      return reponse.status(404).json( { error: "Ce combat n'existe pas !" } ); // => 404

    await combatTrouve.update({ statut: 'started' }); // Update Combat

    if (combatTrouve.dataValues.roundCourant === 0) {
      for (let i = 0; i < combatTrouve.Participations.length; i++)
        await combatTrouve.Participations[i].update( { initiative: Math.floor(100 * Math.random()) } ); // Update Participation.Initiative

      const sortedParticipations = combatTrouve.Participations.sort( (a,b) =>  b.dataValues.initiative - a.dataValues.initiative ); // Sort

      await combatTrouve.update({ roundCourant: 1}); // Update Combat.roundCourant = 1
      await combatTrouve.setTourcourant(sortedParticipations[0].Personnage); // Update Combat.toucourant = Personnage

      const combatModifie = {...combatTrouve.toJSON(), tourcourant: sortedParticipations[0].Personnage.dataValues};
      io.emit('initiativeRolled', combatModifie); // => IO Event
      reponse.status(200).json( { message: "Le combat a bien été démarré !", combatTrouve } ); // => REPONSE combat
    } else {
      io.emit('resumedBattle'); // => IO Event
      reponse.status(200).json( { message: "Le combat est de redémarré !", combatTrouve } ); // => REPONSE combat
    }
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors du démarrage du combat !" } );
  }
}


export {
    recupererCombats,
    recupererUnCombat,
    ajouterCombat,
    modifierCombat,
    supprimerCombat,
    demarrerCombat,
};
