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
        const createTables = `
          DROP TABLE IF EXISTS sale CASCADE;
          CREATE TABLE sale(
            sale_id SERIAL PRIMARY KEY NOT NULL,
            "discountPercentage" INTEGER,
            "saleEndDate" BIGINT,
            "downloadableResources" INTEGER
          ) PARTITION BY RANGE (sale_id);
          CREATE TABLE  sale_50k PARTITION OF sale FOR VALUES FROM (0) TO (500000);
          CREATE TABLE  sale_100k PARTITION OF sale FOR VALUES FROM (500000) TO (1000000);
          CREATE TABLE  sale_150k PARTITION OF sale FOR VALUES FROM (1000000) TO (1500000);
          CREATE TABLE  sale_200k PARTITION OF sale FOR VALUES FROM (1500000) TO (2000000);
          CREATE TABLE  sale_250k PARTITION OF sale FOR VALUES FROM (2000000) TO (2500000);

          DROP TABLE IF EXISTS price;
          CREATE TABLE price(
            "courseId" SERIAL PRIMARY KEY NOT NULL,
            "basePrice" INTEGER,
            sale_id INTEGER,
            "saleOngoing" BOOLEAN default false,
            FOREIGN KEY (sale_id) REFERENCES sale (sale_id) ON DELETE CASCADE
          ) PARTITION BY RANGE ("courseId");
          CREATE TABLE  price_1m PARTITION OF price FOR VALUES FROM (0) TO (1000000);
          CREATE TABLE  price_2m PARTITION OF price FOR VALUES FROM (1000000) TO (2000000);
          CREATE TABLE  price_3m PARTITION OF price FOR VALUES FROM (2000000) TO (3000000);
          CREATE TABLE  price_4m PARTITION OF price FOR VALUES FROM (3000000) TO (4000000);
          CREATE TABLE  price_5m PARTITION OF price FOR VALUES FROM (4000000) TO (5000000);
          CREATE TABLE  price_6m PARTITION OF price FOR VALUES FROM (5000000) TO (6000000);
          CREATE TABLE  price_7m PARTITION OF price FOR VALUES FROM (6000000) TO (7000000);
          CREATE TABLE  price_8m PARTITION OF price FOR VALUES FROM (7000000) TO (8000000);
          CREATE TABLE  price_9m PARTITION OF price FOR VALUES FROM (8000000) TO (9000000);
          CREATE TABLE  price_10m PARTITION OF price FOR VALUES FROM (9000000) TO (10000000);
          CREATE TABLE  price_11m PARTITION OF price FOR VALUES FROM (10000000) TO (11000000);

          DROP TABLE IF EXISTS video;
          CREATE TABLE video(
            "courseId" SERIAL PRIMARY KEY NOT NULL,
            "videoImgUrl" VARCHAR(30),
            "videoUrl" VARCHAR(30)
          ) PARTITION BY RANGE ("courseId");
          CREATE TABLE  video_1m PARTITION OF video FOR VALUES FROM (0) TO (1000000);
          CREATE TABLE  video_2m PARTITION OF video FOR VALUES FROM (1000000) TO (2000000);
          CREATE TABLE  video_3m PARTITION OF video FOR VALUES FROM (2000000) TO (3000000);
          CREATE TABLE  video_4m PARTITION OF video FOR VALUES FROM (3000000) TO (4000000);
          CREATE TABLE  video_5m PARTITION OF video FOR VALUES FROM (4000000) TO (5000000);
          CREATE TABLE  video_6m PARTITION OF video FOR VALUES FROM (5000000) TO (6000000);
          CREATE TABLE  video_7m PARTITION OF video FOR VALUES FROM (6000000) TO (7000000);
          CREATE TABLE  video_8m PARTITION OF video FOR VALUES FROM (7000000) TO (8000000);
          CREATE TABLE  video_9m PARTITION OF video FOR VALUES FROM (8000000) TO (9000000);
          CREATE TABLE  video_10m PARTITION OF video FOR VALUES FROM (9000000) TO (10000000);
          CREATE TABLE  video_11m PARTITION OF video FOR VALUES FROM (10000000) TO (11000000);

          DROP TABLE IF EXISTS sidebar CASCADE;
          CREATE TABLE sidebar(
            content_id SERIAL PRIMARY KEY NOT NULL,
            "contentType" VARCHAR(30)
          );

          DROP TABLE IF EXISTS sidebar_sale;
          CREATE TABLE sidebar_sale(
            "id" SERIAL PRIMARY KEY NOT NULL,
            content_id INTEGER REFERENCES sidebar ON DELETE CASCADE,
            sale_id INTEGER REFERENCES sale ON DELETE CASCADE
          ) PARTITION BY RANGE (id);
          CREATE TABLE  sidebarsale_1m PARTITION OF sidebar_sale FOR VALUES FROM (0) TO (1000000);
          CREATE TABLE  sidebarsale_2m PARTITION OF sidebar_sale FOR VALUES FROM (1000000) TO (2000000);
          CREATE TABLE  sidebarsale_3m PARTITION OF sidebar_sale FOR VALUES FROM (2000000) TO (3000000);
          CREATE TABLE  sidebarsale_4m PARTITION OF sidebar_sale FOR VALUES FROM (3000000) TO (4000000);
          CREATE TABLE  sidebarsale_5m PARTITION OF sidebar_sale FOR VALUES FROM (4000000) TO (5000000);`;
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
