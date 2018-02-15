// @flow
import test from 'tape';
import request, { Response } from 'supertest';
import { getOperations, getStore, getApp } from '../crud.mock';
import { crud } from '../../src/crud';

// init tests
const app = getApp();
const store = getStore();
const operations = getOperations(store);

// route1
const crudRoute1 = crud({
  operations,
  policy: {
    create: 'owner',
    read: 'user',
    update: 'owner',
    delete: 'admin',
  },
});
// route with disabled permissions
const crudRoute2 = crud({
  operations,
  policy: {
    read: 'admin',
    isDisabled: true,
  },
});
// mock user authentication
app.use((req, res, next) => {
  req.user = { _id: 'id1' };
  next();
});

app.use('/test', crudRoute1);
app.use('/disabled', crudRoute2);
app.use((err, req, res, next) =>
  res.status(err.status).json({ success: false, message: err.message })
);

test('Policy tests', (group) => {
  group.test('read without permission and disabled policy', (t) => {
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

  group.test('create with owner permission', (t) => {
    request(app)
      .post('/test')
      .send({ owner: 'id1', test: 'test90' })
      .then((res: Response) => {
        const { success, data } = res.body;
        t.deepEqual(data, { _id: 'id5', owner: 'id1', test: 'test90' });
        t.ok(success);
        t.equal(res.status, 201);
        t.end();
      })
      .catch((err: Error) => t.fail(err));
  });

  group.test('update without permission', (t) => {
    request(app)
      .put('/test/id2')
      .send({ test: 'test8' })
      .then((res: Response) => {
        const { success, message } = res.body;
        t.equal(
          message,
          'Request has user permission while owner permission is required'
        );
        t.notOk(success);
        t.equal(res.status, 401);
        t.end();
      })
      .catch((err: Error) => t.fail(err));
  });

  group.test('update owned ressource', (t) => {
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

  group.test('delete without permission', (t) => {
    request(app)
      .delete('/test/id1')
      .then((res: Response) => {
        const { success, message } = res.body;
        t.deepEqual(
          message,
          'Request has owner permission while admin permission is required'
        );
        t.notOk(success);
        t.equal(res.status, 401);
        t.end();
      })
      .catch((err: Error) => t.fail(err));
  });

  group.end();
});
