import { InMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

buildTest(async () => {
  console.log("InMemoryStore");
  return InMemoryStore<string, string | null>({
    maxEntryCount: 10,
    decodeValue: (value) => {
      if (typeof value === "string") {
        return value;
      }
      return null;
    },
    encodeValue: (value) => {
      return value;
    },
    keySpace: "test",
  });
});
