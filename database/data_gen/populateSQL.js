const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'sdc_sidebar',
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
        const createTables = `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          DROP TABLE IF EXISTS sale CASCADE;
          CREATE TABLE sale(
            sale_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "discountPercentage" INTEGER,
            "saleEndDate" BIGINT,
            "downloadableResources" INTEGER
          );

          DROP TABLE IF EXISTS price;
          CREATE TABLE price(
            "courseId" SERIAL PRIMARY KEY NOT NULL,
            "basePrice" INTEGER,
            sale_id UUID,
            "saleOngoing" BOOLEAN default false,
            FOREIGN KEY (sale_id) REFERENCES sale (sale_id) ON DELETE CASCADE
          );
          DROP TABLE IF EXISTS video;
          CREATE TABLE video(
            "courseId" SERIAL PRIMARY KEY NOT NULL,
            "videoImgUrl" VARCHAR(30),
            "videoUrl" VARCHAR(30)
          );
          DROP TABLE IF EXISTS sidebar CASCADE;
          CREATE TABLE sidebar(
            content_id SERIAL PRIMARY KEY NOT NULL,
            "contentType" VARCHAR(30)
          );
          DROP TABLE IF EXISTS sidebar_sale;
          CREATE TABLE sidebar_sale(
            "id" SERIAL PRIMARY KEY NOT NULL,
            content_id INTEGER REFERENCES sidebar ON DELETE CASCADE,
            sale_id UUID REFERENCES sale ON DELETE CASCADE
          ) PARTITION BY RANGE (id);
          CREATE TABLE  sidebarsale_1m PARTITION OF sidebar_sale FOR VALUES FROM (0) TO (1000000);
          CREATE TABLE  sidebarsale_2m PARTITION OF sidebar_sale FOR VALUES FROM (1000000) TO (2000000);
          CREATE TABLE  sidebarsale_3m PARTITION OF sidebar_sale FOR VALUES FROM (2000000) TO (3000000);
          CREATE TABLE  sidebarsale_4m PARTITION OF sidebar_sale FOR VALUES FROM (3000000) TO (4000000);
          CREATE TABLE  sidebarsale_5m PARTITION OF sidebar_sale FOR VALUES FROM (4000000) TO (5000000);
          CREATE TABLE  sidebarsale_6m PARTITION OF sidebar_sale FOR VALUES FROM (5000000) TO (6000000);
          CREATE TABLE  sidebarsale_7m PARTITION OF sidebar_sale FOR VALUES FROM (6000000) TO (7000000);
          CREATE TABLE  sidebarsale_8m PARTITION OF sidebar_sale FOR VALUES FROM (7000000) TO (8000000);
          CREATE TABLE  sidebarsale_9m PARTITION OF sidebar_sale FOR VALUES FROM (8000000) TO (9000000);`;
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
