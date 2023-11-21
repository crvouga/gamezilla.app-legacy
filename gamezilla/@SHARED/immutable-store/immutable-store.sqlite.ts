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
    key_space TEXT NOT NULL,
    key TEXT NOT NULL,
    posix_timestamp NUMBER NOT NULL,
    append_step NUMBER NOT NULL,
    instance_step NUMBER NOT NULL,
    value TEXT
);
CREATE INDEX IF NOT EXISTS idx_immutable_store_key_space_key_timestamp ON immutable_store (key_space, key, posix_timestamp, append_step, instance_step);
`;

type Row = {
  key_space: string;
  append_step: number;
  instance_step: number;
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
    "append_step" in row &&
    typeof row.append_step === "number" &&
    "instance_step" in row &&
    typeof row.instance_step === "number" &&
    "posix_timestamp" in row &&
    typeof row.posix_timestamp === "number" &&
    "key" in row &&
    typeof row.key === "string"
  ) {
    return {
      key_space: row.key_space,
      append_step: row.append_step,
      instance_step: row.instance_step,
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
}): IStore<TKey, TValue> => {
  const db = new Database(connectionString);

  db.query(UPGRADE_SQL).run();

  let runningAppendStep = 1;

  const append = async (
    now: number,
    instance: StoreInstance<TKey, TValue>,
    entries: [TKey, TValue | null][]
  ): Promise<StoreInstance<TKey, TValue>> => {
    const instanceNew: StoreInstance<TKey, TValue> = {
      _posixTimestamp: now,
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
    init(now) {
      return {
        _posixTimestamp: now,
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

    async listLatest(from, to, instance, log) {
      const sql_query = `
      SELECT
          key_space,
          append_step,
          instance_step,
          posix_timestamp,
          key,
          value
      FROM (
          SELECT
              *,
              ROW_NUMBER() OVER (PARTITION BY key ORDER BY posix_timestamp DESC, instance_step DESC, append_step DESC) as rn
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
      )
      WHERE rn = 1
      ORDER BY
          posix_timestamp ASC,
          instance_step ASC,
          append_step ASC
      `;

      const rows = db.query(sql_query).all();

      const allRows = db.query("SELECT * FROM immutable_store").all();

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

      if (values.length < rows.length) {
        console.log("some values were not parsed", { values, rows, allRows });
      }

      if (log) {
        console.log(sql_query, { rows, allRows, values });
      }

      return values;
    },

    async latest(from, to, instance, key) {
      const sql_query = `
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
        ORDER BY
          posix_timestamp DESC,
          instance_step DESC,
          append_step DESC
        LIMIT 1
      `;

      const rows = db.query(sql_query).all();

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
