import { createApp } from './app.js';
import { config } from './config.js';
import { openDatabase } from './database/connection.js';
import { migrateDatabase } from './database/migrate.js';

const database = openDatabase(config.databasePath);
migrateDatabase(database);
const app = createApp(database);
const server = app.listen(config.port, config.host, () => {
  console.log(`Seduh API: http://${config.host}:${config.port}`);
});

function stopServer() {
  server.close(() => {
    database.close();
  });
}

function handleStartupError(error) {
  console.error(`Server belum bisa berjalan: ${error.message}`);
  database.close();
  process.exitCode = 1;
}

server.on('error', handleStartupError);
process.once('SIGINT', stopServer);
process.once('SIGTERM', stopServer);
