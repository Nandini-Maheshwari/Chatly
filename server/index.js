const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server();
const app = express();

app.arguments(bodyParser.json());

io.on('connection', socket => {
    
})

app.listen(8000, () => console.log('HTTP server running on PORT 8000'));
io.listen(8001);