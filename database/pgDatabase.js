/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable max-classes-per-file */
const { Sequelize, Model, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres://127.0.0.1:5432/SDC', {
  benchmark: true,
  logging: (sqlQuery, timing) => {
    console.log(sqlQuery);
    console.log('Query Time: ', timing, ' ms');
  },
});

class Price extends Model { }
Price.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  basePrice: DataTypes.INTEGER,
  discountPercentage: DataTypes.INTEGER,
  saleEndDate: DataTypes.BIGINT,
  saleOngoing: {
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
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  videoUrl: DataTypes.STRING,
  videoImgUrl: DataTypes.STRING,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'video',
});

class Sidebar extends Model { }
Sidebar.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  fullLifetimeAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  assignments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  certificateOfCompletion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  downloadableResources: DataTypes.INTEGER,
}, {
  sequelize,
  createdAt: false,
  updatedAt: false,
  tableName: 'sidebar',
});

const openConn = () => sequelize.authenticate()
  .then(() => {
    console.log('DB connection successful.');
    return Price.sync({ logging: true });
  })
  .then(() => {
    console.log('The table for the Price model was synced!');
    return PreviewVideo.sync({ logging: true });
  })
  .then(() => {
    console.log('The table for the Preview Video model was synced!');
    return Sidebar.sync({ logging: true });
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
