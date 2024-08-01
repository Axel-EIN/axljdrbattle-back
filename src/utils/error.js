// Fonction qui permet de créer un objet Error personnalisé en lui envoyant comme paramètre le status et le message
export const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
    return err;
};