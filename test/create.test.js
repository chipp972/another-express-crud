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

test("create", t => {
  request(app)
    .post("/test")
    .send({ test: "test8" })
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, { _id: "id" + store.currentId, test: "test8" });
      t.ok(success);
      t.equal(res.status, 201);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("object is persisted in store", t => {
  request(app)
    .get("/test?test=test8")
    .then((res: Response) => {
      const { success, data } = res.body;
      t.deepEqual(data, [{ _id: "id" + store.currentId, test: "test8" }]);
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
