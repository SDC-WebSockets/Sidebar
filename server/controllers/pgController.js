/* eslint-disable no-console */
const pg = require('../../database/pgDatabase');

module.exports.getPrice = async (req, res) => {
  console.log('GET request received at /price.', req.query);
  await pg.Price.findAll({ where: { course_id: req.query.courseId } })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      }
      const dataReceived = result[0].dataValues;
      console.log(dataReceived);
    })
    .catch((error) => {
      console.warn(error);
    });
  //   , (err, docs) => {
  //   if (err) {
  //     res.send(err);
  //   } else if (docs[0] === undefined) {
  //     res.status(404).send('Database does not contain requested record.');
  //   } else {
  //     res.send(docs[0]);
  //   }
  // });
  res.end();
};

module.exports.getPreviewVideo = async (req, res) => {
  console.log('GET request received at /previewVideo.');
  pg.getPreviewVideo(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send('Database does not contain requested record.');
    } else {
      res.send(docs[0]);
    }
  });
};

module.exports.getSidebar = async (req, res) => {
  console.log('GET request received at /sidebar ', req.query);
  pg.getSidebar(req.query, (err, docs) => {
    if (err) {
      res.send(err);
    } else if (docs[0] === undefined) {
      res.status(404).send('Database does not contain requested record.');
    } else {
      res.send(docs[0]);
    }
  });
};

// Read
module.exports.getAll = async (req, res) => {
  console.log('GET request received at /sidebar/all.');
  const fullResponse = {};
  pg.getPrice(req.query, (err, docs) => {
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
    pg.getSidebar(req.query, (error, sbDocs) => {
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
      pg.getPreviewVideo(req.query, (errorr, pvDocs) => {
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
};

// Create
module.exports.add = async (req, res) => {
  console.log('POST request to /sidebar/all');
  const newDocument = req.body;
  const newCourseId = newDocument.courseId;
  console.log(newDocument);
  // change string date to date type
  newDocument.price.saleEndDate = new Date(newDocument.price.saleEndDate);

  if (typeof newCourseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
  } else {
    pg.getSidebar({ courseId: newCourseId }, async (err, docs) => {
      console.log('return from courseId query:', docs);
      if (err) {
        console.warn('Error Occured :', err);
      } else if (docs[0] === undefined) {
        console.log('courseId is available!');
        await pg.postAll(newDocument)
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
};

// Delete
module.exports.delete = async (req, res) => {
  console.log('DELETE request to /sidebar/all', req.query);
  const courseId = req.query;
  await pg.deleteAll(courseId)
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
};

// Update
module.exports.update = async (req, res) => {
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
    await pg.update({ courseId }, updateDoc)
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
};
