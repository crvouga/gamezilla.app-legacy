import { expect, test } from "vitest";
import { createImmutableMap, init } from "./immutable-map";
import { createEntryStorage } from "./entry-storage.in-memory";

const Map = createImmutableMap<string | null | undefined>(createEntryStorage());

test("working with one key", async () => {
  const now = Date.now();
  const key = "user-123";

  const map1 = init(now);
  const map2A = await Map.set(map1, key, "2A");
  const map2B = await Map.set(map1, key, "2B");

  expect(await Map.get(map1, key)).toEqual(undefined);
  expect(await Map.get(map2A, key)).toEqual("2A");
  expect(await Map.get(map2B, key)).toEqual("2B");
});

test("working with two keys", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const map0 = init(now);

  const map1 = await Map.set(map0, key1, "value-1");

  const map2 = await Map.set(map1, key2, "value-2");

  expect(await Map.get(map0, key1)).toEqual(undefined);
  expect(await Map.get(map0, key2)).toEqual(undefined);

  expect(await Map.get(map1, key1)).toEqual("value-1");
  expect(await Map.get(map1, key2)).toEqual(undefined);

  expect(await Map.get(map2, key1)).toEqual("value-1");
  expect(await Map.get(map2, key2)).toEqual("value-2");
});

test("immutable behavior", async () => {
  const now = Date.now();
  const key = "user-123";

  const map1 = init(now);
  const map2 = await Map.set(map1, key, "value");

  // Ensure the original map is unchanged after 'set'
  expect(await Map.get(map1, key)).toEqual(undefined);

  // Ensure the new map has the updated value
  expect(await Map.get(map2, key)).toEqual("value");
});

test("chaining updates", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const map0 = init(now);
  const map1 = await Map.set(map0, key1, "value-1");
  const map2 = await Map.set(map1, key2, "value-2");

  // Ensure original maps are unchanged
  expect(await Map.get(map0, key1)).toEqual(undefined);
  expect(await Map.get(map0, key2)).toEqual(undefined);
  expect(await Map.get(map1, key1)).toEqual("value-1");
  expect(await Map.get(map1, key2)).toEqual(undefined);

  // Ensure the new map has updated values
  expect(await Map.get(map2, key1)).toEqual("value-1");
  expect(await Map.get(map2, key2)).toEqual("value-2");
});

test("deleting keys", async () => {
  const now = Date.now();
  const key = "key-1";

  const map1 = init(now);
  const map2 = await Map.set(map1, key, "value");
  const map3 = await Map.zap(map2, key);

  // Ensure the original map is unchanged
  expect(await Map.get(map1, key)).toEqual(undefined);

  // Ensure the new map has the updated value
  expect(await Map.get(map2, key)).toEqual("value");

  // Ensure the key is deleted in the final map
  expect(await Map.get(map3, key)).toEqual(undefined);
});

test("key not found", async () => {
  const now = Date.now();
  const key = "nonexistent-key";

  const map = init(now);

  // Ensure a key that doesn't exist returns null
  expect(await Map.get(map, key)).toEqual(undefined);
});

test("overwriting values", async () => {
  const now = Date.now();
  const key = "key-1";

  const map1 = init(now);
  const map2 = await Map.set(map1, key, "value1");
  const map3 = await Map.set(map2, key, "value2");

  // Ensure original values remain unchanged
  expect(await Map.get(map1, key)).toEqual(undefined);
  expect(await Map.get(map2, key)).toEqual("value1");

  // Ensure the new value is set in the new map
  expect(await Map.get(map3, key)).toEqual("value2");
});

test("multiple keys independently updated", async () => {
  const now = Date.now();
  const key1 = "key-1";
  const key2 = "key-2";

  const map1 = init(now);
  const map2 = await Map.set(map1, key1, "value1");
  const map3 = await Map.set(map2, key2, "value2");

  // Ensure original maps are unchanged
  expect(await Map.get(map1, key1)).toEqual(undefined);
  expect(await Map.get(map1, key2)).toEqual(undefined);
  expect(await Map.get(map2, key1)).toEqual("value1");
  expect(await Map.get(map2, key2)).toEqual(undefined);

  // Ensure the new map has updated values
  expect(await Map.get(map3, key1)).toEqual("value1");
  expect(await Map.get(map3, key2)).toEqual("value2");
});

test("empty key handling", async () => {
  const now = Date.now();
  const key = "";

  const map1 = init(now);
  const map2 = await Map.set(map1, key, "value");

  expect(await Map.get(map2, key)).toEqual("value");
});

test("null and undefined values", async () => {
  const now = Date.now();
  const key1 = "null-key";
  const key2 = "undefined-key";

  const map1 = init(now);
  const map2 = await Map.set(map1, key1, null);
  const map3 = await Map.set(map2, key2, undefined);

  expect(await Map.get(map3, key1)).toEqual(null);
  expect(await Map.get(map3, key2)).toEqual(undefined);
});

test("concurrent writes", async () => {
  const key = "concurrent-key";
  const now = Date.now();
  const initialMap = init(now);

  // Simulate concurrent operations by creating multiple promises
  const concurrentWrites = Array.from({ length: 10 }, (_, index) => {
    return Map.set(initialMap, key, `value-${index}`);
  });

  // Await all concurrent updates to finish
  const maps = await Promise.all(concurrentWrites);

  // Check each map to see if it contains the correct value
  for (const [index, map] of maps.entries()) {
    const expectedValue = `value-${index}`;
    const got = await Map.get(map, key);
    expect(got).toEqual(expectedValue);
  }
});

test("concurrent reads", async () => {
  const now = Date.now();
  const key = "concurrent-key";

  const map1 = init(now);
  const map2 = await Map.set(map1, key, "value");

  // Simulate concurrent reads by creating multiple promises
  const concurrentReads = Array.from({ length: 10 }, () => {
    return Map.get(map2, key);
  });

  // Await all concurrent reads to finish
  const values = await Promise.all(concurrentReads);

  // All the values read should be the same
  for (let value of values) {
    expect(value).toEqual("value");
  }
});
