# Harmony

Harmony is an open-source chat application, written in Node. You are allowed to self-host this API, but there is currently no real use for it since no client has been created yet. License applies.

#### Note: This project is a Work in Progress. API documentation will soon be available in the form of a Postman collection.

## Prerequisites
1) Node
2) MongoDB server
3) Redis server

## Installation
### Cloning the repository to your local machine

```bash
git clone https://github.com/chris9740/harmony
```

### Installing all packages
```bash
npm ci
```

### Setting the environment
Create a `.env` file at the root of the project, alongside `package.json` and the `README.md`. You will need to populate it with the data. The required data with their descriptions are documented in `typings/environment.d.ts`. It should look something like this:
```bash // bash disables syntax highlighting for this particular case. Couldn't find a contender
PORT=5000
MONGODB_URI=mongodb://<ip>:<port>/<db>
NODE_ENV=development|production
THREAD_COUNT=1
SERVER_ID=1
REDIS_HOST=<ip>
REDIS_PORT=<port>
```

### Configuring the app
To configure the options for the API, such as the maximum amount of servers a person can join, you can edit the files in `./config`

For example, `./config/development.json`:
```json
{
  "maxServers": 50
}
```

Information about each configurable property exists in `./config/config.ts`


### Starting the API
```bash
npm start
```
