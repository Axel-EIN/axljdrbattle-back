import express from "express";
import verifyToken from '../middlewares/auth.js';
import {
  recupererCombats,
  recupererUnCombat,
  ajouterCombat,
  modifierCombat,
  supprimerCombat,
  demarrerCombat,
  recommencerCombat,
  arreterCombat,
  jouerTour,
} from "../controllers/combat.controller.js";

const router = express.Router();

router.get("/tous", recupererCombats);
router.get("/un/:id", recupererUnCombat);
router.post("/ajouter", ajouterCombat);
router.put("/modifier/:id", modifierCombat);
router.delete("/supprimer/:id", supprimerCombat);
router.put("/demarrer/:id", demarrerCombat);
router.put("/recommencer/:id", recommencerCombat);
router.put("/arreter/:id", arreterCombat);
router.put("/jouer/:id", verifyToken, jouerTour);

export default router;