/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const couchbase = require('couchbase');
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
    .catch((error) => {
      console.warn(error);
    });
};

const populateCB = async () => {
// resetBuckets(sdcBucketSetup, 'price')
// .then(() =>
  await resetBuckets(sdcBucketSetup, 'video')
    .then(() => resetBuckets(sdcBucketSetup, 'sidebar'))
    // .then(() => priceCollection.insert(key, sample.price))
    // .then(() => videoCollection.insert(key, sample.video))
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.warn(error);
    });
};

populateCB();
// resetBuckets(sdcBucketSetup, 'price');
