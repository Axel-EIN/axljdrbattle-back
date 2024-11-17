import express from "express";
import verifyToken from '../middlewares/auth.js';
import {
  getAllBattles,
  getOneBattle,
  addBattle,
  editBattle,
  deleteBattle,
  startBattle,
  restartBattle,
  stopBattle,
  playTurn,
} from "../controllers/battle.controller.js";

const router = express.Router();

router.get("/all", getAllBattles);
router.get("/one/:id", getOneBattle);
router.post("/add", addBattle);
router.put("/edit/:id", editBattle);
router.delete("/delete/:id", deleteBattle);
router.put("/start/:id", startBattle);
router.put("/restart/:id", restartBattle);
router.put("/stop/:id", stopBattle);
router.put("/turn/:id", verifyToken, playTurn);

export default router;
