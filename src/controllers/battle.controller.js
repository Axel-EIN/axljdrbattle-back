import { Battle } from "../models/index.js"; // Modèle Battle initialisé
import { Participation } from "../models/index.js"; // Modèle Participation initialisé
import { Character } from "../models/index.js"; // Modèle Character initialisé
import { User } from "../models/index.js"; // Modèle User initialisé
import { io } from "../services/socket.js"; // Service SocketIO
import { uniqueValueArray } from "../utils/utils.js";
import { reformatValueTeam } from "../utils/utils.js";
import { Op } from 'sequelize';

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
        {model: Participation, include: [ {model: Character, include: [User] } ]},
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


// ===================
// === LAST ACTIVE ===
// ===================

const getLastActiveBattle = async (request, response) => {
    try {
        const battleFound = await Battle.findOne({
            where: { status: { [Op.ne]: 'finished' }, },
            order: [['createdAt', 'DESC']],
            include: [
                {model: Participation, include: [Character],},
                {model: Character, as: 'CurrentTurn',},
            ],
        });

        if (!battleFound) return response.status(404).json({ error: "Il n'y a pas de combat actif" }); // => 404
        
        response.status(200).json(battleFound); // => REPONSE Battle
    }
    catch (error) {
        console.log(error);
        response.status(500).json({ error: "Erreur interne lors de la récupération du dernier combat actif !" });
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

    await battleFound.update({ status: 'waiting', current_round: 0, winner_team: null }); // Edite Statut et Round Courant
    await battleFound.setCurrentTurn(null); // Réinitialise Tour Courant

    battleFound.Participations.forEach(async (participation) =>
      await participation.update({ initiative: 0, stance: 'attack', is_played: false, current_tn: 10, is_out: false }));
    
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

    await battleFound.update({ status: 'paused' }); // Edite Statut

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
                {model: Participation, include: [Character]},
                {model: Character, as: 'CurrentTurn'}
            ]});

        if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" }); // => 404
        if (!battleFound.CurrentTurn) return response.status(500).json({ error: "Il n'y a pas de tour en jeu !" }); // => 500

        // Vérification si le Tour Courant correspond ou bien si c'est le MJ
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

        const battleParticipations = battleFound.Participations;
        const currentParticipation = battleParticipations.find(item => item.dataValues.character_id === currentCharacter.dataValues.id);
        await currentParticipation.update({ stance: request.body.stance, current_tn: stance_tn }); // Edite Participation Courante Posture
        await delay(1000);
        io.emit('stanceChanged', currentParticipation.Character.firstname, request.body.stance); // => Signal IO Changement de stance

        // Gestion Attaques
        if (request.body.targetAttack1 && currentParticipation.dataValues.stance != 'dodge' && currentParticipation.dataValues.stance != 'concentration')
            await handleAttack(request.body.targetAttack1, 1);

        if (request.body.targetAttack2 && (currentParticipation.dataValues.stance === 'attack' || currentParticipation.dataValues.stance === 'assault') )
            await handleAttack(request.body.targetAttack2, 2);

        async function handleAttack(targetCharacterID, nthAttack) {
            await delay(1000);
            const targetParticipation = battleParticipations.find(item => item.dataValues.character_id == targetCharacterID);

            if (targetParticipation.dataValues.is_out === true) return;

            let atkRoll = Math.floor(30 * Math.random());
    
            if (currentParticipation.dataValues.stance == 'assault') atkRoll += 10;
    
            if (atkRoll >= targetParticipation.dataValues.current_tn) {
                const baseDamage = 10;
                const damage = baseDamage + Math.floor(20 * Math.random());
                let modifiedHealth = targetParticipation.Character.dataValues.health - damage;
                if (modifiedHealth < 0) modifiedHealth = 0;
        
                await targetParticipation.Character.update({ health: modifiedHealth });
                await delay(1000);
                io.emit('damageRolled', currentParticipation.Character.dataValues.firstname,
                    targetParticipation.Character.dataValues.firstname, atkRoll,
                    targetParticipation.current_tn, damage, nthAttack, targetParticipation.character_id);
        
                // Si vie = 0, out
                if (modifiedHealth == 0) {

                    if (targetParticipation.dataValues.is_out === false) {
                        await targetParticipation.update({ is_out: true });
                        await delay(1000);
                        io.emit('isOut', targetParticipation.Character.dataValues.firstname);
                    }
                }
            } else {
                await delay(1000);
                io.emit('dodgedAttack', currentParticipation.Character.dataValues.firstname,
                    targetParticipation.Character.dataValues.firstname, atkRoll, targetParticipation.dataValues.current_tn);
            }
        }  

    await currentParticipation.update({ is_played: true });

    // Condition de victoire
    const allTeamAOut = battleParticipations.filter(p => p.dataValues.team === 1).every(p => p.dataValues.is_out === true);
    const allTeamBOut = battleParticipations.filter(p => p.dataValues.team === 2).every(p => p.dataValues.is_out === true);

    if (allTeamAOut) {
        await battleFound.update({ status: 'finished', winner_team: 2 });
        await delay(1000);
        io.emit('teamVictory', 'Team B');
        return response.status(200).json({ message: "Team B a gagné, le combat est terminé !" });
    } else if (allTeamBOut) {
        await delay(1000);
        await battleFound.update({ status: 'finished', winner_team: 1 });
        io.emit('teamVictory', 'Team A'); // Team A gagne
        return response.status(200).json({ message: "Team A a gagné, le combat est terminé !" });
    }

    // Calcul Tours Restants
    let remainingTurns = battleParticipations.filter(
      (p) => p.dataValues.is_played === false && p.dataValues.is_out === false).sort((a,b) => 
        b.dataValues.initiative - a.dataValues.initiative);

    // Fin du Round, Début d'un Nouveau Round
    if (remainingTurns.length === 0) { // Tout le monde a joué
        await battleFound.update({ current_round: battleFound.dataValues.current_round + 1 }); // current_round +1
        await delay(1000);
        io.emit('newRound', battleFound.current_round + 1);
        battleParticipations.forEach(async (participation) =>
            await participation.update({ is_played: false })); // Réinitialisation
        remainingTurns = battleParticipations.filter(p => p.dataValues.is_out === false).sort((a, b) =>
            b.dataValues.initiative - a.dataValues.initiative);
    }
    
    // Fonction pour créer un délai (en millisecondes)
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Attente de 3 secondes avant de continuer
    await delay(2000);

    // NOUVEAU TOUR DE JEU
    if (remainingTurns.length > 0) {
        await battleFound.setCurrentTurn(remainingTurns[0].Character); // Edite Tour Courant
        await delay(1000);
        io.emit('nextTurn', remainingTurns[0].Character.firstname); // => IO Event
    } else {
        await battleFound.setCurrentTurn(null);
    }

    response.status(200).json({ message: "Le tour a bien été joué !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors du tour de jeu !" });
  }
}

// ======================
// === RESTORE HEALTH ===
// ======================

const restoreHealth = async (request, response) => {
  try {
    const battleFound = await Battle.findByPk(request.params.id, { include: [ { model: Participation, include: [Character] } ] } );
    if (!battleFound) return response.status(404).json({ error: "Ce combat n'existe pas !" });
    if (battleFound.status != 'waiting') return response.status(403).json({ error: "Vous ne pouvez restaurer pendant un combat en cours" });

    battleFound.Participations.forEach(async oneParticipation =>
      await oneParticipation.Character.update({ health: 100 }) );
    
    io.emit('restoredCharacters'); // => IO Event
    response.status(200).json({ message: "La vie des personnages a été restaurés !" });
  }
  catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la restauration de la vie des personnages !" });
  }
}

export {
    getAllBattles,
    getOneBattle,
    getLastActiveBattle,
    addBattle,
    editBattle,
    deleteBattle,
    startBattle,
    restartBattle,
    stopBattle,
    playTurn,
    restoreHealth,
};
