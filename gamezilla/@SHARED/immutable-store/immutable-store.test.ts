import { expect, test } from "bun:test";
import { StoreModule } from "./immutable-store";

export const buildTest = (
  makeStore: () => StoreModule<string, string | null>
) => {
  test("working with one key", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "user-123";

    const store1 = Store.startingAt(t0);
    const store2A = await Store.assoc(t0, store1, key, "2A");
    const store2B = await Store.assoc(t0, store1, key, "2B");

    const t1 = t0 + 1000;

    expect(await Store.get(store1, key)).toEqual(null);
    expect(await Store.get(store2A, key)).toEqual("2A");
    expect(await Store.get(store2B, key)).toEqual("2B");
  });

  test("working with two keys", async () => {
    const Store = makeStore();
    const t0 = Date.now();

    const key1 = "key-1";
    const value1 = "value-1";

    const key2 = "key-2";
    const value2 = "value-2";

    const store0 = Store.startingAt(t0);

    const store1 = await Store.assoc(t0, store0, key1, value1);

    const store2 = await Store.assoc(t0, store1, key2, value2);

    const t1 = t0 + 1000;

    expect(await Store.get(store0, key1)).toEqual(null);
    expect(await Store.get(store0, key2)).toEqual(null);

    expect(await Store.get(store1, key1)).toEqual(value1);
    expect(await Store.get(store1, key2)).toEqual(null);

    expect(await Store.get(store2, key1)).toEqual(value1);
    expect(await Store.get(store2, key2)).toEqual(value2);
  });

  test("immutable behavior", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "user-123";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    // Ensure the original store is unchanged after 'set'

    expect(await Store.get(store1, key)).toEqual(null);

    // Ensure the new store has the updated value
    expect(await Store.get(store2, key)).toEqual("value");
  });

  test("chaining updates", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key1 = "key-1";
    const key2 = "key-2";

    const store0 = Store.startingAt(t0);
    const store1 = await Store.assoc(t0, store0, key1, "value-1");
    const store2 = await Store.assoc(t0, store1, key2, "value-2");

    const t1 = t0 + 1000;

    // Ensure original stores are unchanged

    expect(await Store.get(store0, key1)).toEqual(null);

    expect(await Store.get(store0, key2)).toEqual(null);
    expect(await Store.get(store1, key1)).toEqual("value-1");

    expect(await Store.get(store1, key2)).toEqual(null);

    // Ensure the new store has updated values
    expect(await Store.get(store2, key1)).toEqual("value-1");
    expect(await Store.get(store2, key2)).toEqual("value-2");
  });

  test("deleting keys", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "key-1";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");
    const store3 = await Store.dissoc(t0, store2, key);

    const t1 = t0 + 1000;
    // Ensure the original store is unchanged

    expect(await Store.get(store1, key)).toEqual(null);

    // Ensure the new store has the updated value
    expect(await Store.get(store2, key)).toEqual("value");

    // Ensure the key is deleted in the final store

    expect(await Store.get(store3, key)).toEqual(null);
  });

  test("key not found", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "nonexistent-key";

    const store = Store.startingAt(t0);
    const t1 = t0 + 1000;
    // Ensure a key that doesn't exist returns null

    expect(await Store.get(store, key)).toEqual(null);
  });

  test("overwriting values", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "key-1";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key, "value1");
    const store3 = await Store.assoc(t0, store2, key, "value2");
    const t1 = t0 + 1000;
    // Ensure original values remain unchanged

    expect(await Store.get(store1, key)).toEqual(null);
    expect(await Store.get(store2, key)).toEqual("value1");

    // Ensure the new value is set in the new store
    expect(await Store.get(store3, key)).toEqual("value2");
  });

  test("multiple keys independently updated", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key1 = "key-1";
    const key2 = "key-2";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key1, "value1");
    const store3 = await Store.assoc(t0, store2, key2, "value2");

    const t1 = t0 + 1000;
    // Ensure original stores are unchanged

    expect(await Store.get(store1, key1)).toEqual(null);

    expect(await Store.get(store1, key2)).toEqual(null);
    expect(await Store.get(store2, key1)).toEqual("value1");

    expect(await Store.get(store2, key2)).toEqual(null);

    // Ensure the new store has updated values
    expect(await Store.get(store3, key1)).toEqual("value1");
    expect(await Store.get(store3, key2)).toEqual("value2");
  });

  test("empty key handling", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    expect(await Store.get(store2, key)).toEqual("value");
  });

  test("null and null values", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key1 = "null-key";
    const key2 = "null-key";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key1, null);
    const store3 = await Store.assoc(t0, store2, key2, null);

    const t1 = t0 + 1000;
    expect(await Store.get(store3, key1)).toEqual(null);

    expect(await Store.get(store3, key2)).toEqual(null);
  });

  test("concurrent reads", async () => {
    const Store = makeStore();
    const t0 = Date.now();
    const key = "concurrent-key";

    const store1 = Store.startingAt(t0);
    const store2 = await Store.assoc(t0, store1, key, "value");

    const t1 = t0 + 1000;
    // Simulate concurrent reads by creating multiple promises
    const concurrentReads = Array.from({ length: 10 }, () => {
      return Store.get(store2, key);
    });

    // Await all concurrent reads to finish
    const values = await Promise.all(concurrentReads);

    // All the values read should be the same
    for (let value of values) {
      expect(value).toEqual("value");
    }
  });

  test("concurrent", async () => {
    const Store = makeStore();
    const key = "key";
    const t0 = Date.now();
    const storeA1 = Store.startingAt(t0);
    const t1 = t0 + 1000;
    const storeA2 = await Store.assoc(t1, storeA1, key, "valueA");

    const storeB1 = Store.startingAt(t1);
    const t2 = t1 + 1000;
    const storeB2 = await Store.assoc(t2, storeB1, key, "valueB");

    const storeC1 = Store.startingAt(t1);
    const t3 = t2 + 1000;
    const storeC2 = await Store.assoc(t3, storeC1, key, "valueC");

    expect(await Store.get(storeA2, key)).toEqual("valueA");
    expect(await Store.get(storeB2, key)).toEqual("valueB");
    expect(await Store.get(storeC2, key)).toEqual("valueC");
  });

  test("add then remove", async () => {
    const Store = makeStore();
    const key = "key";
    const t0 = Date.now();
    const initial = Store.startingAt(t0);
    const t1 = t0 + 1000;
    const added = await Store.assoc(t1, initial, key, "value");
    const t2 = t1 + 1000;
    const removed = await Store.dissoc(t2, added, key);

    expect(await Store.get(added, key)).toEqual("value");

    expect(await Store.get(removed, key)).toEqual(null);
  });

  test("add then remove then add", async () => {
    const Store = makeStore();
    const key = "key";
    const t0 = Date.now();
    const initial = Store.startingAt(t0);
    const t1 = t0 + 1000;
    const added = await Store.assoc(t1, initial, key, "value");
    const t2 = t1 + 1000;
    const removed = await Store.dissoc(t2, added, key);
    const t3 = t2 + 1000;
    const addedAgain = await Store.assoc(t3, removed, key, "valueAgain");

    expect(await Store.get(added, key)).toEqual("value");

    expect(await Store.get(removed, key)).toEqual(null);
    expect(await Store.get(addedAgain, key)).toEqual("valueAgain");
  });

  test("multiple timelines one level deep", async () => {
    const Store = makeStore();

    const key = "key";

    const t0 = Date.now();

    const initial = Store.startingAt(t0);
    const start = await Store.assoc(t0, initial, key, "start");
    const left = await Store.assoc(t0, start, key, "left");
    const right = await Store.assoc(t0, start, key, "right");

    expect(await Store.get(initial, key)).toEqual(null);
    expect(await Store.get(start, key)).toEqual("start");
    expect(await Store.get(left, key)).toEqual("left");
    expect(await Store.get(right, key)).toEqual("right");
  });

  test("multiple timelines two levels deep", async () => {
    const Store = makeStore();

    const key = "key";

    const t0 = Date.now();

    const initial = Store.startingAt(t0);
    const start = await Store.assoc(t0, initial, key, "start");
    //
    const left = await Store.assoc(t0, start, key, "left");
    const right = await Store.assoc(t0, start, key, "right");
    //
    const left_left = await Store.assoc(t0, left, key, "left_left");
    const left_right = await Store.assoc(t0, left, key, "left_right");
    const right_left = await Store.assoc(t0, right, key, "right_left");
    const right_right = await Store.assoc(t0, right, key, "right_right");

    expect(await Store.get(initial, key)).toEqual(null);
    expect(await Store.get(start, key)).toEqual("start");
    expect(await Store.get(left, key)).toEqual("left");
    expect(await Store.get(right, key)).toEqual("right");
    expect(await Store.get(left_left, key)).toEqual("left_left");
    expect(await Store.get(left_right, key)).toEqual("left_right");
    expect(await Store.get(right_left, key)).toEqual("right_left");
    expect(await Store.get(right_right, key)).toEqual("right_right");
  });

  test("multiple timelines three levels deep", async () => {
    const Store = makeStore();

    const key = "key";

    const t0 = Date.now();

    const initial = Store.startingAt(t0);
    const start = await Store.assoc(t0, initial, key, "start");
    //
    const left = await Store.assoc(t0, start, key, "left");
    const right = await Store.assoc(t0, start, key, "right");
    //
    const left_left = await Store.assoc(t0, left, key, "left_left");
    const left_right = await Store.assoc(t0, left, key, "left_right");
    const right_left = await Store.assoc(t0, right, key, "right_left");
    const right_right = await Store.assoc(t0, right, key, "right_right");
    //
    const left_left_left = await Store.assoc(
      t0,
      left_left,
      key,
      "left_left_left"
    );
    const left_left_right = await Store.assoc(
      t0,
      left_left,
      key,
      "left_left_right"
    );
    const left_right_left = await Store.assoc(
      t0,
      left_right,
      key,
      "left_right_left"
    );
    const left_right_right = await Store.assoc(
      t0,
      left_right,
      key,
      "left_right_right"
    );
    const right_left_left = await Store.assoc(
      t0,
      right_left,
      key,
      "right_left_left"
    );
    const right_left_right = await Store.assoc(
      t0,
      right_left,
      key,
      "right_left_right"
    );
    const right_right_left = await Store.assoc(
      t0,
      right_right,
      key,
      "right_right_left"
    );
    const right_right_right = await Store.assoc(
      t0,
      right_right,
      key,
      "right_right_right"
    );

    expect(await Store.get(initial, key)).toEqual(null);
    expect(await Store.get(start, key)).toEqual("start");
    expect(await Store.get(left, key)).toEqual("left");
    expect(await Store.get(right, key)).toEqual("right");
    expect(await Store.get(left_left, key)).toEqual("left_left");
    expect(await Store.get(left_right, key)).toEqual("left_right");
    expect(await Store.get(right_left, key)).toEqual("right_left");
    expect(await Store.get(right_right, key)).toEqual("right_right");
    expect(await Store.get(left_left_left, key)).toEqual("left_left_left");
    expect(await Store.get(left_left_right, key)).toEqual("left_left_right");
    expect(await Store.get(left_right_left, key)).toEqual("left_right_left");
    expect(await Store.get(left_right_right, key)).toEqual("left_right_right");
    expect(await Store.get(right_left_left, key)).toEqual("right_left_left");
    expect(await Store.get(right_left_right, key)).toEqual("right_left_right");
    expect(await Store.get(right_right_left, key)).toEqual("right_right_left");
    expect(await Store.get(right_right_right, key)).toEqual(
      "right_right_right"
    );
  });

  test("listing spaces of different keys", async () => {
    const Store = makeStore();
    const t0 = Date.now() + 10_0000;
    const initial = Store.startingAt(t0);
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
    const Store = makeStore();
    const key = "key";
    const t0 = Date.now() + 10_001;
    const initial = Store.startingAt(t0);
    const t1 = t0 + 1000;
    const added1 = await Store.assoc(t1, initial, key, "1");
    const t2 = t1 + 1000;
    const added2 = await Store.assoc(t2, added1, key, "2");
    const t3 = t2 + 1000;
    const added3 = await Store.assoc(t3, added2, key, "3");

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

  test("multiple timelines one level deep with dissoc", async () => {
    const Store = makeStore();

    const key = "key";

    const t0 = Date.now();

    const initial = Store.startingAt(t0);
    const start = await Store.assoc(t0, initial, key, "start");
    const left = await Store.assoc(t0, start, key, "left");
    const right = await Store.assoc(t0, start, key, "right");
    const startDissoc = await Store.dissoc(t0, start, key);
    const leftDissoc = await Store.dissoc(t0, left, key);
    const rightDissoc = await Store.dissoc(t0, right, key);

    expect(await Store.get(initial, key)).toEqual(null);
    expect(await Store.get(start, key)).toEqual("start");
    expect(await Store.get(left, key)).toEqual("left");
    expect(await Store.get(right, key)).toEqual("right");
    expect(await Store.get(startDissoc, key)).toEqual(null);
    expect(await Store.get(leftDissoc, key)).toEqual(null);
    expect(await Store.get(rightDissoc, key)).toEqual(null);
  });
};
