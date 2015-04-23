var should = require('should'),
  architecture = require('../architecture.js'),
  User = architecture.User,
  RoomState = architecture.RoomState,
  Room = architecture.Room,
  Queue = architecture.Queue,
  sets = require('simplesets'),
  Set = sets.Set;
  
describe("Architecture RoomState",function(){

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
    done();
  });

  it('Should raise onChange with RoomState when successfully adding user to room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error) {
        // Assert
        should.not.exist(error);
        roomState.should.not.equal(null);
        roomState.users.size().should.equal(1);
        roomState.users.has(newUser).should.equal(true);
        done();
      };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser, newRoomOnChange);
  });

  it('Should raise onChange with error when failing to add a user to room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var onChangeCount = 0;


    var newRoomOnChange = 
      function(roomState, error) {
        onChangeCount++;

        if(onChangeCount == 2) {
          // Assert
          should.not.exist(roomState);
          error.should.equal('User already exists in room!')
          done();
        }
      };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser, newRoomOnChange);
    newRoom.addUser(newUser, newRoomOnChange);
  });

  it('Should remove user from the room on removeUser', function(done) {
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
    var onChangeCount = 0;

    var newRoomOnChange = 
      function(roomState, error) {
        onChangeCount++;

        if(onChangeCount == 2) {
          // Assert
          should.not.exist(error);
          roomState.should.not.equal(null);
          newRoom._state.users.has(newUser).should.equal(false);
          newRoom._state.users.size().should.equal(0);
          done();
        }
      };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);
    newRoom.addUser(newUser);
    newRoom.removeUser(newUser);
  });


  it('Should raise onChange with error when failing to remove user for room', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;

    var newRoomOnChange = 
      function(roomState, error) {
        // Assert
        should.not.exist(roomState);
        error.should.not.equal(null);
        error.should.equal('User didn\'t exist in room!');
        done();
      };

    var newUserName = 'testName';
    var newUserID = 1;
    var newUser;

    // Act
    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);
    newUser = new User(newUserName, newUserID);
    newRoom.removeUser(newUser);
  });

  it('Should add user vote to bootVotes when votes are insufficient', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error) { };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = 'track1';
    var newTrack2 = 'track2';

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newTrack2);

    // Act
    newRoom.bootTrack(newUser1);

    // Assert
    newRoom._state.bootVotes.size().should.equal(1);

    done();
  });

  it('Should not let user vote twice on same track', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var onChangeCount = 0;

    var newRoomOnChangePass = function() { };

    var newRoomOnChangeFail = function(roomState, error) { 
      // Assert
      should.not.exist(roomState);
      error.should.not.equal(null);
      error.should.equal('User already voted to boot!')
      newRoom._state.bootVotes.size().should.equal(1);
      done();
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChangePass);

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = 'track1';
    var newTrack2 = 'track2';

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
    var newRoomOnChange = 
      function(roomState, error) { };

    var newRoomOnChangeCheck = 
      function(roomState, error) {
        // Assert
        should.not.exist(error);
        roomState.trackQueue.peek().should.equal('track2');
        roomState.bootVotes.size().should.equal(0);
        roomState.trackQueue.getLength().should.equal(1);
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = 'track1';
    var newTrack2 = 'track2';

    newRoom.addTrack(newUser1, newTrack1);
    newRoom.addTrack(newTrack2);

    // Act
    newRoom.bootTrack(newUser1);
    newRoom.bootTrack(newUser2);

    // Assert
    newRoom._state.bootVotes.size().should.equal(0);
    newRoom._state.trackQueue.getLength().should.equal(1);

    done();
  });

it('Should add track to room\'s track queue', function(done) {
    // Arrange
    var newRoomName = 'test';
    var newRoomID = 1;
    var newRoom;
    var newRoomOnChange = 
      function(roomState, error) { };
      
    var newRoomOnChangeCheck = 
      function(roomState, error) {
        should.not.exist(error);
        roomState.trackQueue.peek().should.equal('track1');
        roomState.trackQueue.getLength().should.equal(1);
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChange);

    var newUser1 = new User('user1', 1);
    var newUser2 = new User('user2', 2);
    var newUser3 = new User('user3', 3);

    newRoom.addUser(newUser1);
    newRoom.addUser(newUser2);
    newRoom.addUser(newUser3);

    var newTrack1 = 'track1';

    newRoom._onChange = newRoomOnChangeCheck;

    // Act
    newRoom.addTrack(newUser1, newTrack1);

    // Assert
    newRoom._state.trackQueue.peek().should.equal('track1');
    newRoom._state.trackQueue.getLength().should.equal(1);

    done();
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
      function(roomState, error) {
        // Assert
        should.not.exist(roomState);
        error.should.equal('TrackQueue is empty!');
        done();
    };

    newRoom = new Room(newRoomName, newRoomID, newRoomOnChangeCheck);

    // Act
    newRoom.nextTrack();
  });
});