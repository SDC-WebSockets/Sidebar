const express = require('express');
const app = express();
const path = require('path');
const db = require('../database/database.js');

app.use(express.static('public'));
app.use(express.json());

app.get('/price', (req, res) => {
  console.log("GET request received at /price.");
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

module.exports = app;