import http from 'http';
import app from './app.js';
import { initSocket } from './socket.js';
import connectDB from './config/db.js';
import env from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();

    const server = http.createServer(app);
    
    // Initialize Socket.io
    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
      console.log(`📡 API: http://localhost:${env.PORT}/api`);
      console.log(`❤️  Health: http://localhost:${env.PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
