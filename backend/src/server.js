import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();
const httpServer = http.createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: env.corsOrigin || '*',
    methods: ['GET', 'POST']
  }
});

async function leaveVoiceRoom(socket, serverId) {
  const roomId = serverId ? `voice:${serverId}` : null;
  if (!roomId) return;
  socket.leave(roomId);
  socket.to(roomId).emit('voice-user-left', socket.id);
}

io.on('connection', (socket) => {
  socket.on('voice-join', async ({ serverId, userId }) => {
    if (!serverId) return;
    const roomId = `voice:${serverId}`;
    socket.data.userId = userId || 'guest';
    socket.data.serverId = serverId;

    await socket.join(roomId);
    const sockets = await io.in(roomId).fetchSockets();
    const users = sockets
      .filter((s) => s.id !== socket.id)
      .map((s) => ({ id: s.id, userId: s.data.userId || 'guest' }));

    socket.emit('voice-users', users);
    socket.to(roomId).emit('voice-user-joined', { id: socket.id, userId: socket.data.userId });
  });

  socket.on('voice-leave', async ({ serverId }) => {
    const activeServerId = serverId || socket.data.serverId;
    await leaveVoiceRoom(socket, activeServerId);
  });

  socket.on('voice-signal', ({ to, data }) => {
    if (!to) return;
    io.to(to).emit('voice-signal', { from: socket.id, data });
  });

  socket.on('disconnect', () => {
    leaveVoiceRoom(socket, socket.data.serverId);
  });
});

httpServer.listen(env.port, () => {
  console.log(`API running: http://localhost:${env.port}`);
});
