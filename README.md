# Random League APIs

- A league where users and admin can be created. Admins can go ahead to create teams and fixtures.
- Users can view pending or completed fixtures.
- The App is hosted on Heroku <heroku.com> via Docker at <https://random-mock-league.herokuapp.com/v1/health>
- Postman Collection can be found here <https://documenter.getpostman.com/view/3343699/SzmiXGW6?version=latest>

## Node Version

- node v12.14.0

## Tools

- Node.js/TypeScript
- Express
- MongoDB
- Redis
- Docker
- Jest

## Starting the App

- Create and Populate the _.env_ file in the root directory with the appropriate environment variables.

### Starting Locally (without Docker)

- Run _yarn_ from the root of the directory to install the required dependencies.
- You should have redis installed on your computer. Run _redis-server_ to start up redis.
- Run _yarn start-dev_ to start the app with _ts-node_

### Starting with docker

- Update the .env file with the following variables.

  - REDIS_URL=redis://redis:6379
  - MONGO_URI=mongodb://mongo:27017/random-league

- Run `yarn build`
- Run _docker build . -t <tagname>_ e.g `docker build . -t random-league`
- Run _docker-compose up_ from the root directory.
- Run _docker ps_ from the root directory (in another terminal window) to get the available port.

## Testing

- All tests cannot be run at once because of the database deoendency.
- Each test file has to be run on its own i.e.
  - Run _yarn test users.test.ts_
  - _yarn test teams.test.ts_
  - _yarn test fixtures.test.ts_
