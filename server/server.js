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

app.get('/price', (req, res) => {
  console.log("GET request received at /price.");
  db.getPrice(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs[0]);
    }
  });
});

app.get('/previewVideo', (req, res) => {
  console.log("GET request received at /previewVideo.");
  db.getPreviewVideo(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs[0]);
    }
  });
});

app.get('/sidebar', (req, res) => {
  console.log("GET request received at /sidebar.");
  db.getSidebar(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else {
      res.send(docs[0]);
    }
  });
});