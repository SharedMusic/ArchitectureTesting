var should = require('should');
var io = require('socket.io-client');
var http = require('http');
var sets = require('simplesets'),
  Set = sets.Set;
var _ = require('underscore')._;

var socketUrl = 'http://localhost:3000';
var url = 'localhost';
var port = 3000;

var socketOptions ={
	transports: ['websocket'],
	'force new connection': true
};

function requestNewRoom(f) {
	var options = {
		host: url,
		port: 3000,
		path: '/createRoom',
		method: 'GET'
	};

	http.request(options, function(res) {
		res.setEncoding('utf8');

		res.on('data', function(chunk) {
			f(chunk.substring(48));
		});
	}).end();
}


describe("Socket.io Operations", function() {
	it('Should allow one user to join room', function(done) {
		var proposedName = 'testUser';

		var client1 = io.connect(socketUrl, socketOptions);

		client1.on('onRoomUpdate', function(roomState) {
			roomState.users.length.should.equal(1);
			roomState.users[0].name.should.equal(proposedName);

			done();
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName.should.equal(proposedName);
		});

		requestNewRoom(function(roomID) {
			client1.emit('joinRoom', roomID, proposedName);
		});
	});

	it('Should allow multiple users to join room', function(done){
		var proposedName1 = 'testUser1';
		var proposedName2 = 'testUser2';

		var actualName1 = null;
		var userID1 = null;
		var actualName2 = null;
		var userID2 = null;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
			if(actualName1 && userID1) {
				var exists = false;
				_.find(roomState.users, function(key, value) {
					if(key.id == userID1) {
						key.name.should.equal(actualName1);
						return exists = true;
					}
				});
				exists.should.equal(true);

				if(++count == 2) {
					done();
				}
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		client2.on('onRoomUpdate', function(roomState) {
			if(actualName2 && userID2) {
				var exists;
				_.find(roomState.users._items, function(key, value) {
					if(key.id == userID2) {
						key.name.should.equal(actualName2);
						return exists = true;
					}
				});

				if(++count == 2) {
					done();
				}
			}
		});

		client2.on('userInfo', function(actualName, userID) {
			actualName2 = actualName;
			userID2 = userID;
		});

		requestNewRoom(function(roomID) {
			client1.emit('joinRoom', roomID, proposedName1);
			client2.emit('joinRoom', roomID, proposedName2)
		});
	});

	it('Should add user tracks to room\s track queue', function(done){
		var proposedName1 = 'testUser1';
		var trackName = 'newTrack';
		var trackDuration = 60*60*1000;

		var actualName1 = null;
		var userID1 = null;
		var newRoomID = null;

		var client1 = io.connect(socketUrl, socketOptions);

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
			count++;
			console.log('hello');
			if(count == 1) {
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, duration: trackDuration});
			} else if(count == 2) {
				console.log(roomState.trackQueue);
				roomState.trackQueue.length.should.equal(1);
				console.log(roomState.trackQueue[0]);

				roomState.trackQueue[0].title.should.equal(trackName);
				roomState.trackQueue[0].duration.should.equal(trackDuration);
				roomState.trackQueue[0].recommender = proposedName1;

				done();
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			console.log(actualName + ' ' + userID);
			actualName1 = actualName;
			userID1 = userID;
		});


		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);

		});
	});

  it('Should send update to all users when a new song is added to track queue', function(done) {
    var trackName = 'newTrack';
    var trackDuration = 60*60*1000;

    var proposedName1 = 'testUser1';
		var proposedName2 = 'testUser2';

		var actualName1 = null;
		var userID1 = null;
		var actualName2 = null;
		var userID2 = null;

    var newRoomID = null;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);

		var client1 = io.connect(socketUrl, socketOptions);

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
      count++;
			if(count == 2) {
        console.log("adding track");

        // add track after second user is in room
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, duration: trackDuration});
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			console.log(actualName + ' ' + userID);
			actualName1 = actualName;
			userID1 = userID;
		});

    client2.on('onRoomUpdate', function(roomState) {
      if(count > 2) {
				console.log(roomState.trackQueue);
				roomState.trackQueue.length.should.equal(1);
				console.log(roomState.trackQueue[0]);

				roomState.trackQueue[0].title.should.equal(trackName);
				roomState.trackQueue[0].duration.should.equal(trackDuration);
				roomState.trackQueue[0].recommender = proposedName1;

				done();
      }
    });

    client2.on('userInfo', function(actualName, userID) {
      actualName2 = actualName;
      userID2 = userID;
    });

		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);
      client2.emit('joinRoom', newRoomID, proposedName2);
		});

  });

  // TODO
  it('Should send update to all users when a song gets a boot vote from a user', function(done) {
    done()
  });

  // TODO
  it('Should send update to all users when a song gets booted', function(done) {
    done()
  });

  // TODO
  it('Tests to see that roomReaper deletes a user from a room when they have disconnected', function(done) {
    done()
  });



});
