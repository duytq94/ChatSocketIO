
// Khai bao bien
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var mysql = require('mysql');
var conn = mysql.createConnection({
	host	: 'localhost',
	user 	: 'root',
	password: '123456',
	database: 'chat_io'
});

conn.connect(function(err) {
	if (err) throw err.stack;
	console.log('Connect database success');
});

// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/welcome.html');
// });

http.listen(3000, function(){
	console.log('Server socket listening on port: 3000');
});


io.on('connection', function(socket) {

	socket.on('disconnect', function() {
		socket.broadcast.to(socket.room).emit('leave_room', {
				username: socket.nickname,
   	 			message: 'leave room'
   		 	});
		delete users[socket.nickname];
	})

	socket.on('send_message', function(content, timestamp, typeMessage) {
      	socket.broadcast.to(socket.room).emit('receive_message', {
      		from_user: socket.nickname,
    		content: content,
    		to_group: socket.room,
    		time_arrive: timestamp,
    		type_message: typeMessage
      	});

    	var sql = 'INSERT INTO archive(from_user, to_group, content, time_arrive, type_message) VALUES (' + '"' + socket.nickname + '", "' + socket.room + '", "' + content + '", "' + timestamp + '", "' + typeMessage + '")';
    	
    	conn.query(sql, function(err) {
    		if (err) throw err;
        });
 	 });

	socket.on('join_room', function(username, room) {
		if (username in users) {
			console.log("User connect fail");
			return;
		} else {
			console.log("User connected");
			socket.room = room;
			socket.join(socket.room);
			socket.nickname = username;
			users[socket.nickname] = socket;

			socket.broadcast.to(socket.room).emit('a_user_join_room', {
				username: username
   		 	});
		}
	});

});



