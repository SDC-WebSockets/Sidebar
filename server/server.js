/* eslint-disable no-console */
const shrinkRay = require('shrink-ray-current');
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('../database/database.js');

const app = express();

app.use(shrinkRay());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
app.use(cors());

app.get('*.js', (req, res, next) => {
  if (req.header('Accept-Encoding').includes('br')) {
    req.url += '.br';
    console.log(req.header('Accept-Encoding'));
    res.set('Content-Encoding', 'br');
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
  } else if (req.header('Accept-Encoding').includes('gzip')) {
    req.url += '.gz';
    console.log(req.header('Accept-Encoding'));
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
  }
  next();
});

app.get('/price', (req, res) => {
  console.log('GET request received at /price.');
  console.log(req.headers);
  db.getPrice(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send('Database does not contain requested record.');
    } else {
      res.send(docs[0]);
    }
  });
});

app.get('/previewVideo', (req, res) => {
  console.log('GET request received at /previewVideo.');
  db.getPreviewVideo(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send('Database does not contain requested record.');
    } else {
      res.send(docs[0]);
    }
  });
});

app.get('/sidebar', (req, res) => {
  console.log('GET request received at /sidebar.');
  db.getSidebar(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send('Database does not contain requested record.');
    } else {
      res.send(docs[0]);
    }
  });
});

app.use('/course', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Read
app.get('/sidebar/all', (req, res) => {
  console.log('GET request received at /sidebar/all.');
  const fullResponse = {};
  db.getSidebar(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      // res.status(404).send('Database does not contain requested record.');
      fullResponse.sidebar({ notFound: true });
    } else {
      fullResponse.sidebar(docs[0]);
    }
  });
  db.getPreviewVideo(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      // res.status(404).send('Database does not contain requested record.');
      fullResponse.previewVideo({ notFound: true });
    } else {
      fullResponse.previewVideo(docs[0]);
    }
  });
});

module.exports = app;
