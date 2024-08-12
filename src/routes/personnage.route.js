import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyMj from '../middlewares/mj.js';
import multer from '../middlewares/multer.js'; // Bibliothèque Middleware qui récupère un fichier image d'un Formulaire et l'upload dans un dossier destination en le renomant

import {
  ajouterPersonnage,
  recupererPersonnages,
  recupererUnPersonnage,
  modifierPersonnage,
  supprimerPersonnage
} from "../controllers/personnage.controller.js";

const router = express.Router();

router.post("/ajouter", verifyToken, verifyMj, multer, ajouterPersonnage);
router.get("/tous", recupererPersonnages);
router.get("/un/:id", recupererUnPersonnage);
router.put("/modifier/:id", verifyToken, verifyMj, multer, modifierPersonnage);
router.delete("/supprimer/:id", verifyToken, verifyMj, multer, supprimerPersonnage);

export default router;