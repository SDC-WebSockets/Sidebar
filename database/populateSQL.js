/* eslint-disable no-await-in-loop */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */

const fs = require('fs');
const readline = require('readline');
const { once } = require('events');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'SDC',
});

const pricePath = path.join(`${__dirname}/data_gen/priceData.csv`);
const videoPath = path.join(`${__dirname}/data_gen/videoData.csv`);
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

const readCSV = async (pathToRead, type) => {
  let linesRead = 0;
  let keys = [];
  try {
    const stream = fs.createReadStream(pathToRead, { encoding: 'utf8' }).pause();
    const rl = readline.createInterface({
      input: stream,
      // crlfDelay: Infinity,
    });

    rl.on('line', async (line) => {
      const lineArray = line.split(',');
      if (linesRead === 0) {
        keys = lineArray;
        console.log(keys);
      } else {
        // console.log(linesRead);
        const db = { name: type };
        if (type === 'price') {
          db.cols = 'courseId, basePrice, discountPercentage, saleNumOfDays, saleOngoing';
          db.numCols = '$1, $2, $3, $4, $5';
        }
        if (type === 'video') {
          db.cols = 'courseId, videoImgUrl, videoImg';
          db.numCols = '$1, $2, $3';
        }
        if (type === 'sidebar') {
          db.cols = 'courseId, fullLifetimeAccess, assignments, certificateOfCompletion, downloadableResources';
          db.numCols = '$1, $2, $3, $4, $5';
        }
        const insertText = `INSERT INTO ${db.name}(${db.cols}) VALUES(${db.numCols})`;
        console.log(insertText)
        await pool.query(insertText, lineArray)
          .then(() => {
            linesRead += 1;
          })
          .catch((err) => {
            console.log(`error saving to DB at ${linesRead}:`, err);
          });
      }
    });
    await once(rl, 'close');
    console.log('Done Seeding ', type);
    stream.close();
  } catch (error) {
    console.warn(`ERROR reading ${type}: ${error}`);
  }
};

(async () => Promise.resolve(pool.connect())
  .then(() => pool.query('SELECT NOW()'))
  .then((result) => {
    console.log('DB connected at ', result.rows[0].now);
    const createTables = `DROP TABLE IF EXISTS price;
      CREATE TABLE price(
        courseId SERIAL PRIMARY KEY,
        basePrice INTEGER,
        discountPercentage INTEGER,
        saleNumOfDays INTEGER,
        saleOngoing BOOLEAN
      );
      DROP TABLE IF EXISTS video;
      CREATE TABLE video(
        courseId SERIAL PRIMARY KEY,
        videoImgUrl VARCHAR(30),
        videoImg VARCHAR(30)
      );
      DROP TABLE IF EXISTS sidebar;
      CREATE TABLE sidebar(
        courseId SERIAL PRIMARY KEY,
        fullLifetimeAccess BOOLEAN,
        assignments BOOLEAN,
        certificateOfCompletion BOOLEAN,
        downloadableResources INTEGER
      );`;
    return pool.query(createTables);
  })
  .then(() => {
    console.log('Table Creations SUCCESS!');
    return readCSV(pricePath, 'price');
  })
  .then(() => readCSV(videoPath, 'video'))
  .then(() => readCSV(sidebarPath, 'sidebar'))
  .then(() => {
    console.log('Completed All Seeding!');
    return pool.end();
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  })
)();
