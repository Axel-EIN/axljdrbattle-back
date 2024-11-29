process.env.NODE_ENV = 'test'; // Le fait de passer cette variable env à "test" permet d'éviter la connexion à la bdd (voir code src/models/index.js)
import { jest } from '@jest/globals';
import { // Import des fonctions du controlleur user que nous testons
  registerUser,
  addUser,
  getAllUsers,
  getOneUser,
  editUser,
  deleteUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../src/controllers/user.controller';

import { User } from './../src/models/index';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const testValidUser = {
  login: 'testLogin',
  password: 'lalalaMotDePasse',
  email: 'test@test.mail',
  firstname: 'prenomDeTest',
  role: 'user',
}
const userFound = User.build({...testValidUser, id: 1});

const testUnvalidUser = {
  login: 'Admin',
  password: null,
  email: 'test2@test2.mail',
  firstname: 'deuxièmePrenomDeTest',
  role: 'admin',
}
const adminUserFound = User.build({...testUnvalidUser, id: 3});

const testUsers = [
  testValidUser,
  testUnvalidUser
];

// ================
// === REGISTER ===
// ================

describe('Tests for registerUser function', () => {

  const mockedResponse = () => { // Simule la réponse dans les controlleurs
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.create = jest.fn(); // prend le contrôle de la méthode User.create en la mockant avec Jest
    User.create.mockImplementation((args) => User.build(args)); // Implémente la call back pour build le user à la place de create
    bcrypt.hash = jest.fn(); // prend le contrôle de la méthode bcrypt.hash en la mockant avec Jest
    bcrypt.hash.mockResolvedValue('hashed-password'); // Implémente en retour une chaîne de caractère fixe 'hashed-passowrd'
  });

  test('for valid user : should call User.create with hashed password, return status 201 and a confirmation message', async () => {
    const mockedRequest = () => { return { body: testValidUser } }; // Simule la requete avec en req.body l'objet testValidUser
    const req = mockedRequest();
    await registerUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(1); // Vérifie si User.create a bien été appellé une fois
    expect(User.create).toHaveBeenCalledWith({ // Vérifie si User.create a bien été appellé avec l'utilisateur et son mot de passe hashé
      ...testValidUser,
      password: 'hashed-password',
    });
    expect(res.status).toHaveBeenCalledWith(201); // Vérifie si la méthode status de la réponse a bien été lancé avec le code 201
    expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été inscrit !" }); // Vérifie si la méthode json de la réponse a bien été lancé avec le message
  });

  test('for user with unvalid password user : should not call User.create and return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { body: testUnvalidUser } }; // Test avec un utilisateur sans mot de passe
    const req = mockedRequest();
    await registerUser(req, res);
    expect(User.create).not.toHaveBeenCalled(); // Vérifie que la fonction create n'a pas été appellé
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur, il n'y a pas de mot de passe !" });
  });

  test('for unexpected error : should call User.create that resolve an unexpected error and return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { body: testValidUser } }
    const req = mockedRequest();
    User.create.mockRejectedValue(new Error('Unexpected error')); // Prend le contrôle du retour de la valeur sous forme d'erreur
    await registerUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de l'inscription de l'utilisateur !" });
  });

});

// ===========
// === ADD ===
// ===========

describe('Tests for addUser function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.create = jest.fn();
    User.create.mockImplementation((args) => User.build(args));
    bcrypt.hash = jest.fn();
    bcrypt.hash.mockResolvedValue('hashed-password');
  });

  test('for valid user : it should call User.create with hashed the password, return status 201 and a confirmation message', async () => {
    const mockedRequest = () => { return { body: testValidUser } }
    const req = mockedRequest();
    await addUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith({
      ...testValidUser,
      password: 'hashed-password',
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été crée !" });
  });

  test('for user with unvalid password user : should not call User.create and return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { body: testUnvalidUser } }
    const req = mockedRequest();
    await addUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur, il n'y a pas de mot de passe !" });
  });

  test('unexpected error : should call User.create with an unexpected error, return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { body: testValidUser } }
    const req = mockedRequest();
    User.create.mockRejectedValue(new Error('Unexpected error'));
    await addUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la création de l'utilisateur !" });
  });

  test('files : should call User.create with hashed password and processed files to add them on the user object', async () => {
    const fakeFiles = [ // Tableau de faux fichiers pour simuler req.files envoyé par multer
      { fieldname: 'avatar', filename: 'profile.jpg' },
      { fieldname: 'cover', filename: 'cover.jpg' },
    ];
    const mockedRequest = () => { return { body: testValidUser, files: fakeFiles } }
    const req = mockedRequest();
    await addUser(req, res);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith({ // Vérifie que les images ont bien été ajouté avec des chemins corrects
      ...testValidUser,
      password: 'hashed-password',
      avatar: "images/avatars/profile.jpg",
      cover: "images/covers/cover.jpg",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été crée !" });
  });

});

