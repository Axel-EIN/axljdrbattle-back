import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyGameMaster from '../middlewares/gamemaster.js';
import {
  getAllBattles,
  getOneBattle,
  getLastActiveBattle,
  addBattle,
  editBattle,
  deleteBattle,
  startBattle,
  restartBattle,
  stopBattle,
  playTurn,
  restoreHealth,
} from "../controllers/battle.controller.js";

const router = express.Router();

router.get("/all", getAllBattles);
router.get("/one/:id", getOneBattle);
router.get("/lastactive", getLastActiveBattle);
router.post("/add", verifyToken, verifyGameMaster, addBattle);
router.put("/edit/:id", verifyToken, verifyGameMaster, editBattle);
router.delete("/delete/:id", verifyToken, verifyGameMaster, deleteBattle);
router.put("/start/:id", verifyToken, verifyGameMaster, startBattle);
router.put("/restart/:id", verifyToken, verifyGameMaster, restartBattle);
router.put("/stop/:id", verifyToken, verifyGameMaster, stopBattle);
router.put("/turn/:id", verifyToken, playTurn);
router.put("/restore/:id", verifyToken, verifyGameMaster, restoreHealth);

export default router;
