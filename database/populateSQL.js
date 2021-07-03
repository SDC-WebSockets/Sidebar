/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
// const { Sequelize, Model, DataTypes } = require('sequelize');
const {
  Price,
  PreviewVideo,
  Sidebar,
  openConn,
  closeConn,
} = require('./pSQLdatabase.js');

const weightedTrueGenerator = (percentageChance) => Math.random() * 100 < percentageChance;

const randomFragmentGen = () => Math.floor(Math.random() * 10000);

const createPricing = (courseId) => {
  const minPrice = 50;
  // range * multiplesOf + minPrice would give you the maxPrice = 150
  const range = 20;
  const multiplesOf = 5;
  const basePrice = Math.floor(Math.random() * range) * multiplesOf + minPrice - 0.01;

  const maxDiscount = 85;
  const minDiscount = 5;
  const discountPercentage = Math.floor(Math.random() * (maxDiscount - minDiscount)) + minDiscount;

  const maxSaleDays = 30;
  const saleEndDate = new Date();
  saleEndDate.setDate(Math.floor(Math.random() * maxSaleDays));

  const priceData = {
    courseId,
    basePrice,
    discountPercentage,
    saleEndDate,
    saleOngoing: weightedTrueGenerator(30),
  };

  return priceData;
};

const createPreviewVideoData = (courseId) => {
  const fragment = randomFragmentGen();
  const s3Url = 'https://sdc-websockets-sidebar.s3-us-west-2.amazonaws.com/';
  const previewVideoData = {
    courseId,
    previewVideoImgUrl: `${s3Url}videoImg/${courseId % 1000}.jpg#${fragment}`,
    previewVideoUrl: `${s3Url}video/${courseId % 1000}.mp4#${fragment}`,
  };

  return previewVideoData;
};

const createSidebarData = (courseId) => {
  const sidebarData = {
    courseId,
    fullLifetimeAccess: weightedTrueGenerator(70) ? 'Full lifetime access' : 'Full access during subscription term',
    accessTypes: 'Access on mobile and TV',
    assignments: weightedTrueGenerator(70),
    certificateOfCompletion: weightedTrueGenerator(90),
    downloadableResources: weightedTrueGenerator(90) ? Math.round(Math.random() * 25) : 0,
  };

  return sidebarData;
};

const postgresDataGen = async (numberOfCourses) => {
  console.log(`Populating DB with ${numberOfCourses} records`);
  for (let i = 1; i <= numberOfCourses; i += 1) {
    const newPrice = createPricing(i);
    const newPreviewVideo = createPreviewVideoData(i);
    const newSidebar = createSidebarData(i);
    // console.log(newPrice, newSidebar, newPreviewVideo);
    await Price.create(newPrice)
      .then((result) => {
        console.log('Price saved successfully');
        // console.log(result);
        return PreviewVideo.create(newPreviewVideo);
      })
      .then((result) => {
        console.log('Preview Video saved successfully');
        // console.log(result);
        return Sidebar.create(newSidebar);
      })
      .then((result) => {
        console.log('Preview Video saved successfully');
        // console.log(result);
      })
      .catch((error) => {
        console.warn('Error in saving instance: \n', error);
      });
  }
};

const numRecsGenerating = 10 ** 7;
(async () => Promise.resolve(openConn())
  .then(async () => {
    await postgresDataGen(numRecsGenerating);
    return Promise.all([Price.findAll(), PreviewVideo.findAll(), Sidebar.findAll()]);
  })
  .then((results) => {
    console.log('Requested', numRecsGenerating, 'records to be genereated.');
    console.log('Price, Preview Video, Sidebar DB sizes respectively.');
    results.forEach((result) => {
      console.log(result.length);
    });
    closeConn();
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  })
)();
