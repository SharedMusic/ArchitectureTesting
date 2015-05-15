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

	it('Should add user tracks to room\'s track queue', function(done){
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
			if(count == 1) {
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, duration: trackDuration});
			} else if(count == 2) {
				roomState.trackQueue.length.should.equal(1);
				
				roomState.trackQueue[0].title.should.equal(trackName);
				roomState.trackQueue[0].duration.should.equal(trackDuration);
				roomState.trackQueue[0].recommender = proposedName1;

				done();
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});


		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);

		});
	});

	it('Should add user tracks to room\'s track queue', function(done){
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
			if(count == 1) {
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, duration: trackDuration});
			} else if(count == 2) {
				roomState.trackQueue.length.should.equal(1);
				
				roomState.trackQueue[0].title.should.equal(trackName);
				roomState.trackQueue[0].duration.should.equal(trackDuration);
				roomState.trackQueue[0].recommender = proposedName1;

				done();
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});


		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);

		});
	});

	it('Should allow multiple users to add tracks to room\'s track queue', function(done){
		var proposedName1 = 'testUser1';
		var proposedName2 = 'testuser2';

		var trackDuration = 60*60*1000;

		var testTrackQueue = 
		[{ title: 'trackName0', duration: trackDuration},
		 { title: 'trackName1', duration: trackDuration},
		 { title: 'trackName2', duration: trackDuration},
		 { title: 'trackName3', duration: trackDuration},
		 { title: 'trackName4', duration: trackDuration},
		 { title: 'trackName5', duration: trackDuration},
		 { title: 'trackName6', duration: trackDuration},
		 { title: 'trackName7', duration: trackDuration}]

		var trackName = 'newTrack';
		var trackDuration = 60*60*1000;

		var actualName1 = null;
		var userID1 = null;
		var actualName2 = null;
		var userID2 = null;

		var newRoomID = null;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);

		var client1UpdateCount = 0;

		client1.on('onRoomUpdate', function(roomState) {
			client1UpdateCount++;
			if(client1UpdateCount == 2) {
				client1.emit('addTrack', newRoomID, userID1, testTrackQueue[0]);
			} else if(client1UpdateCount == 4) {
				client1.emit('addTrack', newRoomID, userID1, testTrackQueue[2]);
			} else if(client1UpdateCount == 6) {
				client1.emit('addTrack', newRoomID, userID1, testTrackQueue[4]);
			} else if(client1UpdateCount == 8) {
				client1.emit('addTrack', newRoomID, userID1, testTrackQueue[6]);
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		var client2UpdateCount = 0;

		client2.on('onRoomUpdate', function(roomState) {
			client2UpdateCount++;
			if(client2UpdateCount == 2) {
				client1.emit('addTrack', newRoomID, userID2, testTrackQueue[1]);
			} else if(client2UpdateCount == 4) {
				client1.emit('addTrack', newRoomID, userID2, testTrackQueue[3]);
			} else if(client2UpdateCount == 6) {
				client1.emit('addTrack', newRoomID, userID2, testTrackQueue[5]);
			} else if(client2UpdateCount == 8) {
				client1.emit('addTrack', newRoomID, userID2, testTrackQueue[7]);
			}

			if(client2UpdateCount >= 9) {
				for(var i = 0; i < roomState.trackQueue.length; i++) {
					var track = roomState.trackQueue[i];

					track.title.should.equal(testTrackQueue[i].title);

					if(i % 2 == 0) {
						track.recommender.should.equal(actualName1);
					} else {
						track.recommender.should.equal(actualName2);
					}
				}

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

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	count++;
			if(count == 2) {
		    	// add track after second user is in room
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, duration: trackDuration});
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		client2.on('onRoomUpdate', function(roomState) {
		  if(count > 2) {
			roomState.trackQueue.length.should.equal(1);
			
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

	it('Should send update to all users when a song gets a boot vote from a user', function(done) {
		var trackName = 'newTrack';
		var trackDuration = 60*60*1000;

		var proposedName1 = 'testUser1';
		var proposedName2 = 'testUser2';
		var proposedName3 = 'testUser3';

		var actualName1 = null;
		var userID1 = null;
		var actualName2 = null;
		var userID2 = null;
		var actualName3 = null;
		var userID3 = null;

		var newRoomID = null;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);
		var client3 = io.connect(socketUrl, socketOptions);

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	count++;
			if(count == 3) {
				// add track after second user is in room
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, recommender: actualName1, duration: trackDuration});
			} else if(count == 4) {
				// boot track after both users are in room and
				// track has been added to queue
				client1.emit('bootTrack', newRoomID, userID1);
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		var bootUpdatecount = 0;

		client2.on('onRoomUpdate', function(roomState) {
		  if(count == 5) {
		  	roomState.trackQueue.length.should.equal(1);
		  	roomState.bootVotes.length.should.equal(1);
				bootUpdatecount++;

		  	if(bootUpdatecount == 2) {
		  		done();
		  	}
		  }
		});

		client2.on('userInfo', function(actualName, userID) {
		  actualName2 = actualName;
		  userID2 = userID;
		});

		client3.on('onRoomUpdate', function(roomState) {
		  if(count == 5) {
		  	roomState.trackQueue.length.should.equal(1);
		  	roomState.bootVotes.length.should.equal(1);
		  	bootUpdatecount++;

		  	if(bootUpdatecount == 2) {
		  		done();
		  	}
		  }
		});

		client3.on('userInfo', function(actualName, userID) {
			actualName3 = actualName
			userID3 = userID;
		});

		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);
		  	client2.emit('joinRoom', newRoomID, proposedName2);
		  	client3.emit('joinRoom', newRoomID, proposedName3);
		});
	});

	it('Should send update to all users when a song gets booted', function(done) {
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

		var client1UpdateCount = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	client1UpdateCount++;
			if(client1UpdateCount == 2) {
				// add track after second user is in room
				client1.emit('addTrack', newRoomID, userID1, { title: trackName, recommender: actualName1, duration: trackDuration});
			} else if(client1UpdateCount == 3) {
				// boot track after both users are in room and
				// track has been added to queue
				client1.emit('bootTrack', newRoomID, userID1);
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		var client2UpdateCount = 0;

		client2.on('onRoomUpdate', function(roomState) {
			client2UpdateCount++;
		  if(client2UpdateCount == 3) {
		  	roomState.trackQueue.length.should.equal(0);
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

	it('Should remove user from room on disconnect', function(done) {
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

		var count = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	count++;
			if(count == 2) {
				// disconnect after second user is in room
				client1.disconnect();
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});


		var client2Update = 0;
		client2.on('onRoomUpdate', function(roomState) {
		  client2Update++;
		  if(client2Update == 2) {
		  	roomState.users.length.should.equal(1);
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

	it('Should not allow user with non existant userID to add track to room.', function(done) {
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

		var client1UpdateCount = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	client1UpdateCount++;
			if(client1UpdateCount == 2) {
				// disconnect after second user is in room
				client1.emit('addTrack', newRoomID, 1234, {title:'testTrack1', duration:60*60*1000});
			}
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		client1.on('onError', function(error) {
			error.should.equal('User does not exist for userID');
			done();
		});

		var client2Update = 0;
		client2.on('onRoomUpdate', function(roomState) {
		  client2Update++;		  
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

	it('Should add room to server when new room is created.', function(done) {
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

	it('Should remove room from server when all users leave.', function(done) {
		var proposedName = 'testUser';

		var room = null;

		var client1 = io.connect(socketUrl, socketOptions);

		client1.on('onRoomUpdate', function(roomState) {
			client1.disconnect();
			client1.emit('joinRoom', room, proposedName);
		});

		client1.on('onError', function(error) {
			error.should.equal('Room does not exist for roomID.');
			done();
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName.should.equal(proposedName);
		});

		requestNewRoom(function(roomID) {
			room = roomID;
			client1.emit('joinRoom', roomID, proposedName);
		});
	});

	it('Should prevent users from joining rooms that are not created.', function(done) {
		var proposedName = 'testUser';
		var room = roomID;

		var client1 = io.connect(socketUrl, socketOptions);

		client1.on('onRoomUpdate', function(roomState) {
			client1.disconnect();
			client1.emit('joinRoom', room, proposedName);
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName.should.equal(proposedName);
		});

		client1.on('onError', function(error) {
			error.should.equal('Room does not exist for roomID.');
			done();
		});

		requestNewRoom(function(roomID) {
			room = roomID;
			client1.emit('joinRoom', roomID, proposedName);
		});
	});

	/*	
	it('Should prevent users from joining with the same username.', function(done) {
		var proposedName = 'testUser';
		var room = roomID;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);

		client1.on('userInfo', function(actualName, userID) {
			actualName.should.equal(proposedName);
		});

		client2.on('onError', function(error) {
			//error.should.equal('');
			done();
		});

		requestNewRoom(function(roomID) {
			client1.emit('joinRoom', roomID, proposedName);
			client2.emit('joinRoom', roomID, proposedName);
		});
	});
	*/

	/*
	it('Should not allow user with existant userID (but not part of room) to add track to room.', function(done) {
		var trackName = 'newTrack';
		var trackDuration = 60*60*1000;

		var proposedName1 = 'testUser1';
		var proposedName2 = 'testUser2';
		var proposedName3 = 'testuser3';

		var actualName1 = null;
		var userID1 = null;
		var actualName2 = null;
		var userID2 = null;
		var actualName3 = null;
		var userID3 = null;

		var newRoomID = null;

		var client1 = io.connect(socketUrl, socketOptions);
		var client2 = io.connect(socketUrl, socketOptions);
		var client3 = io.connect(socketUrl, socketOptions);

		var client1UpdateCount = 0;

		client1.on('onRoomUpdate', function(roomState) {
		  	
		});

		client1.on('userInfo', function(actualName, userID) {
			actualName1 = actualName;
			userID1 = userID;
		});

		client1.on('onError', function(error) {
			error.should.equal('User doesn\'t exist in room');
			done();
		});

		var client2Update = 0;
		client2.on('onRoomUpdate', function(roomState) {
		  client2Update++;		  
		});

		client2.on('userInfo', function(actualName, userID) {
		  actualName2 = actualName;
		  userID2 = userID;
		});

		client3.on('onRoomUpdate', function(roomState) {
			client1.emit('addTrack', newRoomID, userID3, {title:'testTrack1', duration:60*60*1000});
		});

		client3.on('userInfo', function(actualName, userID) {
			actualName3 = actualName;
			userID3 = userID;
		});

		requestNewRoom(function(roomID) {
			newRoomID = roomID;
			client1.emit('joinRoom', newRoomID, proposedName1);
		  	client2.emit('joinRoom', newRoomID, proposedName2);
			
		  	requestNewRoom(function(roomID) {
				client3.emit('joinRoom', roomID, proposedName3);
			});
		});
	});
	*/
});
