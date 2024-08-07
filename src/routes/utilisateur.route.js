import express from "express";

import {
  inscrireUtilisateur,
  recupererUtilisateurs,
  modifierUtilisateur,
  supprimerUtilisateur
} from "../controllers/utilisateur.controller.js";

const router = express.Router();

router.post("/inscrire", inscrireUtilisateur);
router.get("/tous", recupererUtilisateurs);
router.put("/modifier/:id", modifierUtilisateur);
router.delete("/supprimer/:id", supprimerUtilisateur);

export default router;