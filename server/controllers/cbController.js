/* eslint-disable no-console */

module.exports.getPrice('/price', (req, res) => {
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

module.exports.getPreview('/previewVideo', (req, res) => {
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

module.exports.getSidebar('/sidebar', (req, res) => {
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

module.exports.use('/course', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Read
module.exports.get('/sidebar/all', (req, res) => {
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
        saleEndDate,
        saleOngoing,
      } = docs[0];
      const discountedPrice = Math.floor(basePrice * (1 - discountPercentage / 100)) + 0.99;
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
module.exports.post('/sidebar/all', async (req, res) => {
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
module.exports.delete('/sidebar/all', async (req, res) => {
  console.log('DELETE request to /sidebar/all', req.query);
  const courseId = req.query;
  await db.deleteAll(courseId)
    .then((result) => {
      if (result) {
        res.status(204);
      } else {
        throw Error('Check DB side');
      }
      res.end();
    })
    .catch((error) => {
      console.warn('Error occured during delete', error);
      res.status(400).send('Sorry, Error in deleting occured.');
      res.end();
    });
});

// Update
module.exports.put('/sidebar/all', async (req, res) => {
  const updateDoc = req.body;
  const { courseId } = updateDoc;
  console.log('PUT request to /sidebar/all { courseId: ', courseId, ' }');
  const updating = [];
  if (updateDoc.price !== undefined) {
    updating.push('price');
  }
  if (updateDoc.sidebar !== undefined) {
    updating.push('sidebar');
  }
  if (updateDoc.previewVideo !== undefined) {
    updating.push('previewVideo');
  }

  if (typeof courseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
  } else {
    await db.update({ courseId }, updateDoc)
      .then((result) => {
        console.log(result);
        for (let i = 0; i < updating.length; i += 1) {
          if (!result[updating[i]]) {
            throw Error(`Error on DB side for ${updating[i]}`);
          }
        }
        res.status(204);
        res.end();
      })
      .catch((error) => {
        console.warn('Error occured during update (server side): ', error);
      });
  }
});