import http from 'k6/http';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import { sleep, check } from 'k6';
const { postDataGen } =  require('./postDataGenHelpers.js');

// export let options = {
//   vus: 10 ** 1,
//   duration: '1s',
// };

export let options = {
  vus: 300,
  duration: '10s',
};


export default function () {
  const before = new Date().getTime();
  const T = 2;

  const randCourseID = Math.floor(Math.random() * 10 ** 7);
  const getUrl = new URL('http://localhost:3004/sidebar/all');
  getUrl.searchParams.append('courseId', randCourseID);
  http.get(getUrl.toString());

  const postUrl = 'http://localhost:3004/sidebar/all';
  const newPost = postDataGen();
  http.post(postUrl, JSON.stringify(newPost), { headers: { 'Content-Type': 'application/json' } });

  const after = new Date().getTime();
  const diff = (after - before) / 1000;
  const remainder = T - diff;
  check(remainder, { 'reached request rate': remainder > 0 });
  if (remainder > 0) {
    sleep(remainder);
  } else {
    console.warn(`Timer exhausted! The execution time of the test took longer than ${T} seconds`);
  }
}
