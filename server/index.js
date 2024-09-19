const express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const io = new Server({
    cors: true,
});
const app = express();

app.use(bodyParser.json());

//to see who's in the room <- map (holds key-value pairs)
// when you need to send a message or perform an action directly to a specific user identified by their email address.
const emailToSocketMapping = new Map();

//reverse mapping
//When you handle the call signaling in WebRTC (e.g., sending a call offer or answering a call), 
//you need to identify both the caller and the callee. Since Socket.IO connections use socket.id 
//to uniquely identify clients, you need to map between users' email addresses and their socket IDs to route messages correctly.
const socketToEmailMapping = new Map();

io.on('connection', socket => {

    console.log('New connection');

    socket.on('join-room', data => {
        const { roomId, emailId } = data;
        console.log(`User ${emailId} joined room ${roomId}`);
        emailToSocketMapping.set(emailId, socket.id);
        socketToEmailMapping.set(socket.id, emailId);
        socket.join(roomId);
        socket.emit('joined-room', { roomId });
        socket.broadcast.to(roomId).emit('user-joined', { emailId });
    });

    socket.on('call-user', (data) => {
        console.log('Recieved call-user event', data);
        const { emailId, offer } = data;
        const fromEmail = socketToEmailMapping.get(socket.id);
        const socketId = emailToSocketMapping.get(emailId);
        console.log(`${fromEmail}, ${socketId}`);
        socket.to(socketId).emit('incoming-call', { from: fromEmail, offer });
    });

    socket.on('call-accepted', (data) => {
        const { emailId, ans } = data;
        const socketId = emailToSocketMapping.get(emailId);
        socket.to(socketId).emit('call-accepted', { ans });
    });
})

app.listen(8000, () => console.log('HTTP server running on PORT 8000'));
io.listen(8001);