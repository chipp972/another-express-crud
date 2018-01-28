// @flow
import test from 'tape';
import express, { Response } from 'express';
import request from 'supertest';
import { getOperations, getStore } from './crud.mock';
import { crud } from '../src/crud';

// init tests
const app = express();
const store = getStore();
const operations = getOperations(store);
const crudRoutes = crud({ operations });
app.use('/test', crudRoutes);
app.use((err: Error, _, res: Response, next) =>
  res.status(404).json({ success: false, message: err.message })
);

test('read without param or filter', (t) => {
  request(app)
    .get('/test')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, store.items);
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('read with id param', (t) => {
  request(app)
    .get('/test/id1')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: 'id1', test: 'test2' });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('read with query', (t) => {
  request(app)
    .get('/test?test=test3')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, [{ _id: 'id2', test: 'test3' }]);
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('read with param AND query', (t) => {
  request(app)
    .get('/test/id1?test=test3')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: 'id1', test: 'test2' });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('read with bad param', (t) => {
  request(app)
    .get('/test/id8')
    .then((res: Response) => {
      const { success, message } = res.body;
      t.deepEqual(message, 'NotFound');
      t.notOk(success);
      t.equal(res.status, 404);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('read with bad query', (t) => {
  request(app)
    .get('/test?test=haha')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, []);
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
