/* eslint-disable no-undef */
import 'regenerator-runtime/runtime';

jest.useFakeTimers();

const supertest = require('supertest');
const app = require('../server/server');

const request = supertest(app);

describe('API calls', () => {
  test('GET /sidebar/all route works for existing courseId', async (done) => {
    // expect.assertions(4);
    request.get('/sidebar/all?courseId=1')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200)
      .then((response) => {
        expect(response.body.price.basePrice).toEqual(89.99);
        expect(response.body.sidebar.fullLifetimeAccess).toEqual('Full lifetime access');
        done();
      })
      .catch((err) => done(err));
  });

  test('POST /sidebar/all route works for existing courseId', async (done) => {
    const testData = {
      courseId: 101,
      price: {
        basePrice: 99.99,
        discountPercentage: 84,
        discountedPrice: 15.99,
        saleEndDate: '2021-06-29T20:14:35.238Z',
        saleOngoing: false,
      },
      sidebar: {
        fullLifetimeAccess: 'Full lifetime access',
        accessTypes: 'Access on mobile and TV',
        assignments: true,
        certificateOfCompletion: true,
        downloadableResources: 20,
      },
      previewVideo: {
        previewVideoImgUrl: 'http://localhost:3004/assets/previewVideoImg6.jpg',
        previewVideoUrl: 'http://localhost:3004/assets/previewVideo6.mp4',
      },
    };
    // expect.assertions(1);
    request.post('/sidebar/all')
      .send(testData)
      .expect(201, done())
      .catch((err) => done(err));
  });

  test('DELETE /sidebar/all route works for existing courseId', async (done) => {
    // create data to delete...
    const testData = {
      courseId: 101,
      price: {
        basePrice: 99.99,
        discountPercentage: 84,
        discountedPrice: 15.99,
        saleEndDate: '2021-06-29T20:14:35.238Z',
        saleOngoing: false,
      },
      sidebar: {
        fullLifetimeAccess: 'Full lifetime access',
        accessTypes: 'Access on mobile and TV',
        assignments: true,
        certificateOfCompletion: true,
        downloadableResources: 20,
      },
      previewVideo: {
        previewVideoImgUrl: 'http://localhost:3004/assets/previewVideoImg6.jpg',
        previewVideoUrl: 'http://localhost:3004/assets/previewVideo6.mp4',
      },
    };
    // expect.assertions(1);
    await request.post('/sidebar/all')
      .send(testData);

    // expect.assertions(1);
    await request.delete('/sidebar/all?courseId=101')
      .expect(204, done());
  });
});
