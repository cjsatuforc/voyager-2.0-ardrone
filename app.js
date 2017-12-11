
var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path');

http.listen(3000, function() {
  console.log('Servidor escuchando en puerto 3000');
});



app.use('/static', express.static('static'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/templates/index.html');
});

app.get('/data', function(req, res) {
  res.sendFile(__dirname + '/templates/data.html');
});

app.get('/data.json', function(req, res) {
  res.sendFile(__dirname + '/data.json');
});

app.get('/graph', function(req, res) {
  res.sendFile(__dirname + '/templates/graph.html');
});

var arDrone = require('ar-drone');
var client = arDrone.createClient({ip: "192.168.1.25"});
var onAir = false;

var sockets = {};

const socketIN = require('socket.io-client')('http://0.0.0.0:8080');

socketIN.on('lidar_response', (data) => {

  console.log(data.cm)
  io.emit("lidar_web", data)

  if (data.cm < 40) {
    if (onAir) {
      client.stop();
      client.back(0.1);
      client.stop();
    }
  }
});

io.on('connection', (socket) => {

  sockets[socket.id] = socket;
  console.log("Clientes conectados ", Object.keys(sockets).length);

  socket.on('takeoff', () => {
    if (onAir == false) {
      client.takeoff();
      onAir = true;
      console.log("takeoff!");
    }
  });

  socket.on('land', () => {
    if (onAir) {
      client.stop();
      client.land();
      console.log("land!");
      onAir = false;
    }

  });

  socket.on('up', () => {
    if (onAir) {
        client.up(0.1);
      console.log("up!");
    }
  });

  socket.on('down', () => {
    if (onAir) {
      client.down(0.1);
      console.log("down!");
    }
  });
  socket.on('left', () => {
    if (onAir) {
      client.left(0.1);
      console.log("left!");
    }
  });
  socket.on('right', () =>  {
    if (onAir) {
      client.right(0.1);
      console.log("right!");
    }
  });
  socket.on('front', () =>  {
    if (onAir) {
      client.front(0.1);
      console.log("front!");
    }
  });
  socket.on('back', () =>  {
    if (onAir) {
      client.back(0.1);
      console.log("back!");
    }
  });

  socket.on('ServoOn-Off', (estado) =>  {
    socketIN.emit("ServoOn-Off", estado)

  });

  socket.on('eme', () =>  {
    client.disableEmergency();
    console.log("disableEmergency!");

  });


});
