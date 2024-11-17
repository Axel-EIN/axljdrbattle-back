import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur

const verifyGameMaster = (request, response, next) => {
    if (request.user.role != 'gamemaster')
        return next(createError(401, "L'Accès est restreint aux Maîtres de Jeu !"));

    next();
}

export default verifyGameMaster;
