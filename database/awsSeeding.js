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

const numSeededFiles = 1000;

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

const generateVideoURLs = async (totalVideoUrls, currPage = 1, allVideoURLs = []) => {
  const callsToAPI = Math.ceil(totalVideoUrls / 80);
  if (callsToAPI === currPage) {
    const moreVideoURLs = await getVideoLinks(currPage);
    const totalLength = allVideoURLs.concat(moreVideoURLs).length;
    console.log(totalLength);
    return allVideoURLs.concat(moreVideoURLs);
  }

  const moreVideoURLs = await getVideoLinks(currPage);
  return generateVideoURLs(totalVideoUrls, currPage += 1, allVideoURLs.concat(moreVideoURLs));
};

const videoTxtPath = path.join(`${__dirname}/videoURLs.txt`);

const writeVideoUrlsToFile = async () => {
  const links = await generateVideoURLs(500);
  const currFile = fs.readFileSync(videoTxtPath);
  const currArray = JSON.parse(currFile);
  const allLinks = currArray.concat(links);
  console.log('currArray length: ', currArray.length);
  console.log('allLinks length: ', allLinks.length);
  fs.writeFile(videoTxtPath, JSON.stringify(allLinks), (err) => {
    if (err) {
      console.log('Writing of Video URLs to File FAILED');
    } else {
      console.log('Writing of Video URLs to File SUCCESS');
    }
  });
};

// writeVideoUrlsToFile();

const download = async (url, i, type) => {
  const dlPath = path.join(`${__dirname}/${type}`);
  const response = await fetch(url);
  const buffer = await response.buffer();
  const dlPathName = `${dlPath}/${i.toString()}.${type === 'videos' ? 'mp4' : 'jpg'}`;
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
  const videosFile = fs.readFileSync(videoTxtPath);
  const videos = JSON.parse(videosFile);
  console.log('Number of Videos on File: ', videos.length);
  for (let i = 201; i <= numSeededFiles; i += 1) {
    const video = videos[i];
    let videoFilePath;

    await download(video, i, 'videos')
      .then((result) => {
        console.log('Success! video at: ', result);
        videoFilePath = result;
        const videoFile = fs.readFileSync(result);
        return videoToS3(videoFile, i);
      })
      .then((result) => {
        console.log('Success! video at: ', result);
        return fs.unlink(videoFilePath, (err) => {
          if (err) throw Error('Cannot delete local file');
        });
      })
      .then(() => {
        console.log('Video removed locally');
      })
      .catch((error) => {
        console.log('Error in Seeding!');
        console.log(error);
      });
  }
};

// seedPhotos();
seedVideos();

// (function () {
//   const videosFile = fs.readFileSync(videoTxtPath);
//   const videos = JSON.parse(videosFile);
//   const videoSet = new Set(videos);
//   console.log(videoSet.size);
//   const videoArray = Array.from(videoSet);
//   fs.writeFile(videoTxtPath, JSON.stringify(videoArray), (err) => {
//     if (err) {
//       console.log('Writing of Video Set to File FAILED');
//     } else {
//       console.log('Writing of Video Set to File SUCCESS');
//     }
//   });
// }());
