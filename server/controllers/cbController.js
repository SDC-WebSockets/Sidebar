/* eslint-disable no-console */
const { Price, PreviewVideo, Sidebar } = require('../../database/cbDatabase');
const helper = require('./helper.js');

module.exports.getPrice = async (req, res) => {
  console.log('GET request received at /price.', req.query);
  const { courseId } = req.query;
};

module.exports.getPreviewVideo = async (req, res) => {
  console.log('GET request received at /previewVideo.', req.query);
  const { courseId } = req.query;
};

module.exports.getSidebar = async (req, res) => {
  console.log('GET request received at /sidebar ', req.query);
  const { courseId } = req.query;
};

// Read
module.exports.getAll = async (req, res) => {
  console.log('GET request received at /sidebar/all.');
  const { courseId } = req.query;
};

// Create
module.exports.add = async (req, res) => {
  console.log('POST request to /sidebar/all');
};

// Update
module.exports.update = async (req, res) => {
  const updateDoc = req.body;
  const { courseId } = updateDoc;
  console.log('PUT request to /sidebar/all { courseId: ', courseId, ' }');
};
