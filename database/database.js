const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/sidebar?gssapiServiceName=mongodb', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to database."))
.catch( error => console.log("Connection error: ", error));

const connection = mongoose.connection;

const priceSchema = new mongoose.Schema({
  courseID: Number,
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean
})

const Price = mongoose.model('Price', priceSchema);

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
      }
    }
  });
}

const generatePriceData = (index) => {
  console.log("index: " + index);
  const basePrice = createBasePrice();
  const discountPercentage = 84;
  const saleEndDate = new Date();
  const priceData = new Price({
    courseID: index,
    basePrice: basePrice,
    discountPercentage: discountPercentage,
    discountedPrice: Math.round(Math.floor(basePrice * (discountPercentage / 100)) * 100) / 100,
    saleEndDate: saleEndDate.setDate(saleEndDate.getDate() + 3),
    saleOngoing: Math.random() * 100 > 30 ? false : true
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
  if (Math.random() < 0.2) {
    basePrice = basePrice + 5;
  }

  return basePrice;
}

exports.populateDatabase = populateDatabase;