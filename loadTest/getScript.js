import http from 'k6/http';
import { check } from 'k6';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 10 ** 3,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 100,
      maxVUs: 12500,
    }
  },
};

export default function () {
  const randCourseID = Math.floor(Math.random() * 10 ** 7);
  const getUrl = new URL('http://127.0.0.1:3004/sidebar/all');
  getUrl.searchParams.append('courseId', randCourseID);
  const res = http.get(getUrl.toString());
  check(res, {
    'is status 200': (r) => r.status === 200,
  });
};
