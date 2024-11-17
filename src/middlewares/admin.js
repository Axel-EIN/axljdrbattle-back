import { createError } from '../utils/error.js'; // Importation de la fonction personnalisable de création d'objet d'erreur

const verifyAdmin = (request, response, next) => {
    if (request.user.role != 'admin') return next(createError(401, "Désolé ! L'Accès est restreint aux Administrateurs !"));
    next();
}

export default verifyAdmin;
