import 'regenerator-runtime/runtime';
import database from '../database/database';
const supertest = require('supertest');
const app = require('../server/server');
const request = supertest(app);

jest.setTimeout(15000);

function sum(a, b) {
  return a + b;
}

describe('database methods work right, and database content exists', () => {

  test('database returns price information for ids 1-100', async done => {
    let result = [];
    for (let i = 0; i < 100; i++) {
      await database.getPrice({courseId: i}, (err, docs) => {
        result.push(docs[0]);
      });
    }
    expect(result).toHaveLength(100);
    done();
  });

  test('database returns previewVideo information for ids 1-100', async done => {
    let result = [];
    for (let i = 0; i < 100; i++) {
      await database.getPreviewVideo({courseId: i}, (err, docs) => {
        result.push(docs[0]);
      });
    }
    expect(result).toHaveLength(100);
    done();
  });

  test('database returns sidebar information for ids 1-100', async done => {
    let result = [];
    for (let i = 0; i < 100; i++) {
      await database.getSidebar({courseId: i}, (err, docs) => {
        result.push(docs[0]);
      });
    }
    expect(result).toHaveLength(100);
    done();
  });
});

describe('server methods work right', () => {

  test('can see the /price endpoint', async done => {
    const response = await request.get('/price');
    expect(response.status).toBe(200);
    done();
  });

  test('can see the /previewVideo endpoint', async done => {
    const response = await request.get('/previewVideo');
    expect(response.status).toBe(200);
    done();
  });

  test('can see the /sidebar endpoint', async done => {
    const response = await request.get('/sidebar');
    expect(response.status).toBe(200);
    done();
  });

  test('/price route works for existing courseId', async done => {
    request.get('/price?courseId=10')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, done);
  });

  test('/previewVideo route works for existing courseId', async done => {
    request.get('/previewVideo?courseId=10')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, done);
  });

  test('/sidebar route works for existing courseId', async done => {
    request.get('/sidebar?courseId=10')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(200, done);
  });

  test('/price responds appropriately if document not found', async done => {
    const response = await request.get('/price?courseId=5000');
    expect(response.status).toBe(404);
    done();
  });

  test('/previewVideo responds appropriately if document not found', async done => {
    const response = await request.get('/previewVideo?courseId=5000');
    expect(response.status).toBe(404);
    done();
  });

  test('/sidebar responds appropriately if document not found', async done => {
    const response = await request.get('/sidebar?courseId=5000');
    expect(response.status).toBe(404);
    done();
  });

});

