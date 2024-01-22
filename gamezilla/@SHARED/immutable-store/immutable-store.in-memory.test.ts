import { InMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

buildTest(async () => {
  return InMemoryStore<string, string | null>({
    maxEntryCount: 10,
    decodeValue: (value) => {
      if (typeof value === "string") {
        return value;
      }
      if (value === null) {
        return null;
      }
      return null;
    },
    encodeValue: (value) => {
      return value;
    },
    namespace: "test",
  });
});
