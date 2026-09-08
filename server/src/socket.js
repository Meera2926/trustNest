const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Location = require('./models/Location');
const logger = require('./utils/logger');
const { setIO } = require('./services/notification.service');

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Inject IO instance into notification service for real-time alerts
  setIO(io);

  // Authentication middleware for Socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('accessToken=')[1]?.split(';')[0];
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.user.id})`);

    // Join personal room for targeted notifications
    socket.join(`user:${socket.user.id}`);

    // Update user online status
    await User.findByIdAndUpdate(socket.user.id, {
      isOnline: true,
      socketId: socket.id,
      lastSeen: new Date()
    });
    io.emit('user:status', { userId: socket.user.id, status: 'online' });

    // Location Tracking (Live GPS)
    socket.on('location:update', async (data) => {
      try {
        const { coordinates, accuracy, bookingId } = data;
        
        // Save to DB
        await Location.create({
          user: socket.user.id,
          role: socket.user.role,
          location: { type: 'Point', coordinates },
          accuracy,
          booking: bookingId,
          isSharing: true
        });

        // Broadcast to relevant parties (e.g. if in a booking, broadcast to booking room)
        if (bookingId) {
          io.to(`booking:${bookingId}`).emit('location:update', {
            userId: socket.user.id,
            coordinates
          });
        }
      } catch (error) {
        logger.error('Socket location update error:', error);
      }
    });

    // Chat Room Join
    socket.on('chat:join', (conversationId) => {
      socket.join(`chat:${conversationId}`);
    });

    // Typing Indicators
    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(`chat:${conversationId}`).emit('chat:typing', {
        userId: socket.user.id,
        isTyping
      });
    });

    // Booking Room Join (for live status tracking)
    socket.on('booking:join', (bookingId) => {
      socket.join(`booking:${bookingId}`);
    });

    // Disconnect
    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: false,
        socketId: null,
        lastSeen: new Date()
      });
      
      io.emit('user:status', { 
        userId: socket.user.id, 
        status: 'offline', 
        lastSeen: new Date() 
      });
    });
  });

  return io;
};

module.exports = initializeSocket;
