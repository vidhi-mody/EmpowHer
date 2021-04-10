#!/usr/bin/env node

/**
 * Module dependencies.
 */

import debug from 'debug';
import http from 'http';
import socketio from 'socket.io';
import mongoAdapter from 'socket.io-adapter-mongo';
import app, { sessionMiddleware } from '../app';
import { ChatRoomRepo, MessageRepo, UserRepo } from '../models';
import { MONGODB_URI } from '../util/secrets';

http.globalAgent.maxSockets = Infinity;

debug('empower:server');

/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  debug('Listening on ' + bind);
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Initialize socket.io for server
 */
const sio = socketio(server);
sio.adapter(mongoAdapter(MONGODB_URI));

sio.use((socket, next) => {
  next(sessionMiddleware(socket.request, socket.request.res, next));
});

async function type(socket: any) {
  try {
    const user = await UserRepo.findOne({
      username: socket.session.user.username,
    });

    socket.to(socket.session.socket.room).emit('typing', {
      username: user?.username,
    });
  } catch (err) {
    throw err;
  }
}

async function sendMessage(socket: any, data: { text: string }) {
  try {
    const message = await MessageRepo.createOne({
      text: data.text,
      by: socket.session.user._id,
    });

    const room = socket.room;

    await ChatRoomRepo.updateOne(room._id, {
      $push: {
        messages: message._id,
      },
    });

    sio.to(socket.session.socket.room).emit('new message', {
      text: data.text,
      by: socket.session.user.username,
      time: message.createdAt,
    });
  } catch (err) {
    throw err;
  }
}

sio.on('connection', async function (socket: any) {
  const { session } = socket.request;

  if (session) {
    socket.session = session;
    socket.join(socket.session.room);
    const room = await ChatRoomRepo.findByIdAndPopulate(session.socket.room);

    if (!room) {
      return socket.disconnect('unauthorized');
    } else {
      socket.room = room;
    }

    socket.on('message', sendMessage);
    socket.on('typing', type);
  }
});
