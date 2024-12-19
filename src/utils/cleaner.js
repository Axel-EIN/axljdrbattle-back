function isString(variable) {
    return typeof variable === "string";
}

const cleanUser = (user) => {
    const cleanedUser = {};

    if (user.login && user.login != '' && isString(user.login)) cleanedUser.login = user.login; 
    if (user.password && user.password != '' && isString(user.password)) cleanedUser.password = user.password;
    if (user.email && user.email != '' && isString(user.email)) cleanedUser.email = user.email;
    if (user.firstname && user.firstname != '' && isString(user.firstname)) cleanedUser.firstname = user.firstname;
    if (user.role && user.role != '' && ['user', 'gamemaster', 'admin'].includes(user.role)) cleanedUser.role = user.role;
    if (user.isVerify === 'true' || user.isVerify === true) cleanedUser.isVerify = true;
    if (user.isVerify === 'false' || user.isVerify === false) cleanedUser.isVerify = false;

  return cleanedUser;
}

export {
    cleanUser,
};
