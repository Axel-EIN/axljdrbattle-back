import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur

const verifyAdmin = (requete, reponse, next) => {
    if (requete.user.role != 'admin')
        return next(createError(401, "L'Accès est restreint aux Administrateurs !"));

    next();
}

export default verifyAdmin;