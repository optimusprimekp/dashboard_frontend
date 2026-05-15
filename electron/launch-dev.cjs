const { spawn } = require('child_process');
const http = require('http');

const DEV_URL = 'http://localhost:5173';
const POLL_INTERVAL = 500;
const TIMEOUT = 60000;

function waitForDevServer() {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + TIMEOUT;
    function poll() {
      http.get(DEV_URL, () => resolve())
        .on('error', () => {
          if (Date.now() > deadline) return reject(new Error(`Timed out waiting for ${DEV_URL}`));
          setTimeout(poll, POLL_INTERVAL);
        });
    }
    poll();
  });
}

waitForDevServer()
  .then(() => {
    const electronBin = require('electron');
    const proc = spawn(electronBin, ['.'], { stdio: 'inherit', cwd: process.cwd() });
    proc.on('close', (code) => process.exit(code ?? 0));
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
