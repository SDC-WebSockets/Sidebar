const express = require('express');
const app = express();
const port = 3004;
const path = require('path');
const db = require('../database/database.js');

app.use(express.static('public'));
app.use(express.json());

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
});

app.get('/populate', (req, res) => {
  db.populateDatabase(100);
  res.send("Database cleared and re-populated.");
});

app.get('/price', (req, res) => {
  db.getPrice(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

app.get('/previewVideo', (req, res) => {
  db.getPreviewVideo(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});

app.get('/sidebar', (req, res) => {
  db.getSidebar(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs);
    }
  });
});