process.env.NODE_ENV = 'test'; // Le fait de passer cette variable env à "test" permet d'éviter la connexion à la bdd (voir code src/models/index.js)
import { jest } from '@jest/globals';
import { // Import des fonctions du controlleur character que nous testons
  addCharacter,
  getAllCharacters,
  getOneCharacter,
  editCharacter,
  deleteCharacter,
} from '../src/controllers/character.controller';
import { Character } from './../src/models/index';
import { User } from './../src/models/index';
import fs from 'fs';

const testCharacter = {
  lastname: 'testNomDuPersonnage',
  firstname: 'testPrenomDuPersonnage',
  portrait: 'images/portraits/portrait_testPrenom',
  illustration: 'images/illustrations/illustration_testPrenom',
  health: 150,
  user_id: null,
}
const buildedCharacter = Character.build({...testCharacter, id: 1});

const testCharacterUser = {
  lastname: 'testNomDuPersonnag2',
  firstname: 'testPrenomDuPersonnage2',
  portrait: 'images/portraits/portrait_testPrenom2',
  illustration: 'images/illustrations/illustration_testPrenom2',
  health: 150,
  user_id: 1,
}
const buildedCharacterUser = Character.build({...testCharacterUser, id: 2});

const testCharacterNoImages = {
  lastname: 'testNomDuPersonnag3',
  firstname: 'testPrenomDuPersonnage3',
  health: 150,
  user_id: 2,
}
const buildedCharacterNoImages = Character.build({...testCharacterNoImages, id: 3});

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

  test('character with no userID : call Character.create and return status 201 with message', async () => {
    const mockedRequest = () => { return { body: testCharacter } }
    const req = mockedRequest();
    await addCharacter(req, res);
    expect(User.findByPk).not.toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalled();
    expect(Character.create).toHaveBeenCalledWith(testCharacter);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été ajouté !" });
  });

  test('character with unfound userID : call User.findByPk, call Character.create, return status 201 with message', async () => {
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

  test('character with found userID : call User.findByPk, call userFound.createCharacter, return 201 with message', async () => {
    const mockedRequest = () => { return { body: testCharacterUser } }
    const req = mockedRequest();
    User.findByPk.mockResolvedValue(buildedUser);
    buildedUser.createCharacter = jest.fn();
    await addCharacter(req, res);
    expect(buildedUser.createCharacter).toHaveBeenCalledTimes(1);
    expect(buildedUser.createCharacter).toHaveBeenCalledWith(testCharacterUser);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été ajouté !" });
  });

  test('unexpected error : call Character.create and get an unexpected error, return status 500 with message', async () => {
    const mockedRequest = () => { return { body: testCharacter } }
    const req = mockedRequest();
    Character.create.mockRejectedValue(new Error('Unexpected error'));
    await addCharacter(req, res);
    expect(Character.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la création du personnage !" });
  });

});

// ===========
// === ALL ===
// ===========

describe('Tests for getAllCharacters function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    Character.findAll = jest.fn();
    Character.findAll.mockResolvedValue(testCharacters);
  });

  test('found characters : call User.findAll, return status 200 with an array', async () => {
    const mockedRequest = () => { return {} };
    const req = mockedRequest();
    await getAllCharacters(req, res);
    expect(Character.findAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(testCharacters);
  });

  test('unexpected error : should call Character.findAll, get an unexpected error, return status 500 with message', async () => {
    const mockedRequest = () => { return {} }
    const req = mockedRequest();
    Character.findAll.mockRejectedValue(new Error('Unexpected error'));
    await getAllCharacters(req, res);
    expect(Character.findAll).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la récupération des personnages !" });
  });

});

// ===========
// === ONE ===
// ===========

describe('Tests for getOneCharacter function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    Character.findByPk = jest.fn();
    Character.findByPk.mockResolvedValue(testCharacterUser);
  });

  const mockedRequest = () => { return { params: { id : 1 } } };
  const req = mockedRequest();

  test('found character : call Character.findByPk, return status 200 with found character object', async () => {
    await getOneCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(testCharacterUser);
  });

  test('not found character : call Character.findByPk and get null, return status 404 with message', async () => {
    Character.findByPk.mockResolvedValue(null);
    await getOneCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Ce personnage n'existe pas !" });
  });

  test('unexpected error : should call Character.findByPk with unexpected error, return status 500 with message', async () => {
    Character.findByPk.mockRejectedValue(new Error('Unexpected error'));
    await getOneCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la récupération d'un personnage !" });
  });

});

// ============
// === EDIT ===
// ============