// ===========
// === ALL ===
// ===========

describe('Tests for getAllUsers function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.findAll = jest.fn();
    User.findAll.mockImplementation(() => { return testUsers }); // Implémentation d'une call back de retour qui renvoie l'arrayt Users
  });

  test('found users : it should call User.findAll and return status 200 with an array', async () => {
    const mockedRequest = () => { return {} };
    const req = mockedRequest();
    await getAllUsers(req, res);
    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(testUsers); // Vérifie que la méthode json de la réponse a été appellé avec l'array testUsers
  });

  test('unexpected error : should call User.findAll with an unexpected error, return status 500 with a specific message', async () => {
    const mockedRequest = () => { return {} }
    const req = mockedRequest();
    User.findAll.mockRejectedValue(new Error('Unexpected error'));
    await getAllUsers(req, res);
    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la récupération des utilisateurs !" });
  });

});

// ===========
// === ONE ===
// ===========

describe('Tests for getOneUser function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.findByPk = jest.fn(); // prend le contrôle du comportement de la méthode User.findByPk en la mockant avec jest
    User.findByPk.mockImplementation(() => { return testValidUser }); // Implémente une call back qui renvoie l'utilisateur de test défini
  });

  const mockedRequest = () => { return { params: { id : 1 } } }; // Simule la requete avec un request.params.id = 1
  const req = mockedRequest();

  test('case found user : it should call User.findByPk and return status 200 with the found user', async () => {
    await getOneUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(testValidUser);
  });

  test('case user not found : should call User.findByPk that return null, and then return status 404 with a specific message', async () => {
    User.findByPk.mockImplementation(() => { return null }); // Simule un retour null
    await getOneUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cette utilisateur n'existe pas !" });
  });

  test('unexpected error : should call User.findByPk with an unexpected error, return status 500 with a specific message', async () => {
    User.findByPk.mockRejectedValue(new Error('Unexpected error'));
    await getOneUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la récupération d'un utilisateur !" });
  });

});

// ============
// === EDIT ===
// ============

describe('Tests for editUser function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.findByPk = jest.fn();
    User.findByPk.mockImplementation(() => { return userFound }); // Implémente une call back qui renvoie l'utilisateur de test défini
    userFound.update = jest.fn();
  });

  const toUpdateObject = { email: "TestChangement@mail.com" };
  const mockedRequest = () => { return { params: { id : 1 }, body: toUpdateObject } };
  const req = mockedRequest();

  test('case found user and edit : it should call User.findByPk, then update it, and return status 200 with the updated user', async () => {
    await editUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.update).toHaveBeenCalledTimes(1);
    expect(userFound.update).toHaveBeenCalledWith(toUpdateObject);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "L'utilisateur a bien été modifié !", userFound });
  });

  test('case user not found : should call User.findByPk that return null, it should not call User.update and then return status 404 with a specific message', async () => {
    User.findByPk.mockImplementation(() => { return null });
    await editUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cette utilisateur n'existe pas !" });
  });

  test('unexpected error : should call User.findByPk, then try to update it with an unexpected error, return status 500 with a specific message', async () => {
    userFound.update.mockRejectedValue(new Error('Unexpected error'));
    await editUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.update).toHaveBeenCalledTimes(1);
    expect(userFound.update).toHaveBeenCalledWith(toUpdateObject);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la modification de l'utilisateur !" });
  });

});

// ==============
// === DELETE ===
// ==============

describe('Tests for deleteUser function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.findByPk = jest.fn();
    User.findByPk.mockImplementation(() => { return userFound }); // Implémente une call back qui renvoie l'utilisateur de test défini
    userFound.destroy = jest.fn();
    adminUserFound.destroy = jest.fn();
  });

  test('case found user : should call User.findByPk and then delete the user and return status 200 with a message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, user: { id : 2 } } };
    const req = mockedRequest();
    await deleteUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.destroy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "L'utilisateur a bien été supprimé !" });
  });

  test('case user is current user : call User.findByPk, then if verify req.user equals userFound.id return status 403 with a message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, user: { id : 1 } } };
    const req = mockedRequest();
    await deleteUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.destroy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Vous ne pouvez vous supprimer !" });
  });

  test('case user is role admin : call User.findByPk, then if verify user has role admin return status 403 with a message', async () => {
    User.findByPk.mockImplementation(() => { return adminUserFound });
    const mockedRequest = () => { return { params: { id : 3 }, user: { id : 2 } } };
    const req = mockedRequest();
    await deleteUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(adminUserFound.destroy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Vous ne pouvez supprimer un Administrateur !" });
  });

  test('case user not found : should call User.findByPk that return null, it should not call User.destroy and then return status 404 with a specific message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, user: { id : 2 } } };
    const req = mockedRequest();
    User.findByPk.mockImplementation(() => { return null });
    await deleteUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.destroy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cette utilisateur n'existe pas !" });
  });

  test('unexpected error : should call User.findByPk with an unexpected error, return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, user: { id : 2 } } };
    const req = mockedRequest();
    userFound.destroy.mockRejectedValue(new Error('Unexpected error'));
    await deleteUser(req, res);
    expect(User.findByPk).toHaveBeenCalledTimes(1);
    expect(userFound.destroy).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la suppression de l'utilisateur !" });
  });

});

