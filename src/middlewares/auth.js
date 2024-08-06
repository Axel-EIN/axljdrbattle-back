import jwt from 'jsonwebtoken'; // Importation de la librairie pour le JsonWebToken
import { ENV } from '../../config.js'; // Importation des variables d'environements pour le secret token
import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur
import { Utilisateur } from "../models/index.js";
const verifyToken = (requete, reponse, next) => {
    const token = requete.cookies.access_token;

    if (!token)
        return next(createError(401, "L'Accès est réfusé car vous devez être connecté !"));

    jwt.verify(token, ENV.TOKEN, async (err, user) => {
        if (err)
            return next(createError(403, { message: "Le token n'est pas valide !", error: err.message }));

        const userTrouve = await Utilisateur.findByPk(user.id); // Recherche de l'utilisateur dans la base de donnée

        if (!userTrouve)
            return next(createError(404, { message: "Cet utilisateur n'existe pas !", error: err.message }));
        
        requete.user = userTrouve; // Si le token est bon, alors l'utilisateur est stocké dans la requête
        next();
    })
}

export default verifyToken;