import request from 'supertest';
import { ObjectID } from 'mongodb';
import app from '../../Server';
import User from '../../models/User';
import Team from '../../models/Team';
import Fixture from '../../models/Fixture';
import { Env } from '../../config/env';
import Utils from '../../utils/utils';

const { baseURL } = Env.all();

export function post(url: string, body: any) {
  const httpRequest = request(app).post(url);

  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);

  return httpRequest;
}

export function authPost(url: string, body: any, token: string) {
  const httpRequest = request(app).post(url);

  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);
  httpRequest.set('Authorization', `Bearer ${token}`);

  return httpRequest;
}

export function authPut(url: string, body: any, token: string) {
  const httpRequest = request(app).put(url);

  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);
  httpRequest.set('Authorization', `Bearer ${token}`);

  return httpRequest;
}

export function put(url: string, body: any) {
  const httpRequest = request(app).put(url);

  httpRequest.send(body);
  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);

  return httpRequest;
}

export function get(url: string) {
  const httpRequest = request(app).get(url);

  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);

  return httpRequest;
}

export function authGet(url: string, token: string) {
  const httpRequest = request(app).get(url);

  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);
  httpRequest.set('Authorization', `Bearer ${token}`);

  return httpRequest;
}

export function iDelete(url: string) {
  const httpRequest = request(app).delete(url);

  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);

  return httpRequest;
}

export function authDelete(url: string, token: string) {
  const httpRequest = request(app).delete(url);

  httpRequest.set('Accept', 'application/json');
  httpRequest.set('Origin', baseURL);
  httpRequest.set('Authorization', `Bearer ${token}`);

  return httpRequest;
}

export const users = [
  {
    _id: new ObjectID(),
    first_name: 'raul',
    last_name: 'jimenez',
    email: 'raul@wolves.com',
    role: 'user',
    password: 'password',
  },
  {
    _id: new ObjectID(),
    first_name: 'diogo',
    last_name: 'jota',
    email: 'diogo@wolves.com',
    role: 'user',
    password: 'password',
  },
  {
    _id: new ObjectID(),
    first_name: 'adama',
    last_name: 'traore',
    email: 'adama@wolves.com',
    role: 'user',
    password: 'password',
  },
  {
    _id: new ObjectID(),
    first_name: 'nuno',
    last_name: 'santo',
    email: 'nuno@wolves.com',
    role: 'admin',
    password: 'password',
  },
  {
    _id: new ObjectID(),
    first_name: 'ruben',
    last_name: 'neves',
    email: 'ruben@wolves.com',
    role: 'user',
    password: 'password',
  },
  {
    _id: new ObjectID(),
    first_name: 'joao',
    last_name: 'moutinho',
    email: 'joao@wolves.com',
    role: 'admin',
    password: 'password',
  },
];

export const populateUsers = (done: any) => {
  User.deleteMany({})
    .then(() => {
      const userOne = new User(users[0]).save();
      const userTwo = new User(users[1]).save();
      const userThree = new User(users[2]).save();
      const userFour = new User(users[3]).save();
      const userFive = new User(users[4]).save();
      const userSix = new User(users[5]).save();

      return Promise.all([userOne, userTwo, userThree, userFour, userFive, userSix]);
    })
    .then(() => done());
};

export const teams = [
  {
    _id: new ObjectID(),
    team_name: 'atletico madrid',
    coach: 'diego simeone',
    stadium: 'wanda metropolitano',
    creator: users[3]._id,
    fixtures: [],
  },
  {
    _id: new ObjectID(),
    team_name: 'real madrid',
    coach: 'zinedine zidane',
    stadium: 'santiago bernabeu',
    creator: users[5]._id,
    fixtures: [],
  },
  {
    _id: new ObjectID(),
    team_name: 'fc barcelona',
    coach: 'quique setien',
    stadium: 'camp nou',
    creator: users[3]._id,
    fixtures: [],
  },
  {
    _id: new ObjectID(),
    team_name: 'villareal cf',
    coach: 'javier calleja',
    stadium: 'ceramica',
    creator: users[5]._id,
    fixtures: [],
  },
];

export const populateTeams = (done: any) => {
  Team.deleteMany({})
    .then(() => {
      const teamOne = new Team(teams[0]).save();
      const teamTwo = new Team(teams[1]).save();
      const teamThree = new Team(teams[2]).save();
      const teamFour = new Team(teams[3]).save();

      return Promise.all([teamOne, teamTwo, teamThree, teamFour]);
    })
    .then(() => done());
};

export const fixtures = [
  {
    _id: new ObjectID(),
    home_team: teams[0]._id,
    away_team: teams[1]._id,
    match_date: new Date('2020-06-11'),
    completed: false,
    scores: {
      home_team: 0,
      away_team: 0,
    },
    venue: 'wanda metropolitano',
    link: Utils.generateLink(),
  },
  {
    _id: new ObjectID(),
    home_team: teams[2]._id,
    away_team: teams[3]._id,
    match_date: new Date('2020-05-11'),
    completed: true,
    scores: {
      home_team: 3,
      away_team: 0,
    },
    venue: 'camp nou',
    link: Utils.generateLink(),
  },
];

export const populateFixtures = (done: any) => {
  Fixture.deleteMany({})
    .then(() => {
      const fixtureOne = new Fixture(fixtures[0]).save();
      const fixtureTwo = new Fixture(fixtures[1]).save();

      return Promise.all([fixtureOne, fixtureTwo]);
    })
    .then(() => done());
};
