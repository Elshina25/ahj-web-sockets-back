const http = require('http');
const Koa = require('koa');
const Router = require('koa-router');
const CORS = require('koa2-cors');
const koaBody = require('koa-body');
const WS = require('ws');
const User = require('./User');

const app = new Koa();
const router = new Router();

app.use(CORS());

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  text: true,
  json: true,
}));

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server
});

wsServer.on('connection', (ws, req) => {
  ws.on('message', async (data) => {
    const message = JSON.parse(data);

    if (message.type === 'createUser') {
      const user = User.getByName(message.username);
      if (!user) {
        const newUser = new User(message.username);
        newUser.save();
        const users = User.getUsers();

        [...wsServer.clients]
          .filter(o => o.readyState === WS.OPEN)
          .forEach(o => o.send(JSON.stringify({ type: 'users', data: users })));

        return;
      }
      ws.send(JSON.stringify({ type: 'error' }));
      return;
    } else if (message.type === 'sendMessage') {
      [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify({ type: 'sendMessage', data: message })))
    } else if (message.type === 'deleteUser') {
      User.deleteUser(message.username);
      const users = User.getUsers();
      [...wsServer.clients]
        .filter(o => o.readyState === WS.OPEN)
        .forEach(o => o.send(JSON.stringify({ type: 'users', data: users })));
    }
  });
});

server.listen(port, () => {
  console.log(`Server listen ${port} port`);
});
