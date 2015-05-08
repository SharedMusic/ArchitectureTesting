var DEBUG = true;
var sets = require('simplesets');
var _ = require('underscore')._;

/**
 *	TODO comment user
 */
exports.User = function (p_name, p_id, p_roomID) {
	this.name = p_name;
	this.id = p_id;
	this.roomID = p_roomID;
	this._addedTracks = [];
}
var UserPrototype = {
	// Adds a track to the list of user added tracks
	addTrack: function(track) {
		this._addedTracks.push(track);
	}
}
exports.User.prototype = UserPrototype;

/**
 * RoomState represents the current state of a room 
 * and is intended to be passed to clients for them
 * to update the views accordingly.
 * @constructor
 */
var RoomState = function (p_name) {
	this.name = p_name;
	this.users = new sets.Set();
	this.currentSongEpoch = -1;
	this.trackQueue = new Queue();
	this.bootVotes = new sets.Set();
}
exports.RoomState = RoomState;

/**
 * Room handles all relevant information for an individual
 * SharedMusic session and any operations that can be
 * performed to change session's state. 
 *  
 * @constructor
 */
exports.Room = function(p_name, p_id, p_onChange) {
	/**
	 *	The number of milliseconds between track being moved
	 *	to the head of the queue and when client should begin
	 *	playing that track.
	 */
	this._loadDelay = 4000;

	// Public
	this.id = p_id;
	this._state = new RoomState(p_name);
	this._onChange = p_onChange;
	this._songTimeout = null;
}
var RoomPrototype = {

	// Adds a user to the room
	addUser: function (user) {
		if(this._state.users.has(user)) {
			this._onChange(null, 'User already exists in room!', user.id);
		} else {
			this._state.users.add(user);
			this._onChange(this._state, null, null);
		}
	},

	// Removes a user from the room
	removeUser: function (user) {
		if(this._state.users.has(user)) {
			this._state.users.remove(user);
			this._onChange(this._state, null, null);
		} else {
			this._onChange(null, 'User didn\'t exist in room!', user.id);
		}
	},

	// Adds user's vote to boot the current song
	// if there is a song in the track queue
	// If the boot count gets over ceil(half of the
	// users in the room) then the next track
	// is requested and boot votes are cleared.
	bootTrack: function (user) {
		if(!this._checkUserExistsInRoom(user)) {
			return;
		}

		if(this._state.bootVotes.has(user.id)) {
			this._onChange(null, 'User already voted to boot!', user.id);
		} else if(!this._state.trackQueue.isEmpty()) {


			this._state.bootVotes.add(user.id);
			if(this._state.bootVotes.size() >=
			   Math.ceil(this._state.users.size() / 2)) {
			   	clearTimeout(this._songTimeout);
				this.nextTrack();
			} else {
				this._onChange(this._state, null, null);
			}
		}
	},

	// Adds the track to the room's track queue
	addTrack: function (user, track) {
		if(!this._checkUserExistsInRoom(user)) {
			return;
		}

		track.recommender = user.name;
		this._state.trackQueue.enqueue(track);
		user.addTrack(track);
		if (this._state.currentSongEpoch == -1) {
			if (DEBUG && this._state.trackQueue.getLength() != 1) {
				console.log('track queue was wrong length');
			}
			this._playSong(track);
		}

		this._onChange(this._state, null, null);
	},

	_playSong: function(track) {			//TODO refactor this ish
		this._state.currentSongEpoch = (new Date).getTime() + this._loadDelay;
		var that = this;
		this._songTimeout = setTimeout(function(){that.nextTrack()}, track.duration + this._loadDelay);
	},

	_checkUserExistsInRoom: function(user) {
		if(!this._state.users.has(user)) {
			this._onChange(null, 'User doesn\'t exist in room', user.id);

			return false;
		}

		return true;
	},

	// Removes the head of the room's track queue
	// and clears any votes for the song.
	nextTrack: function () {
		this._state.bootVotes = new sets.Set();

		if(this._state.trackQueue.isEmpty()) {
			this._onChange(null, 'TrackQueue is empty!', null);
		} else {
			this._state.trackQueue.dequeue();
			if (this._state.trackQueue.isEmpty()) {
				this._state.currentSongEpoch = -1;
			} else {
				this._playSong(this._state.trackQueue.peek());
			}
			this._onChange(this._state, null, null);
		}
	},

	isEmpty: function() {
		return this._state == null || this._state.users.size() == 0;
	},

	closeRoom: function() {
		this._state = null;
		this._onChange(null, null, null);
	},

	getUniqueName: function(possName) {
		var exists = false;
		var proposedName = possName;

		_.find(this._state.users.array(), function(key, value) {
			if(key.name.toLowerCase() === possName.toLowerCase()) {
				return exists = true;
			}
		});

		if(exists) {
			var tries = 0;
			do {
				tries++;
				var seed = Math.floor(Math.random()*1001);
				proposedName = possName + seed;

				_.find(this._state.users.array(), function(key, value) {
					if(key.name.toLowerCase() === proposedName.toLowerCase()) {
						return exists = true;
					}
				});				
			} while(exists && tries < 5);
			if (tries >= 5) {
				proposedName = "anony-mouse user";
			}
		}

		return proposedName;
	},

	getRoomState: function() {			//TODO pending delete after finished implementation
		return this._state;
	}
}
exports.Room.prototype = RoomPrototype;

function Queue() {
  var queue  = [];
  var offset = 0;

  this.getLength = function(){
    return (queue.length - offset);
  }

  this.isEmpty = function(){
    return (queue.length == 0);
  }

  this.enqueue = function(item){
    queue.push(item);
  }

  this.dequeue = function(){
    if (queue.length == 0) return undefined;

    var item = queue[offset];

    if (++ offset * 2 >= queue.length){
      queue  = queue.slice(offset);
      offset = 0;
    }

    return item;
  }

  this.getQueue = function(){
  	return queue.slice(offset, queue.length);
  }

  this.peek = function(){
    return (queue.length > 0 ? queue[offset] : undefined);
  }
}

exports.Queue = Queue;