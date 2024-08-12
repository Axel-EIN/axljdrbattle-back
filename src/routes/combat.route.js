import express from "express";

import {
  recupererCombats,
  recupererUnCombat,
  ajouterCombat,
  modifierCombat,
  supprimerCombat
} from "../controllers/combat.controller.js";

const router = express.Router();

router.get("/tous", recupererCombats);
router.get("/un/:id", recupererUnCombat);
router.post("/ajouter", ajouterCombat);
router.put("/modifier/:id", modifierCombat);
router.delete("/supprimer/:id", supprimerCombat);

export default router;