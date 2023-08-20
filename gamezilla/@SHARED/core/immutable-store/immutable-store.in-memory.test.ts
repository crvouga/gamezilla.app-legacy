import { expect, test } from "vitest";
import { createImmutableStore } from "./immutable-store.in-memory";

const Db = createImmutableStore<string, string | null | undefined>();

test("working with one key", async () => {
  const now = Date.now();
  const key = "user-123";

  const db1 = Db.init(now);
  const db2A = await Db.assoc(db1, key, "2A");
  const db2B = await Db.assoc(db1, key, "2B");

  expect(await Db.get(db1, key)).toEqual(undefined);
  expect(await Db.get(db2A, key)).toEqual("2A");
  expect(await Db.get(db2B, key)).toEqual("2B");
});

test("working with two keys", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const db0 = Db.init(now);

  const db1 = await Db.assoc(db0, key1, "value-1");

  const db2 = await Db.assoc(db1, key2, "value-2");

  expect(await Db.get(db0, key1)).toEqual(undefined);
  expect(await Db.get(db0, key2)).toEqual(undefined);

  expect(await Db.get(db1, key1)).toEqual("value-1");
  expect(await Db.get(db1, key2)).toEqual(undefined);

  expect(await Db.get(db2, key1)).toEqual("value-1");
  expect(await Db.get(db2, key2)).toEqual("value-2");
});

test("immutable behavior", async () => {
  const now = Date.now();
  const key = "user-123";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key, "value");

  // Ensure the original db is unchanged after 'set'
  expect(await Db.get(db1, key)).toEqual(undefined);

  // Ensure the new db has the updated value
  expect(await Db.get(db2, key)).toEqual("value");
});

test("chaining updates", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const db0 = Db.init(now);
  const db1 = await Db.assoc(db0, key1, "value-1");
  const db2 = await Db.assoc(db1, key2, "value-2");

  // Ensure original dbs are unchanged
  expect(await Db.get(db0, key1)).toEqual(undefined);
  expect(await Db.get(db0, key2)).toEqual(undefined);
  expect(await Db.get(db1, key1)).toEqual("value-1");
  expect(await Db.get(db1, key2)).toEqual(undefined);

  // Ensure the new db has updated values
  expect(await Db.get(db2, key1)).toEqual("value-1");
  expect(await Db.get(db2, key2)).toEqual("value-2");
});

test("deleting keys", async () => {
  const now = Date.now();
  const key = "key-1";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key, "value");
  const db3 = await Db.dissoc(db2, key);

  // Ensure the original db is unchanged
  expect(await Db.get(db1, key)).toEqual(undefined);

  // Ensure the new db has the updated value
  expect(await Db.get(db2, key)).toEqual("value");

  // Ensure the key is deleted in the final db
  expect(await Db.get(db3, key)).toEqual(undefined);
});

test("key not found", async () => {
  const now = Date.now();
  const key = "nonexistent-key";

  const db = Db.init(now);

  // Ensure a key that doesn't exist returns null
  expect(await Db.get(db, key)).toEqual(undefined);
});

test("overwriting values", async () => {
  const now = Date.now();
  const key = "key-1";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key, "value1");
  const db3 = await Db.assoc(db2, key, "value2");

  // Ensure original values remain unchanged
  expect(await Db.get(db1, key)).toEqual(undefined);
  expect(await Db.get(db2, key)).toEqual("value1");

  // Ensure the new value is set in the new db
  expect(await Db.get(db3, key)).toEqual("value2");
});

test("multiple keys independently updated", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key1, "value1");
  const db3 = await Db.assoc(db2, key2, "value2");

  // Ensure original dbs are unchanged
  expect(await Db.get(db1, key1)).toEqual(undefined);
  expect(await Db.get(db1, key2)).toEqual(undefined);
  expect(await Db.get(db2, key1)).toEqual("value1");
  expect(await Db.get(db2, key2)).toEqual(undefined);

  // Ensure the new db has updated values
  expect(await Db.get(db3, key1)).toEqual("value1");
  expect(await Db.get(db3, key2)).toEqual("value2");
});

test("empty key handling", async () => {
  const now = Date.now();
  const key = "";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key, "value");

  expect(await Db.get(db2, key)).toEqual("value");
});

test("null and undefined values", async () => {
  const now = Date.now();
  const key1 = "null-key";
  const key2 = "undefined-key";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key1, null);
  const db3 = await Db.assoc(db2, key2, undefined);

  expect(await Db.get(db3, key1)).toEqual(null);
  expect(await Db.get(db3, key2)).toEqual(undefined);
});

test("concurrent writes", async () => {
  const key = "concurrent-key";
  const now = Date.now();
  const initialMap = Db.init(now);

  // Simulate concurrent operations by creating multiple promises
  const concurrentWrites = Array.from({ length: 10 }, (_, index) => {
    return Db.assoc(initialMap, key, `value-${index}`);
  });

  // Await all concurrent updates to finish
  const dbs = await Promise.all(concurrentWrites);

  // Check each db to see if it contains the correct value
  for (const [index, db] of dbs.entries()) {
    const expectedValue = `value-${index}`;
    const got = await Db.get(db, key);
    expect(got).toEqual(expectedValue);
  }
});

test("concurrent reads", async () => {
  const now = Date.now();
  const key = "concurrent-key";

  const db1 = Db.init(now);
  const db2 = await Db.assoc(db1, key, "value");

  // Simulate concurrent reads by creating multiple promises
  const concurrentReads = Array.from({ length: 10 }, () => {
    return Db.get(db2, key);
  });

  // Await all concurrent reads to finish
  const values = await Promise.all(concurrentReads);

  // All the values read should be the same
  for (let value of values) {
    expect(value).toEqual("value");
  }
});

test("concurrent", async () => {
  const KEY = "key";
  const dbA1 = Db.init(Date.now());
  const dbA2 = await Db.assoc(dbA1, KEY, "valueA");

  await new Promise((resolve) => setTimeout(resolve, 1));

  const dbB1 = Db.init(Date.now());
  const dbB2 = await Db.assoc(dbB1, KEY, "valueB");

  await new Promise((resolve) => setTimeout(resolve, 1));

  const dbC1 = Db.init(Date.now());
  const dbC2 = await Db.assoc(dbC1, KEY, "valueC");

  expect(await Db.get(dbA2, KEY)).toEqual("valueA");
  expect(await Db.get(dbB2, KEY)).toEqual("valueB");
  expect(await Db.get(dbC2, KEY)).toEqual("valueC");
});
