/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const path = require('path');
const couchbase = require('couchbase');
const { exec } = require('child_process');
const { username, password } = require('./cb.config.js');

const cluster = new couchbase.Cluster('couchbase://localhost', {
  username,
  password,
});
const bucketMgr = cluster.buckets();
const price = cluster.bucket('price');
const video = cluster.bucket('video');
const sidebar = cluster.bucket('sidebar');

const sdcBucketSetup = {
  flushEnabled: true,
  replicaIndex: false,
  ramQuotaMB: 955,
  bucketType: couchbase.BucketType.Couchbase,
};

const resetBuckets = (bucket, name) => {
  console.log('resetting ', name);
  bucket.name = name;
  return bucketMgr.flushBucket(name)
    .then(() => {
      console.log('Flushed', bucket.name);
    })
    .catch((error) => {
      console.warn(error.message);
      if (error.message !== 'bucket not found') {
        throw error;
      } else {
        return bucketMgr.createBucket(bucket)
          .then(() => {
            console.log(`Created ${bucket.name} bucket!`);
          });
      }
    })
    .then(() => {
      const importText = `"/Applications/Couchbase Server.app/Contents/Resources/couchbase-core/bin/cbimport" csv -c http://127.0.0.1:8091 -u ${username} -p ${password} -b ${name} -g %courseId% -d file://${path.join(`${__dirname}/data_gen/${name}Data.csv`)}`;

      return exec(`${importText}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
      });
    })
    .catch((error) => {
      console.warn(error);
    });
};

const populateCB = async () => {
  await resetBuckets(sdcBucketSetup, 'price')
    .then(() => resetBuckets(sdcBucketSetup, 'video'))
    .then(() => resetBuckets(sdcBucketSetup, 'sidebar'))
    .catch((error) => {
      console.warn(error);
    });
};

populateCB();
// resetBuckets(sdcBucketSetup, 'price');
