/* eslint-disable no-console */
const shrinkRay = require('shrink-ray-current');
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('../database/database');
const controller = require('./controllers/pgController'); // postgres
// const controller = require('./controllers/cbController'); // couchbase

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

app.get('/price', controller.getPrice);

app.get('/previewVideo', controller.getPreviewVideo);

app.get('/sidebar', controller.getSidebar);

app.use('/course', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Create
app.post('/sidebar/all', controller.add);
// Read
app.get('/sidebar/all', controller.getAll);
// Update
app.put('/sidebar/all', controller.update);
// Delete
app.delete('/sidebar/all', controller.delete);

module.exports = app;
