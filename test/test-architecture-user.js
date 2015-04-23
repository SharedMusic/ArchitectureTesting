var should = require('should'),
  architecture = require('../architecture.js'),
  User = architecture.User;
  
describe("Architecture User",function(){

  it('Should populate properties on creating new user',function(done){
    // Arrange
    var newUserName = 'test';
    var newUserID = 1;
    var newUser;

    // Act
    newUser = new User(newUserName, newUserID);

    // Assert
    newUser.name.should.equal(newUserName);
    newUser.id.should.equal(newUserID);
    done();
  });

  it('Should add track to user\'s addedTracks',function(done){
    // Arrange
    var newUserName = 'test';
    var newUserID = 1;
    var myTrack = 'track1';
    var newUser;

    // Act
    newUser = new User(newUserName, newUserID);
    newUser.addTrack(myTrack);

    // Assert
    newUser._addedTracks.length.should.equal(1);
    newUser._addedTracks[0].should.equal(myTrack);
    done();
  });
});