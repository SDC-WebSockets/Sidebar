const express = require('express');
const app = express();
const port = 3004;
const path = require('path');
const db = require('../database/database.js');

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})

app.get('/populate', (req, res) => {
  db.populateDatabase(100);
  res.send("Database cleared and re-populated.");
})
