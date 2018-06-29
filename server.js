var server = require('http').createServer()
var  io = require('socket.io')(server)
io.on('connection', function(client) {
    var role = client.handshake.query.role
    client.on('draw', function(data) {
        if(role === 'teacher') {
            client.broadcast.emit('teacherDraw', data)
        }
    })
    client.on('drawBeign', function(data) {
        if(role === 'teacher') {
            client.broadcast.emit('teacherDrawBeign', data)
        }
    })
    client.on('disconnet', function(data) {
        console.log(data)
    })
})

server.listen(8006)