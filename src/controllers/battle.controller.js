import { Battle } from "../models/index.js"; // Modèle Battle initialisé
import { Participation } from "../models/index.js"; // Modèle Participation initialisé
import { Character } from "../models/index.js"; // Modèle Character initialisé
import { io } from "../services/socket.js"; // Service SocketIO
import { uniqueValueArray } from "../utils/utils.js";
import { reformatValueTeam } from "../utils/utils.js";

// ====================
// === RETRIEVE ALL ===
// ====================

const getAllBattles = async (request, response) => {
  try {
    const allBattles = await Battle.findAll({ include: { all: true } });
    response.status(200).json(allBattles);
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération des combats !" });
  }
};


// ====================
// === RETRIEVE ONE ===
// ====================

const getOneBattle = async (request, response) => {
    try {
      const battleFound = await Battle.findByPk(request.params.id, { include: [
        {model: Participation, include: [Character]},
        {model: Character, as: 'CurrentTurn', include: [ {model: Participation, where: { battle_id: request.params.id } } ]}
      ]});
      if (!battleFound)
            return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
        response.status(200).json(battleFound); // => REPONSE Battle
    }
    catch (error) {
        console.log(error);
        response.status(500).json({ error: "Erreur interne lors de la récupération d'un combat !" });
    }
}


// ==================
// === CREATE ONE ===
// ==================

const addBattle = async (request, response) => {
  try {
    const newBattle = await Battle.create(request.body); // Crée Battle

    if (request.body.teamA) request.body.teamA = reformatValueTeam(request.body.teamA, 1); // Formatage requête teamA
    if (request.body.teamB) request.body.teamB = reformatValueTeam(request.body.teamB, 2); // Formatage requête teamB
    const uniqueArray = uniqueValueArray( [...(request.body.teamA || []), ...(request.body.teamB || [])] ); // Fusion Unique Array

    uniqueArray.forEach(async (item) => await newBattle.createParticipation({ character_id: item.valueID, team: item.team })); // Crée Participation
    io.emit('newBattle'); // => IO Event
    response.status(201).json({ message: "Le combat et les participations ont bien été ajouté !", newBattle} ); // => REPONSE Battle
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la création du combat !" });
  }
};


// ==================
// === UPDATE ONE ===
// ==================

const editBattle = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id, { include: [Participation] });
    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404

    await battleFound.update(request.body); // Edite Battle

    if (request.body.teamA) request.body.teamA = reformatValueTeam(request.body.teamA, 1); // Formatage requête teamA
    if (request.body.teamB) request.body.teamB = reformatValueTeam(request.body.teamB, 2); // Formatage requête teamB
    const uniqueArray = uniqueValueArray( [...(request.body.teamA || []), ...(request.body.teamB || [])] ); // Fusion Unique Array

    if (uniqueArray) {
      for (let i = 0; i < battleFound.Participations.length; i++) {
        let isFound = false;
        for (let j = 0; j < uniqueArray.length; j++) {
          if (battleFound.Participations[i].dataValues.character_id === uniqueArray[j].valueID) {
            isFound = true;
            await battleFound.Participations[i].update({ team: uniqueArray[j].team }); // Edite Participation
            break;
          }
        }
        if (isFound === false) await battleFound.Participations[i].destroy(); // Supprime Participation
      }

      for (let j = 0; j < uniqueArray.length; j++) {
        let isFound = false;
        for (let i = 0; i < battleFound.Participations.length; i++) {
          if (uniqueArray[j].valueID === battleFound.Participations[i].dataValues.character_id) {
            isFound = true;
            break;
          }
        }
        if (isFound === false) await battleFound.createParticipation({ character_id: uniqueArray[j].valueID, team: uniqueArray[j].team }); // Crée Participation
      }
    }
 
    io.emit('editedBattle'); // => IO Event
    response.status(200).json({ message: "Le combat a bien été modifié !", battleFound }); // => REPONSE Battle
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la modification du combat !" });
  }
};


// ==================
// === DELETE ONE ===
// ==================

const deleteBattle = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id, { include: [Participation] });
    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    await battleFound.destroy(); // Supprime Battle et ses Participations
    io.emit('deletedBattle'); // => IO Event
    response.status(200).json({ message: "Le combat a bien été supprimé !", battleFound }); // => REPONSE Battle
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la suppression du combat !" });
  }
};


// =============
// === START ===
// =============

const startBattle = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id, { include: [
      { model: Participation, include: [Character] },
      { model: Character, as: 'CurrentTurn', include: [ {model: Participation, where: { battle_id: request.params.id } } ]}]});

    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    
    await battleFound.update({ status: 'started' }); // Edite status

    if (battleFound.dataValues.current_round > 0) {
      io.emit('resumedBattle'); // => IO Event
      response.status(200).json({ message: "Le combat a repris !" });
      return;
    }

    battleFound.Participations.forEach(async (participation) =>
      await participation.update({ initiative: Math.floor(100 * Math.random()) })); // Edite Initiative

    const turnOrder = battleFound.Participations.sort((a,b) => b.dataValues.initiative - a.dataValues.initiative); // Tri Initiative

    await battleFound.update({ current_round: 1 }); // Edite Round Courant
    await battleFound.setCurrentTurn(turnOrder[0].Character); // Edite Tour Courant

    io.emit('initiativeRolled', turnOrder[0].Character.firstname); // => IO Event
    response.status(200).json({ message: "Le combat a bien été démarré !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors du démarrage du combat !" });
  }
}


