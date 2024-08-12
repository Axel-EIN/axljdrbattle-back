import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur

const verifyMj = (requete, reponse, next) => {
    if (requete.user.role != 'mj')
        return next(createError(401, "L'Accès est restreint aux Maîtres de Jeu !"));

    next();
}

export default verifyMj;