/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Connecting to the database
mongoose.connect('mongodb://localhost:27017/sidebar?gssapiServiceName=mongodb', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true })
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
// Function that creates information to the database

const postAll = async (newDoc) => {
  // console.log('NewDoc in db: ', newDoc);
  const { courseId } = newDoc;
  // create a new objects
  const newPrice = newDoc.price;
  const newPreviewVideo = newDoc.previewVideo;
  const newSidebar = newDoc.sidebar;

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
      // console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newPrice[schemaPath];
      // console.log('newPrice key: ', newPrice[schemaPath], ' type: ', keyType);
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

  for (const schemaPath in sidebarSchema.obj) {
    if (newSidebar[schemaPath] !== undefined) {
      const schemaTypeOf = sidebarSchema.path(schemaPath).instance.toLowerCase();
      // console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newSidebar[schemaPath];
      // console.log('newSidebar key: ', newSidebar[schemaPath], ' type: ', keyType);
      if (keyType !== schemaTypeOf) { return { error: `Sidebar ${schemaPath} type is ${schemaTypeOf} and does not match ${keyType}.` }; }
    } else {
      return { error: `Sidebar ${schemaPath} does not exist.` };
    }
  }

  for (const schemaPath in previewVideoSchema.obj) {
    if (newPreviewVideo[schemaPath] !== undefined) {
      const schemaTypeOf = previewVideoSchema.path(schemaPath).instance.toLowerCase();
      // console.log('schema path:', schemaPath, ' type: ', schemaTypeOf);
      const keyType = typeof newPreviewVideo[schemaPath];
      // console.log('newPreviewVideo key: ', newPreviewVideo[schemaPath], ' type: ', keyType);
      if (keyType !== schemaTypeOf) { return { error: `Preview video ${schemaPath} type is ${schemaTypeOf} and does not match ${keyType}.` }; }
    } else {
      return { error: `Preview video ${schemaPath} does not exist.` };
    }
  }

  return Price.create(newPrice)
    .then((result) => {
      if (result) {
        return Sidebar.create(newSidebar);
      }
      throw Error('Problem creating new Price');
    })
    .then((result) => {
      if (result) {
        return PreviewVideo.create(newPreviewVideo);
      }
      throw Error('Problem creating new Sidebar');
    })
    .then((result) => {
      if (result) {
        return 'Success in creating new data!';
      }
      throw Error('Problem creating new Preview Video');
    })
    .catch((error) => {
      console.warn('Error occured during create: ', error);
    });
};

// ------------------------------------------------------------------
// Function that deletes information on the database

const deleteAll = async (courseId) => {
  console.log(`Request to delete courseId: ${courseId.courseId} in DB.`);
  return Price.deleteOne(courseId)
    .then((result) => {
      if (result.deletedCount === 1) {
        // console.log(`Success in deleting Price for courseId: ${courseId.courseId}`);
        return Sidebar.deleteOne(courseId);
      }
      throw new Error(`Could not find document to delete in Price for courseId: ${courseId.courseId}`);
    })
    .then((result) => {
      if (result.deletedCount === 1) {
        // console.log(`Success in deleting Sidebar for courseId: ${courseId.courseId}`);
        return PreviewVideo.deleteOne(courseId);
      }
      throw new Error(`Could not find document to delete in Sidebar for courseId: ${courseId.courseId}`);
    })
    .then((result) => {
      if (result.deletedCount === 1) {
        // console.log(`Success in deleting Preview Video for courseId: ${courseId.courseId}`);
        console.log(`Success in deleting all data from courseId = ${courseId.courseId}!`);
        return true;
      }
      throw new Error(`Could not find document to delete in Preview Video for courseId: ${courseId.courseId}`);
    })
    .catch((error) => {
      console.warn('Error occured during delete: ', error);
      return false;
    });
};

// ------------------------------------------------------------------
// Function that updates information on the database

const update = async (courseId, updateDoc) => {
  console.log(`Request to update courseId: ${updateDoc.courseId} in DB.`);
  const updateOpts = {
    new: true,
    omitUndefined: true,
  };
  const updated = {};

  if (updateDoc.price !== undefined) {
    await Price.findOneAndUpdate(courseId, updateDoc.price, updateOpts)
      .then((result) => {
        console.log(result);
        updated.price = true;
      })
      .catch((error) => {
        console.warn('Error occured during update for price: ', error);
        updated.price = false;
      });
  }
  if (updateDoc.sidebar !== undefined) {
    await Sidebar.findOneAndUpdate(courseId, updateDoc.sidebar, updateOpts)
      .then((result) => {
        console.log(result);
        updated.sidebar = true;
      })
      .catch((error) => {
        console.warn('Error occured during update for sidebar: ', error);
        updated.sidebar = false;
      });
  }
  if (updateDoc.previewVideo !== undefined) {
    await PreviewVideo.findOneAndUpdate(courseId, updateDoc.previewVideo, updateOpts)
      .then((result) => {
        console.log(result);
        updated.previewVideo = true;
      })
      .catch((error) => {
        console.warn('Error occured during update for preview video: ', error);
        updated.previewVideo = false;
      });
  }

  return updated;
};
// ------------------------------------------------------------------
// Exports
exports.getPrice = getPrice;
exports.getSidebar = getSidebar;
exports.getPreviewVideo = getPreviewVideo;
exports.postAll = postAll;
exports.deleteAll = deleteAll;
exports.update = update;
exports.Price = Price;
exports.PreviewVideo = PreviewVideo;
exports.Sidebar = Sidebar;
exports.connection = connection;
