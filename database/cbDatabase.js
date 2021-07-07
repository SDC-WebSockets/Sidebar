/* eslint-disable no-console */
const couchbase = require('couchbase');
const { username, password } = require('./cb.config.js');

const cluster = new couchbase.Cluster('couchbase://localhost', {
  username,
  password,
});

const price = cluster.bucket('price');
const video = cluster.bucket('video');
const sidebar = cluster.bucket('sidebar');
const priceCollection = price.defaultCollection();
const videoCollection = video.defaultCollection();
const sidebarCollection = sidebar.defaultCollection();

const openConn = () => couchbase.connect('couchbase://localhost', {
  username,
  password,
})
  .then(() => {
    console.log('DB connection successful.');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });
const closeConn = () => cluster.close()
  .then(() => {
    console.log('DB connection closed.');
  });

module.exports.Price = priceCollection;
module.exports.PreviewVideo = videoCollection;
module.exports.Sidebar = sidebarCollection;
module.exports.openConn = openConn;
module.exports.closeConn = closeConn;
