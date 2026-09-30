const express = require('express');
const server = require('http').createServer();
const app = express();
const PORT = 3000;

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: __dirname});
});

server.on('request', app);

server.listen(PORT, function () { console.log('Listening on ' + PORT); });


/** Websocket **/

const WebSocketServer = require('ws').Server;

const wss = new WebSocketServer({ server: server });

wss.on('connection', function connection(ws) {
  const numClients = wss.clients.size;

  console.log('clients connected: ', numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send('welcome!');
  }

  db.run(`INSERT INTO visitors (count, time) 
      VALUES (${numClients}, datetime('now'))
  `);

  ws.on('close', function close() {
    wss.broadcast(`Current visitors: ${wss.clients.size}`);
    console.log('A client has disconnected');
  });

  ws.on('error', function error() {
    //
  });
});

wss.broadcast = function broadcast(data) {
  console.log('Broadcasting: ', data);
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

/* Database */
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(':memory:');

db.serialize(function() {
    db.run(
        `CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )`
    );
})

function getCounts(){
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    })
}

function shutdownDB(){
    getCounts();
    console.log('Shutting down database');
    db.close();
}

process.on('SIGINT', () => {
  console.log('SIGINT received. Closing server...');
  wss.clients.forEach(function each(client) {
    client.close();
  });
    server.close(() => {
        console.log('Server closed');
        shutdownDB();
    });
});