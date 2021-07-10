/* eslint-disable no-console */
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'SDC',
});

const pricePath = path.join(`${__dirname}/data_gen/priceData.csv`);
const videoPath = path.join(`${__dirname}/data_gen/videoData.csv`);
const sidebarPath = path.join(`${__dirname}/data_gen/sidebarData.csv`);

const copyCSV = (pathToCopy, type) => {
  const insertText = `COPY ${type}
  FROM '${pathToCopy}'
  DELIMITER ','
  CSV HEADER;`;
  return pool.query(insertText);
};

const seedPSQL = async () => Promise.resolve(pool.connect())
  .then(() => pool.query('SELECT NOW()'))
  .then((result) => {
    console.log('DB connected at ', result.rows[0].now);
    const createTables = `DROP TABLE IF EXISTS price;
    CREATE TABLE price(
      "courseId" SERIAL PRIMARY KEY,
      "basePrice" INTEGER,
      "discountPercentage" INTEGER,
      "saleNumOfDays" INTEGER,
      "saleOngoing" BOOLEAN
    );
    DROP TABLE IF EXISTS video;
    CREATE TABLE video(
      "courseId" SERIAL PRIMARY KEY,
      "videoImgUrl" VARCHAR(30),
      "videoUrl" VARCHAR(30)
    );
    DROP TABLE IF EXISTS sidebar;
    CREATE TABLE sidebar(
      "courseId" SERIAL PRIMARY KEY,
      "fullLifetimeAccess" BOOLEAN,
      "assignments" BOOLEAN,
      "certificateOfCompletion" BOOLEAN,
      "downloadableResources" INTEGER
      );`;
    return pool.query(createTables);
  })
  .then(() => {
    console.log('Table Creations SUCCESS!');
    return copyCSV(pricePath, 'Price');
  })
  .then(() => pool.query('SELECT NOW()'))
  .then((result) => {
    console.log('Finished seeding price at ', result.rows[0].now);
    return copyCSV(videoPath, 'Video');
  })
  .then(() => pool.query('SELECT NOW()'))
  .then((result) => {
    console.log('Finished seeding video at ', result.rows[0].now);
    return copyCSV(sidebarPath, 'Sidebar');
  })
  .then(() => pool.query('SELECT NOW()'))
  .then((result) => {
    console.log('Completed All Seeding at ', result.rows[0].now);
    return pool.end();
  })
  .then(() => {
    console.log('bye!');
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  });

seedPSQL();
