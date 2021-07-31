const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'SDCsidebar',
});

const pricePath = path.join(`${__dirname}/priceData.csv`);
const salePath = path.join(`${__dirname}/saleData.csv`);
const videoPath = path.join(`${__dirname}/videoData.csv`);
const sidebarPath = path.join(`${__dirname}/sidebar.csv`);
const junctionPath = path.join(`${__dirname}/junctionTable.csv`);

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
        const createTables = `
          DROP TABLE IF EXISTS sale CASCADE;
          CREATE TABLE sale(
            sale_id SERIAL PRIMARY KEY,
            "discountPercentage" INTEGER,
            "saleEndDate" BIGINT,
            "downloadableResources" INTEGER
          );
          DROP TABLE IF EXISTS price;
          CREATE TABLE price(
            "courseId" SERIAL PRIMARY KEY,
            "basePrice" INTEGER,
            sale_id INTEGER,
            "saleOngoing" BOOLEAN default false,
            FOREIGN KEY (sale_id) REFERENCES sale (sale_id) ON DELETE CASCADE
          );
          DROP TABLE IF EXISTS video;
          CREATE TABLE video(
            "courseId" SERIAL PRIMARY KEY,
            "videoImgUrl" VARCHAR(30),
            "videoUrl" VARCHAR(30)
          );
          DROP TABLE IF EXISTS sidebar CASCADE;
          CREATE TABLE sidebar(
            content_id SERIAL PRIMARY KEY,
            "contentType" VARCHAR(30)
          );
          DROP TABLE IF EXISTS sidebar_sale;
          CREATE TABLE sidebar_sale(
            "id" SERIAL PRIMARY KEY,
            content_id INTEGER REFERENCES sidebar ON DELETE CASCADE,
            sale_id INTEGER REFERENCES sale ON DELETE CASCADE
          );`;
        return client.query(createTables);
      })
      .then(() => {
        console.log('Table Creations SUCCESS!');
        console.log('Seeding Sidebar');
        return copyCSV(sidebarPath, 'sidebar');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding sidebar at ', result.rows[0].now);
        console.log('Seeding Video');
        return copyCSV(videoPath, 'video');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding video at ', result.rows[0].now);
        console.log('Seeding sale');
        return copyCSV(salePath, 'sale');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding sale at ', result.rows[0].now);
        console.log('Seeding Price');
        return copyCSV(pricePath, 'price');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding price at ', result.rows[0].now);
        console.log('Seeding junction');
        return copyCSV(junctionPath, 'sidebar_sale');
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
