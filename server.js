var static = require('node-static');
var WebSocketServer = require('ws').Server;

var clients = [];
var messages = [];

// static content
var fileServer = new static.Server('./public');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}).listen(8080);

// socket server
var ws = new WebSocketServer({port: 8181});
ws.on('connection', function(client) {
    clients.push(client);
    var index = clients.length - 1
    console.log('> connected client', index);

    // send all existing messages to client
    client.send(JSON.stringify(messages));

    client.on('message', function(data) {
        console.log('> message - client', index, '-', data);
        var message = {
            timestamp: (new Date()).getTime(),
            content: data
        };
        messages.push(message);
        // notify all clients
        var json = JSON.stringify([message]);
        for(var i in clients) {
            clients[i].send(json);
        }
    });

    client.on('close', function() {
        console.log('> disconnected client', index);
        clients.splice(index, 1);
    });
});

console.log('> web server on http://0.0.0.0:8080');
console.log('> socket server on ws://0.0.0.0:8181');