// ==============
// === LOGIN ===
// ==============

describe('Tests for loginUser function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    User.findOne = jest.fn();
    User.findOne.mockImplementation(() => { return userFound });
    bcrypt.compare = jest.fn();
    jwt.sign = jest.fn();
  });

  test('case found user : should call User.findOne, then compare password, then create a jwt token, and return status 200, with a cookie and userFound', async () => {
    const mockedRequest = () => { return { body: { login : testValidUser.login } } };
    const req = mockedRequest();
    bcrypt.compare.mockResolvedValue(true);
    const mockedJWToken = 'mocked-jwt-token'
    jwt.sign.mockReturnValue(mockedJWToken);
    await loginUser(req, res);
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(jwt.sign).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(userFound);
    expect(res.cookie).toHaveBeenCalledWith("access_token", mockedJWToken, { httpOnly: true, secure: true, sameSite: "None" });
  });

  test('case user not found : should call User.findOne that return null, then it should return status 404 with a specific message', async () => {
    const mockedRequest = () => { return { body: { login : testUnvalidUser.login } } };
    const req = mockedRequest();
    User.findOne.mockImplementation(() => { return null });
    await loginUser(req, res);
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Cette utilisateur n'existe pas !" });
  });

  test('case password invalid: should call User.findOne, then compare password, then return status 400, with specific message', async () => {
    const mockedRequest = () => { return { body: { login : testValidUser.login } } };
    const req = mockedRequest();
    bcrypt.compare.mockResolvedValue(false);
    await loginUser(req, res);
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Les identifiants sont inccorects !" });
  });

  test('case unexpected error : should call User.findOne get error, then it should return status 500 with a specific message', async () => {
    const mockedRequest = () => { return { body: { login : testValidUser.login } } };
    const req = mockedRequest();
    User.findOne.mockRejectedValue(new Error('Unexpected error'));
    await loginUser(req, res);
    expect(User.findOne).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la connection !" });
  });

});

// ==============
// === LOGOUT ===
// ==============

describe('Tests for logoutUser function', () => {

  test('user connected : clear cookie, return status 200 with message', async () => {
    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      res.clearCookie = jest.fn().mockReturnValue(res);
      return res;
    };
    const res = mockedResponse();
    const mockedRequest = () => { return { user: { id : 1 } } };
    const req = mockedRequest();
    await logoutUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "L'utilisateur a bien été déconnecté !" });
    expect(res.clearCookie).toHaveBeenCalledWith("access_token", { httpOnly: true });
  });

  test('user not connected : return status 403 with message', async () => {
    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const res = mockedResponse();
    const mockedRequest = () => { return { user: null } };
    const req = mockedRequest();
    await logoutUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Vous devez être connecté pour pouvoir vous deconnecter !" });
  });

  test('unexpected error : return status 500 with message', async () => {
    const mockedResponse2 = () => {
      const res2 = {};
      res2.status = jest.fn().mockReturnValue(res2);
      res2.json = jest.fn().mockReturnValue(res2);
      res2.clearCookie = jest.fn().mockImplementation(() => {
        throw new Error('Erreur lors de la suppression du cookie');  // Simule une erreur
      });
      return res2;
    };
    const res2 = mockedResponse2();
    const mockedRequest = () => { return { user: { id : 1 } } };
    const req = mockedRequest();
    await logoutUser(req, res2);
    expect(res2.status).toHaveBeenCalledWith(500);
    expect(res2.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la déconnection !" });
  });

});

// ===============
// === CURRENT ===
// ===============

describe('Tests for getCurrentUser function', () => {

  test('user connected : return status 200 with user data session', async () => {
    const mockedRequest = () => { return { user: {...userFound} } };
    const req = mockedRequest();
    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const res = mockedResponse();
    getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(userFound);
  });

  test('user not connected : return status 403 with message', async () => {
    const mockedRequest = () => { return { user: null } };
    const req = mockedRequest();
    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const res = mockedResponse();
    getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Vous devez être connecté pour récupérer votre session !" });
  });

  test('unexpected error : return status 500 with message', async () => {
    const mockedRequest = () => { return { user: { id : 1 } } };
    const req = mockedRequest();
    const mockedResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
    const res = mockedResponse();
    // Simuler une erreur dans le bloc `try` en espionnant `response.status`
    jest.spyOn(res, 'status').mockImplementationOnce(() => {
      throw new Error('Erreur simulée');
    });
    getCurrentUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la récupération de la session !" });
  });

});
