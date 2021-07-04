/* eslint-disable max-len */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const pricePath = path.join(`${__dirname}/priceData.csv`);
const previewVideoPath = path.join(`${__dirname}/previewVideoData.csv`);
const sidebarPath = path.join(`${__dirname}/sidebarData.csv`);

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

  const saleOngoing = weightedTrueGenerator(30);

  const priceData = [courseId, basePrice, discountPercentage, saleEndDate, saleOngoing];

  return priceData;
};

const createPreviewVideoData = (courseId) => {
  const fragment = Math.floor(Math.random() * 888888);
  const s3Url = 'https://sdc-websockets-sidebar.s3-us-west-2.amazonaws.com/';

  const previewVideoData = [courseId, `${s3Url}videoImg/${courseId % 1000}.jpg#${fragment}`, `${s3Url}video/${courseId % 1000}.mp4#${fragment}`];

  return previewVideoData;
};

const createSidebarData = (courseId) => {
  const fullLifetimeAccess = weightedTrueGenerator(70) ? 'Full lifetime access' : 'Full access during subscription term';
  const accessTypes = 'Access on mobile and TV';
  const assignments = weightedTrueGenerator(70);
  const certificateOfCompletion = weightedTrueGenerator(90);
  const downloadableResources = weightedTrueGenerator(90) ? Math.round(Math.random() * 25) : 0;
  const sidebarData = [courseId, fullLifetimeAccess, accessTypes, assignments, certificateOfCompletion, downloadableResources];

  return sidebarData;
};

const generatePriceData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} Price records`);
  const priceStream = fs.createWriteStream(pricePath);
  const priceKeys = 'courseId,basePrice,discountPercentage,saleEndDate,saleOngoing';
  priceStream.write(`${priceKeys}\n`);
  for (let i = 1; i <= numberOfCourses; i += 1) {
    const newPrice = createPricing(i);
    priceStream.write(`${newPrice}\n`);
  }
  priceStream.end();
  console.log('Completed Price Writing.');
};

const generatePreviewVideoData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} PreviewVideo records`);
  const previewVideoStream = fs.createWriteStream(previewVideoPath);
  const previewVideoKeys = 'courseId,previewVideoImgUrl,previewVideoUrl';
  previewVideoStream.write(`${previewVideoKeys}\n`);
  for (let i = 1; i <= numberOfCourses; i += 1) {
    const newPreviewVideo = createPreviewVideoData(i);
    previewVideoStream.write(`${newPreviewVideo}\n`);
  }
  previewVideoStream.end();
  console.log('Completed Preview Video Writing.');
};

const generateSidebarData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} sidebar records`);
  const sidebarStream = fs.createWriteStream(sidebarPath);
  const sidebarKeys = 'courseId,fullLifetimeAccess,accessTypes,assignments,certificateOfCompletion,downloadableResources';
  sidebarStream.write(`${sidebarKeys}\n`);
  for (let i = 1; i <= numberOfCourses; i += 1) {
    const newSidebar = createSidebarData(i);
    sidebarStream.write(`${newSidebar}\n`);
  }
  sidebarStream.end();
  console.log('Completed Sidebar Writing.');
};

const dataGen = async (numberOfCourses) => {
  console.log(`Generating ${3 * numberOfCourses} total records of data`);
  generatePriceData(numberOfCourses);
  generatePreviewVideoData(numberOfCourses);
  generateSidebarData(numberOfCourses);
};

dataGen(10 ** 7);
