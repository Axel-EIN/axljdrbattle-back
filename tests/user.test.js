import User from './../src/models/user.model';
import { addUser } from '../src/controllers/user.controller';

jest.mock('./../src/models/user.model', () => {
  const UserModelMock = jest.requireActual('./../src/models/user.model');
  UserMock.create = jest.fn();
  return UserModelMock;
});

describe('addUser', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  const email = 'tests@unitaire.com';
  const password = 'abc';
  const firstName = 'tests';
  const lastName = 'unitaire';

  const expectedUser = User.build({
    email,
    password,
    firstName,
    login,
    roleId: 'user'
  });

  it('should call User.create', async () => {
    User.create.mockImplementation((args) => User.build(args));
    const responseUser = await addUser(email, password, firstName, lastName);
    expect(User.create).toHaveBeenCalledWith({
      email,
      password,
      firstName,
      login,
      role: 'user'
    });
    expect(responseUser).toEqual(expectedUser);
  });
});
