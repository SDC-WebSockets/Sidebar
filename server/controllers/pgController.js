const { Price, PreviewVideo, Sidebar, Sale, SidebarSale } = require('../../database/pgDatabase');
const helper = require('./formatHelper.js');

module.exports.getPrice = async (req, res) => {
  console.log('GET request received at /price.', req.query);
  let { courseId } = req.query;
  if (courseId === undefined) {
    courseId = 1;
  }
  await Price.findOne({
    where: { courseId },
    include: {
      model: Sale,
      required: true
    },
  })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      // console.log(result)
      const { courseId, basePrice, saleOngoing } = result.dataValues;
      const { discountPercentage, saleEndDate } = result.dataValues.Sale.dataValues;
      console.log(courseId, basePrice, saleOngoing, saleEndDate);
      const data = {
        courseId,
        basePrice,
        discountPercentage,
        saleEndDate,
        saleOngoing,
      }
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
  await Price.findOne({
    where: { courseId },
    include: [{
      model: Sale,
      include: [Sidebar],
      required: true,
    }],
  })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const { courseId } = result.dataValues;
      const { Sidebars, downloadableResources } = result.dataValues.Sale;
      const data = {
        courseId,
        fullLifetimeAccess: false,
        assignments: false,
        certificateOfCompletion: false,
        downloadableResources,
      };
      for (let i = 0; i < Sidebars.length; i++) {
        const currentContent = Sidebars[i].dataValues.contentType;
        data[currentContent] = true;
      }
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
  await Price.findOne({
    where: { courseId },
    include: [{
      model: Sale,
      include: [Sidebar],
      required: true,
    }],
  })
    .then((result) => {
      if (result === null) {
        throw Error('Database does not contain requested record.');
      }
      const { courseId, basePrice, saleOngoing } = result.dataValues;
      const { discountPercentage, saleEndDate } = result.dataValues.Sale.dataValues;
      const { Sidebars, downloadableResources } = result.dataValues.Sale;

      const priceData = {
        courseId,
        basePrice,
        discountPercentage,
        saleEndDate,
        saleOngoing,
      }
      fullResponse.price = helper.priceDBtoAPI(priceData);

      // console.log(downloadableResources);
      const data = {
        courseId,
        fullLifetimeAccess: false,
        assignments: false,
        certificateOfCompletion: false,
        downloadableResources,
      };
      for (let i = 0; i < Sidebars.length; i++) {
        const currentContent = Sidebars[i].dataValues.contentType;
        data[currentContent] = true;
      }
      fullResponse.sidebar = helper.sidebarDBtoAPI(data);

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
  const newDocument = await helper.transformToDBformat(req.body);
  const newCourseId = newDocument.courseId;
  console.log(newDocument);

  if (typeof newCourseId !== 'number') {
    res.status(400).send('Sorry, invalid request: courseId is not a number');
    res.end();
  } else {
    await Sale.findOrCreate({ where: newDocument.sale })
      .then(async (result, created) =>{
        if (created) {
          await SidebarSale.create(newDocument.junction)
        }
        return Price.findOrCreate({ where: newDocument.price })
      })
      .then((result) => {
        const created = result[1];
        if (!created) {
          throw Error('courseId already exists.');
        }
        console.log('courseId is available!');
      })
      .then(() => PreviewVideo.create(newDocument.previewVideo))
      .then(() => {
        const end = new Date();
        const timeElapsed = end - start;
        console.log('Time Elapsed: ', timeElapsed, 'ms');
        res.status(201).send(req.body);
        res.end();
      })
      .catch((error) => {
        console.warn('Error occured during POST: ', error);
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
  } else {
    const entryToBeDeleted = {};
    await Price.findOne({
      where: { courseId },
      include: [{
        model: Sale,
        include: [Sidebar],
        required: true,
      }],
    })
      .then((result) => {
        if (result === null) {
          throw Error('Database does not contain requested record.');
        }
        const { courseId, basePrice, saleOngoing } = result.dataValues;
        const { discountPercentage, saleEndDate } = result.dataValues.Sale.dataValues;
        const { Sidebars, downloadableResources } = result.dataValues.Sale;

        const priceData = {
          courseId,
          basePrice,
          discountPercentage,
          saleEndDate,
          saleOngoing,
        }
        entryToBeDeleted.price = helper.priceDBtoAPI(priceData);

        // console.log(downloadableResources);
        const data = {
          courseId,
          fullLifetimeAccess: false,
          assignments: false,
          certificateOfCompletion: false,
          downloadableResources,
        };
        for (let i = 0; i < Sidebars.length; i++) {
          const currentContent = Sidebars[i].dataValues.contentType;
          data[currentContent] = true;
        }
        entryToBeDeleted.sidebar = helper.sidebarDBtoAPI(data);

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
        entryToBeDeleted.previewVideo = helper.videoDBtoAPI(data);
        return Price.destroy({ where: { courseId } })
      })
      .then((result) => {
        if (result) {
          console.log(result);
          return PreviewVideo.destroy({ where: { courseId } });
        }
        throw Error('Check Price DB side');
      })
      .then((result) => {
        if (result) {
          const end = new Date();
          const timeElapsed = end - start;
          console.log('Time Elapsed: ', timeElapsed, 'ms');

          res.send(entryToBeDeleted);
          res.end();
        } else {
          throw Error('Check Video DB side');
        }
      })
      .catch((error) => {
        console.warn('Error occured during delete', error);
        res.status(400).send(error.message);
        res.end();
      });
  }
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
    const updatePrice = await helper.updatePriceAPItoDB(updateDoc.price, courseId);
    console.log(updatePrice);
    if (updatePrice.sale !== undefined) {
      await Sale.findOrCreate({ where: updatePrice.sale });
    }
    await Price.update(updatePrice.price, { where: { courseId } })
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
    const updateSidebar = await helper.updateSidebarAPItoDB(updateDoc.sidebar, courseId);
    console.log(updateSidebar);
    if (updateSidebar.sale !== undefined) {
      await Sale.findOrCreate({ where: updateSidebar.sale });
    }
    updateSidebar.sidebar.forEach(async (junctionUpdate) => {
      console.log(junctionUpdate)
      await SidebarSale.create(junctionUpdate)
        .catch((error) => {
          console.warn('Error occured during update (server side): ', error);
          errors.push(`Sidebar error: ${error.message} \n`);
        });
    })
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
