const app = require('./server.js');
const port = 3004;

const serverInstance = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
});

const closeServer = () => {
  serverInstance.close();
}

exports.closeServer = closeServer;