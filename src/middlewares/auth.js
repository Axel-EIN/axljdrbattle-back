import jwt from 'jsonwebtoken'; // Importation de la librairie pour le JsonWebToken
import { ENV } from '../../config.js';
import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur
import { User } from "../models/index.js";
import { Character } from "../models/index.js";
import { Participation } from "../models/index.js";

const verifyToken = (request, response, next) => {
    const token = request.cookies.access_token;
    if (!token) return next(createError(401, "Le Token JWT n'a pas été trouvé ! L'Accès est réfusé car vous devez être connecté avec un Token !"));
    jwt.verify(token, ENV.TOKEN, async (err, user) => {
        if (err) return next(createError(403, { message: "Le token JWT ne semble pas valide !", error: err }));
        // const userFound = await User.findByPk(user.id); // Recherche de l'utilisateur dans la base de donnée

        const userFound = await User.findByPk(user.id, { include: [
            {model: Character, include: [Participation]}
        ]});

        if (!userFound) return next(createError(404, { message: "Cet utilisateur n'existe pas !", error: err }));

        request.user = userFound; // Si le token est bon, alors l'utilisateur est stocké dans la requête
        next();
    });
}

export default verifyToken;
