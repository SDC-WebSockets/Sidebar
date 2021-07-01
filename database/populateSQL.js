/* eslint-disable max-classes-per-file */
/* eslint-disable no-console */
const { Sequelize, Model, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();
const sequelize = new Sequelize('postgres://127.0.0.1:5432/SDC');

class Price extends Model { }
Price.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  basePrice: DataTypes.INTEGER,
  discountPercentage: DataTypes.INTEGER,
  discountedPrice: DataTypes.INTEGER,
  saleEndDate: DataTypes.DATE,
  saleOngoing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, { sequelize });

class PreviewVideo extends Model { }
PreviewVideo.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  previewVideoUrl: DataTypes.STRING,
  previewVideoImgUrl: DataTypes.STRING,
}, { sequelize });

class Sidebar extends Model { }
Sidebar.init({
  courseId: {
    type: DataTypes.INTEGER,
    unique: true,
    primaryKey: true,
  },
  fullLifetimeAccess: DataTypes.STRING,
  accessTypes: DataTypes.STRING,
  assignments: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  certificateOfCompletion: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  downloadableResources: DataTypes.INTEGER,
}, { sequelize });

const openConn = async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connection successful.');
    await Price.sync({ force: true });
    console.log('The table for the Price model was just (re)created!');
    await PreviewVideo.sync({ force: true });
    console.log('The table for the Preview Video model was just (re)created!');
    await Sidebar.sync({ force: true });
    console.log('The table for the Sidebar model was just (re)created!');
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

const closeConn = () => sequelize.close()
  .then(() => {
    console.log('DB connection closed.');
  });

const postgresDataGen = async (numberOfCourses) => {
  console.log(`Populating DB with ${numberOfCourses} records`);
};

(async () => openConn()
  .then(() => {
    postgresDataGen(10 ** 6);
  })
  .then(() => {
    closeConn();
  })
  .catch((error) => {
    console.warn('Error occured: ', error);
  })
)();
