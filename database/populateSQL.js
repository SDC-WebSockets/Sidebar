/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */

// const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const {
  Price,
  PreviewVideo,
  Sidebar,
  openConn,
  closeConn,
} = require('./pSQLdatabase.js');

const pricePath = path.join(`${__dirname}/data_gen/priceData.csv`);
const previewVideoPath = path.join(`${__dirname}/data_gen/previewVideoData.csv`);
const sidebarPath = path.join(`${__dirname}/data_gen/sidebarData.csv`);

const priceObj = (keys, array) => {
  const nums = ['courseId', 'basePrice', 'discountPercentage'];
  const strings = [];
  const boolean = ['saleOngoing'];
  const date = ['saleEndDate'];
  const newPrice = {};
  for (let k = 0; k < keys.length; k += 1) {
    const currKey = keys[k];
    if (date.includes(currKey)) {
      newPrice[currKey] = new Date(array[k]);
    } else if (nums.includes(currKey)) {
      newPrice[currKey] = parseFloat(array[k]);
    } else if (array[k] === 'true') {
      newPrice[currKey] = true;
    } else {
      newPrice[currKey] = false;
    }
  }
  return newPrice;
};

const readCSV = (pathToRead, type) => {
  let linesRead = 0;
  let keys = [];

  const stream = fs.createReadStream(pathToRead, { encoding: 'utf8' }).pause();
  const rl = readline.createInterface({
    input: stream,
  });

  rl.on('line', async (line) => {
    const lineArray = line.split(',');
    if (linesRead === 0) {
      keys = lineArray;
      console.log(keys);
    } else {
      console.log(linesRead);
      let newData = {};
      if (type === 'price') {
        newData = priceObj(keys, lineArray);
        Price.create(newData);
      }
    }
    linesRead += 1;
  });
};

const postgresDataGen = async (numberOfCourses) => {
  console.log(`Populating DB with ${numberOfCourses} records`);
  readCSV(pricePath, 'price');
};

const numRecsGenerating = 10 ** 7;
(async () => Promise.resolve(openConn())
  .then(async () => {
    await postgresDataGen(numRecsGenerating);
    // return Promise.all([Price.findAll(), PreviewVideo.findAll(), Sidebar.findAll()]);
    return Price.count();
  })
  .then((results) => {
    console.log('Requested', numRecsGenerating, 'records to be generated.');
    console.log('price count: ', results);
    // console.log('Price, Preview Video, Sidebar DB sizes respectively.');
    // results.forEach((result) => {
    //   console.log(result.length);
    // });
    // closeConn();
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  })
)();
