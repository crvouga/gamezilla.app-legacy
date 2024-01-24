import { SqliteStore } from "./immutable-store.sqlite";
import { buildTest } from "./immutable-store.test";

if (false) {
  buildTest(async () => {
    return SqliteStore<string, string | null>({
      connectionString: ":memory:",
      keySpace: "test",
      decodeValue: (encoded) => encoded,
      encodeValue: (value) => value,
    });
  });
}
