var app = require('express')();
var http = require('http').Server(app);
var architecture = require('./architecture.js'),
	Room = architecture.Room,
	User = architecture.User;
var io = require('socket.io').listen(http);
var _ = require('underscore')._;
var uuid = require('uuid');

var userIDToUser = {};
var rooms = {};

var roomReaper = setInterval(function() {
	for(var roomID in rooms) {
		if(rooms.hasOwnProperty(roomID)) {
			if(rooms[roomID].isEmpty()) {
				room.closeRoom();
				delete rooms[roomID];
			}
		}	
	}
}, 5*60*1000);

io.sockets.on('connection', function(socket) {
	console.log("A socket with id:" + socket.id + " has connected.");

	socket.on('disconnect', function() {
		var user = userIDToUser[socket.id];
		if(user != null) {
			var room = rooms[user.roomID];

			room.removeUser(user);

			delete userIDToUser[socket.id];

			if(room.isEmpty()) {
				delete rooms[room.id];
				room.closeRoom();
			}
		}
	});

	socket.on('joinRoom', function(roomID, name) {
		var room = rooms[roomID];

		if(!room) {
			socket.emit('onError', 'Room does not exist for roomID.');
			return;
		}
		
		var uName = room.getUniqueName(name);
		var uID = socket.id;

		var newUser = new User(uName, uID, roomID);


		io.to(socket.id).emit('userInfo', newUser.name, newUser.id);

		socket.join(roomID);

		room.addUser(newUser);
		userIDToUser[newUser.id] = newUser;
	})

	socket.on('addTrack', function(roomID, userID, track) {
		var room = rooms[roomID];
		if(!room) {
			socket.emit('onError', 'Room does not exist for roomID.');
			return;
		}

		var user = userIDToUser[userID];
		if(!user) {
			socket.emit('onError', 'User does not exist for userID');
			return;
		}

		// TO DO - non existant room
		room.addTrack(user, track);
	})

	socket.on('bootTrack', function(roomID, userID) {
		var room = rooms[roomID];
		if(!room) {
			socket.emit('onError', 'Room does not exist for roomID.');
			return;
		}

		var user = userIDToUser[userID];
		if(!user) {
			socket.emit('onError', 'User does not exist for userID');
			return;
		}

		room.bootTrack(user);
	})

	socket.on('getRoomState', function(roomID, fn) {
		var room = rooms[roomID];
		if(!room) {
			socket.emit('onError', 'Room does not exist for roomID.');
			return;
		}


		socket.emit('onRoomUpdate', room.getRoomState());
	})	
});

var onRoomChange = function(roomID) {
	return function(roomState, error, userID) {
		if(roomState) {
			io.to(roomID).emit('onRoomUpdate', 
			{ 
					name: roomState.name,
					users: roomState.users.array(),
					currentSongEpoch: roomState.currentSongEpoch,
					trackQueue: roomState.trackQueue.getQueue(),
					bootVotes: roomState.bootVotes.array()
			});
		} else if(error) {
			if(userID) {
				io.to(userID).emit('onError', error);
			} else {
				io.to(roomID).emit('onError', error);
			}
		} else {
			io.to(roomID).emit('onClose');
		}
	};
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/createRoom', function(req, res){
	var uRoomID = uuid.v4();
	var newRoom = new Room('NewRoom', uRoomID, onRoomChange(uRoomID));

	rooms[uRoomID] = newRoom;
	res.redirect('/room/?roomID=' + uRoomID);
})

app.param('roomID', function (req, res, next, roomID) {
	req.room = rooms[roomID];
	next();
}); 

app.get('/room/:roomID', function (req, res) {
	var room = req.room;
	// Pass room to the view and return view to client
	res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
