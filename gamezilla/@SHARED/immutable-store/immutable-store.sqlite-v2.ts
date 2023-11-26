import { StoreModule, Store } from "./immutable-store";
import { Database } from "bun:sqlite";

export type Instance = {
  _posixTimestamp: number;
  _parentInstance: Instance | null;
  _id: string;
};

const UPGRADE_SQL = `
CREATE TABLE IF NOT EXISTS immutable_store_v2 (
  key_space       TEXT NOT NULL,
  key             TEXT NOT NULL,
  posix_timestamp NUMBER NOT NULL,
  id              TEXT NOT NULL,
  parent_id       TEXT,
  value           TEXT
);
`;

type Row = {
  key_space: string;
  parent_id: string | null;
  id: string;
  posix_timestamp: number;
  key: string;
  value: string | null;
};

function toRow(row: unknown): Row | null {
  if (
    typeof row === "object" &&
    row !== null &&
    "value" in row &&
    (typeof row.value === "string" || row.value === null) &&
    "key_space" in row &&
    typeof row.key_space === "string" &&
    "id" in row &&
    typeof row.id === "string" &&
    "parent_id" in row &&
    (typeof row.parent_id === "string" || row.parent_id === null) &&
    "posix_timestamp" in row &&
    typeof row.posix_timestamp === "number" &&
    "key" in row &&
    typeof row.key === "string"
  ) {
    return {
      key_space: row.key_space,
      id: row.id,
      parent_id: row.parent_id,
      posix_timestamp: row.posix_timestamp,
      key: row.key,
      value: row.value,
    };
  }

  return null;
}

export const SqliteStore = <TKey extends string | number, TValue>({
  connectionString,
  keySpace: keySpace,
  encodeValue,
  decodeValue,
}: {
  keySpace: string;
  connectionString: string;
  decodeValue: (encoded: string | null) => TValue | null;
  encodeValue: (value: TValue | null) => string | null;
}): StoreModule<TKey, TValue> => {
  const cleaned = connectionString.replace("sqlite:", "");

  const db = new Database(cleaned, {
    create: true,
  });

  db.query(UPGRADE_SQL).run();

  let runningAppendStep = 1;

  const append = async (
    now: number,
    instance: Store<TKey, TValue>,
    entries: [TKey, TValue | null][]
  ): Promise<Store<TKey, TValue>> => {
    const instanceNew: Store<TKey, TValue> = {
      _posixTimestamp: Math.max(now, 0),
      _instanceStep: instance._instanceStep + 1,
      _appendStep: runningAppendStep++,
    };

    const sql_values = entries
      .map(([key, value]) => {
        const encodedValue = value ? encodeValue(value) : null;
        const valueSql =
          typeof encodedValue === "string" ? quote(encodedValue) : "NULL";
        return [
          quote(keySpace),
          quote(key),
          instanceNew._posixTimestamp,
          instanceNew._appendStep,
          instanceNew._instanceStep,
          valueSql,
        ].join(", ");
      })
      .map((values) => `(${values})`)
      .join(",\n");

    const sql_query = `
      INSERT INTO immutable_store (
        key_space,
        key,
        posix_timestamp,
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
    startingAt(now) {
      return {
        _posixTimestamp: Math.max(now, 0),
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

    async listLatest(from, to, instance, _log) {
      const listLatestQuery = `
          WITH latest_keys AS (
            SELECT
                key,
                MAX(posix_timestamp) as max_posix_timestamp
            FROM
                immutable_store
            WHERE
                key_space = '${keySpace}'
            AND
                posix_timestamp >= ${from}
            AND
                posix_timestamp <= ${to}
            AND
                instance_step <= ${instance._instanceStep}
            AND
                append_step <= ${instance._appendStep}
            AND
                posix_timestamp <= ${instance._posixTimestamp}
            GROUP BY
                key
        )
        SELECT
            immutable_store.*
        FROM
            immutable_store
        INNER JOIN latest_keys ON
            immutable_store.key = latest_keys.key AND
            immutable_store.posix_timestamp = latest_keys.max_posix_timestamp
        ORDER BY
            immutable_store.posix_timestamp ASC,
            immutable_store.instance_step ASC,
            immutable_store.append_step ASC
      `;

      const rows = db.query(listLatestQuery).all();

      const values = rows.flatMap((row) => {
        const maybeParsedRow = toRow(row);
        if (!maybeParsedRow) {
          return [];
        }
        const parsedValue = decodeValue(maybeParsedRow.value);
        if (!parsedValue) {
          return [];
        }
        return [parsedValue];
      });

      return values;
    },

    async get(instance, key) {
      const latestQuery = `
        SELECT
            key_space,
            append_step,
            instance_step,
            posix_timestamp,
            key,
            value
        FROM
            immutable_store
        WHERE
          key_space = '${keySpace}'
        AND
          key = '${key}'
        AND (
            posix_timestamp < ${instance._posixTimestamp}
          OR (
                posix_timestamp = ${instance._posixTimestamp}
            AND instance_step < ${instance._instanceStep}
          ) OR (
                posix_timestamp = ${instance._posixTimestamp}
            AND instance_step = ${instance._instanceStep}
            AND append_step < ${instance._appendStep}
          ) OR (
                posix_timestamp = ${instance._posixTimestamp}
            AND instance_step = ${instance._instanceStep}
            AND append_step = ${instance._appendStep}
          )
        )
        ORDER BY
          posix_timestamp DESC,
          instance_step DESC,
          append_step DESC
        LIMIT 1
      `;

      const rows = db.query(latestQuery).all();

      const values = rows.flatMap((row) => {
        const maybeParsedRow = toRow(row);
        if (maybeParsedRow) {
          const parsedValue = decodeValue(maybeParsedRow.value);
          return [parsedValue];
        }
        return [];
      });

      const latestValue = values[0] ?? null;

      return latestValue;
    },
  };
};

function quote(str: string | number): string {
  return `'${str}'`;
}
