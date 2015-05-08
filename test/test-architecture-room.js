var should = require('should'),
  architecture = require('../architecture.js'),
  User = architecture.User,
  RoomState = architecture.RoomState,
  Room = architecture.Room,
  Queue = architecture.Queue,
  sets = require('simplesets'),
  Set = sets.Set;
  
describe("Architecture Room",function(){

  it('Should populate properties on creating new Room',function(done){
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = function() { };

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    // Assert
    newRoom.id.should.equal(newRoomID);
    newRoom._state.should.be.an.instanceof(RoomState);
    newRoom._state.name.should.equal(newRoomName);
    should.not.exist(newRoom._songTimeout);
    newRoom._onChange.should.equal(newRoomOnChange);
    done();
  });

  it('Should add user to the room on addUser', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = function() { };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser, newRoomOnChange);

    // Assert
    newRoom._state.users.has(newUser).should.equal(true);
    newRoom._state.users.size().should.equal(1);
    done();
  });

  it('Should raise onChange with RoomState when successfully adding user to room', function(done) {
    // Arrange
    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(userID);
        should.not.exist(error);
        roomState.should.not.equal(null);
        roomState.users.size().should.equal(1);
        roomState.users.has(newUser).should.equal(true);
        done();
      };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);

    // Act
    newRoom.addUser(newUser, newRoomOnChange);
  });

  it('Should raise onChange with RoomState when successfully adding multiple users to room', function(done) {
    // Arrange
    var newUserName1 = 'testName';
    var newUserID1 = 1;
    var newUser1;

    var newUserName2 = 'testName2';
    var newUserID2 = 2;
    var newUser2;

    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(userID);
        should.not.exist(error);
        roomState.should.not.equal(null);
        roomState.users.size().should.equal(2);
        roomState.users.has(newUser2).should.equal(true);
        done();
      };

    newRoom = new Room(newRoomName, newRoomID, function() {});
    newUser1 = new User(newUserName1, newUserID1);
    newUser2 = new User(newUserName2, newUserID2);
    newRoom.addUser(newUser1);
    newRoom._onChange = newRoomOnChange;

    // Act
    newRoom.addUser(newUser2);
  });

  it('Should raise onChange with error when adding same user twice to a room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(roomState);
        newUserID.should.equal(userID);
        error.should.equal('User already exists in room!');
        done();
      };

    newRoom = new Room(newRoomName, newRoomID, function() {});
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser);
    newRoom._onChange = newRoomOnChange;

    // Act
    newRoom.addUser(newUser);
  });

  it('Should remove user from the room on removeUser', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    newRoom = new Room(newRoomName, newRoomID, function() {});
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser);

    // Act
    newRoom.removeUser(newUser);

    // Assert
    newRoom._state.users.has(newUser).should.equal(false);
    newRoom._state.users.size().should.equal(0);
    done();
  });

  it('Should raise onChange with RoomState when successfully removing user for room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(userID);
        should.not.exist(error);
        roomState.should.not.equal(null);
        newRoom._state.users.has(newUser).should.equal(false);
        newRoom._state.users.size().should.equal(0);
        done();
      };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    newRoom = new Room(newRoomName, newRoomID, function() {});
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser);
    newRoom._onChange = newRoomOnChange;

    // Act
    newRoom.removeUser(newUser);
  });

  it('Should raise onChange with error when removing a non-existent user for room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        newUserID.should.equal(userID);
        should.not.exist(roomState);
        error.should.not.equal(null);
        error.should.equal('User didn\'t exist in room!');
        done();
      };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);

    // Act
    newRoom.removeUser(newUser);
  });

  it('Should raise onChange when removing multiple users that exist from a room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newUserName1 = 'testName';
    var newUserID1 = 1;
    var newUser1;

    var newUserName2 = 'testName2';
    var newUserID2 = 2;
    var newUser2;

    var newRoomOnChange = 
      function(roomState, error, userID) {
        // Assert
        newUserID2.should.equal(userID);
        should.not.exist(roomState);
        error.should.not.equal(null);
        error.should.equal('User didn\'t exist in room!');
        done();
      };

    newRoom = new Room(newRoomName, newRoomID, function() {});
    newUser1 = new User(newUserName1, newUserID1);
    newUser2 = new User(newUserName2, newUserID2);
    newRoom.removeUser(newUser1);
    newRoom._onChange = newRoomOnChange;

    // Act
    newRoom.removeUser(newUser2);
  });

  it('Should add user vote to bootVotes when votes are insufficient', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};
    var newTrack2 = {title: 'track2', recommender: newUser2.name};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);

    var newRoomOnChange = function(roomState, error, userID) {
      // Assert
      roomState.should.not.equal(null);
      should.not.exist(error);
      should.not.exist(userID);
      roomState.bootVotes.size().should.equal(1);
      roomState.trackQueue.getLength().should.equal(2);
      done();
    }

    newRoom._onChange = newRoomOnChange;

    // Act
    newRoom.bootTrack(newUser1);
  });

  it('Should error and not let user vote twice on same track', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var onChangeCount = 0;

    var newRoomOnChangeFail = function(roomState, error) { 
      // Assert
      should.not.exist(roomState);
      error.should.not.equal(null);
      error.should.equal('User already voted to boot!')
      newRoom._state.bootVotes.size().should.equal(1);
      done();
    };

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};
    var newTrack2 = {title: 'track2', recommender: newUser2.name};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser1, newTrack2);

    newRoom.bootTrack(newUser1);
    newRoom._onChange = newRoomOnChangeFail;

    // Act
    newRoom.bootTrack(newUser1);
  });

  it('Should ignore boot track from user not in the room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};
    var newTrack2 = {title: 'track2', recommender: newUser2.name};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser1, newTrack2);

    // Act
    newRoom.bootTrack(newUser3);

    // Assert
    newRoom._state.should.not.equal(null);
    newRoom._state.trackQueue.getLength().should.equal(2);
    newRoom._state.bootVotes.size().should.equal(0);

    done();
  });

  it('Should boot track and clear votes when boot votes are sufficient', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 60*1000};
    var newTrack2 = {title: 'track2', recommender: newUser2.name, duration: 60*1000};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);
    newRoom.bootTrack(newUser1);
    newRoom._onChange = 
      function(roomState, error, userID) {
          // Assert
          should.not.exist(error);
          should.not.exist(userID);
          roomState.should.not.equal(null);
          roomState.trackQueue.peek().title.should.equal('track2');
          roomState.bootVotes.size().should.equal(0);
          roomState.trackQueue.getLength().should.equal(1);
          done();
      };

    // Act
    newRoom.bootTrack(newUser2);
  });

  it('Should clear boot votes when song is done playing', function(done) {
    // Arrange
    this.timeout(10*1000);
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 1*1000};
    var newTrack2 = {title: 'track2', recommender: newUser2.name, duration: 1*1000};
    var newTrack3 = {title: 'track3', recommender: newUser3.name, duration: 1*1000};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);
    newRoom.addTrack(newUser3, newTrack3);

    newRoom.bootTrack(newUser1);

    newRoom._onChange =
      function(roomState, error, userID) {
        newRoom._onChange = function() {};

        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.bootVotes.size().should.equal(0);
        done();
      }
    // Act 
    // Wait for first song to finish playing

  });

  it('Should boot track and clear votes when boot votes are exactly half of room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);
    var newUser4 = new User('user4', 4);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);
    newRoom.addUser(newUser4);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};
    var newTrack2 = {title: 'track2', recommender: newUser2.name};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);
    newRoom.bootTrack(newUser1);
    newRoom._onChange = 
      function(roomState, error, userID) {
          // Assert
          should.not.exist(error);
          should.not.exist(userID);
          roomState.should.not.equal(null);
          roomState.trackQueue.peek().title.should.equal('track2');
          roomState.bootVotes.size().should.equal(0);
          roomState.trackQueue.getLength().should.equal(1);
          done();
      };

    // Act
    newRoom.bootTrack(newUser2);
  });

  it('Should boot track when track is the last track in queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;

    var newRoom = new Room(newRoomName, newRoomID, function() {});
    var newUser = new User('user', 1);
    var newTrack = {title: 'track', recommender: newUser.name};
    
    newRoom.addUser(newUser);
    newRoom.addTrack(newUser, newTrack);
    newRoom._onChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.trackQueue.getLength().should.equal(0);
        roomState.currentSongEpoch.should.equal(-1);
        roomState.bootVotes.size().should.equal(0);
        done();
      };

    // Act
    newRoom.bootTrack(newUser);
});


