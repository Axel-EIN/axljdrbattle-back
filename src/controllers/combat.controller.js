import { Combat } from "../models/index.js"; // Modèle Combat initialisé
import { Participation } from "../models/index.js"; // Modèle Participation initialisé
import { Personnage } from "../models/index.js"; // Modèle Personnage initialisé
import { io } from "../services/socket.js"; // Service SocketIO
import { tableauValeurUnique } from "../utils/utils.js";
import { reformatterValeursEquipe } from "../utils/utils.js";

// ====================
// === RETRIEVE ALL ===
// ====================

const recupererCombats = async (requete, reponse) => {
  try {
    const toutCombats = await Combat.findAll({ include: { all: true } });
    reponse.status(200).json(toutCombats); // => REPONSE [Combats]
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la récupération des combats !" });
  }
};


// ====================
// === RETRIEVE ONE ===
// ====================

const recupererUnCombat = async (requete, reponse) => {
    try {
      const combatTrouve = await Combat.findByPk(requete.params.id, { include: [
        {model: Participation, include: [Personnage]},
        {model: Participation, as: 'TourCourant', include: [Personnage]}
      ]});
        if (!combatTrouve)
            return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
        reponse.status(200).json(combatTrouve); // => REPONSE Combat
    }
    catch (erreur) {
        console.log(erreur);
        reponse.status(500).json({ error: "Erreur interne lors de la récupération d'un combat !" });
    }
}


// ==================
// === CREATE ONE ===
// ==================

const ajouterCombat = async (requete, reponse) => {
  try {
    const nouveauCombat = await Combat.create(requete.body); // Crée Combat

    if (requete.body.teamA) requete.body.teamA = reformatterValeursEquipe(requete.body.teamA, 1); // Formatage requête teamA
    if (requete.body.teamB) requete.body.teamB = reformatterValeursEquipe(requete.body.teamB, 2); // Formatage requête teamB
    const tableauUnique = tableauValeurUnique( [...(requete.body.teamA || []), ...(requete.body.teamB || [])] ); // Fusion Unique Array

    tableauUnique.forEach(async (item) => await nouveauCombat.createParticipation({ PersonnageId: item.valueID, team: item.team })); // Crée Participation
    io.emit('newBattle'); // => IO Event
    reponse.status(201).json({ message: "Le combat et les participations ont bien été ajouté !", nouveauCombat} ); // => REPONSE Combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la création du combat !" });
  }
};


// ==================
// === UPDATE ONE ===
// ==================

const modifierCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation] });
    if (!combatTrouve) return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    await combatTrouve.update(requete.body); // Edite Combat

    if (requete.body.teamA) requete.body.teamA = reformatterValeursEquipe(requete.body.teamA, 1); // Formatage requête teamA
    if (requete.body.teamB) requete.body.teamB = reformatterValeursEquipe(requete.body.teamB, 2); // Formatage requête teamB
    const tableauUnique = tableauValeurUnique( [...(requete.body.teamA || []), ...(requete.body.teamB || [])] ); // Fusion Unique Array

    if (tableauUnique) {
      for (let i = 0; i < combatTrouve.Participations.length; i++) {
        let trouvee = false;
        for (let j = 0; j < tableauUnique.length; j++) {
          if (combatTrouve.Participations[i].dataValues.PersonnageId === tableauUnique[j].valueID) {
            trouvee = true;
            await combatTrouve.Participations[i].update({ team: tableauUnique[j].team }); // Edite Participation
            break;
          }
        }
        if (trouvee === false) await combatTrouve.Participations[i].destroy(); // Supprime Participation
      }

      for (let j = 0; j < tableauUnique.length; j++) {
        let trouvee = false;
        for (let i = 0; i < combatTrouve.Participations.length; i++) {
          if (tableauUnique[j].valueID === combatTrouve.Participations[i].dataValues.PersonnageId) {
            trouvee = true;
            break;
          }
        }
        if (trouvee === false) await combatTrouve.createParticipation({ PersonnageId: tableauUnique[j].valueID, team: tableauUnique[j].team }); // Crée Participation
        }
      }
 
    io.emit('editedBattle'); // => IO Event
    reponse.status(200).json({ message: "Le combat a bien été modifié !", combatTrouve }); // => REPONSE Combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la modification du combat !" });
  }
};


// ==================
// === DELETE ONE ===
// ==================

const supprimerCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation] });
    if (!combatTrouve) return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    await combatTrouve.destroy(); // Supprime Combat et ses Participations
    io.emit('deletedBattle'); // => IO Event
    reponse.status(200).json({ message: "Le combat a bien été supprimé !", combatTrouve }); // => REPONSE Combat
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la suppression du combat !" });
  }
};


// =============
// === START ===
// =============

const demarrerCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [
      { model: Participation, include: [Personnage] },
      { model: Participation, as: 'TourCourant'}]});
    if (!combatTrouve) return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    await combatTrouve.update({ statut: 'started' }); // Edite statut

    if (combatTrouve.dataValues.roundCourant === 0) {
      combatTrouve.Participations.forEach(
        async (participation) => await participation.update({ initiative: Math.floor(100 * Math.random()) })); // Edite Initiative
      const ordreTours = combatTrouve.Participations.sort((a,b) => b.dataValues.initiative - a.dataValues.initiative); // Tri Initiative
      await combatTrouve.update({ roundCourant: 1 }); // Edite Round Courant
      await combatTrouve.setTourCourant(ordreTours[0]); // Edite Tour Courant
      io.emit('initiativeRolled', ordreTours[0].Personnage.prenom); // => IO Event
      reponse.status(200).json({ message: "Le combat a bien été démarré !" });
    } else {
      io.emit('resumedBattle'); // => IO Event
      reponse.status(200).json({ message: "Le combat a repris !" });
    }
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors du démarrage du combat !" });
  }
}


// ====================
// === REINITIALIZE ===
// ====================

const recommencerCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id, { include: [Participation] });
    if (!combatTrouve) return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404

    await combatTrouve.update({ statut: 'waiting', roundCourant: 0 }); // Edite Statut et Round Courant
    await combatTrouve.setTourCourant(null); // Réinitialise Tour Courant
    combatTrouve.Participations.forEach(
      async (participation) => await participation.update({ initiative: 0, posture: 'attaque', isPlayed: false })); // Réunitialise Iniative Posture isPlayed

    io.emit('restartedBattle'); // => IO Event
    reponse.status(200).json({ message: "Le combat a bien été réinitialisé !" });
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de la réinitialisation du combat !" });
  }
}


// ============
// === STOP ===
// ============

const arreterCombat = async (requete, reponse) => {
  try {
    const combatTrouve = await Combat.findByPk(requete.params.id);
    if (!combatTrouve) return reponse.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    combatTrouve.update({ statut: 'paused' }); // Edite Statut
    io.emit('pausedBattle'); // => IO Event
    reponse.status(200).json({ message: "Le combat a bien été mis en pause !" });
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json({ error: "Erreur interne lors de l'arrêt du combat !" });
  }
}
  }
  catch (erreur) {
    console.log(erreur);
    reponse.status(500).json( { error: "Erreur interne lors de l'arrêt du combat !" } );
  }
}

export {
    recupererCombats,
    recupererUnCombat,
    ajouterCombat,
    modifierCombat,
    supprimerCombat,
    demarrerCombat,
    recommencerCombat,
    arreterCombat,
};
