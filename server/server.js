const express = require('express');
const app = express();
const db = require('../database/database.js');
const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

app.get('/price', (req, res) => {
  console.log("GET request received at /price.");
  console.log(req.headers);
  db.getPrice(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send("Database does not contain requested record.");
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
    } else if (docs[0] === undefined) {
      res.status(404).send("Database does not contain requested record.");
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
    } else if (docs[0] === undefined) {
      res.status(404).send("Database does not contain requested record.");
    } else {
      res.send(docs[0]);
    }
  });
});

app.use('/course', (req, res) => {
  res.sendFile('index.html', {root: 'client'});
});

module.exports = app;