it('Should boot track when there is no track in the queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;

    var newRoom = new Room(newRoomName, newRoomID, function() {});
    var newUser = new User('user', 1);

    newRoom.addUser(newUser);

    // Act
    newRoom.bootTrack(newUser);

    // Assert
    newRoom._state.should.not.equal(null);
    newRoom._state.trackQueue.getLength().should.equal(0);
    newRoom._state.currentSongEpoch.should.equal(-1);
    newRoom._state.bootVotes.size().should.equal(0);
    done();
});

it('Should boot track after all other songs in queue are booted', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;

    var newRoom = new Room(newRoomName, newRoomID, function() {});
    var newUser = new User('user', 1);
    var newTrack = {title: 'track', recommender: newUser.name};
    
    newRoom.addUser(newUser);
    newRoom.addTrack(newUser, newTrack);
    newRoom.bootTrack(newUser);

    // Act
    newRoom.bootTrack(newUser);

    // Assert
    newRoom._state.should.not.equal(null);
    newRoom._state.trackQueue.getLength().should.equal(0);
    newRoom._state.currentSongEpoch.should.equal(-1);
    newRoom._state.bootVotes.size().should.equal(0);
    done();
});

it('Should add track to room\'s track queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};

    newRoom._onChange = function(roomState, error, userID) {
        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.trackQueue.peek().title.should.equal('track1');
        roomState.trackQueue.getLength().should.equal(1);
        done();
    };

    // Act
    newRoom.addTrack(newUser1, newTrack1);
  });

  it('Should ignore add track from user not in the room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);

    var newTrack1 = {title: 'track1', recommender: newUser1.name};
    var newTrack2 = {title: 'track2', recommender: newUser2.name};

    // Act
    newRoom.addTrack(newUser3, newTrack1);
    newRoom.addTrack(newUser1, newTrack2);

    // Assert
    newRoom._state.should.not.equal(null);
    newRoom._state.trackQueue.getLength().should.equal(1);
    newRoom._state.trackQueue.peek().title.should.equal('track2');
    newRoom._state.bootVotes.size().should.equal(0);
    
    done();
  });

