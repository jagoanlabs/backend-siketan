const express = require('express');
const config = require('./config/app');
const routerAll = require('./app/router');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const http = require('http');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: '*', // atau specific domains untuk production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Cache-Control',
      'Pragma',
      'Expires',
      'If-None-Match',
      'If-Modified-Since',
      'X-Requested-With',
      'Accept',
      'Origin'
    ],
    exposedHeaders: ['Cache-Control', 'Content-Length', 'ETag', 'Expires', 'Last-Modified'],
    credentials: true, // if needed for cookies/auth
    maxAge: 86400 // Cache preflight response for 24 hours
  })
);

app.use(routerAll);

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));

const port = config.appPort;

const server = http.createServer(app);
const SocketServer = require('./socket');
SocketServer(server);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});
