import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { ExpirationWorker } from "./workers/expiration.worker.js";

// Initialize expiration worker
const expirationWorker = new ExpirationWorker();

// Connect to database before starting server
const startServer = async () => {
  await connectDatabase();
  
  // Start expiration worker after database connection
  expirationWorker.start();
  
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(` Environment: ${env.nodeEnv}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  expirationWorker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  expirationWorker.stop();
  process.exit(0);
});

startServer();