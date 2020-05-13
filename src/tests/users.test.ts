import { users, populateUsers, post, get, authGet, authPut, authDelete } from './seeds/seed';

const noEmailUser = {
  first_name: 'Rui',
  last_name: 'Patricio',
  password: 'password',
};
const noFirstNameUser = {
  last_name: 'Patricio',
  email: 'rui@wolves.com',
  password: 'password',
};
const existingEmailUser = {
  first_name: 'Rui',
  last_name: 'Patricio',
  email: 'raul@wolves.com',
  password: 'password',
};
const newUser = {
  first_name: 'Rui',
  last_name: 'Patricio',
  email: 'rui@wolves.com',
  password: 'password',
};
const newAdminUser = {
  first_name: 'Roman',
  last_name: 'Saiss',
  email: 'roman@wolves.com',
  password: 'password',
  role: 'admin',
};

describe('#all user tests', () => {
  beforeEach(async (done) => {
    populateUsers(done);
  });

  describe('new users', () => {
    it('should should not create a user with no email', async (done) => {
      const response = await post('/v1/users', noEmailUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should should not create a user with no first name', async (done) => {
      const response = await post('/v1/users', noFirstNameUser);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should should not create a user with an existing email', async (done) => {
      const response = await post('/v1/users', existingEmailUser);
      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('User already exists');
      done();
    });

    it('should return newly created user', async (done) => {
      const response = await post('/v1/users', newUser);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.user.first_name).toEqual(newUser.first_name);
      expect(response.body.data.user.password).not.toEqual(newUser.password);
      expect(response.body.data.user.role).toEqual('user');
      expect(response.body.data.token).toBeTruthy();
      done();
    });

    it('should create an admin when role is specfied in user object', async (done) => {
      const response = await post('/v1/users', newAdminUser);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.user.role).toEqual('admin');
      done();
    });
  });

  describe('user login', () => {
    it('should return an error if incomplete params are sent', async (done) => {
      await post('/v1/users', newUser);
      const response = await post('/v1/users/login', {
        email: newUser.email,
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.data).toBeFalsy();
      done();
    });

    it('should return an error if an incorrect password sent', async (done) => {
      await post('/v1/users', newUser);
      const response = await post('/v1/users/login', {
        email: newUser.email,
        password: 'passwordine',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.data).toBeFalsy();
      done();
    });

    it('should return an error if a non-existent email is sent', async (done) => {
      const response = await post('/v1/users/login', {
        email: 'coady@wolves.com',
        password: 'passwordine',
      });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.data).toBeFalsy();
      done();
    });

    it('should return a user object for a user with the right creds', async (done) => {
      await post('/v1/users', newUser);
      const response = await post('/v1/users/login', {
        email: newUser.email,
        password: newUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.user.first_name).toEqual(newUser.first_name);
      expect(response.body.data.user.password).not.toEqual(newUser.password);
      expect(response.body.data.user.role).toEqual('user');
      expect(response.body.data.token).toBeTruthy();
      done();
    });
  });

  describe('get a user', () => {
    it('should return an error if an unauthenticated user tries to get a user', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await get(`/v1/users/${newUserResponse.body.data.user._id}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return an error if requested user does not exist', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authGet(`/v1/users/5ebb63b8fd38911b67dc350d`, newUserResponse.body.data.token);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return a user object for an authenticated user', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authGet(
        `/v1/users/${newUserResponse.body.data.user._id}`,
        newUserResponse.body.data.token,
      );

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeTruthy();
      expect(response.body.data.user.password).toBeFalsy();
      done();
    });
  });

  describe('update user', () => {
    it('should return an error if requester is not the same as data to be updated', async (done) => {
      const userID = users[0]._id;
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authPut(`/v1/users/${userID}`, { first_name: 'Willy' }, newUserResponse.body.data.token);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Unauthorized request');
      done();
    });

    it('should return an error if requester is not an admin', async (done) => {
      const userID = users[0]._id;
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authPut(`/v1/users/${userID}`, { first_name: 'Willy' }, newUserResponse.body.data.token);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Unauthorized request');
      done();
    });

    it('should return an error if an unallowed field is sent', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authPut(
        `/v1/users/${newUserResponse.body.data.user._id}`,
        { age: 33 },
        newUserResponse.body.data.token,
      );
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it(`should return an error if a non-admin tries to update a user's role`, async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authPut(
        `/v1/users/${newUserResponse.body.data.user._id}`,
        { role: 'admin' },
        newUserResponse.body.data.token,
      );
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Unauthorized request');
      done();
    });

    it('should return an updated user if requester tries to update their data', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authPut(
        `/v1/users/${newUserResponse.body.data.user._id}`,
        { first_name: 'Willy' },
        newUserResponse.body.data.token,
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.first_name).toBe('Willy');
      done();
    });

    it('should return an updated user if requester is an admin', async (done) => {
      const newUserResponse = await post('/v1/users', { ...newAdminUser, email: 'test@test.dev' });

      const userID = users[0]._id;

      const response = await authPut(`/v1/users/${userID}`, { first_name: 'Willy' }, newUserResponse.body.data.token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.first_name).toBe('Willy');
      done();
    });
  });

  describe('get all users', () => {
    it('should return an error if an unauthenticated user tries to get all users', async (done) => {
      const response = await get(`/v1/users`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return an error if an authenticated non-admin tries to get all users', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authGet(`/v1/users`, newUserResponse.body.data.token);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return a users array for an authenticated admin', async (done) => {
      const newUserResponse = await post('/v1/users', { ...newAdminUser, email: 'test@test.dev' });

      const response = await authGet(`/v1/users`, newUserResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.users).toBeTruthy();
      expect(response.body.data.users[0].first_name).toBeTruthy();
      done();
    });
  });

  describe('delete a user', () => {
    it('should return an error if requester is not the same as data to be deleted', async (done) => {
      const userID = users[0]._id;
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authDelete(`/v1/users/${userID}`, newUserResponse.body.data.token);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Unauthorized request');
      done();
    });

    it('should return an error if requester is not an admin', async (done) => {
      const userID = users[0]._id;
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authDelete(`/v1/users/${userID}`, newUserResponse.body.data.token);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Unauthorized request');
      done();
    });

    it('should return an error if user does not exist', async (done) => {
      const newUserResponse = await post('/v1/users', { ...newAdminUser, email: 'test@test.dev' });

      const response = await authDelete(`/v1/users/5ebb63b8fd38911b67dc350d`, newUserResponse.body.data.token);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should delete a user if user intiates request', async (done) => {
      const newUserResponse = await post('/v1/users', newUser);

      const response = await authDelete(
        `/v1/users/${newUserResponse.body.data.user._id}`,
        newUserResponse.body.data.token,
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      done();
    });

    it('should delete a user if requester is an admin', async (done) => {
      const newUserResponse = await post('/v1/users', { ...newAdminUser, email: 'test@test.dev' });

      const userID = users[0]._id;

      const response = await authDelete(`/v1/users/${userID}`, newUserResponse.body.data.token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      done();
    });
  });
});
