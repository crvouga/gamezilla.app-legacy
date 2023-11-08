import { createInMemoryStore } from "./immutable-store.in-memory";
import { buildTest } from "./immutable-store.test";

const Store = createInMemoryStore<string, string | null | undefined>({
  maxEntryCount: 10,
});

buildTest(Store);
