function isString(variable) {
  return typeof variable === "string";
}

// Fonction qui check les champs de l'objet utilisateur
const userFieldsCheck = (user) => {
  const cleanedUser = {};

  // Identifiant
  if (user.identifiant && user.identifiant != '' && isString(user.identifiant))
    cleanedUser.identifiant = user.identifiant;

  // Mdp
  if (user.mdp && user.mdp != '' && isString(user.mdp))
    cleanedUser.mdp = user.mdp;

  // Email
  if (user.email && user.email != '' && isString(user.email))
    cleanedUser.email = user.email;

  // Prenom
  if (user.prenom && user.prenom != '' && isString(user.prenom))
    cleanedUser.prenom = user.prenom;
  
  // Role
  if (user.role && user.role != '' && ['user', 'mj', 'admin'].includes(user.role))
    cleanedUser.role = user.role;

  return cleanedUser;
}

export default userFieldsCheck;
