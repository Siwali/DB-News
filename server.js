const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);


server.get('/favicon.ico', (req, res) => res.status(204).end());

server.use(router);

module.exports = server;
