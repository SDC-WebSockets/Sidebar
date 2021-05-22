const mongoose = require('mongoose');

// Connecting to the database
mongoose.connect('mongodb://localhost:27017/sidebar?gssapiServiceName=mongodb', {useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log("Connected to database."))
.catch( error => console.log("Connection error: ", error));

const connection = mongoose.connection;

// ------------------------------------------------------------------
// Setting up schemas and models
const priceSchema = new mongoose.Schema({
  courseId: Number,
  basePrice: Number,
  discountPercentage: Number,
  discountedPrice: Number,
  saleEndDate: Date,
  saleOngoing: Boolean
});

const Price = mongoose.model('Price', priceSchema);

const previewVideoSchema = new mongoose.Schema({
  courseId: Number,
  previewVideoUrl: String,
});

const PreviewVideo = mongoose.model('PreviewVideo', previewVideoSchema);

const sidebarSchema = new mongoose.Schema({
  courseId: Number,
  fullLifetimeAccess: String,
  accessTypes: String,
  assignments: Boolean,
  certificateOfCompletion: Boolean,
  downloadableResources: Number
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
// Exports
exports.getPrice = getPrice;
exports.getSidebar = getSidebar;
exports.getPreviewVideo = getPreviewVideo;
exports.Price = Price;
exports.PreviewVideo = PreviewVideo;
exports.Sidebar = Sidebar;
exports.connection = connection;