// @flow weak
import express, { Application } from "express";
import bodyParser from "body-parser";

/* Mocked express app */

export const getApp = (): Application => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  return app;
};

/* Mocked database */

type StoreItem = { _id: string, test: string };

type Store = {
  currentId: number,
  items: StoreItem[]
};

export const getStore = (): Store => ({
  currentId: 4,
  items: [
    { _id: "id0", test: "test1" },
    { _id: "id1", test: "test2" },
    { _id: "id2", test: "test3" },
    { _id: "id3", test: "test4" },
    { _id: "id4", test: "test5" }
  ]
});

/* Mocked model operations */

export const getOperations = (store: Store) => ({
  create: ({ data }: { data: any }) => {
    store.currentId++;
    const newItem = { _id: "id" + store.currentId, ...data };
    store.items.push(newItem);
    return Promise.resolve(newItem);
  },
  read: ({ id, data }: { id: string, data: any }) => {
    if (id) {
      return Promise.resolve(
        store.items.find((item: StoreItem) => item._id === id)
      );
    }
    return Promise.resolve(
      store.items.filter(
        (item: StoreItem) =>
          data
            ? Object.keys(data).every(prop => data[prop] === item[prop])
            : true
      )
    );
  },
  update: ({ id, data }: { id: string, data: any }) => {
    const item = store.items.find((item: StoreItem) => item._id === id);
    if (!item) return Promise.reject(new Error("No item found"));
    const updatedItem = { ...item, ...data };
    store.items = store.items
      .filter((item: StoreItem) => item._id !== id)
      .concat(updatedItem);
    return Promise.resolve(updatedItem);
  },
  delete: ({ id }) => {
    const item = store.items.find((item: StoreItem) => item._id === id);
    if (!item) return Promise.reject(new Error("No item found"));
    store.items = store.items.filter((item: StoreItem) => item._id !== id);
    return Promise.resolve(item);
  }
});
