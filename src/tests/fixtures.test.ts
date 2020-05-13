import { logger } from '../config/logger';
import {
  fixtures,
  teams,
  populateFixtures,
  post,
  authPost,
  get,
  authGet,
  authPut,
  put,
  authDelete,
  iDelete,
  populateTeams,
  populateUsers,
} from './seeds/seed';

const newFixture = {
  home_team: teams[0]._id,
  away_team: teams[1]._id,
  match_date: new Date('2020-07-15'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'wanda metropolitano',
};

const noHomeTeamFixture = {
  away_team: teams[1]._id,
  match_date: new Date('2020-06-11'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'wanda metropolitano',
};

const noMatchDateFixture = {
  home_team: teams[0]._id,
  away_team: teams[1]._id,
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'wanda metropolitano',
};

const noVenueFixture = {
  home_team: teams[0]._id,
  away_team: teams[1]._id,
  match_date: new Date('2020-06-11'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
};

const sameTeamFixture = {
  home_team: teams[2]._id,
  away_team: teams[2]._id,
  match_date: new Date('2020-05-21'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'camp nou',
};

const invalidTeamFixture = {
  home_team: '5ebb63b8fd38911b67dc350d',
  away_team: teams[3]._id,
  match_date: new Date('2020-08-11'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'camp nou',
};

const sameDateFixture = {
  home_team: teams[2]._id,
  away_team: teams[3]._id,
  match_date: new Date('2020-07-11'),
  scores: {
    home_team: 0,
    away_team: 0,
  },
  venue: 'camp nou',
};

const newUser = {
  first_name: 'Rui',
  last_name: 'Patricio',
  email: 'cutrone@wolves.com',
  password: 'password',
};
const newAdminUser = {
  first_name: 'Roman',
  last_name: 'Saiss',
  email: 'neto@wolves.com',
  password: 'password',
  role: 'admin',
};

describe('#all fixture tests', () => {
  beforeEach(async (done) => {
    populateUsers(done);
    populateTeams(done);
    populateFixtures(done);
  });

  describe('new fixture', () => {
    it('should not allow a non-auth user create a fixture', async (done) => {
      const response = await post('/v1/fixtures', newFixture);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not allow an auth non-admin create a fixture', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authPost('/v1/fixtures', newFixture, userResponse.body.data.token);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a fixture with no home team', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', noHomeTeamFixture, userResponse.body.data.token);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a fixture with no match date', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', noMatchDateFixture, userResponse.body.data.token);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a fixture with no venue', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', noVenueFixture, userResponse.body.data.token);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a fixture against the same team', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', sameTeamFixture, userResponse.body.data.token);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('same teams cannot play a fixture');
      done();
    });

    it('should not create a fixture when another fixture exists on the same date at the same venue', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', sameDateFixture, userResponse.body.data.token);

      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('existing fixture on the same date');
      done();
    });

    it('should not create a fixture if one of the teams is invalid', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', invalidTeamFixture, userResponse.body.data.token);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('one or both teams does not exist');
      done();
    });

    it('should create a new fixture', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPost('/v1/fixtures', newFixture, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Fixture created successfully');
      expect(response.body.data.fixture).toBeTruthy();
      expect(response.body.data.fixture.link).toBeTruthy();
      done();
    });
  });

  describe('get a fixture', () => {
    it('should return an error if a link does not correspond to a fixture', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authGet('/v1/fixtures/link/https://localhost44847', userResponse.body.data.token);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('fixture does not exist');
      done();
    });

    xit('should return a fixture via a link for an auth user', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const fixtureResponse = await authPost('/v1/fixtures', newFixture, userResponse.body.data.token);

      const link = fixtureResponse.body.data.fixture.link;

      const response = await authGet(link, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.fixture.link).toEqual(link);
      done();
    });

    it('should return a fixture for an admin user', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authGet(`/v1/fixtures/${fixtures[0]._id}`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.fixture.link).toEqual(fixtures[0].link);
      done();
    });
  });

  describe('get all fixtures', () => {
    it('should return all fixtures for an admin user', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authGet(`/v1/fixtures`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.fixtures).toBeTruthy();
      done();
    });
  });

  describe('update fixture', () => {
    it('should not allow an auth non-admin update a fixture', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authPut(
        `/v1/fixtures/${fixtures[0]._id}`,
        {
          venue: 'camp nou',
        },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not update a fixture that has the same date and venue as an existing fixture', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPut(
        `/v1/fixtures/${fixtures[0]._id}`,
        {
          match_date: new Date('2020-07-11'),
          venue: 'camp nou',
        },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('existing fixture on the same date');
      done();
    });

    it('should not update a fixture successfully', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authPut(
        `/v1/fixtures/${fixtures[0]._id}`,
        {
          match_date: new Date('2020-11-11'),
          venue: 'camp nou',
        },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.fixture.venue).toBe('camp nou');
      done();
    });
  });

  describe('delete fixture', () => {
    it('should not allow auth non-admins delete a fixture', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authDelete(`/v1/fixtures/${fixtures[0]._id}`, userResponse.body.data.token);
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should delete a fixture successfully', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authDelete(`/v1/fixtures/${fixtures[0]._id}`, userResponse.body.data.token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      done();
    });
  });
});
