process.env.NODE_ENV = 'test'; // Le fait de passer cette variable env à "test" permet d'éviter la connexion à la bdd (voir code src/models/index.js)
import { jest } from '@jest/globals';
import { // Import des fonctions du controlleur character que nous testons
  getAllCharacters,
  getOneCharacter,
  addCharacter,
  editCharacter,
  deleteCharacter,
} from '../src/controllers/character.controller';
import { Character } from './../src/models/index';
import { User } from './../src/models/index';

const testCharacter = {
  lastname: 'testNomDuPersonnage',
  firstname: 'testPrenomDuPersonnage',
  portrait: 'images/portraits/portrait_testPrenom',
  illustration: 'images/portraits/illustration_testPrenom',
  health: 150,
  user_id: null,
}
const buildedTestCharacter = Character.build({...testCharacter, id: 1});

const testCharacterUser = {
  lastname: 'testNomDuPersonnag2',
  firstname: 'testPrenomDuPersonnage2',
  portrait: 'images/portraits/portrait_testPrenom2',
  illustration: 'images/portraits/illustration_testPrenom2',
  health: 150,
  user_id: 1,
}
const buildedTestCharacterUser = Character.build({...testCharacterUser, id: 2});

const testUser = {
  login: 'testLogin',
  password: 'lalalaMotDePasse',
  email: 'test@test.mail',
  firstname: 'prenomDeTest',
  role: 'user',
}
const buildedUser = User.build({...testUser, id: 1});

const testCharacters = [
  testCharacter,
  testCharacterUser
];

// ===========
// === ADD ===
// ===========

describe('Tests for addCharacter function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    Character.create = jest.fn();
    Character.create.mockImplementation((args) => Character.build(args));
    User.findByPk = jest.fn();
  });

  test('character with no userID : call Character.create and return status 201 and a confirmation message', async () => {
    const mockedRequest = () => { return { body: testCharacter } }
    const req = mockedRequest();
    await addCharacter(req, res);
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalledWith(testCharacter);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été ajouté !" });
  });

  test('character with unfound userID : call User.findByPk, call Character.create, return status 201 and a confirmation message', async () => {
    const mockedRequest = () => { return { body: testCharacterUser } }
    const req = mockedRequest();
    User.findByPk.mockResolvedValue(null);
    await addCharacter(req, res);
    expect(User.findByPk).toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalledWith(testCharacterUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été ajouté !" });
  });

  // test('for user with unvalid password user : should not call Charactercreate and return status 500 with a specific message', async () => {
  //   const mockedRequest = () => { return { body: testUnvalidCharacter } }
  //   const req = mockedRequest();
  //   await addUser(req, res);
  //   expect(Charactercreate).toHaveBeenCalledTimes(0);
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ error: "Erreur, il n'y a pas de mot de passe !" });
  // });

  // test('unexpected error : should call Charactercreate with an unexpected error, return status 500 with a specific message', async () => {
  //   const mockedRequest = () => { return { body: testValidCharacter } }
  //   const req = mockedRequest();
  //   Charactercreate.mockRejectedValue(new Error('Unexpected error'));
  //   await addUser(req, res);
  //   expect(Charactercreate).toHaveBeenCalledTimes(1);
  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la création de l'utilisateur !" });
  // });

  // test('files : should call Charactercreate with hashed password and processed files to add them on the user object', async () => {
  //   const fakeFiles = [ // Tableau de faux fichiers pour simuler req.files envoyé par multer
  //     { fieldname: 'avatar', filename: 'profile.jpg' },
  //     { fieldname: 'cover', filename: 'cover.jpg' },
  //   ];
  //   const mockedRequest = () => { return { body: testValidCharacter, files: fakeFiles } }
  //   const req = mockedRequest();
  //   await addUser(req, res);
  //   expect(Charactercreate).toHaveBeenCalledTimes(1);
  //   expect(Charactercreate).toHaveBeenCalledWith({ // Vérifie que les images ont bien été ajouté avec des chemins corrects
  //     ...testValidCharacter,
  //     password: 'hashed-password',
  //     avatar: "images/avatars/profile.jpg",
  //     cover: "images/covers/cover.jpg",
  //   });
  //   expect(res.status).toHaveBeenCalledWith(201);
  //   expect(res.json).toHaveBeenCalledWith({ message: "L'Utilisateur a bien été crée !" });
  // });

});