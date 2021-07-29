import http from 'k6/http';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
const { postDataGen } =  require('./postDataGenHelpers.js');

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 10 ** 3,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 300,
    }
  },
};

export default function () {
  const postUrl = 'http://localhost:3004/sidebar/all';
  const newPost = postDataGen();
  http.post(postUrl, JSON.stringify(newPost), { headers: { 'Content-Type': 'application/json' } });
};
