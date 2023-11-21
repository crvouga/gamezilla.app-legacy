import { SqliteStore } from "./immutable-store.sqlite";
import { buildTest } from "./immutable-store.test";

buildTest(() => {
  return SqliteStore<string, string | null>({
    connectionString: ":memory:",
    keySpace: "test",
    decodeValue: (encoded) => encoded,
    encodeValue: (value) => value,
  });
});
