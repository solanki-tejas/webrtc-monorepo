import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

export function setupSocketIO(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow all origins
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'], // Explicitly specify transports
  });

  io.on('connection', (socket) => {
    console.log(`New connection established: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      console.log(`User ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);
      socket.to(roomId).emit('user-connected');
    });

    socket.on('offer', (offer, roomId) => {
      console.log(`Offer received for room: ${roomId}`);
      socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', (answer, roomId) => {
      console.log(`Answer received for room: ${roomId}`);
      socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice-candidate', (candidate, roomId) => {
      console.log(`ICE candidate received for room: ${roomId}`);
      socket.to(roomId).emit('ice-candidate', candidate);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Connection closed: ${socket.id}, Reason: ${reason}`);
    });
  });

  io.engine.on('connection_error', (err) => {
    console.log(`Connection error: ${err.req.url}`);
    console.log(`Error code: ${err.code}`);
    console.log(`Error message: ${err.message}`);
    console.log(`Error context: ${JSON.stringify(err.context)}`);
  });

  return io;
}
