import http from 'k6/http';
import { check } from 'k6';

export let options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 10 ** 2 * 2.5,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 1000,
      maxVUs: 12500,
      gracefulStop: '3m',
    }
  },
};

export default function () {
  const params = {
    timeout:'90s',
  }
  const randCourseID = 9 * 10 ** 6 + Math.floor(Math.random() * 10 ** 6);
  const res = http.get(`http://localhost:3004/sidebar/all?courseId=${randCourseID}`, params);
  check(res, {
    'is status 200': (r) => r.status === 200,
    'status is 404': (r) => r.status === 404,
  });
};
