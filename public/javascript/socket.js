$(function() {
  var socket = io();
  var timer;
  //send message
  $('#messagingForm').submit(function() {
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });
  //change username
  $('#changeUsername').submit(function() {
    socket.emit('change username', $('#username').val());
    $('#username').val('');
    return false;
  });
  $('#messagingForm').keydown(function() {
    //kills setTimeout of hiding typing if user is typing
    clearTimeout(timer);
    socket.emit('typing form');
  });
  $('#messagingForm').keyup(function() {
    clearTimeout(timer); //just in case it fires off too early
    timer = setTimeout(function() {
      socket.emit('stopped typing form');
    }, 1000);
  })
  //append message
  socket.on('chat message', function(user, msg) {
    $('#messages').append($('<li class="message">').html(user.name + ': ' + msg));
  });
  //user connected
  socket.on('user connected', function(users) {
    $('#messages').append($('<li>').text(users[users.length-1].name + ' connected...'));
  });
  socket.on('user update', function(users) {
    console.log("USER UPDATE");
    $('#whoseOnline').html('');
    users.forEach(function(user) {
      $('#whoseOnline').append($('<h6>').html(user.name));
    });
  })
  //user disconnected
  socket.on('user disconnected', function(user) {
    $('#messages').append($('<li>').text(user.name + ' disconnected...'));
  });
  //valid name change hides modal
  socket.on('hide modal', function() {
    $('#changeUsernameModal').modal('hide');
  });
  //user invalid name change
  socket.on('invalid username', function(name) {
    $('.alert').fadeIn();
    setTimeout(function(){
      $('.alert').fadeOut();
    }, 2000);
  });
  //user typing io
  socket.on('user typing', function(user) {
    $('.user-typing').html($('<span>').text(user.name + ' is typing...'));
  });
  socket.on('stopped typing', function() {
    $('.user-typing').html('');
  });
});
