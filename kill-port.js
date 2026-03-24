const net = require('net');
const { exec } = require('child_process');

// Try to find and kill process on port 5001
const port = 5001;

exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
  if (error || !stdout.trim()) {
    console.log(`Port ${port} is already free`);
    process.exit(0);
  }

  const lines = stdout.trim().split('\n');
  const pids = new Set();
  
  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length > 0) {
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    }
  });

  if (pids.size === 0) {
    console.log(`Port ${port} is already free`);
    process.exit(0);
  }

  console.log(`Found processes on port ${port}: ${Array.from(pids).join(', ')}`);
  
  // Try to kill each PID
  pids.forEach(pid => {
    exec(`taskkill /PID ${pid} /F`, (err) => {
      if (err) {
        console.log(`Warning: Could not kill ${pid} - trying PowerShell method`);
        // Try PowerShell as fallback
        exec(`powershell -NoProfile -Command "Get-Process -Id ${pid} -ErrorAction SilentlyContinue | Stop-Process -Force"`, (psErr) => {
          if (psErr) {
            console.error(`Failed to kill PID ${pid}: ${err.message}`);
          } else {
            console.log(`Killed PID ${pid} via PowerShell`);
          }
        });
      } else {
        console.log(`Killed PID ${pid}`);
      }
    });
  });

  setTimeout(() => {
    console.log('Process cleanup initiated');
    process.exit(0);
  }, 1000);
});
