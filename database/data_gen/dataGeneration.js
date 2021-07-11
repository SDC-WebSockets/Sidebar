/* eslint-disable max-len */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const pricePath = path.join(`${__dirname}/priceData.csv`);
const videoPath = path.join(`${__dirname}/videoData.csv`);
const sidebarPath = path.join(`${__dirname}/sidebarData.csv`);

const weightedTrueGenerator = (percentageChance) => Math.random() * 100 < percentageChance;

const course1 = {
  price: {
    courseId: 1,
    basePrice: 90,
    discountPercentage: 24,
    saleNumOfDays: 11,
    saleOngoing: false,
  },
  sidebar: {
    courseId: 1,
    fullLifetimeAccess: true,
    assignments: false,
    certificateOfCompletion: true,
    downloadableResources: 23,
  },
  video: {
    courseId: 1,
    videoImgUrl: 'videoImg/1.jpg#116378',
    videoUrl: 'video/1.mp4#116378',
  },
};

const createPricing = (courseId) => {
  const minPrice = 50;
  //  the calculation: (range * multiplesOf) + minPrice would give you the maxPrice = 150
  const range = 20;
  const multiplesOf = 5;
  const basePrice = Math.floor(Math.random() * range) * multiplesOf + minPrice;

  const maxDiscount = 85;
  const minDiscount = 5;
  const discountPercentage = Math.floor(Math.random() * (maxDiscount - minDiscount)) + minDiscount;

  const maxSaleDays = 30;
  const saleNumOfDays = Math.floor(Math.random() * maxSaleDays);

  const saleOngoing = weightedTrueGenerator(30);

  const priceData = [courseId, basePrice, discountPercentage, saleNumOfDays, saleOngoing];

  return priceData;
};

const createVideoData = (courseId) => {
  const fragment = Math.floor(Math.random() * 888888);

  const videoData = [courseId, `videoImg/${courseId % 1000}.jpg#${fragment}`, `video/${courseId % 1000}.mp4#${fragment}`];

  return videoData;
};

const createSidebarData = (courseId) => {
  const fullLifetimeAccess = !!weightedTrueGenerator(70);
  // const accessTypes = 'Access on mobile and TV';
  const assignments = weightedTrueGenerator(70);
  const certificateOfCompletion = weightedTrueGenerator(90);
  const downloadableResources = weightedTrueGenerator(90) ? Math.round(Math.random() * 25) : 0;
  const sidebarData = [courseId, fullLifetimeAccess, assignments, certificateOfCompletion, downloadableResources];

  return sidebarData;
};

const generatePriceData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} Price records`);
  const priceStream = fs.createWriteStream(pricePath);
  const priceKeys = 'courseId,basePrice,discountPercentage,saleNumOfDays,saleOngoing';
  priceStream.write(`${priceKeys}\n`);
  const {
    courseId, basePrice, discountPercentage, saleNumOfDays, saleOngoing,
  } = course1.price;
  priceStream.write(`${courseId},${basePrice},${discountPercentage},${saleNumOfDays},${saleOngoing}\n`);

  for (let i = 2; i <= numberOfCourses; i += 1) {
    const newPrice = createPricing(i);
    priceStream.write(`${newPrice}\n`);
  }
  priceStream.end();
  console.log('Completed Price Writing.');
};

const generateVideoData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} video records`);
  const videoStream = fs.createWriteStream(videoPath);
  const videoKeys = 'courseId,videoImgUrl,videoUrl';
  videoStream.write(`${videoKeys}\n`);
  const { courseId, videoImgUrl, videoUrl } = course1.video;
  videoStream.write(`${courseId},${videoImgUrl},${videoUrl}\n`);

  for (let i = 2; i <= numberOfCourses; i += 1) {
    const newVideo = createVideoData(i);
    videoStream.write(`${newVideo}\n`);
  }
  videoStream.end();
  console.log('Completed Video Writing.');
};

const generateSidebarData = async (numberOfCourses) => {
  console.log(`Generating ${numberOfCourses} sidebar records`);
  const sidebarStream = fs.createWriteStream(sidebarPath);
  const sidebarKeys = 'courseId,fullLifetimeAccess,assignments,certificateOfCompletion,downloadableResources';
  sidebarStream.write(`${sidebarKeys}\n`);
  const {
    courseId, fullLifetimeAccess, assignments, certificateOfCompletion, downloadableResources,
  } = course1.sidebar;
  sidebarStream.write(`${courseId},${fullLifetimeAccess},${assignments},${certificateOfCompletion},${downloadableResources}\n`);

  for (let i = 2; i <= numberOfCourses; i += 1) {
    const newSidebar = createSidebarData(i);
    sidebarStream.write(`${newSidebar}\n`);
  }
  sidebarStream.end();
  console.log('Completed Sidebar Writing.');
};

const dataGen = async (numberOfCourses) => {
  console.log(`Generating ${3 * numberOfCourses} total records of data`);
  generatePriceData(numberOfCourses);
  generateVideoData(numberOfCourses);
  generateSidebarData(numberOfCourses);
};

dataGen(10 ** 7);
