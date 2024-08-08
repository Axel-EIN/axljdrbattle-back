import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyAdmin from '../middlewares/admin.js';
import multer from '../middlewares/multer.js'; // Bibliothèque Middleware qui récupère un fichier image d'un Formulaire et l'upload dans un dossier destination en le renomant

import {
  inscrireUtilisateur,
  creerUtilisateur,
  recupererUtilisateurs,
  recupererUnUtilisateur,
  modifierUtilisateur,
  supprimerUtilisateur,
  connecterUtilisateur,
  deconnecterUtilisateur,
  recupererUtilisateurCourant
} from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post("/inscrire", inscrireUtilisateur);
router.post("/creer", verifyToken, verifyAdmin, multer, creerUtilisateur);
router.get("/tous", recupererUtilisateurs);
router.get("/un/:id", recupererUnUtilisateur);
router.put("/modifier/:id", verifyToken, verifyAdmin, multer, modifierUtilisateur);
router.delete("/supprimer/:id", verifyToken, verifyAdmin, supprimerUtilisateur);
router.post("/connecter", connecterUtilisateur);
router.post("/deconnecter", verifyToken, deconnecterUtilisateur);
router.get("/courant", verifyToken, recupererUtilisateurCourant);

export default router;