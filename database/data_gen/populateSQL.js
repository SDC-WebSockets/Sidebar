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

const createIndexQuery = (tablename, column) => pool.query(`CREATE INDEX "${tablename + '_' + column + '_index'}" ON ${tablename} ("${column}");`);

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
            sale_id UUID DEFAULT uuid_generate_v4(),
            "discountPercentage" INTEGER,
            "saleEndDate" BIGINT,
            "downloadableResources" INTEGER,
            CONSTRAINT "sale_key" PRIMARY KEY (sale_id)
          );

          DROP TABLE IF EXISTS price;
          CREATE TABLE price(
            "courseId" SERIAL,
            "basePrice" INTEGER,
            sale_id UUID,
            "saleOngoing" BOOLEAN default false,
            FOREIGN KEY (sale_id) REFERENCES sale (sale_id) ON DELETE CASCADE,
            CONSTRAINT "price_id_key" PRIMARY KEY ("courseId")
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
          ALTER SEQUENCE "price_courseId_seq" OWNED BY price."courseId";

          DROP TABLE IF EXISTS video;
          CREATE TABLE video(
            "courseId" SERIAL,
            "videoImgUrl" VARCHAR(30),
            "videoUrl" VARCHAR(30),
            CONSTRAINT "video_id_key" PRIMARY KEY ("courseId")
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
          ALTER SEQUENCE "video_courseId_seq" OWNED BY video."courseId";

          DROP TABLE IF EXISTS sidebar CASCADE;
          CREATE TABLE sidebar(
            content_id SERIAL PRIMARY KEY,
            "contentType" VARCHAR(30)
          );
          DROP TABLE IF EXISTS sidebar_sale;
          CREATE TABLE sidebar_sale(
            "id" UUID DEFAULT uuid_generate_v4(),
            content_id INTEGER REFERENCES sidebar ON DELETE CASCADE,
            sale_id UUID REFERENCES sale ON DELETE CASCADE,
            CONSTRAINT "junction_key" PRIMARY KEY ("id")
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
        return createIndexQuery('sidebar', 'content_id');
      })
      .then(() => {
        console.log('Seeding sale');
        return copyCSV(salePath, 'sale');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding sale at ', result.rows[0].now);
        return createIndexQuery('sale', 'sale_id');
      })
      .then(() => {
        console.log('Seeding Price');
        return copyCSV(pricePath, 'price');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding price at ', result.rows[0].now);
        return createIndexQuery('price', 'courseId');
      })
      .then(() => {
        console.log('Seeding Video');
        return copyCSV(videoPath, 'video');
      })
      .then(() => client.query('SELECT NOW()'))
      .then((result) => {
        console.log('Finished seeding video at ', result.rows[0].now);
        return createIndexQuery('video', 'courseId');
      })
      .then(() => {
        console.log('Seeding junction');
        return copyCSV(junctionPath, 'sidebar_sale');
      })
      .then(() => createIndexQuery('sidebar_sale', 'id'))
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
