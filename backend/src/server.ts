import { app } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";

// Connect to database before starting server
const startServer = async () => {
//   await connectDatabase();
  
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(` Environment: ${env.nodeEnv}`);
  });
};

startServer();