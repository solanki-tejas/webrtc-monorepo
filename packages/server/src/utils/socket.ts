import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface User {
  id: string;
  socketId: string;
}

const rooms: { [roomId: string]: User[] } = {}; // Keeps track of users in each room

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`New connection established: ${socket.id}`);

    socket.on('join-room', (roomId: string) => {
      console.log(`User ${socket.id} joining room: ${roomId}`);

      // Add user to the room
      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }
      rooms[roomId].push({ id: socket.id, socketId: socket.id });

      socket.join(roomId);

      // Emit the updated user list to the room
      io.to(roomId).emit('user-list-update', getUsersInRoom(roomId));
    });

    socket.on('call-offer', (data) => {
      console.log(`Call offer from ${data.fromUserId} to ${data.targetUserId}`);
      socket.to(data.targetUserId).emit('call-offer', data);
    });

    socket.on('call-answer', (data) => {
      console.log(`Call answer from ${data.fromUserId} to ${data.targetUserId}`);
      socket.to(data.targetUserId).emit('call-answer', data);
    });

    socket.on('ice-candidate', (data) => {
      console.log(`ICE candidate from ${data.fromUserId} to ${data.targetUserId}`);
      socket.to(data.targetUserId).emit('ice-candidate', {
        candidate: data.candidate, // Ensure this is a valid ICE candidate string
        sdpMid: data.sdpMid, // Optional, but good to include if available
        sdpMLineIndex: data.sdpMLineIndex, // Optional, but good to include if available
      });
    });

    socket.on('disconnect', () => {
      console.log(`Connection closed: ${socket.id}`);

      // Remove user from all rooms
      Object.keys(rooms).forEach((roomId) => {
        rooms[roomId] = rooms[roomId].filter((user) => user.socketId !== socket.id);

        // Notify room about the disconnection
        io.to(roomId).emit('user-list-update', getUsersInRoom(roomId));
      });
    });
  });

  io.engine.on('connection_error', (err) => {
    console.log(`Connection error: ${err.req.url}`);
    console.log(`Error code: ${err.code}`);
    console.log(`Error message: ${err.message}`);
    console.log(`Error context: ${JSON.stringify(err.context)}`);
  });

  function getUsersInRoom(roomId: string): User[] {
    return rooms[roomId] || [];
  }

  return io;
}
