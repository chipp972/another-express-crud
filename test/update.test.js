// @flow
import test from "tape";
import { Response } from "express";
import request from "supertest";
import { getOperations, getStore, getApp } from "./crud.mock";
import { crud } from "../src/crud";

// init tests
const app = getApp();
const store = getStore();
const operations = getOperations(store);
const crudRoutes = crud({ operations });
app.use("/test", crudRoutes);

test("update with patch", t => {
  request(app)
    .patch("/test/id3")
    .send({ test: "test8" })
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: "id3", test: "test8" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("patch update is persisted in store", t => {
  request(app)
    .get("/test/id3")
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: "id3", test: "test8" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("update with put", t => {
  request(app)
    .put("/test/id2")
    .send({ test: "test9" })
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: "id2", test: "test9" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("put update is persisted in store", t => {
  request(app)
    .get("/test/id2")
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: "id2", test: "test9" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
