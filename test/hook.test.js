// @flow
import test from "tape";
import { Response } from "express";
import request from "supertest";
import { stub } from "sinon";
import { getOperations, getStore, getApp } from "./crud.mock";
import { crud } from "../src/crud";

// init tests
const app = getApp();
const store = getStore();
const operations = getOperations(store);
const successBeforeStub = stub().resolves({ success: true });
const errorBeforeStub = stub().resolves({
  success: false,
  error: new Error("StubError")
});
const afterStub = stub().resolves({ test: "modifiedResponse" });
const afterUndefinedStub = stub().resolves(undefined);
const crudRoutes = crud({
  operations,
  hooks: {
    before: {
      create: errorBeforeStub,
      read: successBeforeStub
    },
    after: {
      update: afterStub,
      delete: afterUndefinedStub
    }
  }
});
app.use("/test", crudRoutes);
app.use((err, req, res, next) =>
  res.status(500).json({ success: false, message: err.message })
);

test("successful before hook", t => {
  request(app)
    .get("/test/id2")
    .then((res: Response) => {
      const { success, data } = res.body;
      t.ok(
        successBeforeStub.calledWith({
          id: "id2",
          user: undefined,
          data: {},
          files: {}
        })
      );
      t.deepEqual(data, { _id: "id2", test: "test3" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("failed before hook", t => {
  request(app)
    .post("/test")
    .send({ test: "test8" })
    .then((res: Response) => {
      const { success, message } = res.body;
      t.ok(
        errorBeforeStub.calledWith({
          id: undefined,
          user: undefined,
          data: { test: "test8" },
          files: {}
        })
      );
      t.deepEqual(message, "StubError");
      t.notOk(success);
      t.equal(res.status, 500);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("after hook modifying response", t => {
  request(app)
    .patch("/test/id2")
    .send({ test: "test8" })
    .then((res: Response) => {
      const { success, data } = res.body;
      t.ok(
        afterStub.calledWith({
          _id: "id2",
          test: "test8"
        })
      );
      t.deepEqual(data, { test: "modifiedResponse" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});

test("after hook with unchanged response", t => {
  request(app)
    .delete("/test/id2")
    .then((res: Response) => {
      const { success, data } = res.body;
      t.ok(
        afterStub.calledWith({
          _id: "id2",
          test: "test8"
        })
      );
      t.deepEqual(data, { _id: "id2", test: "test8" });
      t.ok(success);
      t.equal(res.status, 200);
      t.end();
    })
    .catch((err: Error) => t.fail(err));
});
