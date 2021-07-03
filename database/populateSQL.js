/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
const { Sequelize, Model, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
const {
  Price,
  PreviewVideo,
  Sidebar,
  openConn,
  closeConn,
} = require('./pSQLdatabase.js');

dotenv.config();

const weightedTrueGenerator = (percentageChance) => Math.random() * 100 < percentageChance;

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
  const videoIndex = Math.floor(Math.random() * 10);

  const previewVideoData = {
    courseId,
    previewVideoImgUrl: `${process.env.ASSET_URL}/previewVideoImg${videoIndex}.jpg`,
    previewVideoUrl: `${process.env.ASSET_URL}/previewVideo${videoIndex}.mp4`,
  };

  return previewVideoData;
};

const createSidebarData = (courseId) => {
  const sidebarData = {
    courseId,
    fullLifetimeAccess: randomDecider(70) ? 'Full lifetime access' : 'Full access during subscription term',
    accessTypes: 'Access on mobile and TV',
    assignments: randomDecider(70),
    certificateOfCompletion: randomDecider(90),
    downloadableResources: randomDecider(90) ? Math.round(Math.random() * 25) : 0,
  };

  return sidebarData;
};

const postgresDataGen = async (numberOfCourses) => {
  console.log(`Populating DB with ${numberOfCourses} records`);
  const bulkPriceData = [];
  const bulkPreviewVideoData = [];
  const bulkSideBarData = [];
  for (let i = 1; i <= numberOfCourses; i += 1) {
    const newPrice = createPricing(i);
    bulkPriceData.push(newPrice);

    const newPreviewVideo = createPreviewVideoData(i);
    bulkPreviewVideoData.push(newPreviewVideo);

    const newSidebarData = createSidebarData(i);
    bulkSideBarData.push(newSidebarData);
  }

  console.log(bulkPriceData.length, bulkPreviewVideoData.length, bulkSideBarData.length);
};

(async () => openConn()
  .then(() => {
    postgresDataGen(10 ** 7);
  })
  .then(() => {
    closeConn();
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  })
)();
