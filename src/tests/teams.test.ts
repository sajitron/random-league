import { teams, populateTeams, post, authPost, get, authGet, authPut, put, authDelete, iDelete } from './seeds/seed';

const noNameTeam = {
  coach: 'jose mourinho',
  stadium: 'London Stadium',
};
const noCoachTeam = {
  team_name: 'Tottenham Hotspurs',
  stadium: 'London Stadium',
};
const existingNameTeam = {
  coach: 'jose mourinho',
  team_name: 'real madrid',
  stadium: 'London Stadium',
};
const newTeam = {
  coach: 'Jose Mourinho',
  team_name: 'Tottenham Hotspurs',
  stadium: 'London Stadium',
};
const newUser = {
  first_name: 'Rui',
  last_name: 'Patricio',
  email: 'dendocker@wolves.com',
  password: 'password',
};
const newAdminUser = {
  first_name: 'Roman',
  last_name: 'Saiss',
  email: 'jonny@wolves.com',
  password: 'password',
  role: 'admin',
};

describe('#all team tests', () => {
  beforeEach(async (done) => {
    populateTeams(done);
  });

  describe('new team', () => {
    it('should not allow a non-admin create a team', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authPost('/v1/teams', newTeam, userResponse.body.data.token);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a team with no coach', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPost('/v1/teams', noCoachTeam, userResponse.body.data.token);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a team with no name', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPost('/v1/teams', noNameTeam, userResponse.body.data.token);
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not create a team with an existing team name', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPost('/v1/teams', existingNameTeam, userResponse.body.data.token);
      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Team already exists');
      done();
    });

    it('should create a team successfully', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPost('/v1/teams', newTeam, userResponse.body.data.token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.data.team.team_name).toBe(newTeam.team_name.toLowerCase());
      done();
    });
  });

  describe('get a team', () => {
    it('should not allow a non-auth user get a team', async (done) => {
      const response = await get(`/v1/teams/${teams[0]._id}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return an error if the requested team does not exist', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authGet(`/v1/teams/5ebb869ddd993128246d7ab1`, userResponse.body.data.token);
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('team does not exist');
      done();
    });

    it('should return a team for an auth non-admin user', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authGet(`/v1/teams/${teams[1]._id}`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.team.team_name).toBeTruthy();
      done();
    });

    it('should return a team for an auth admin user', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authGet(`/v1/teams/${teams[3]._id}`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.team.team_name).toBeTruthy();
      done();
    });
  });

  describe('get teams', () => {
    it('should not allow a non-auth user get teams', async (done) => {
      const response = await get(`/v1/teams/${teams[0]._id}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should return all teams for an auth non-admin user', async (done) => {
      const userResponse = await post('/v1/users', newUser);

      const response = await authGet(`/v1/teams`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.teams).toBeTruthy();
      done();
    });

    it('should return all teams for an auth admin user', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);

      const response = await authGet(`/v1/teams`, userResponse.body.data.token);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.teams).toBeTruthy();
      done();
    });
  });

  describe('update a team', () => {
    it('should not allow a non-auth user update a team', async (done) => {
      const response = await put(`/v1/teams/${teams[0]._id}`, { team_name: 'sevilla' });
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not allow an auth non-admin user update a team', async (done) => {
      const userResponse = await post('/v1/users', newUser);
      const response = await authPut(
        `/v1/teams/${teams[0]._id}`,
        { team_name: 'sevilla' },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not update a team that has an existing team name', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPut(
        `/v1/teams/${teams[0]._id}`,
        { team_name: 'fc barcelona' },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(409);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Team already exists');
      done();
    });

    it('should update a team successfully', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authPut(
        `/v1/teams/${teams[0]._id}`,
        { team_name: 'Atletico de Madrid' },
        userResponse.body.data.token,
      );
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.team.team_name).toBe('atletico de madrid');
      done();
    });
  });

  describe('delete a team', () => {
    it('should not allow a non-auth user delete a team', async (done) => {
      const response = await iDelete(`/v1/teams/${teams[0]._id}`);
      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should not allow an auth non-admin user delete a team', async (done) => {
      const userResponse = await post('/v1/users', newUser);
      const response = await authDelete(`/v1/teams/${teams[0]._id}`, userResponse.body.data.token);
      expect(response.status).toBe(403);
      expect(response.body.status).toBe('error');
      done();
    });

    it('should delete a team successfully', async (done) => {
      const userResponse = await post('/v1/users', newAdminUser);
      const response = await authDelete(`/v1/teams/${teams[0]._id}`, userResponse.body.data.token);
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      done();
    });
  });
});
