const mongoose = require('mongoose');

// Actually connecting to the database
mongoose.connect('mongodb://localhost:27017/sidebar?gssapiServiceName=mongodb', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to database."))
.catch( error => console.log("Connection error: ", error));

const connection = mongoose.connection;

// ------------------------------------------------------------------
// Setting up schemas and models
const priceSchema = new mongoose.Schema({
  courseID: Number,
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean
});

const Price = mongoose.model('Price', priceSchema);

const previewVideoSchema = new mongoose.Schema({
  courseID: Number,
  previewVideoUrl: String,
});

const PreviewVideo = mongoose.model('PreviewVideo', previewVideoSchema);

const sidebarSchema = new mongoose.Schema({
  courseID: Number,
  fullLifetimeAccess: String,
  accessTypes: String,
  assignments: Boolean,
  certificateOfCompletion: Boolean
})

const Sidebar = mongoose.model('Sidebar', sidebarSchema);

// ------------------------------------------------------------------
// Functions that retrieve information from the database
const getPrice = (query, callback) => {
  return Price.find(query, callback);
}

const getPreviewVideo = (query, callback) => {
  return PreviewVideo.find(query, callback);
}

const getSidebar = (query, callback) => {
  return Sidebar.find(query, callback);
}

// ------------------------------------------------------------------
// Functions that create data and add it to the database
const populateDatabase = async (numberOfRecords) => {
  // Make a list of all the collections
  await connection.db.listCollections().toArray( async (err, collections) => {
    if (err) {
      console.log("Error has occurred: " + err);
    } else {
      // Go through the list of collections and delete each one
      for (let collection of collections) {
        connection.db.dropCollection(collection.name, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Collection "' + collection.name + '" dropped.');
          }
        });
      }
      // Generate new data
      console.log("Populating database...");
      for (let i = 0; i < numberOfRecords; i++) {
        const newPrice = generatePriceData(i + 1);
        await newPrice.save().then((result) => console.log(result));
        const newPreviewVideo = generatePreviewVideoData(i + 1);
        await newPreviewVideo.save().then((result) => console.log(result));
        const newSidebar = generateSidebarData(i + 1);
        await newSidebar.save().then((result) => console.log(result));
      }
    }
  });
}

const generatePriceData = (index) => {
  const basePrice = createBasePrice();
  const discountPercentage = 84;
  const saleEndDate = new Date();
  const priceData = new Price({
    courseID: index,
    basePrice: basePrice,
    discountPercentage: discountPercentage,
    discountedPrice: Math.round(Math.floor(basePrice * (discountPercentage / 100)) * 100) / 100,
    saleEndDate: saleEndDate.setDate(saleEndDate.getDate() + 3),
    saleOngoing: randomDecider(30)
  });

  return priceData;
}

const createBasePrice = () => {
  // Considered having min and max be parameters, but given that this function is only used for
  // initial data generation it seemed cleaner to have this included here instead
  const minPrice = 49.99;
  const maxPrice = 149.99;

  // It feels a little weird to be immediately converting information we just hard-coded, but I
  // think it's nice to have maxPrice and minPrice be similar to what one might see on the screen
  let range = Math.ceil(maxPrice) - Math.ceil(minPrice);

  // All prices will be one cent off from multiples of 5, so we should get rid of the ones digit
  // (we're adding the occasional $5 later)
  range = range / 10;

  // Construct basePrice
  let basePrice = (Math.floor(Math.random() * range) * 10 + minPrice);

  // Get rid of anything after 2 decimal places (cleaning up after floating-point issues)
  basePrice = Math.round(basePrice * 100) / 100;

  // 20-ish% of the time we'll add $5, so we get the occasional $54.99 or whatever
  if (randomDecider(20)) {
    basePrice = basePrice + 5;
  }

  return basePrice;
}

const generatePreviewVideoData = (index) => {

  const videoIndex = Math.floor(Math.random() * 10);

  const previewVideoData = new PreviewVideo({
    courseID: index,
    previewVideoUrl: "https://example.com/previewVideo" + videoIndex + ".mp4",
  });

  return previewVideoData;
}

const generateSidebarData = (index) => {

  const sidebarData = new Sidebar({
    courseID: index,
    fullLifetimeAccess: randomDecider(70) ? "Full lifetime access" : "Full access during subscription term",
    accessTypes: "Access on mobile and TV",
    assignments: randomDecider(70),
    certificateOfCompletion: randomDecider(90)
  });

  return sidebarData;
}

const randomDecider = (percentageChance) => {
  if (Math.random() * 100 < percentageChance) {
    return true;
  } else {
    return false;
  }
}

// ------------------------------------------------------------------
// Exports
exports.populateDatabase = populateDatabase;
exports.getPrice = getPrice;
exports.getSidebar = getSidebar;
exports.getPreviewVideo = getPreviewVideo;