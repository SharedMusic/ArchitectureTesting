var should = require('should'),
  architecture = require('../architecture.js'),
  RoomState = architecture.RoomState,
  Queue = architecture.Queue,
  sets = require('simplesets'),
  Set = sets.Set;
  
describe("Architecture RoomState",function(){

  it('Should populate properties on creating new RoomState',function(done){
    // Arrange
    var newRoomName = 'test';
    var newRoomState;

    // Act
    newRoomState = new RoomState(newRoomName);

    // Assert
    newRoomState.name.should.equal(newRoomName);
    newRoomState.users.should.be.an.instanceof(Set);
    newRoomState.users.size().should.equal(0);
    newRoomState.currentSongEpoch.should.equal(-1);
    newRoomState.trackQueue.should.be.an.instanceof(Queue);
    newRoomState.trackQueue.isEmpty().should.equal(true);
    newRoomState.bootVotes.should.be.an.instanceof(Set);
    newRoomState.bootVotes.size().should.equal(0);
    done();
  });
});