it('Should add same track twice to room\'s track queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 3*60*1000};
    var newTrack2 = {title: 'track1', recommender: newUser1.name, duration: 3*60*1000};
    
    newRoom.addTrack(newUser1, newTrack1);
    newRoom._onChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.trackQueue.getLength().should.equal(2);
        roomState.trackQueue.peek().title.should.equal('track1');
        roomState.trackQueue.dequeue();
        roomState.trackQueue.peek().title.should.equal('track1');
        done();
      };

    // Act
    newRoom.addTrack(newUser1, newTrack2);
  });


it('Should add multiple tracks to room\'s track queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 3*60*1000};
    var newTrack2 = {title: 'track2', recommender: newUser2.name, duration: 3*60*1000};
    var newTrack3 = {title: 'track3', recommender: newUser3.name, duration: 3*60*1000};
    
    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);
    newRoom._onChange = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.trackQueue.getLength().should.equal(3);
        roomState.trackQueue.peek().title.should.equal('track1');
        roomState.trackQueue.dequeue();
        roomState.trackQueue.peek().title.should.equal('track2');
        roomState.trackQueue.dequeue();
        roomState.trackQueue.peek().title.should.equal('track3');
        done();
      };

    // Act
    newRoom.addTrack(newUser3, newTrack3);
  });

it('Should dequeue front song of multi-song queue on nextTrack', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error) { };
      
    var newRoomOnChangeCheck = 
      function(roomState, error) {
        // Assert
        should.not.exist(error);
        roomState.trackQueue.peek().title.should.equal('track2');
        roomState.trackQueue.getLength().should.equal(1);

        done();
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    var newUser1 = new User('user1', 1);

    var newTrack1 = { title: 'track1', duration: 60*60*1000 };
    var newTrack2 = { title: 'track2', duration: 60*60*1000 };

    newRoom.addUser(newUser1);

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser1, newTrack2);

    newRoom._onChange = newRoomOnChangeCheck;

    // Act
    newRoom.nextTrack();
  });

  it('Should onChange error when dequeueing empty room trackQueue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newRoomOnChangeCheck = 
      function(roomState, error, userID) {
        // Assert
        should.not.exist(roomState);
        should.not.exist(userID);
        error.should.equal('TrackQueue is empty!');
        done();
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChangeCheck);

    // Act
    newRoom.nextTrack();
  });

  it('Should skip to the next song when song is done playing', function(done) {
    // Arrange
    this.timeout(10*1000);
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 1*1000};
    var newTrack2 = {title: 'track2', recommender: newUser2.name, duration: 1*1000};
    var newTrack3 = {title: 'track3', recommender: newUser3.name, duration: 1*1000};

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newUser2, newTrack2);
    newRoom.addTrack(newUser3, newTrack3);

    var count = 0;
    newRoom._onChange =
      function(roomState, error, userID) {
        count++;

        if(count == 1) {
            // Assert
            should.not.exist(error);
            should.not.exist(userID);
            roomState.should.not.equal(null);
            roomState.trackQueue.peek().title.should.equal('track2');
            roomState.trackQueue.getLength().should.equal(2);
            done();
        }
      }
    // Act 
    // Wait for first song to finish playing

  });
  
  it('Should stop when last song is done playing', function(done) {
    // Arrange
    this.timeout(10*1000);
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    newRoom = new Room(newRoomName, newRoomID, function() {});

    var newUser1 = new User('user1', 1);

    newRoom.addUser(newUser1);

    var newTrack1 = {title: 'track1', recommender: newUser1.name, duration: 1*1000};

    newRoom.addTrack(newUser1, newTrack1);

    newRoom._onChange =
      function(roomState, error, userID) {
        // Assert
        should.not.exist(error);
        should.not.exist(userID);
        roomState.should.not.equal(null);
        roomState.trackQueue.getLength().should.equal(0);
        roomState.bootVotes.size().should.equal(0);
        roomState.currentSongEpoch.should.equal(-1);
        done();
      }
    // Act 
    // Wait for song to finish playing
  });
});
