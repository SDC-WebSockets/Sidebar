
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { createClient } = require('pexels');
const { AWSAccessKeyId, AWSSecretKey } = require('./aws.config.js');


AWS.config.update({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey,
  region: 'us-west-2',
});

const Bucket = 'sdc-websockets-sidebar';
const s3Bucket = new AWS.S3({
  params: { Bucket },
});
const s3Url = 'https://sdc-websockets-sidebar.s3-us-west-2.amazonaws.com/';

const bundleToS3 = (bundle) => {
  const pathName = 'sidebar.js';
  const data = {
    Key: pathName,
    Body: bundle,
    ContentType: 'application/javascript',
    ACL: 'public-read'
  };
  return new Promise((resolve, reject) => {
    s3Bucket.putObject(data, err => {
      err ? reject(err) : resolve(s3Url + pathName)
    })
  })
    .then(result => {
      console.log('Success! bundle loaded at: ', result);
    })
    .catch(error => {
      console.log('Error in Bundle Loading!');
      console.log(error);
    })
};

const uploadBundle = () =>{
  const pathToBundle = path.resolve('./public/sidebar.js');
  console.log('path: ', pathToBundle)
  const bundle = fs.readFileSync(pathToBundle);
  bundleToS3(bundle);
}

uploadBundle();
