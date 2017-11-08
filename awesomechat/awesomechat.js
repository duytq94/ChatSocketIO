var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
var mysql = require('mysql');
var conn = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: '123456',
    database: 'chat_io'
});

conn.connect(function(err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connect database success');
    }
});


http.listen(3000, function(){
    console.log('Server socket chat listening on port: 3000');
});


io.on('connection', function(socket) {




    socket.on('disconnect', function() {
        socket.broadcast.to(socket.room).emit('a_user_leave_room', {
                username: socket.nickname
            });

         var sql = 'UPDATE user_in_plan SET is_online = 0 WHERE email = "' + socket.nickname + '" AND id_plan = "' + socket.room + '"';

         conn.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }

        delete users[socket.nickname];
        console.log("User disconnected")
       });
    });


//----------------------------------------------------------------------------------------------------------------------------------------


    socket.on('send_message', function(content, timestamp, typeMessage) {
        socket.broadcast.to(socket.room).emit('receive_message', {
            from_user: socket.nickname,
            content: content,
            to_group: socket.room,
            time_arrive: timestamp,
            type_message: typeMessage
        });

        var sql = 'INSERT INTO archive(from_user, id_plan, content, time_arrive, type_message) VALUES (' + '"' + socket.nickname + '", "' + socket.room + '", "' + content + '", "' + timestamp + '", "' + typeMessage + '")';
        
        conn.query(sql, function(err) {
            if (err) {
                console.log(err);
            }
        });
     });

//-----------------------------------------------------------------------------------------------------------------------------------------


    socket.on('join_room', function(username, room) {
        if (username in users) {
            console.log("User connect fail");
        } else {
            console.log("User connected");
            socket.room = room;
            socket.join(socket.room);
            socket.nickname = username;
            users[socket.nickname] = socket;

            socket.broadcast.to(socket.room).emit('a_user_join_room', {
                username: socket.nickname
            });

         var sql = 'UPDATE user_in_plan SET is_online = 1 WHERE email = "' + socket.nickname + '" AND id_plan = "' + socket.room + '"';

         conn.query(sql, function(err, result) {
            if (err) {
                console.log(err);
                return;
            }
         });        
        }
    });






});