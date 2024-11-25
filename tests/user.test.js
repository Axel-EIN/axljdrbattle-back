process.env.NODE_ENV = 'test'; // Change l'environnement à 'test' pour éviter la connexion à la bdd

import { jest } from '@jest/globals';
import { User } from './../src/models/index';
import { addUser } from '../src/controllers/user.controller';

User.create = jest.fn();
User.create.mockImplementation((args) => User.build(args));

describe('test de la fonction addUser', () => {

  afterAll(() => {
    jest.resetAllMocks();
  });

  let fakeUser = {
    login: 'test',
    password: 'lalala',
    email: 'test@test.maim',
    firstname: 'prenom',
    role: 'user',
  }

  let mockedRequestObject = { body: fakeUser };
  const mockedRequest = () => { return mockedRequestObject; } // Simule la requête req.body
  const req = mockedRequest();

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res); // Simule la méthode .status()
    res.json = jest.fn().mockReturnValue(res); // Simule la méthode .json()
    return res;
  };
  const res = mockedResponse();

  it('should call User.create and return status 201 and a validation message', async () => {
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été crée !" });
  });

  it('should call User.create and return status 500 if there is a missing field', async () => {
    fakeUser.password = null;
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur, il n'y a pas de mot de passe !" });
  });

  it('should call User.create and return status 500 if there an unexpected error', async () => {
    fakeUser.password = 'lalala';
    User.create.mockRejectedValue(new Error('Unexpected error'));
    await addUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la création de l'utilisateur !" });
  });

  
  it('should call User.create and process files if present', async () => {
    fakeUser = {
      login: 'test',
      email: 'test@test.maim',
      password: expect.any(String),
      avatar: "images/avatars/profile.jpg",
      cover: "images/covers/cover.jpg",
      firstname: 'prenom',
      role: 'user',
    };

    let fakeFiles = [
      { fieldname: 'avatar', filename: 'profile.jpg' },
      { fieldname: 'cover', filename: 'cover.jpg' },
    ];

    mockedRequestObject = { body: fakeUser, files: fakeFiles  };
    await addUser(req, res);
    expect(User.create).toHaveBeenCalledWith(fakeUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été crée !" });
  });
});
