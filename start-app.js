// Simple script to start the application
import { exec } from 'child_process';
console.log('Starting application server...');
const server = exec('npx tsx server/index.ts');
server.stdout.on('data', (data) => {
  console.log(data);
});
server.stderr.on('data', (data) => {
  console.error(data);
});