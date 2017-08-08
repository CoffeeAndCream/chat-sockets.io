var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var publicPath = path.join(__dirname, 'public');
var views = path.join(__dirname, 'views');

app.use(express.static(publicPath));
app.use(express.static(views));

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

var connectionCounter = 0;
var users = [];

io.on('connection', function(socket) {
  connectionCounter++;
  var username = 'User.' + socket.id.toString().substr(3,9);
  var user = {
    name: username,
    id: socket.id
  }
  users.push(user);
  //user connected
  io.emit('user connected', users);
  io.emit('user update', users);
  //user disconnected
  socket.on('disconnect', function() {
    io.emit('user disconnected', user);
    connectionCounter--;
    users.splice(users.indexOf(user), 1);
    io.emit('user update', users);
  });
  //send message
  socket.on('chat message', function(msg) {
    io.emit('chat message', user, msg);
  });
  //change username
  socket.on('change username', function(name) {
    var nameValid = true;
    users.forEach(function(tmpUser) {
      if(name == user.name){
        //checking to see if username hasn't changed
        nameValid = false;
      }
      else if(name == tmpUser.name && name != user.name) {
        //checking if user name already exists elsewhere
        socket.emit('invalid username', tmpUser.name);
        nameValid = false;
      }
    })
    if(nameValid) {
      var oldName = user.name;
      user.name = name;
      io.emit('chat message', user, oldName + " just changed their name to " + name);
      io.emit('user update', users);
      socket.emit('hide modal');
    }
  });
  //user is typing
  socket.on('typing form', function() {
    io.emit('user typing', user);
  })
  socket.on('stopped typing form', function() {
    io.emit('stopped typing', user);
  })
});

http.listen(3000, function() {
  console.log("listening on port 3000");
});
