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
  // const before = new Date().getTime();
  // const T = 2;

  const randCourseID = Math.floor(Math.random() * 10 ** 7);
  const getUrl = new URL('http://localhost:3004/sidebar/all');
  getUrl.searchParams.append('courseId', randCourseID);
  http.get(getUrl.toString());

  const postUrl = 'http://localhost:3004/sidebar/all';
  const newPost = postDataGen();
  http.post(postUrl, JSON.stringify(newPost), { headers: { 'Content-Type': 'application/json' } });

  // const after = new Date().getTime();
  // const diff = (after - before) / 1000;
  // const remainder = T - diff;
  // check(remainder, { 'reached request rate': remainder > 0 });
  // if (remainder > 0) {
  //   sleep(remainder);
  // } else {
  //   console.warn(`Timer exhausted! The execution time of the test took longer than ${T} seconds`);
  // }
}
