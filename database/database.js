const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));

const priceSchema = new mongoose.Schema({
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean
})

const Price = mongoose.model('Price', priceSchema);

async function populateDatabase(numberOfRecords) {
  for (let i = 0; i < numberOfRecords; i++) {
    const newPrice = generatePriceData();
    await newPrice.save();
  }
}

function generatePriceData() {
  const priceData = new Price({
    basePrice: createBasePrice(),
    discountPercentage: Number,
    discountedPrice: Number,
    saleEndDate: Date,
    saleOngoing: Boolean
  })
  return priceData;
}

function createBasePrice() {
  // Considered having min and max be parameters, but given that this function is only used for
  // initial data generation it seemed cleaner to have this included here instead
  const minPrice = 49.99;
  const maxPrice = 149.99;

  // It feels a little weird to be immediately converting information we just hard-coded, but I
  // think it's nice to have maxPrice and minPrice be similar to what one might see on the screen
  let range = Math.ceil(maxPrice) - Math.ceil(minPrice);
  console.log("Range: " + range);

  // All prices will be one cent off from multiples of 5, so we should get rid of the ones digit
  // (we're adding the occasional $5 later)
  range = range / 10;
  console.log("Modified Range: " + range);

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