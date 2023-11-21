import { InMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

buildTest(() => {
  return InMemoryStore<string, string | null>({
    maxEntryCount: 10,
  });
});
