import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyGameMaster from '../middlewares/gamemaster.js';
import multer from '../middlewares/multer.js'; // Bibliothèque Middleware qui récupère un fichier image d'un Formulaire et l'upload dans un dossier destination en le renomant

import {
  addCharacter,
  getAllCharacters,
  getOneCharacter,
  editCharacter,
  deleteCharacter
} from "../controllers/character.controller.js";

const router = express.Router();

router.get("/all", getAllCharacters);
router.get("/one/:id", getOneCharacter);
router.post("/add", verifyToken, verifyGameMaster, multer, addCharacter);
router.put("/edit/:id", verifyToken, verifyGameMaster, multer, editCharacter);
router.delete("/delete/:id", verifyToken, verifyGameMaster, multer, deleteCharacter);

export default router;
