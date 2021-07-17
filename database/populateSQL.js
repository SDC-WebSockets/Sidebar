/* eslint-disable no-console */
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'SDC',
});

const pricePath = path.join(`${__dirname}/data_gen/priceData.csv`);
const salePath = path.join(`${__dirname}/data_gen/saleData.csv`);
const videoPath = path.join(`${__dirname}/data_gen/videoData.csv`);
const sidebarPath = path.join(`${__dirname}/data_gen/sidebarData.csv`);

const copyCSV = (pathToCopy, type) => {
  const insertText = `COPY ${type}
  FROM '${pathToCopy}'
  DELIMITER ','
  CSV HEADER;`;
  return pool.query(insertText);
};

const seedPSQL = async () => {
  await pool.connect()
    .then((client) => client.query('SELECT NOW()')
      .then((result) => {
        console.log('DB connected at ', result.rows[0].now);
        const createTables = `DROP TABLE IF EXISTS price;
          CREATE TABLE price(
            "courseId" SERIAL PRIMARY KEY,
            "basePrice" INTEGER,
            "discountPercentage" INTEGER,
          );
          DROP TABLE IF EXISTS sale;
          CREATE TABLE sale(
            "courseId" SERIAL PRIMARY KEY,
            "saleEndDate" BIGINT,
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
        return client.query(createTables);
      })
      .then(() => {
        console.log('Table Creations SUCCESS!');
        console.log('Seeding Price');
        return copyCSV(pricePath, 'Price');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding price at ', result.rows[0].now);
        console.log('Seeding Sale');
        return copyCSV(salePath, 'Sale');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding sale at ', result.rows[0].now);
        console.log('Seeding Video');
        return copyCSV(videoPath, 'Video');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding video at ', result.rows[0].now);
        console.log('Seeding Sidebar');
        return copyCSV(sidebarPath, 'Sidebar');
      })
      .then(() => client.query('SELECT NOW()'))
      .then(async (result) => {
        console.log('Completed All Seeding at ', result.rows[0].now);
        return client.release();
      })
      .catch((error) => {
        console.warn('Error occured: ', error);
        return client.release();
      }))
    .catch((error) => {
      console.warn('Error occured: ', error);
    });
};

seedPSQL();
