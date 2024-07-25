import express from "express";

import {
  ajouterCombat,
  recupererCombats,
  modifierCombat,
  supprimerCombat
} from "../controllers/combat.controller.js";

const router = express.Router();

router.post("/ajouter", ajouterCombat);
router.get("/tous", recupererCombats);
router.put("/modifier/:id", modifierCombat);
router.delete("/supprimer/:id", supprimerCombat);

export default router;