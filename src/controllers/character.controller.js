import { Character } from "../models/index.js"; // Importation de l'Objet Character initialisé et connecté à la base de données Sequelize
import { User } from "../models/index.js"; // Importation de l'Objet User initialisé et connecté à la base de données Sequelize
import { removeFile } from "../utils/managefiles.js"; // Importation de la fonction utilisate pour effacer des fichiers images

// ===============================
// === RETRIEVE ALL CHARACTERS ===
// ===============================

const getAllCharacters = async (request, response) => {
  try {
    const allCharacters = await Character.findAll({ include: User });
    response.status(200).json(allCharacters);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération des personnages !" });
  }
};


// ==============================
// === RETRIEVE ONE CHARACTER ===
// ==============================

const getOneCharacter = async (request, response) => {
  try {
    const characterFound = await Character.findByPk( request.params.id, { include: User } );
    if (!characterFound) return response.status(404).json({ error: "Ce personnage n'existe pas !" });

    response.status(200).json(characterFound);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération d'un personnage !" });
  }
};


// =====================
// === ADD CHARACTER ===
// =====================

const addCharacter = async (request, response) => {
  try {
    if (request.files && request.files.length > 0) // Si des fichiers images sont présents par multer
      request.files.forEach( (file) =>
        request.body[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename ); // Pour chaque élément prépare la request

    let userFound = null;
    if (request.body.user_id) userFound = await User.findByPk(request.body.user_id);

    if (!userFound) await Character.create(request.body);
    else await userFound.createCharacter(request.body);

    response.status(201).json({ message: "Le personnage a bien été ajouté !" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la création du personnage !" });
  }
};


// ======================
// === EDIT CHARACTER ===
// ======================

const editCharacter = async (request, response) => {
  try {
    const characterFound = await Character.findByPk(request.params.id); // Récupère un personnage par son ID

    if (!characterFound) return response.status(404).json( { error: "Ce personnage n'existe pas !" } );

    if (request.files && request.files.length > 0) // Si des fichiers images sont présents par multer
        request.files.forEach((file) =>
          request.body[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename ); // Pour chaque élément prépare la request

    let previousPortrait;
    if (request.body.portrait && characterFound.portrait) previousPortrait = characterFound.portrait;

    let previousIllustration;
    if (request.body.illustration && characterFound.illustration) previousIllustration = characterFound.illustration;

    await characterFound.update(request.body);

    if (previousPortrait) removeFile(previousPortrait);
    if (previousIllustration) removeFile(previousIllustration);

    response.status(200).json({ message: "Le personnage a bien été modifié !", characterFound });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la modification du personnage !" });
  }
};


// ========================
// === DELETE CHARACTER ===
// ========================

const deleteCharacter = async (request, response) => {
  try {
    const characterFound = await Character.findByPk(request.params.id); // Récupère un personnage par ID

    if (!characterFound) return response.status(404).json({ error: "Ce personnage n'existe pas !" });

    await characterFound.destroy();

    if (characterFound.portrait && characterFound.portrait != "") removeFile(characterFound.portrait);
    if (characterFound.illustration && characterFound.illustration != "") removeFile(characterFound.illustration);

    response.status(200).json({ message: "Le personnage a bien été supprimé !", characterFound });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la suppression du personnage !" });
  }
};

export {
    getAllCharacters,
    getOneCharacter,
    addCharacter,
    editCharacter,
    deleteCharacter,
};
