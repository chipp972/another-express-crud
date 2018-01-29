// @flow
import test from 'tape';
import { Response } from 'express';
import request from 'supertest';
import { getOperations, getStore, getApp } from '../crud.mock';
import { crud } from '../../src/crud';

// init tests
const app = getApp();
const store = getStore();
const operations = getOperations(store);
const crudRoute1 = crud({
  operations,
  policy: {
    create: 'guest',
    read: 'user',
    update: 'owner',
    delete: 'admin',
    isOwner: ({ id, user }) => (user ? user._id === id : false)
  }
});
const crudRoute2 = crud({
  operations,
  policy: {
    read: 'admin',
    isDisabled: true
  }
});
app.use((req, res, next) => {
  req.user = { _id: 'id1' };
  next();
});
app.use('/test', crudRoute1);
app.use('/disabled', crudRoute2);
app.use((err, req, res, next) =>
  res.status(500).json({ success: false, message: err.message })
);

test('read without permission and disabled policy', (t) => {
  request(app)
    .get('/disabled')
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, store.items);
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('update without permission', (t) => {
  request(app)
    .put('/test/id2')
    .send({ test: 'test8' })
    .then((res: Response) => {
      const { success, message } = res.body;
      t.equal(message, 'PolicyError');
      t.notOk(success);
      t.equal(res.status, 500);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('update owned ressource', (t) => {
  request(app)
    .put('/test/id1')
    .send({ test: 'test8' })
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: 'id1', test: 'test8' });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test('delete without permission', (t) => {
  request(app)
    .delete('/test/id1')
    .then((res: Response) => {
      const { success, message } = res.body;
      t.deepEqual(message, 'PolicyError');
      t.notOk(success);
      t.equal(res.status, 500);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
