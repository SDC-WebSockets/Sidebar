import { check } from 'k6';
import http from 'k6/http';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
const { postDataGen } =  require('./postDataGenHelpers.js');

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 10 ** 3,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 100,
      maxVUs: 2500,
    }
  },
};

export default function () {
  const postUrl = 'http://localhost:3004/sidebar/all';
  const newPost = postDataGen();
  const res = http.post(postUrl, JSON.stringify(newPost), { headers: { 'Content-Type': 'application/json' } });
    check(res, {
    'is status 201?': (r) => r.status === 201,
  });
};
