import express from "express";
import verifyToken from '../middlewares/auth.js';

import {
  inscrireUtilisateur,
  recupererUtilisateurs,
  modifierUtilisateur,
  supprimerUtilisateur,
  connecterUtilisateur
} from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post("/connecter", connecterUtilisateur);
router.post("/inscrire", inscrireUtilisateur);
router.get("/tous", recupererUtilisateurs);
router.put("/modifier/:id", verifyToken, modifierUtilisateur);
router.delete("/supprimer/:id", verifyToken, supprimerUtilisateur);

export default router;