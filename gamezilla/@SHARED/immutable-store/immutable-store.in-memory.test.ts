import { InMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

const Store = InMemoryStore<string, string | null>({
  maxEntryCount: 10,
});

buildTest(Store);
