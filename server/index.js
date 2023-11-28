const PORT = 5000

const io = require("socket.io")(PORT, {
  cors: {
    origin: "*",
  },
  // secure: true, 
});
const rooms = {};

io.on('connection', socket => {
    
  socket.on('join room', roomId => {
    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    rooms[roomId].push(socket.id);
    socket.join(roomId);

    // Notify all users in the room about the new user
    socket.to(roomId).emit('new user', {participants:rooms[roomId]});
    // socket.emit('new user', {participants:rooms[roomId]});
  });

  socket.on('offer', ({ to, offer, roomId }) => {
    io.to(to).emit('offer', { from:socket.id ,offer:offer, participants:rooms[roomId]});
    console.log(to)
  });

  socket.on('answer', ({ to, answer, uniqueId }) => {
    io.to(to).emit('answer', { from: socket.id, answer,uniqueId });
  });
  console.log('connected')
  socket.on('disconnect', () => {
    for (const roomId in rooms) {
      const index = rooms[roomId].indexOf(socket.id);
      if (index !== -1) {
        rooms[roomId].splice(index, 1);
        socket.to(roomId).emit('user disconnected', socket.id);
        break;
      }
    }
  });
});
