var should = require('should');
var io = require('socket.io-client');
var http = require('http');

var url = 'localhost';
var port = 3000;

var options ={
	transports: ['websocket'],
	'force new connection': true
};


describe("Server Operations", function() {
	it('Should join room', function(done) {
		var client1 = io.connect('http://0.0.0.0:3000', options);
		console.log('Client.id: ' + client1.id);

		client1.on('onRoomUpdate', function(roomState) {
			console.log(roomState.users._items[0].name);
		});

		client1.on('userInfo', function(data) {
   		console.log('hello hello hello');
			done();
		});

		var options = {
			host: url,
			port: 3000,
			path: '/createRoom',
			method: 'GET'
		};
		
		http.request(options, function(res) {
			console.log('STATUS: ' + res.statusCode);
			console.log('HEADERS: ' + JSON.stringify(res.headers));
			res.setEncoding('utf8');

			res.on('data', function(chunk) {
				console.log(chunk);
				//var roomID = JSON.parse(chunk).roomID;
				//console.log('helloworld' + roomID);
				client1.emit('joinRoom', roomID, 'testUser');
			});


		}).end();

	});

});
