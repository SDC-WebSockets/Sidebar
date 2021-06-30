/* eslint-disable no-undef */
import 'regenerator-runtime/runtime';

const supertest = require('supertest');
const app = require('../server/server');

const request = supertest(app);

describe('API calls', () => {
  test('/sidebar/all route works for existing courseId', async (done) => {
    request.get('/sidebar/all?courseId=1')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.body.price.basePrice).toEqual(99.99);
        expect(response.body.sidebar.fullLifetimeAccess).toEqual('Full lifetime access');
        done();
      })
      .catch((err) => done(err));
  });
});
