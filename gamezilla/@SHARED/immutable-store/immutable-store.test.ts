import { expect, test } from "bun:test";
import { IStore } from "./immutable-store";

export const buildTest = (Store: IStore<string, string | null>) => {
  test("working with one key", async () => {
    const t0 = Date.now();
    const key = "user-123";

    const store1 = Store.init(t0);
    const store2A = await Store.assoc(t0, store1, key, "2A");
    const store2B = await Store.assoc(t0, store1, key, "2B");

    const t1 = t0 + 1000;

    expect(await Store.latest(t0, t1, store1, key)).toEqual(null);
    expect(await Store.latest(t0, t1, store2A, key)).toEqual("2A");
    expect(await Store.latest(t0, t1, store2B, key)).toEqual("2B");
  });

  test("working with two keys", async () => {
    const t0 = Date.now();
    const key1 = "key-1";
    const key2 = "key-2";

    const store0 = Store.init(t0);

    const store1 = await Store.assoc(t0, store0, key1, "value-1");

    const store2 = await Store.assoc(t0, store1, key2, "value-2");

    const t1 = t0 + 1000;

    expect(await Store.latest(t0, t1, store0, key1)).toEqual(null);
    expect(await Store.latest(t0, t1, store0, key2)).toEqual(null);
    expect(await Store.latest(t0, t1, store1, key1)).toEqual("value-1");
    expect(await Store.latest(t0, t1, store1, key2)).toEqual(null);
    expect(await Store.latest(t0, t1, store2, key1)).toEqual("value-1");
    expect(await Store.latest(t0, t1, store2, key2)).toEqual("value-2");
  });

  test("immutable behavior", async () => {
    const t0 = Date.now();
    const key = "user-123";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    // Ensure the original store is unchanged after 'set'

    expect(await Store.latest(t0, t1, store1, key)).toEqual(null);

    // Ensure the new store has the updated value
    expect(await Store.latest(t0, t1, store2, key)).toEqual("value");
  });

  test("chaining updates", async () => {
    const t0 = Date.now();
    const key1 = "key-1";
    const key2 = "key-2";

    const store0 = Store.init(t0);
    const store1 = await Store.assoc(t0, store0, key1, "value-1");
    const store2 = await Store.assoc(t0, store1, key2, "value-2");

    const t1 = t0 + 1000;

    // Ensure original stores are unchanged

    expect(await Store.latest(t0, t1, store0, key1)).toEqual(null);

    expect(await Store.latest(t0, t1, store0, key2)).toEqual(null);
    expect(await Store.latest(t0, t1, store1, key1)).toEqual("value-1");

    expect(await Store.latest(t0, t1, store1, key2)).toEqual(null);

    // Ensure the new store has updated values
    expect(await Store.latest(t0, t1, store2, key1)).toEqual("value-1");
    expect(await Store.latest(t0, t1, store2, key2)).toEqual("value-2");
  });

  test("deleting keys", async () => {
    const t0 = Date.now();
    const key = "key-1";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");
    const store3 = await Store.dissoc(t0, store2, key);

    const t1 = t0 + 1000;
    // Ensure the original store is unchanged

    expect(await Store.latest(t0, t1, store1, key)).toEqual(null);

    // Ensure the new store has the updated value
    expect(await Store.latest(t0, t1, store2, key)).toEqual("value");

    // Ensure the key is deleted in the final store

    expect(await Store.latest(t0, t1, store3, key)).toEqual(null);
  });

  test("key not found", async () => {
    const t0 = Date.now();
    const key = "nonexistent-key";

    const store = Store.init(t0);
    const t1 = t0 + 1000;
    // Ensure a key that doesn't exist returns null

    expect(await Store.latest(t0, t1, store, key)).toEqual(null);
  });

  test("overwriting values", async () => {
    const t0 = Date.now();
    const key = "key-1";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key, "value1");
    const store3 = await Store.assoc(t0, store2, key, "value2");
    const t1 = t0 + 1000;
    // Ensure original values remain unchanged

    expect(await Store.latest(t0, t1, store1, key)).toEqual(null);
    expect(await Store.latest(t0, t1, store2, key)).toEqual("value1");

    // Ensure the new value is set in the new store
    expect(await Store.latest(t0, t1, store3, key)).toEqual("value2");
  });

  test("multiple keys independently updated", async () => {
    const t0 = Date.now();
    const key1 = "key-1";
    const key2 = "key-2";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key1, "value1");
    const store3 = await Store.assoc(t0, store2, key2, "value2");

    const t1 = t0 + 1000;
    // Ensure original stores are unchanged

    expect(await Store.latest(t0, t1, store1, key1)).toEqual(null);

    expect(await Store.latest(t0, t1, store1, key2)).toEqual(null);
    expect(await Store.latest(t0, t1, store2, key1)).toEqual("value1");

    expect(await Store.latest(t0, t1, store2, key2)).toEqual(null);

    // Ensure the new store has updated values
    expect(await Store.latest(t0, t1, store3, key1)).toEqual("value1");
    expect(await Store.latest(t0, t1, store3, key2)).toEqual("value2");
  });

  test("empty key handling", async () => {
    const t0 = Date.now();
    const key = "";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    expect(await Store.latest(t0, t1, store2, key)).toEqual("value");
  });

  test("null and null values", async () => {
    const t0 = Date.now();
    const key1 = "null-key";
    const key2 = "null-key";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key1, null);
    const store3 = await Store.assoc(t0, store2, key2, null);

    const t1 = t0 + 1000;
    expect(await Store.latest(t0, t1, store3, key1)).toEqual(null);

    expect(await Store.latest(t0, t1, store3, key2)).toEqual(null);
  });

  test("concurrent reads", async () => {
    const t0 = Date.now();
    const key = "concurrent-key";

    const store1 = Store.init(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    // Simulate concurrent reads by creating multiple promises
    const concurrentReads = Array.from({ length: 10 }, () => {
      return Store.latest(t0, t1, store2, key);
    });

    // Await all concurrent reads to finish
    const values = await Promise.all(concurrentReads);

    // All the values read should be the same
    for (let value of values) {
      expect(value).toEqual("value");
    }
  });

  test("concurrent", async () => {
    const key = "key";
    const t0 = Date.now();
    const storeA1 = Store.init(t0);
    const t1 = t0 + 1000;
    const storeA2 = await Store.assoc(t1, storeA1, key, "valueA");

    const storeB1 = Store.init(t1);
    const t2 = t1 + 1000;
    const storeB2 = await Store.assoc(t2, storeB1, key, "valueB");

    const storeC1 = Store.init(t1);
    const t3 = t2 + 1000;
    const storeC2 = await Store.assoc(t3, storeC1, key, "valueC");

    expect(await Store.latest(t0, t1, storeA2, key)).toEqual("valueA");
    expect(await Store.latest(t0, t2, storeB2, key)).toEqual("valueB");
    expect(await Store.latest(t0, t3, storeC2, key)).toEqual("valueC");
  });

  test("add then remove", async () => {
    const key = "key";
    const t0 = Date.now();
    const initial = Store.init(t0);
    const t1 = t0 + 1000;
    const added = await Store.assoc(t1, initial, key, "value");
    const t2 = t1 + 1000;
    const removed = await Store.dissoc(t2, added, key);

    expect(await Store.latest(t0, t1, added, key)).toEqual("value");

    expect(await Store.latest(t0, t2, removed, key)).toEqual(null);
  });

  test("add then remove then add", async () => {
    const key = "key";
    const t0 = Date.now();
    const initial = Store.init(t0);
    const t1 = t0 + 1000;
    const added = await Store.assoc(t1, initial, key, "value");
    const t2 = t1 + 1000;
    const removed = await Store.dissoc(t2, added, key);
    const t3 = t2 + 1000;
    const addedAgain = await Store.assoc(t3, removed, key, "valueAgain");

    expect(await Store.latest(t0, t1, added, key)).toEqual("value");

    expect(await Store.latest(t0, t2, removed, key)).toEqual(null);
    expect(await Store.latest(t0, t3, addedAgain, key)).toEqual("valueAgain");
  });

  test("listing spaces of different keys", async () => {
    const key = "key";
    const t0 = Date.now() + 10_0000;
    const initial = Store.init(t0);
    const t1 = t0 + 1000;
    const added1 = await Store.assoc(t1, initial, "k1", "1");
    const t2 = t1 + 1000;
    const added2 = await Store.assoc(t2, added1, "k2", "2");
    const t3 = t2 + 1000;
    const added3 = await Store.assoc(t3, added2, "k3", "3");

    expect(await Store.listLatest(t0, t1, initial)).toEqual([]);
    //
    expect(await Store.listLatest(t0, t1, added1)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added1)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t3, added1)).toEqual(["1"]);
    //
    expect(await Store.listLatest(t0, t1, added2)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added2)).toEqual(["1", "2"]);
    expect(await Store.listLatest(t0, t3, added2)).toEqual(["1", "2"]);
    //
    expect(await Store.listLatest(t0, t1, added3)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added3)).toEqual(["1", "2"]);
    expect(await Store.listLatest(t0, t3, added3)).toEqual(["1", "2", "3"]);
  });

  test("listing spaces of same keys", async () => {
    const key = "key";
    const t0 = Date.now() + 10_001;
    const initial = Store.init(t0);
    const t1 = t0 + 1000;
    const added1 = await Store.assoc(t1, initial, "k1", "1");
    const t2 = t1 + 1000;
    const added2 = await Store.assoc(t2, added1, "k1", "2");
    const t3 = t2 + 1000;
    const added3 = await Store.assoc(t3, added2, "k1", "3");

    expect(await Store.listLatest(t0, t1, initial)).toEqual([]);
    //
    expect(await Store.listLatest(t0, t1, added1)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added1)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t3, added1)).toEqual(["1"]);
    //
    expect(await Store.listLatest(t0, t1, added2)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added2)).toEqual(["2"]);
    expect(await Store.listLatest(t0, t3, added2)).toEqual(["2"]);
    //
    expect(await Store.listLatest(t0, t1, added3)).toEqual(["1"]);
    expect(await Store.listLatest(t0, t2, added3)).toEqual(["2"]);
    expect(await Store.listLatest(t0, t3, added3)).toEqual(["3"]);
  });
};
