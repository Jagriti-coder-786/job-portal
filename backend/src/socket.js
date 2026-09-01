import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from './config/env.js';
import User from './models/User.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (env.NODE_ENV !== 'production') return callback(null, true);

        const allowedOrigins = (process.env.FRONTEND_URL || '')
          .split(',')
          .map(url => url.trim().replace(/\/$/, ''))
          .filter(Boolean);

        const cleanOrigin = origin.replace(/\/$/, '');
        if (
          allowedOrigins.length === 0 ||
          allowedOrigins.includes(cleanOrigin) ||
          cleanOrigin.endsWith('.vercel.app') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1')
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      // First try to get token from handshake auth, then fallback to cookies (if parsed)
      const token = socket.handshake.auth?.token || 
                    (socket.handshake.headers.cookie && getCookie('token', socket.handshake.headers.cookie));

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      if (user.status === 'suspended') {
        return next(new Error('Authentication error: User suspended'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name})`);

    // Join a personal room for user-specific notifications
    socket.join(socket.user._id.toString());
    
    // Broadcast user joined
    socket.broadcast.emit('user_joined', { userId: socket.user._id, name: socket.user.name });

    // Messaging: Join a room specific to an application
    socket.on('join_application_room', (applicationId) => {
      socket.join(`app_${applicationId}`);
      console.log(`User ${socket.user.name} joined room: app_${applicationId}`);
    });

    socket.on('leave_application_room', (applicationId) => {
      socket.leave(`app_${applicationId}`);
    });

    // Handle typing events
    socket.on('typing', ({ applicationId, isTyping }) => {
      socket.to(`app_${applicationId}`).emit('typing', {
        userId: socket.user._id,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};

// Helper function to parse cookies manually from string
const getCookie = (name, cookieString) => {
  const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
};
