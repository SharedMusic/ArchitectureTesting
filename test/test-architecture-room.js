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

//TODO
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

//TODO
it('Should boot track when track is the last track in queue', function(done) {
    // Arrange

    // Assert
    done();

    // Act
});

//TODO
it('Should boot track when there is not track in the queue', function(done) {
    // Arrange

    // Assert

    // Act
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

//TODO
it('Should add same track twice to room\'s track queue', function(done) {
    // Arrange

    // Assert
    done();

    // Act
  });

//TODO
it('Should add multiple tracks to room\'s track queue', function(done) {
    // Arrange

    // Assert
    done();

    // Act
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
        roomState.trackQueue.peek().should.equal('track2');
        roomState.trackQueue.getLength().should.equal(1);

        done();
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    var newUser1 = new User('user1', 1);

    var newTrack1 = 'track1';
    var newTrack2 = 'track2';

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
});












