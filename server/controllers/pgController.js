/* eslint-disable no-console */
const { Price, PreviewVideo, Sidebar } = require('../../database/pgDatabase');
const helper = require('./formatHelper.js');

module.exports.getPrice = async (req, res) => {
  console.log('GET request received at /price.', req.query);
  let { courseId } = req.query;
  if (courseId === undefined) {
    courseId = 1;
  }
  await Price.findOne({ where: { courseId } })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      console.log(data);
      res.send(helper.priceDBtoAPI(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

module.exports.getPreviewVideo = async (req, res) => {
  console.log('GET request received at /previewVideo.', req.query);
  let { courseId } = req.query;
  if (courseId === undefined) {
    courseId = 1;
  }
  await PreviewVideo.findOne({ where: { courseId } })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      console.log(data);
      res.send(helper.videoDBtoAPI(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

module.exports.getSidebar = async (req, res) => {
  console.log('GET request received at /sidebar ', req.query);
  let { courseId } = req.query;
  if (courseId === undefined) {
    courseId = 1;
  }
  await Sidebar.findOne({ where: { courseId } })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      console.log(data);
      res.send(helper.sidebarDBtoAPI(data));
    })
    .catch((error) => {
      console.warn(error);
      res.status(404).send(error.message);
    });
};

// Read
module.exports.getAll = async (req, res) => {
  console.log('GET request received at /sidebar/all.');
  let { courseId } = req.query;
  if (courseId === undefined) {
    courseId = 1;
  }
  const fullResponse = {};
  const start = new Date();
  await Price.findOne({ where: { courseId } })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      // console.log('Price: ', data);
      fullResponse.price = helper.priceDBtoAPI(data);
      return PreviewVideo.findOne({
        where: { courseId },
      });
    })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      // console.log('Preview Video: ', data);
      fullResponse.previewVideo = helper.videoDBtoAPI(data);
      return Sidebar.findOne({
        where: { courseId },
      });
    })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const data = result.dataValues;
      // console.log('Sidebar: ', data);
      fullResponse.sidebar = helper.sidebarDBtoAPI(data);
      const end = new Date();
      const timeElapsed = end - start;
      console.log('Time Elapsed: ', timeElapsed, 'ms');
      fullResponse.timeElapsed = timeElapsed;
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
  const start = new Date();
  const newDocument = helper.transformToDBformat(req.body);
  const newCourseId = newDocument.courseId;
  // console.log(newDocument);

  if (typeof newCourseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
    res.end();
  } else {
    await Price.findOne({ where: { courseId: newCourseId } })
      .then((result) => {
        // console.log('return from courseId query:', result);
        if (result !== null) {
          throw Error('courseId already exists.');
        }
        console.log('courseId is available!');
        return Price.create(newDocument.price);
      })
      .then(() => PreviewVideo.create(newDocument.previewVideo))
      .then(() => Sidebar.create(newDocument.sidebar))
      .then(() => {
        const end = new Date();
        const timeElapsed = end - start;
        console.log('Time Elapsed: ', timeElapsed, 'ms');
        res.status(201).send(req.body);
        res.end();
      })
      .catch((error) => {
        console.warn('Error occured during POST: ', error.message);
        res.status(400).send(`Sorry, error occured: ${error.message} \n`);
        res.end();
      });
  }
};

// Delete
module.exports.delete = async (req, res) => {
  const start = new Date();
  console.log('DELETE request to /sidebar/all', req.query);
  let { courseId } = req.query;
  if (courseId === undefined) {
    res.status(404).send(`Sorry, Error in deleting occured -- courseId = ${courseId} is not valid`);
      res.end();
  }
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
        res.send({ timeElapsed });
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
  const start = new Date();
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
  const errors = [];
  if (typeof courseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
    res.end();
  }
  if (updating.includes('price')) {
    const updatePrice = helper.updatePriceAPItoDB(updateDoc.price);
    console.log(updatePrice);
    await Price.update(updatePrice, { where: { courseId } })
      .catch((error) => {
        console.warn('Error occured during update (server side): ', error);
        errors.push(`price error: ${error.message} \n`);
      });
  }
  if (updating.includes('previewVideo')) {
    const updateVideo = helper.updateVideoAPItoDB(updateDoc.previewVideo);
    console.log(updateVideo);
    await PreviewVideo.update(updateVideo, { where: { courseId } })
      .catch((error) => {
        console.warn('Error occured during update (server side): ', error);
        errors.push(`PreviewVideo error: ${error.message} \n`);
      });
  }
  if (updating.includes('sidebar')) {
    const updateSidebar = helper.updateSidebarAPItoDB(updateDoc.sidebar);
    console.log(updateSidebar);
    await Sidebar.update(updateSidebar, { where: { courseId } })
      .catch((error) => {
        console.warn('Error occured during update (server side): ', error);
        errors.push(`Sidebar error: ${error.message} \n`);
      });
  }
  const end = new Date();
  const timeElapsed = end - start;
  console.log('Time Elapsed: ', timeElapsed, 'ms');
  if (errors.length > 0) {
    res.status(400).send(errors);
  } else {
    res.send({ timeElapsed });
  }
  res.end();
};
