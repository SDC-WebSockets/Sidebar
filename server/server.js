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
  console.log('GET request received at /sidebar ', req.query);
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
  db.getPrice(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      fullResponse.price = { notFound: true };
    } else {
      const {
        basePrice,
        discountPercentage,
        discountedPrice,
        saleEndDate,
        saleOngoing,
      } = docs[0];
      fullResponse.price = {
        basePrice,
        discountPercentage,
        discountedPrice,
        saleEndDate,
        saleOngoing,
      };
    }
    db.getSidebar(req.query, (error, sbDocs) => {
      if (error) {
        res.send(error);
      } else if (sbDocs[0] === undefined) {
        fullResponse.sidebar = { notFound: true };
      } else {
        const {
          fullLifetimeAccess,
          accessTypes,
          assignments,
          certificateOfCompletion,
          downloadableResources,
        } = sbDocs[0];
        fullResponse.sidebar = {
          fullLifetimeAccess,
          accessTypes,
          assignments,
          certificateOfCompletion,
          downloadableResources,
        };
      }
      db.getPreviewVideo(req.query, (errorr, pvDocs) => {
        if (errorr) {
          res.send(errorr);
        } else if (pvDocs[0] === undefined) {
          fullResponse.previewVideo = { notFound: true };
        } else {
          const {
            previewVideoImgUrl,
            previewVideoUrl,
          } = pvDocs[0];
          fullResponse.previewVideo = {
            previewVideoImgUrl,
            previewVideoUrl,
          };
          res.send(fullResponse);
        }
      });
    });
  });
});

// Create
app.post('/sidebar/all', async (req, res) => {
  console.log('POST request to /sidebar/all');
  const newDocument = req.body;
  const newCourseId = newDocument.courseId;
  console.log(newDocument);
  // change string date to date type
  newDocument.price.saleEndDate = new Date(newDocument.price.saleEndDate);

  if (typeof newCourseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
  } else {
    db.getSidebar({ courseId: newCourseId }, async (err, docs) => {
      console.log('return from courseId query:', docs);
      if (err) {
        console.warn('Error Occured :', err);
      } else if (docs[0] === undefined) {
        console.log('courseId is available!');
        await db.postAll(newDocument)
          .then((result) => {
            console.log(result);
            res.status(201).send(result);
          })
          .catch((error) => {
            console.warn('Error occured during create (server side): ', error);
          });
      } else {
        res.status(400).send('Sorry, courseId already exists.');
      }
    });
  }
});

// Delete
app.delete('/sidebar/all', async (req, res) => {
  console.log('DELETE request to /sidebar/all', req.query);
  const courseId = req.query;
  await db.deleteAll(courseId)
    .then((result) => {
      console.log('Result from delete: ');
      console.log(result);
      res.status(204);
    })
    .catch((error) => {
      console.warn('Error occured during delete (server side): ', error);
      res.status(400).send('Sorry, Error in deleting occured.');
    });

  res.end();
});

module.exports = app;
