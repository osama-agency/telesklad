const http = require('http');

function checkHealth(port = 3011) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Backend health check passed:', parsed);
          resolve(true);
        } catch (error) {
          console.log('⚠️ Backend responded but invalid JSON:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Backend health check failed:', error.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ Backend health check timeout');
      req.destroy();
      resolve(false);
    });

    req.setTimeout(5000);
    req.end();
  });
}

if (require.main === module) {
  const port = process.argv[2] || 3011;
  checkHealth(port).then((success) => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = checkHealth;
