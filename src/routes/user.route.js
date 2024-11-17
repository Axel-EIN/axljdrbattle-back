import express from "express";
import verifyToken from '../middlewares/auth.js';
import verifyAdmin from '../middlewares/admin.js';
import multer from '../middlewares/multer.js'; // Bibliothèque Middleware qui récupère un fichier image d'un Formulaire et l'upload dans un dossier destination en le renomant

import {
  registerUser,
  addUser,
  getAllUsers,
  getOneUser,
  editUser,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/all", getAllUsers);
router.get("/one/:id", getOneUser);
router.post("/add", verifyToken, verifyAdmin, multer, addUser);
router.put("/edit/:id", verifyToken, verifyAdmin, multer, editUser);
router.delete("/delete/:id", verifyToken, verifyAdmin, deleteUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);
router.get("/current", verifyToken, getCurrentUser);

export default router;
