import jwt from 'jsonwebtoken'; // Importation de la librairie pour le JsonWebToken
import { ENV } from '../../config.js'; // Importation des variables d'environements pour le secret token
import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur

const verifyToken = (requete, reponse, next) => {
    const token = requete.cookies.access_token;

    if (!token)
        return next(createError(401, "L'Accès est réfusé !"));

    jwt.verify(token, ENV.TOKEN, (err, user) => {
        if (err) {
            return next(createError(403, { message: "Le token n'est pas valide !", error: err.message }))
        }
        requete.user = user; // Si le token est bon, alors l'utilisateur est stocké dans la requête
        next();
    })
}

export default verifyToken;