var app = require('express')();
var http = require('http').Server(app);
var architecture = require('./architecture.js'),
	Room = architecture.Room,
	User = architecture.User,
	IDgenerator = architecture.IDgenerator;
var io = require('socket.io').listen(http);


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

/*
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

var users = {};
var rooms = {};

io.sockets.on('connection', function(socket) {
	console.log(socket.id);
	socket.on('disconnect', function() {
		
	});

	socket.on('joinRoom', function(roomID, name) {
		var room = rooms[roomID];

		var uName = room.getUniqueName(name);
		var uID = genUniqueUserID();

		var newUser = new User(uName, uID);

		users.addUser(newUser);
		room.addUser(newUser);


		socket.emit('userInfo', { name: newUser.name, id: newUser.id });
		socket.emit('onRoomUpdate', room.getRoomState());
		socket.join(roomID);
	})

	socket.on('addTrack', function(roomID, userID, track) {
		var room = rooms[roomID];

		room.addTrack(userID, track);
	})

	socket.on('bootTrack', function(roomID, userID) {
		var room = rooms[roomID];

		socket.bootTrack(userID);
	})

	socket.on('playTrack', function(roomID, userID) {
		socket.broadcast.to(roomID).emit('onPlay');
	})

	socket.on('pauseTrack', function(roomID, userID) {
		socket.broadcast.to(roomID).emit('onPause');
	})

	socket.on('seekTrack', function(roomID, userID, seekVal) {
		socket.broadcast.to(roomID).emit('onSeek', seekVal);
	})

	socket.on('sendMessage', function(roomID, userID, msg) {
		socket.broadcast.to(roomID).emit('onMessage', msg);
	})

	socket.on('endTrack', function(roomID, userID) {

	})

	socket.on('getRoomState', function(roomID, fn) {
		var room = rooms[roomID];

		socket.emit('onRoomUpdate', room.getRoomState());
	})	
});
*/