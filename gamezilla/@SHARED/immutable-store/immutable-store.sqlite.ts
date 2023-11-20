import { IStore, StoreInstance } from "./immutable-store";
import { Database } from "bun:sqlite";

export type MapEntry<TKey extends string | number, TValue> = StoreInstance<
  TKey,
  TValue
> & {
  key: TKey;
  value: TValue | undefined;
};

const UPGRADE_SQL = `
CREATE TABLE IF NOT EXISTS immutable_store (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    append_step NUMBER NOT NULL,
    instance_step NUMBER NOT NULL,
    value TEXT
);
CREATE INDEX IF NOT EXISTS idx_immutable_store_namespace_key_timestamp ON immutable_store (namespace, key, timestamp);
CREATE INDEX IF NOT EXISTS idx_immutable_store_key_timestamp ON immutable_store (key, timestamp);
CREATE INDEX IF NOT EXISTS idx_immutable_store_parent_id ON immutable_store (parent_id);
CREATE INDEX IF NOT EXISTS idx_immutable_store_id ON immutable_store (id);
CREATE INDEX IF NOT EXISTS idx_immutable_store_timestamp ON immutable_store (timestamp);
`;

type Row = {
  id: string;
  parent_id: string | null;
  timestamp: number;
  key: string;
  value: string | null;
};

export const SqliteStore = <TKey extends string | number, TValue>({
  connectionString,
  namespace,
  encodeValue,
  decodeValue,
}: {
  namespace: string;
  connectionString: string;
  decodeValue: (encoded: string) => TValue | null;
  encodeValue: (value: TValue | null) => string | null;
}): IStore<TKey, TValue> => {
  const db = new Database(connectionString);

  db.query(UPGRADE_SQL).run();

  const map = new Map<TKey, MapEntry<TKey, TValue>[]>();

  let runningAppendStep = 1;

  const append = async (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue | null][]
  ): Promise<StoreInstance<TKey, TValue>> => {
    const instanceNew: StoreInstance<TKey, TValue> = {
      _timestamp: now,
      _instanceStep: instance._instanceStep + 1,
      _appendStep: runningAppendStep++,
    };

    const sql_values = entries
      .map(([key, value]) => {
        const value_sql = (value ? encodeValue(value) : null) ?? "NULL";
        return [
          quote(namespace),
          quote(key),
          quote(instanceNew._timestamp),
          instanceNew._appendStep,
          instanceNew._instanceStep,
          quote(value_sql),
        ].join(", ");
      })
      .map((values) => `(${values})`)
      .join(",\n");

    const sql_query = `
      INSERT INTO immutable_store (
        namespace,
        key,
        timestamp,
        append_step,
        instance_step,
        value
      ) VALUES
      ${sql_values}
    `;

    db.query(sql_query).run();

    return instanceNew;
  };

  return {
    init(now) {
      return {
        _timestamp: now,
        _instanceStep: 0,
        _appendStep: 0,
      };
    },
    async assoc(now, instance, key, value) {
      return append(now, instance, [[key, value]]);
    },

    async assocMany(now, instance, entries) {
      return append(now, instance, entries);
    },

    async dissoc(now, instance, key) {
      return append(now, instance, [[key, null]]);
    },

    async dissocMany(now, instance, keys) {
      return append(
        now,
        instance,
        keys.map((key) => [key, null])
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
            append_step,
            instance_step,
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
            timestamp DESC,
            instance_step DESC,
            append_step DESC
        LIMIT 1
      `;

      const rows = db.query(query).all();

      const parsed = rows.flatMap((row) => {
        if (
          typeof row === "object" &&
          row !== null &&
          "value" in row &&
          typeof row.value === "string"
        ) {
          return {
            ...row,
            value: decodeValue(row.value),
          };
        }
      });

      for (const entry of map.get(key) ?? []) {
        // SKIP entry is too old
        if (entry._timestamp < from) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._timestamp > to) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._instanceStep > instance._instanceStep) {
          continue;
        }

        // SKIP entry is from the future
        if (entry._appendStep > instance._appendStep) {
          continue;
        }

        // KEEP entry exists
        if (!runningEntry) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._timestamp > runningEntry._timestamp) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._instanceStep > runningEntry._instanceStep) {
          runningEntry = entry;
          continue;
        }

        // KEEP entry is newer
        if (entry._appendStep > runningEntry._appendStep) {
          runningEntry = entry;
          continue;
        }
      }

      return runningEntry?.value ?? null;
    },
  };
};

function quote(str: string | number): string {
  return `'${str}'`;
}
