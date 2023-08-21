import { expect, test } from "vitest";
import { createInMemoryStore } from "./immutable-store.in-memory";

const Store = createInMemoryStore<string, string | null | undefined>({
  maxEntryCount: 10,
});

test("working with one key", async () => {
  const now = Date.now();
  const key = "user-123";

  const store1 = Store.init(now);
  const store2A = await Store.assoc(now, store1, key, "2A");
  const store2B = await Store.assoc(now, store1, key, "2B");

  expect(await Store.get(now, store1, key)).toEqual(undefined);
  expect(await Store.get(now, store2A, key)).toEqual("2A");
  expect(await Store.get(now, store2B, key)).toEqual("2B");
});

test("working with two keys", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const store0 = Store.init(now);

  const store1 = await Store.assoc(now, store0, key1, "value-1");

  const store2 = await Store.assoc(now, store1, key2, "value-2");

  expect(await Store.get(now, store0, key1)).toEqual(undefined);
  expect(await Store.get(now, store0, key2)).toEqual(undefined);

  expect(await Store.get(now, store1, key1)).toEqual("value-1");
  expect(await Store.get(now, store1, key2)).toEqual(undefined);

  expect(await Store.get(now, store2, key1)).toEqual("value-1");
  expect(await Store.get(now, store2, key2)).toEqual("value-2");
});

test("immutable behavior", async () => {
  const now = Date.now();
  const key = "user-123";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key, "value");

  // Ensure the original store is unchanged after 'set'
  expect(await Store.get(now, store1, key)).toEqual(undefined);

  // Ensure the new store has the updated value
  expect(await Store.get(now, store2, key)).toEqual("value");
});

test("chaining updates", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const store0 = Store.init(now);
  const store1 = await Store.assoc(now, store0, key1, "value-1");
  const store2 = await Store.assoc(now, store1, key2, "value-2");

  // Ensure original stores are unchanged
  expect(await Store.get(now, store0, key1)).toEqual(undefined);
  expect(await Store.get(now, store0, key2)).toEqual(undefined);
  expect(await Store.get(now, store1, key1)).toEqual("value-1");
  expect(await Store.get(now, store1, key2)).toEqual(undefined);

  // Ensure the new store has updated values
  expect(await Store.get(now, store2, key1)).toEqual("value-1");
  expect(await Store.get(now, store2, key2)).toEqual("value-2");
});

test("deleting keys", async () => {
  const now = Date.now();
  const key = "key-1";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key, "value");
  const store3 = await Store.dissoc(now, store2, key);

  // Ensure the original store is unchanged
  expect(await Store.get(now, store1, key)).toEqual(undefined);

  // Ensure the new store has the updated value
  expect(await Store.get(now, store2, key)).toEqual("value");

  // Ensure the key is deleted in the final store
  expect(await Store.get(now, store3, key)).toEqual(undefined);
});

test("key not found", async () => {
  const now = Date.now();
  const key = "nonexistent-key";

  const store = Store.init(now);

  // Ensure a key that doesn't exist returns null
  expect(await Store.get(now, store, key)).toEqual(undefined);
});

test("overwriting values", async () => {
  const now = Date.now();
  const key = "key-1";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key, "value1");
  const store3 = await Store.assoc(now, store2, key, "value2");

  // Ensure original values remain unchanged
  expect(await Store.get(now, store1, key)).toEqual(undefined);
  expect(await Store.get(now, store2, key)).toEqual("value1");

  // Ensure the new value is set in the new store
  expect(await Store.get(now, store3, key)).toEqual("value2");
});

test("multiple keys independently updated", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key1, "value1");
  const store3 = await Store.assoc(now, store2, key2, "value2");

  // Ensure original stores are unchanged
  expect(await Store.get(now, store1, key1)).toEqual(undefined);
  expect(await Store.get(now, store1, key2)).toEqual(undefined);
  expect(await Store.get(now, store2, key1)).toEqual("value1");
  expect(await Store.get(now, store2, key2)).toEqual(undefined);

  // Ensure the new store has updated values
  expect(await Store.get(now, store3, key1)).toEqual("value1");
  expect(await Store.get(now, store3, key2)).toEqual("value2");
});

test("empty key handling", async () => {
  const now = Date.now();
  const key = "";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key, "value");

  expect(await Store.get(now, store2, key)).toEqual("value");
});

test("null and undefined values", async () => {
  const now = Date.now();
  const key1 = "null-key";
  const key2 = "undefined-key";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key1, null);
  const store3 = await Store.assoc(now, store2, key2, undefined);

  expect(await Store.get(now, store3, key1)).toEqual(null);
  expect(await Store.get(now, store3, key2)).toEqual(undefined);
});

test("concurrent writes", async () => {
  const key = "concurrent-key";
  const now = Date.now();
  const initialMap = Store.init(now);

  // Simulate concurrent operations by creating multiple promises
  const concurrentWrites = Array.from({ length: 10 }, (_, index) => {
    return Store.assoc(now, initialMap, key, `value-${index}`);
  });

  // Await all concurrent updates to finish
  const stores = await Promise.all(concurrentWrites);

  // Check each store to see if it contains the correct value
  for (const [index, store] of stores.entries()) {
    const expectedValue = `value-${index}`;
    const got = await Store.get(now, store, key);
    expect(got).toEqual(expectedValue);
  }
});

test("concurrent reads", async () => {
  const now = Date.now();
  const key = "concurrent-key";

  const store1 = Store.init(now);
  const store2 = await Store.assoc(now, store1, key, "value");

  // Simulate concurrent reads by creating multiple promises
  const concurrentReads = Array.from({ length: 10 }, () => {
    return Store.get(now, store2, key);
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
  const storeA1 = Store.init(Date.now());
  const t1 = Date.now();
  const storeA2 = await Store.assoc(t1, storeA1, KEY, "valueA");

  await new Promise((resolve) => setTimeout(resolve, 1));

  const storeB1 = Store.init(Date.now());
  const t2 = Date.now();
  const storeB2 = await Store.assoc(t2, storeB1, KEY, "valueB");

  await new Promise((resolve) => setTimeout(resolve, 1));

  const storeC1 = Store.init(Date.now());
  const t3 = Date.now();
  const storeC2 = await Store.assoc(t3, storeC1, KEY, "valueC");

  expect(await Store.get(t1, storeA2, KEY)).toEqual("valueA");
  expect(await Store.get(t2, storeB2, KEY)).toEqual("valueB");
  expect(await Store.get(t3, storeC2, KEY)).toEqual("valueC");
});
