/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
const AWS = require('aws-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { createClient } = require('pexels');
const { AWSAccessKeyId, AWSSecretKey } = require('./aws.config.js');
const { pexelsAuth } = require('./pexels.config.js');
// const faker = require('faker');

const numSeededFiles = 200;

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

const client = createClient(pexelsAuth);
const getVideoLinks = async (page) => {
  const videoURLArray = [];

  await client.videos.search({
    query: 'cats',
    orientation: 'landscape',
    size: 'small',
    locale: 'en-US',
    page,
    per_page: 80,
  }).then((response) => {
    const { videos } = response;
    for (let i = 0; i < videos.length; i += 1) {
      const currVid = videos[i];
      // console.log(currVid);
      videoURLArray.push(currVid.video_files[0].link);
    }
  });
  // console.log(videoURLArray);
  return videoURLArray;
};

const generateNumOfVideoLinks = async (numVideosRequested) => {
  const allVideoURLs = [];
  const callsToAPI = Math.ceil(numVideosRequested / 80);
  for (let i = 1; i <= callsToAPI; i += 1) {
    const moreVideoURLs = await getVideoLinks(i);
    allVideoUrls = allVideoURLs.concat(moreVideoURLs);
  }
  console.log(allVideoURLs, allVideoURLs.length);

};

generateNumOfVideoLinks(numSeededFiles);

const download = async (url, i, type) => {
  const dlPath = path.join(`${__dirname}/${type}`);
  const response = await fetch(url);
  const buffer = await response.buffer();
  const dlPathName = `${dlPath}/${i.toString()}.jpg`;
  return new Promise((resolve, reject) => {
    fs.writeFile(dlPathName, buffer, (err) => {
      err ? reject(err) : resolve(dlPathName);
    });
  });
};

const imageToS3 = (image, i) => {
  const pathName = `videoImg/${i.toString()}.jpg`;
  const data = {
    Key: pathName,
    Body: image,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3Bucket.putObject(data, (err) => {
      err ? reject(err) : resolve(s3Url + pathName);
    });
  });
};

const videoToS3 = (video, i) => {
  const pathName = `video/${i.toString()}.mp4`;
  const data = {
    Key: pathName,
    Body: video,
    ContentType: 'video/mp4',
    ACL: 'public-read',
  };
  return new Promise((resolve, reject) => {
    s3Bucket.putObject(data, (err) => {
      err ? reject(err) : resolve(s3Url + pathName);
    });
  });
};

const seedPhotos = async () => {
  for (let i = 1000; i <= numSeededFiles; i += 1) {
    const width = 342;
    const height = 192;
    const image = `http://placecorgi.com/${width}/${height}`;
    let imageFilePath;
    // console.log(image);
    await download(image, i, 'photos')
      .then((result) => {
        // console.log('Success! photo at: ', result);
        imageFilePath = result;
        const imageFile = fs.readFileSync(result);
        return imageToS3(imageFile, i);
      })
      .then((result) => {
        console.log('Success! photo at: ', result);
        return fs.unlink(imageFilePath, (err) => {
          if (err) throw Error('Cannot delete local file');
        });
      })
      .then(() => {
        console.log('Photo removed locally');
      })
      .catch((error) => {
        console.log('Error in Seeding!');
        console.log(error);
      });
  }
};

const seedVideos = async () => {
  for (let i = 1; i <= numSeededFiles; i += 1) {
    const video = `http://placecorgi.com/v/${width}/${height}`;

    await download(video, i, 'videos')
      .then((result) => {
        console.log('Success! video at: ', result);
        const videoFile = fs.readFileSync(result);
        return videoToS3(videoFile, i);
      })
      .then((result) => {
        console.log('Success! video at: ', result);
      })
      .catch((error) => {
        console.log('Error in Seeding!');
        console.log(error);
      });
  }
};

// seedPhotos();
// seedVideos();
