import { Character, Participation, User } from "../models/index.js"; // Modèle initialisé et connecté à la base données Sequelize
import bcrypt from "bcrypt"; // Bibliothèque bcrypt pour crypter le mot de passe
import jwt from "jsonwebtoken"; // Bibliothèque jwt pour créer le cookie/token
import { ENV } from "./../../config.js";
import userFieldCheck from "../utils/userfieldcheck.js";
import { removeFile } from "../utils/managefiles.js";
import { sendMailToUser } from "../services/nodemailer.js";

// =====================
// === GET ALL USERS ===
// =====================

const getAllUsers = async (request, response) => {
  try {
    const allUsers = await User.findAll({
        include: [Character],
        attributes: {
          exclude: ['password']
        }
    });
    response.status(200).json(allUsers);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération des utilisateurs !" });
  }
};


// =========================
// === RETRIEVE ONE USER ===
// =========================

const getOneUser = async (request, response) => {
  try {
    const userFound = await User.findByPk(request.params.id, { include: [
        {model: Character, include: [Participation]}
    ]});
    if (!userFound) return response.status(404).json({ error: "Cette utilisateur n'existe pas !" });
    response.status(200).json(userFound);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération d'un utilisateur !" });
  }
};


// =====================
// === REGISTER USER ===
// =====================

const registerUser = async (request, response) => {
  try {
    const cleanedUser = userFieldCheck(request.body); // utilitaire pour enlever les prop. vide ou null
    if (!cleanedUser.password) return response.status(500).json({ error: "Erreur, il n'y a pas de mot de passe !" }); // Créer la fonction Erreur dans userFieldCheck avec ThrowError?
    cleanedUser.password = await bcrypt.hash(cleanedUser.password, 10);
    const userFound = await User.create({ ...cleanedUser, role: "user", isVerify: false }); // On force le role user à l'inscription

    const verifyToken = jwt.sign({ id: userFound.id }, ENV.TOKEN, { expiresIn: "10m" } );
    sendMailToUser(userFound, verifyToken);

    response.status(201).json({ message: "L'Utilisateur a bien été inscrit !" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de l'inscription de l'utilisateur !" });
  }
};


// ====================
// === VERIFY EMAIL ===
// ====================

const verifyEmail = async (request, response) => {
    try {
        const { token } = request.params;

        const decoded = jwt.verify(token, ENV.TOKEN);

        if (decoded) {
            const userFound = await User.findByPk(decoded.id);
            await userFound.update({ isVerify: true });
        }

        response.status(201).json({ message: "L'Utilisateur a bien été validé !" });
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: "Erreur interne lors de la validation du token !" });
    }
  };


// ================
// === ADD USER ===
// ================

const addUser = async (request, response) => {
  try {
    const cleanedUser = userFieldCheck(request.body); // utilitaire pour enlever les prop. vide ou null
    if (!cleanedUser.password) return response.status(500).json({ error: "Erreur, il n'y a pas de mot de passe !" });
    cleanedUser.password = await bcrypt.hash(cleanedUser.password, 10);

    if (request.files && request.files.length > 0) // Si des fichiers images sont présents par multer
      request.files.forEach((file) =>
        cleanedUser[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename); // Pour chaque élément prépare la requete

    await User.create(cleanedUser);
    response.status(201).json({ message: "L'Utilisateur a bien été crée !" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la création de l'utilisateur !" });
  }
};


// ================
// === EDIT USER ===
// ================

const editUser = async (request, response) => {
  try {
    const userFound = await User.findByPk(request.params.id);

    if (!userFound) return response.status(404).json({ error: "Cette utilisateur n'existe pas !" });

    const cleanedUser = userFieldCheck(request.body); // utilitaire pour enlever les prop. vide ou null

    if (userFound.login == 'Admin' && cleanedUser.role && cleanedUser.role != 'admin') // Protection pour les droits de l'administrateur
      return response.status(403).json({ error: "Vous ne pouvez enlevez les droits à l'Administrateur original !" });

    if (cleanedUser.password) cleanedUser.password = await bcrypt.hash(cleanedUser.password, 10); // On hache le password

    if (request.files && request.files.length > 0) // Si des fichiers images sont présents par multer
      request.files.forEach((file) => cleanedUser[file.fieldname] = "images/" + file.fieldname + "s/" + file.filename); // Pour chaque élément prépare la request

    let previousAvatar;
    if (cleanedUser.avatar && userFound.avatar) previousAvatar = userFound.avatar;

    await userFound.update(cleanedUser);
    if (previousAvatar) removeFile(previousAvatar);
    response.status(200).json({ message: "L'utilisateur a bien été modifié !", userFound });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la modification de l'utilisateur !" });
  }
};


// ===================
// === DELETE USER ===
// ===================

const deleteUser = async (request, response) => {
  try {
    const userFound = await User.findByPk(request.params.id);
    if (!userFound) return response.status(404).json({ error: "Cette utilisateur n'existe pas !" });
    if (userFound.id == request.user.id) return response.status(403).json({ error: "Vous ne pouvez vous supprimer !" });
    if (userFound.login == 'Admin') return response.status(403).json({ error: "Vous ne pouvez supprimer un Administrateur !" });

    await userFound.destroy();

    if (userFound.avatar) removeFile(userFound.avatar);
    response.status(200).json({ message: "L'utilisateur a bien été supprimé !" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la suppression de l'utilisateur !" });
  }
};


// ==================
// === LOGIN USER ===
// ==================

const loginUser = async (request, response) => {
  try {
    const userFound = await User.findOne({ where: { login: request.body.login }, include: [
        {model: Character, include: [Participation]}
    ]});
    if (!userFound) return response.status(404).json({ error: "Cette utilisateur n'existe pas !" });

    if (!userFound.isVerify) return response.status(403).json({ error: "Veuillez d'abord vérifier votre email !" });

    const passwordCompareResult = await bcrypt.compare(request.body.password, userFound.password);
    if (!passwordCompareResult) return response.status(400).json({ error: "Les identifiants sont inccorects !" });

    // Création du Token JWT
    const token = jwt.sign({ id: userFound.id }, ENV.TOKEN, { expiresIn: "24h" } );
    response.cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        partitioned: true,
    }).status(200).json(userFound); // renvoi de l'utilisateur en objet
    // renvoi du cookie access token jwt, sameSite peut être 'strict' or 'lax or None'
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la connection !" });
  }
};


// ===================
// === LOGOUT USER ===
// ===================

const logoutUser = async (request, response) => {
  try {
    if (!request.user) return response.status(403).json({ error: "Vous devez être connecté pour pouvoir vous deconnecter !" });
    response.clearCookie("access_token", { httpOnly: true, partitioned: true, secure: true, sameSite: 'None',}, ) // on détruit le cookie
      .status(200).json({ message: "L'utilisateur a bien été déconnecté !" });
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la déconnection !" } );
  }
};


// ========================
// === GET CURRENT USER ===
// ========================

const getCurrentUser = (request, response) => {
  try {
    if (!request.user) return response.status(403).json({ error: "Vous devez être connecté pour récupérer votre session !" });
    response.status(200).json(request.user);
  } catch (error) {
    console.log(error);
    response.status(500).json({ error: "Erreur interne lors de la récupération de la session !" });
  }
};

export {
  registerUser,
  verifyEmail,
  addUser,
  getAllUsers,
  getOneUser,
  editUser,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUser
};
