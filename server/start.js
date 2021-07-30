require('newrelic');
const app = require('./server.js');
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3004;
const host = process.env.PRIVATE_HOST || 'localhost'

const serverInstance = app.listen(port, host, () => {
  console.log(`Listening at ${host}:${port}`)
});

const closeServer = () => {
  serverInstance.close();
};

exports.closeServer = closeServer;