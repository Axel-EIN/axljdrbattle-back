function isString(variable) {
  return typeof variable === "string";
}

// Fonction qui check les champs de l'objet utilisateur
const userFieldsCheck = (user) => {
  const cleanedUser = {};

  // Identifiant
  if (user.login && user.login != '' && isString(user.login))
    cleanedUser.login = user.login;

  // Mdp
  if (user.password && user.password != '' && isString(user.password))
    cleanedUser.password = user.password;

  // Email
  if (user.email && user.email != '' && isString(user.email))
    cleanedUser.email = user.email;

  // Prenom
  if (user.firstname && user.firstname != '' && isString(user.firstname))
    cleanedUser.firstname = user.firstname;
  
  // Role
  if (user.role && user.role != '' && ['user', 'gamemaster', 'admin'].includes(user.role))
    cleanedUser.role = user.role;

  return cleanedUser;
}

export default userFieldsCheck;