describe('Tests for editCharacter function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  beforeEach(() => {
    Character.findByPk = jest.fn();
    buildedCharacter.update = jest.fn();
    fs.unlink = jest.fn(); // Empêche que la fonction unlink se lance et suprime des fichiers
  });

  test('not found character : call Character.findByPk and get null, return status 404 with message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, body: { firstname: 'toto' } } };
    const req = mockedRequest();
    Character.findByPk.mockResolvedValue(null);
    await editCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Ce personnage n'existe pas !" });
  });

  test('character found : call Character.findByPk, update it and return status 200 with message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, body: { firstname: 'toto' } } };
    const req = mockedRequest();
    Character.findByPk.mockResolvedValue(buildedCharacter);
    const updatedCharacter = {...testCharacter, firstname: 'toto'};
    buildedCharacter.update.mockResolvedValue(updatedCharacter);
    await editCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.update).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été modifié !", updatedCharacter });
  });

  test('files : process files if there is any files from multer, put on request.body and call Character.update, remove system saved files if character already had', async () => {
    const fakeMulterFiles = [
      { fieldname: 'portrait', filename: 'portrait-de-toto.jpg' },
      { fieldname: 'illustration', filename: 'illustration-de-toto.jpg' },
    ];
    const mockedRequest = () => { return { params: { id : 1 }, body: { firstname: 'toto' }, files: fakeMulterFiles } };
    const req = mockedRequest();
    Character.findByPk.mockResolvedValue(buildedCharacter);
    const updatedCharacter = {
      ...testCharacter,
      firstname: 'toto',
      portrait: "images/portraits/portrait-de-toto.jpg",
      illustration: "images/illustrations/illustration-de-toto.jpg"
    };
    buildedCharacter.update.mockResolvedValue(updatedCharacter);
    await editCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(Character.findByPk).toHaveBeenCalledWith(1);
    expect(buildedCharacter.update).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.update).toHaveBeenCalledWith({
      firstname: 'toto',
      portrait: "images/portraits/portrait-de-toto.jpg",
      illustration: "images/illustrations/illustration-de-toto.jpg",
    });
    expect(fs.unlink.mock.calls[0][0]).toContain('public/images/portraits/portrait_testPrenom');
    expect(fs.unlink.mock.calls[1][0]).toContain('public/images/illustrations/illustration_testPrenom');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été modifié !", updatedCharacter });
  });

  test('error : call Character.findByPk, then characterFound.update, get an error, return status 500 with message', async () => {
    const mockedRequest = () => { return { params: { id : 1 }, body: { firstname: 'toto' } } };
    const req = mockedRequest();
    Character.findByPk.mockResolvedValue(buildedCharacter);
    buildedCharacter.update.mockRejectedValue(new Error('Unexpected error'));
    await editCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.update).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.update).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne lors de la modification du personnage !" });
  });

});

// ==============
// === DELETE ===
// ==============

describe('Tests for deleteCharacter function', () => {

  const mockedResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const res = mockedResponse();

  const mockedRequest = () => { return { params: { id : 1 } } };
  const req = mockedRequest();

  beforeEach(() => {
    Character.findByPk = jest.fn();
    buildedCharacterNoImages.destroy = jest.fn();
    buildedCharacter.destroy = jest.fn();
    fs.unlink = jest.fn();
  });

  test('not found character : call Character.findByPk and get null, return status 404 with message', async () => {
    Character.findByPk.mockResolvedValue(null);
    await deleteCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(Character.findByPk).toHaveBeenCalledWith(1);
    expect(buildedCharacter.destroy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Ce personnage n'existe pas !" });
  });

  test('character found with no images: call Character.findByPk, delete it and return status 200 with message', async () => {
    Character.findByPk.mockResolvedValue(buildedCharacterNoImages);
    const characterFound = buildedCharacterNoImages;
    await deleteCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(buildedCharacterNoImages.destroy).toHaveBeenCalledTimes(1);
    expect(fs.unlink).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été supprimé !", characterFound });
  });

  test('character found with files : call Character.findByPk, delete it, remove files and return status 200 with message', async () => {
    Character.findByPk.mockResolvedValue(buildedCharacter);
    const characterFound = buildedCharacter;
    await deleteCharacter(req, res);
    expect(Character.findByPk).toHaveBeenCalledTimes(1);
    expect(buildedCharacter.destroy).toHaveBeenCalledTimes(1);
    expect(fs.unlink.mock.calls[0][0]).toContain('public/images/portraits/portrait_testPrenom');
    expect(fs.unlink.mock.calls[1][0]).toContain('public/images/illustrations/illustration_testPrenom');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Le personnage a bien été supprimé !", characterFound });
  });

});
