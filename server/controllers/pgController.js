/* eslint-disable no-console */
const { Price, PreviewVideo, Sidebar } = require('../../database/pgDatabase');
const helper = require('./helper.js');

module.exports.getPrice = async (req, res) => {
  console.log('GET request received at /price.', req.query);
  const { courseId } = req.query;
  await Price.findAll({ where: { courseId } })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      console.log(data);
      res.send(helper.price(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

module.exports.getPreviewVideo = async (req, res) => {
  console.log('GET request received at /previewVideo.', req.query);
  const { courseId } = req.query;

  await PreviewVideo.findAll({ where: { courseId } })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      console.log(data);
      res.send(helper.video(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

module.exports.getSidebar = async (req, res) => {
  console.log('GET request received at /sidebar ', req.query);
  const { courseId } = req.query;
  await Sidebar.findAll({ where: { courseId } })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      console.log(data);
      res.send(helper.sidebar(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

// Read
module.exports.getAll = async (req, res) => {
  console.log('GET request received at /sidebar/all.');
  const { courseId } = req.query;
  const fullResponse = {};
  const start = new Date();
  await Price.findAll({ where: { courseId } })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      // console.log('Price: ', data);
      fullResponse.price = helper.price(data);
      return PreviewVideo.findAll({
        where: { courseId },
      });
    })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      // console.log('Preview Video: ', data);
      fullResponse.previewVideo = helper.video(data);
      return Sidebar.findAll({
        where: { courseId },
      });
    })
    .then((result) => {
      if (result.length > 1) {
        throw Error('Expected 1 result, received '.result.length);
      } else if (result.length === 0) {
        throw Error('Database does not contain requested record.');
      }
      const data = result[0].dataValues;
      // console.log('Sidebar: ', data);
      fullResponse.sidebar = helper.sidebar(data);
      const end = new Date();
      const timeElapsed = end - start;
      console.log('Time Elapsed: ', timeElapsed, 'ms');
      fullResponse.millisecsElapsed = timeElapsed;
      res.send(fullResponse);
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

// Create
module.exports.add = async (req, res) => {
  console.log('POST request to /sidebar/all');
  const newDocument = helper.transformToDBformat(req.body);
  const newCourseId = newDocument.courseId;
  console.log(newDocument);

  if (typeof newCourseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
    res.end();
  } else {
    await Price.findAll({ where: { courseId: newCourseId } })
      .then((result) => {
        // console.log('return from courseId query:', result);
        if (result.length > 0) {
          throw Error('courseId already exists.');
        }
        console.log('courseId is available!');
        return Price.create(newDocument.price);
      })
      .then(() => PreviewVideo.create(newDocument.previewVideo))
      .then(() => Sidebar.create(newDocument.sidebar))
      .then(() => {
        res.status(201).send('New Records created at courseId: ', newCourseId);
        res.end();
      })
      .catch((error) => {
        console.warn('Error occured during POST: ', error.message);
        res.status(400).send(`Sorry, error occured: ${error.message}`);
        res.end();
      });
  }
  // res.end();
};

// Delete
module.exports.delete = async (req, res) => {
  console.log('DELETE request to /sidebar/all', req.query);
  const { courseId } = req.query;
  const start = new Date();
  await Price.destroy({ where: { courseId } })
    .then((result) => {
      if (result) {
        console.log(result);
        return PreviewVideo.destroy({ where: { courseId } });
      }
      throw Error('Check Price DB side');
    })
    .then((result) => {
      if (result) {
        return Sidebar.destroy({ where: { courseId } });
      }
      throw Error('Check Video DB side');
    })
    .then((result) => {
      if (result) {
        const end = new Date();
        const timeElapsed = end - start;
        console.log('Time Elapsed: ', timeElapsed, 'ms');
        res.status(204);
        res.end();
      } else {
        throw Error('Check DB side');
      }
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
    await update({ courseId }, updateDoc)
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
