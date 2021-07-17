/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const dotenv = require('dotenv');
const pg = require('./pgDatabase.js');

dotenv.config();

// Connecting to the database
pg.openConn();
