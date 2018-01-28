// @flow
import test from 'tape';
import { Response } from 'express';
import request from 'supertest';
import { getOperations, getStore, getApp } from './crud.mock';
import { crud } from '../src/crud';

// init tests
const app = getApp();
const store = getStore();
const operations = getOperations(store);
const crudRoutes = crud({ operations });
app.use('/test', crudRoutes);
app.use((err: Error, _, res: Response, next) =>
  res.status(404).json({ success: false, message: err.message })
);

test('delete response', (t) => {
  request(app)
    .delete('/test/id2')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: 'id2', test: 'test3' });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('object is deleted from store', (t) => {
  request(app)
    .get('/test/id2')
    .then((res: Response) => {
      const { success, message } = res.body;
      t.deepEqual(message, 'NotFound');
      t.notOk(success);
      t.equal(res.status, 404);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
