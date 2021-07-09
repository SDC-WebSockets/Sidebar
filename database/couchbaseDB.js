/* eslint-disable no-console */
const couchbase = require('couchbase');
const { username, password } = require('./cb.config.js');

const cluster = new couchbase.Cluster('couchbase://localhost', {
  username,
  password,
});
const bucketMgr = cluster.buckets();

const sdc = cluster.bucket('sdc');
const price = cluster.bucket('price');
const video = cluster.bucket('video');
const sidebar = cluster.bucket('sidebar');
const priceCollection = price.defaultCollection();
const videoCollection = video.defaultCollection();
const sidebarCollection = sidebar.defaultCollection();
