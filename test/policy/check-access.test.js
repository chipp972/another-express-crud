// @flow
import test from "tape";
import { checkAccess, ACCESS } from "../../src/crud.policy";

test("guest request", t => {
  const res = checkAccess({
    id: "1",
    data: { field: "test", _id: "1" }
  });
  t.equal(res, ACCESS.GUEST);
  t.end();
});

test("user request", t => {
  const res = checkAccess({
    id: "1",
    data: { field: "test", _id: "1" },
    user: { _id: "2" }
  });
  t.equal(res, ACCESS.USER);
  t.end();
});

test("owner request", t => {
  const res = checkAccess({
    id: "1",
    data: { field: "test", _id: "1" },
    user: { _id: "1" }
  });
  t.equal(res, ACCESS.OWNER);
  t.end();
});

test("admin request", t => {
  const res = checkAccess({
    id: "1",
    data: { field: "test", _id: "1" },
    user: { _id: "1", role: "admin" }
  });
  t.equal(res, ACCESS.ADMIN);
  t.end();
});

test("request with no id (create)", t => {
  const res = checkAccess({
    data: { field: "test", owner: "1" },
    user: { _id: "1" }
  });
  t.equal(res, ACCESS.OWNER);
  t.end();
});

test("user request on another person ressource", t => {
  const res = checkAccess({
    id: "1",
    data: { field: "test", _id: "1", owner: "2" },
    user: { _id: "3" }
  });
  t.equal(res, ACCESS.USER);
  t.end();
});