// ====================
// === REINITIALIZE ===
// ====================

const restartBattle = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id, { include: [Participation] });
    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404

    await battleFound.update({ status: 'waiting', current_round: 0 }); // Edite Statut et Round Courant
    await battleFound.setCurrentTurn(null); // Réinitialise Tour Courant

    battleFound.Participations.forEach(async (participation) =>
      await participation.update({ initiative: 0, stance: 'attack', is_played: false, current_tn: 10 })); // Réunitialise Iniative Posture is_played
    
    io.emit('restartedBattle'); // => IO Event
    response.status(200).json({ message: "Le combat a bien été réinitialisé !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la réinitialisation du combat !" });
  }
}


// ============
// === STOP ===
// ============

const stopBattle = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id);
    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404

    battleFound.update({ status: 'paused' }); // Edite Statut

    io.emit('pausedBattle'); // => IO Event
    response.status(200).json({ message: "Le combat a bien été mis en pause !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de l'arrêt du combat !" });
  }
}


// ==================
// === JOUER TOUR ===
// ==================

const playTurn = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(
      request.params.id, { include: [
        {model: Character, as: 'CurrentTurn', include: [
          {model: Participation, where: { battle_id: request.params.id } }]}]});

    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
    if (!battleFound.CurrentTurn) return response.status(500).json({ error: "Il n'y a pas de tour en jeu !" }); // => 500

    // Vérification si le Tour Courant correspond ou bien si c'est me MJ
    const currentCharacter = battleFound.CurrentTurn;
    if (request.user.dataValues.id != currentCharacter.dataValues.user_id && request.user.dataValues.role != 'gamemaster')
      return response.status(403).json({ error: "Désolé ! Mais ce n'est pas encore à votre tour de jouer ou bien vous n'êtes pas mj !" }); // => 403

    // Changement de posture
    let stance_tn;
    switch (request.body.stance) {
      case 'attack':
      case 'concentration':
        stance_tn = 10;
        break;
      case 'defense':
        stance_tn = 15;
        break;
      case 'dodge':
        stance_tn = 25;
        break;
      case 'assault':
        stance_tn = 0;
        break;
    }
    await currentCharacter.Participations[0].update({ stance: request.body.stance, current_tn: stance_tn }); // Edite Participation Courante Posture
    io.emit('stanceChanged', currentCharacter.dataValues.firstname, request.body.stance); // => Signal IO Changement de stance

    await currentCharacter.Participations[0].update({ is_played: true });
    const battleParticipations = await battleFound.getParticipations({ include: [Character] });

    // Gestion Attaque 1
    if (request.body.targetAttack1) {
      const targetParticipation = battleParticipations.find((item) => item.dataValues.character_id == request.body.targetAttack1);
      const damage = Math.floor(33 * Math.random());
      targetParticipation.Character.update({ health: targetParticipation.Character.dataValues.health - damage });
      io.emit('damageRolled', currentCharacter.dataValues.firstname, damage, targetParticipation.Character.dataValues.firstname);
    }
    
    // Gestion Attaque 2
    if (request.body.targetAttack2) {
      const targetParticipation2 = battleParticipations.find((item) => item.dataValues.character_id == request.body.targetAttack2);
      const damage2 = Math.floor(33 * Math.random());
      targetParticipation2.Character.update({ health: targetParticipation2.Character.dataValues.health - damage2 });
      io.emit('damageRolled',  currentCharacter.dataValues.firstname, damage2, targetParticipation2.Character.dataValues.firstname);
    }

    // Calcul Tours Restants
    let remainingTurns = battleParticipations.filter(
      (participation) => participation.dataValues.is_played === false).sort((a,b) =>  b.dataValues.initiative - a.dataValues.initiative);

    // Fin du Round, Début d'un Nouveau Round
    if (remainingTurns.length === 0) { // Tout le monde a joué
      io.emit('newRound', battleFound.current_round + 1);
      await battleFound.update({ current_round: battleFound.dataValues.current_round + 1 }); // current_round +1
      battleParticipations.forEach(async (participation) =>
        await participation.update({ is_played: false })); // Réinitialisation
      remainingTurns = battleParticipations.sort ((a, b) => b.dataValues.initiative - a.dataValues.initiative);
    }
    
    // NOUVEAU TOUR DE JEU
    await battleFound.setCurrentTurn(remainingTurns[0].Character); // Edite Tour Courant
    io.emit('nextTurn', remainingTurns[0].Character.firstname); // => IO Event
    response.status(200).json({ message: "Le tour a bien été joué !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors du tour de jeu !" });
  }
}

export {
    getAllBattles,
    getOneBattle,
    addBattle,
    editBattle,
    deleteBattle,
    startBattle,
    restartBattle,
    stopBattle,
    playTurn,
};
