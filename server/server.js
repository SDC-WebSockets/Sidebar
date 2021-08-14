const shrinkRay = require('shrink-ray-current');
const express = require('express');
const path = require('path');
const cors = require('cors');
// const config = require('./config.js');
const db = require('../database/database');
const controller = require('./controllers/pgController');

const app = express();

app.use(shrinkRay());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());
// const allowedOrigins = config.allowedOrigins;
app.use(cors());
// app.use(cors({ origin: allowedOrigins }));

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

// get all including course content
app.get('/sidebar/allPlus', controller.allPlus);

module.exports = app;

app.get('/loaderio-b5ff1ab5cdd85f8a18e883ea59b6524b/', (req, res) => {
  res.send('loaderio-b5ff1ab5cdd85f8a18e883ea59b6524b');
  res.end();
})