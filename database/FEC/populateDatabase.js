const mongoose = require('mongoose');
const database = require('./database.js');
const dotenv = require('dotenv');
dotenv.config();

const populateDatabase = async (numberOfRecords) => {
  // Make a list of all the collections
  await database.connection.db.listCollections().toArray( async (err, collections) => {
    if (err) {
      console.log("Error has occurred: " + err);
    } else {
      // Go through the list of collections and delete each one
      for (let collection of collections) {
        database.connection.db.dropCollection(collection.name, (err, result) => {
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
    database.connection.close();
  });
}

const randomDecider = (percentageChance) => {
  if (Math.random() * 100 < percentageChance) {
    return true;
  } else {
    return false;
  }
}

const generatePriceData = (index) => {
  const baseDiscountPercentage = 84;
  const basePrice = createBasePrice();
  const discountedPrice = (Math.round(Math.floor(basePrice * ((100 - baseDiscountPercentage) / 100)) * 100) / 100) + 0.99
  const saleEndDate = new Date();
  const priceData = new database.Price({
    courseId: index,
    basePrice: basePrice,
    discountPercentage: Math.round((1 - (discountedPrice / basePrice)) * 100),
    discountedPrice: discountedPrice,
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
  let basePrice = (Math.floor(Math.random() * range) * 10 + Math.floor(minPrice) + 0.99);

  // 20-ish% of the time we'll add $5, so we get the occasional $54.99 or whatever
  if (randomDecider(20)) {
    basePrice = basePrice + 5;
  }

  // Get rid of anything after 2 decimal places (cleaning up after floating-point issues)
  basePrice = Math.round(basePrice * 100) / 100;

  return basePrice;
}

const generatePreviewVideoData = (index) => {

  const videoIndex = Math.floor(Math.random() * 10);

  const previewVideoData = new database.PreviewVideo({
    courseId: index,
    previewVideoImgUrl: `${process.env.ASSET_URL}/previewVideoImg${videoIndex}.jpg`,
    previewVideoUrl: `${process.env.ASSET_URL}/previewVideo${videoIndex}.mp4`
  });

  return previewVideoData;
}

const generateSidebarData = (index) => {

  const sidebarData = new database.Sidebar({
    courseId: index,
    fullLifetimeAccess: randomDecider(70) ? "Full lifetime access" : "Full access during subscription term",
    accessTypes: "Access on mobile and TV",
    assignments: randomDecider(70),
    certificateOfCompletion: randomDecider(90),
    downloadableResources: randomDecider(90) ? Math.round(Math.random() * 25) : 0,
  });

  return sidebarData;
}

database.connection.on('connected', () => {
  populateDatabase(100);
});