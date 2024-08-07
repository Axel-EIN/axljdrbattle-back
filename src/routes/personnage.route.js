import express from "express";

import {
  ajouterPersonnage,
  recupererPersonnages,
  modifierPersonnage,
  supprimerPersonnage
} from "../controllers/personnage.controller.js";

const router = express.Router();

router.post("/ajouter", ajouterPersonnage);
router.get("/tous", recupererPersonnages);
router.put("/modifier/:id", modifierPersonnage);
router.delete("/supprimer/:id", supprimerPersonnage);

export default router;