import { InMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

buildTest(async () => {
  return InMemoryStore<string, string | null>({
    maxEntryCount: 10,
  });
});
