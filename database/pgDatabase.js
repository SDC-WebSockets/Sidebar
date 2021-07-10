/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-classes-per-file */
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres://127.0.0.1:5432/SDC');

class Price extends Model { }
Price.init({
  course_id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  base_price: DataTypes.INTEGER,
  discount_percent: DataTypes.INTEGER,
  sale_days: DataTypes.INTEGER,
  sale_ongoing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'price',
});

class PreviewVideo extends Model { }
PreviewVideo.init({
  course_id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  videoimg_url: DataTypes.STRING,
  video_url: DataTypes.STRING,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'video',
});

class Sidebar extends Model { }
Sidebar.init({
  course_id: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  full_access: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  assignments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completion_certificate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  downloadable_resources: DataTypes.INTEGER,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'sidebar',
});

const openConn = () => sequelize.authenticate()
  .then(() => {
    console.log('DB connection successful.');
    return Price.sync({ logging: false });
  })
  .then(() => {
    console.log('The table for the Price model was synced!');
    return PreviewVideo.sync({ logging: false });
  })
  .then(() => {
    console.log('The table for the Preview Video model was synced!');
    return Sidebar.sync({ logging: false });
  })
  .then(() => {
    console.log('All models were synchronized successfully.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

const closeConn = () => sequelize.close()
  .then(() => {
    console.log('DB connection closed.');
  });

module.exports.Price = Price;
module.exports.PreviewVideo = PreviewVideo;
module.exports.Sidebar = Sidebar;
module.exports.openConn = openConn;
module.exports.closeConn = closeConn;
