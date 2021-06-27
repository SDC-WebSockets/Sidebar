/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connecting to the database
mongoose.connect('mongodb://localhost:27017/sidebar?gssapiServiceName=mongodb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to database.'))
  .catch((error) => console.log('Connection error: ', error));

const { connection } = mongoose;

// ------------------------------------------------------------------
// Setting up schemas and models
const priceSchema = new mongoose.Schema({
  courseId: Number,
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean,
});

const Price = mongoose.model('Price', priceSchema);

const previewVideoSchema = new mongoose.Schema({
  courseId: Number,
  previewVideoUrl: String,
  previewVideoImgUrl: String,
});

const PreviewVideo = mongoose.model('PreviewVideo', previewVideoSchema);

const sidebarSchema = new mongoose.Schema({
  courseId: Number,
  fullLifetimeAccess: String,
  accessTypes: String,
  assignments: Boolean,
  certificateOfCompletion: Boolean,
  downloadableResources: Number,
});

const Sidebar = mongoose.model('Sidebar', sidebarSchema);

// ------------------------------------------------------------------
// Functions that retrieve information from the database
const getPrice = (query, callback) => Price.find(query, callback);

const getPreviewVideo = (query, callback) => PreviewVideo.find(query, callback);

const getSidebar = (query, callback) => Sidebar.find(query, callback);

// ------------------------------------------------------------------
// Functions that create information to the database
const postPrice = (query, callback) => Price.find(query, callback);

const postPreviewVideo = (query, callback) => PreviewVideo.find(query, callback);

const postSidebar = (query, callback) => PreviewVideo.find(query, callback);

const postAll = async (newDoc) => {
  console.log('NewDoc in db: ', newDoc);
  const { courseId } = newDoc;
  // create a new objects
  const newPrice = newDoc.price;
  const newPreviewVideo = newDoc.previewVideo;
  const newSidebar = newDoc.sidebar;
  const createPromises = [];

  if (newPrice.courseId === undefined) {
    newPrice.courseId = courseId;
  }
  if (newPreviewVideo.courseId === undefined) {
    newPreviewVideo.courseId = courseId;
  }
  if (newSidebar.courseId === undefined) {
    newSidebar.courseId = courseId;
  }
  console.log(newPrice, newSidebar, newPreviewVideo);

  for (const schemaPath in priceSchema.obj) {
    if (newPrice[schemaPath] !== undefined) {
      const schemaTypeOf = priceSchema.path(schemaPath).instance.toLowerCase();
      console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newPrice[schemaPath];
      console.log('newPrice key: ', newPrice[schemaPath], ' type: ', keyType);
      if (keyType !== schemaTypeOf) {
        if (keyType === 'object' && schemaTypeOf === 'date') {
          // eslint-disable-next-line no-continue
          continue;
        } else {
          return { error: `Price ${schemaPath} type is ${schemaTypeOf} and does not match ${keyType}.` };
        }
      }
    } else {
      return { error: `Price ${schemaPath} does not exist.` };
    }
  }
  createPromises.push(Price.create(newPrice));

  for (const schemaPath in sidebarSchema.obj) {
    if (newSidebar[schemaPath] !== undefined) {
      const schemaTypeOf = sidebarSchema.path(schemaPath).instance.toLowerCase();
      console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newSidebar[schemaPath];
      console.log('newSidebar key: ', newSidebar[schemaPath], ' type: ', keyType);
      if (keyType !== schemaTypeOf) { return { error: `Sidebar ${schemaPath} type is ${schemaTypeOf} and does not match ${keyType}.` }; }
    } else {
      return { error: `Sidebar ${schemaPath} does not exist.` };
    }
  }
  createPromises.push(Sidebar.create(newSidebar));

  for (const schemaPath in previewVideoSchema.obj) {
    if (newPreviewVideo[schemaPath] !== undefined) {
      const schemaTypeOf = previewVideoSchema.path(schemaPath).instance.toLowerCase();
      console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newPreviewVideo[schemaPath];
      console.log('newPreviewVideo key: ', newPreviewVideo[schemaPath], ' type: ', keyType);
      if (keyType !== schemaTypeOf) { return { error: `Preview video ${schemaPath} type is ${schemaTypeOf} and does not match ${keyType}.` }; }
    } else {
      return { error: `Preview video ${schemaPath} does not exist.` };
    }
  }
  createPromises.push(PreviewVideo.create(newPreviewVideo));

  console.log(createPromises);
  return Price.create(newPrice)
    .then((result) => {
      console.log(result);
      return Sidebar.create(newSidebar);
    })
    .then((result) => {
      console.log(result);
      return PreviewVideo.create(newPreviewVideo);
    })
    .catch((error) => {
      console.warn('Error occured during create: ', error);
    });
};

// ------------------------------------------------------------------
// Exports
exports.getPrice = getPrice;
exports.getSidebar = getSidebar;
exports.getPreviewVideo = getPreviewVideo;
exports.postPrice = postPrice;
exports.postSidebar = postSidebar;
exports.postPreviewVideo = postPreviewVideo;
exports.postAll = postAll;
exports.Price = Price;
exports.PreviewVideo = PreviewVideo;
exports.Sidebar = Sidebar;
exports.connection = connection;
