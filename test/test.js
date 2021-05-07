import 'regenerator-runtime/runtime';
import server from '../server/server';
import database from '../database/database';

jest.setTimeout(15000);

function sum(a, b) {
  return a + b;
}

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('database returns price information for ids 1-100', async () => {
  let result = [];
  for (let i = 0; i < 100; i++) {
    await database.getPrice({courseID: i}, (err, docs) => {
      result.push(docs[0]);
    });
  }
  expect(result).toHaveLength(100);
});

test('database returns previewVideo information for ids 1-100', async () => {
  let result = [];
  for (let i = 0; i < 100; i++) {
    await database.getPreviewVideo({courseID: i}, (err, docs) => {
      result.push(docs[0]);
    });
  }
  expect(result).toHaveLength(100);
});

test('database returns sidebar information for ids 1-100', async () => {
  let result = [];
  for (let i = 0; i < 100; i++) {
    await database.getSidebar({courseID: i}, (err, docs) => {
      result.push(docs[0]);
    });
  }
  expect(result).toHaveLength(100);
});

// test('database returns appropriate error message for invalid id', async () => {
//   await database.getPrice({courseID: 105}, (err, docs) => {
//     expect(err).toBe("");
//   });
// });

afterAll(() => server.closeServer());

