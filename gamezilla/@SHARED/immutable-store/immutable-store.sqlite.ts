import { Store, StoreInstance } from "./immutable-store";
import { Database } from "bun:sqlite";

export type MapEntry<TKey extends string | number, TValue> = StoreInstance<
  TKey,
  TValue
> & {
  key: TKey;
  value: TValue | undefined;
};

const sql = `
CREATE TABLE IF NOT EXISTS immutable_store (
    namespace TEXT NOT NULL,
    id TEXT NOT NULL,
    parent_id TEXT,
    timestamp TIMESTAMP NOT NULL,
    key TEXT NOT NULL,
    value TEXT
);
CREATE INDEX IF NOT EXISTS idx_immutable_store_namespace_key_timestamp ON immutable_store (namespace, key, timestamp);
CREATE INDEX IF NOT EXISTS idx_immutable_store_key_timestamp ON immutable_store (key, timestamp);
CREATE INDEX IF NOT EXISTS idx_immutable_store_parent_id ON immutable_store (parent_id);
CREATE INDEX IF NOT EXISTS idx_immutable_store_id ON immutable_store (id);
CREATE INDEX IF NOT EXISTS idx_immutable_store_timestamp ON immutable_store (timestamp);
`;

export const createSqliteStore = <TKey extends string | number, TValue>({
  connectionString,
  namespace,
}: {
  namespace: string;
  connectionString: string;
  decodeValue: (encoded: string) => TValue | null;
  encodeValue: (value: TValue) => string;
}): Store<TKey, TValue> => {
  const db = new Database(connectionString);

  const map = new Map<TKey, MapEntry<TKey, TValue>[]>();

  let runningAppendStep = 1;

  const append = async (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue | undefined][]
  ): Promise<StoreInstance<TKey, TValue>> => {
    const instanceNew: StoreInstance<TKey, TValue> = {
      timestamp: now,
      instanceStep: instance.instanceStep + 1,
      appendStep: runningAppendStep++,
    };

    return instanceNew;
  };

  return {
    init(now) {
      return {
        timestamp: now,
        instanceStep: 0,
        appendStep: 0,
      };
    },
    async assoc(now, instance, key, value) {
      return append(now, instance, [[key, value]]);
    },

    async assocMany(now, instance, entries) {
      return append(now, instance, entries);
    },

    async dissoc(now, instance, key) {
      return append(now, instance, [[key, undefined]]);
    },

    async dissocMany(now, instance, keys) {
      return append(
        now,
        instance,
        keys.map((key) => [key, undefined])
      );
    },

    async listLatest(from, to, instance) {
      const latestValues: TValue[] = [];
      for (const key of map.keys()) {
        const value = await this.latest(from, to, instance, key);

        if (!value) {
          continue;
        }

        latestValues.push(value);
      }
      return latestValues;
    },

    async latest(from, to, instance, key) {
      let runningEntry: MapEntry<TKey, TValue> | undefined = undefined;

      const query = `
        SELECT
            id,
            parent_id,
            timestamp,
            key,
            value
        FROM
            immutable_store
        WHERE
            key = :key
        AND
            namespace = :namespace
        AND
            timestamp >= :from
        AND
            timestamp <= :to
        ORDER BY
            timestamp DESC
        LIMIT 100
      `;

      for (const entry of map.get(key) ?? []) {
        // SKIP entry is too old
        if (entry.timestamp < from) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.timestamp > to) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.instanceStep > instance.instanceStep) {
          continue;
        }

        // SKIP entry is from the future
        if (entry.appendStep > instance.appendStep) {
          continue;
        }

        // KEEP entry exists
        if (!runningEntry) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.timestamp > runningEntry.timestamp) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.instanceStep > runningEntry.instanceStep) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry.appendStep > runningEntry.appendStep) {
          runningEntry = entry;
          continue;
        }
      }

      return runningEntry?.value;
    },
  };
};
