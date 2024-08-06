import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyAdmin from '../middlewares/admin.js';

import {
  inscrireUtilisateur,
  creerUtilisateur,
  recupererUtilisateurs,
  modifierUtilisateur,
  supprimerUtilisateur,
  connecterUtilisateur,
  deconnecterUtilisateur,
  recupererUtilisateurCourant
} from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post("/inscrire", inscrireUtilisateur);
router.post("/creer", verifyToken, verifyAdmin, creerUtilisateur);
router.get("/tous", recupererUtilisateurs);
router.put("/modifier/:id", verifyToken, modifierUtilisateur);
router.delete("/supprimer/:id", verifyToken, verifyAdmin, supprimerUtilisateur);
router.post("/connecter", connecterUtilisateur);
router.post("/deconnecter", verifyToken, deconnecterUtilisateur);
router.get("/courant", verifyToken, recupererUtilisateurCourant);

export default router;