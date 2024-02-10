import { Store, StoreModule } from "./immutable-store"

const UPGRADE_SQL = `
CREATE TABLE IF NOT EXISTS immutable_store (
  key_space       TEXT NOT NULL,
  key             TEXT NOT NULL,
  posix_timestamp NUMERIC NOT NULL,
  append_step     NUMERIC NOT NULL,
  instance_step   NUMERIC NOT NULL,
  value           TEXT
);

CREATE INDEX IF NOT EXISTS idx_query1              ON immutable_store (key_space, key, posix_timestamp DESC, instance_step DESC, append_step DESC);
CREATE INDEX IF NOT EXISTS idx_key_posix_timestamp ON immutable_store (key, posix_timestamp);
CREATE INDEX IF NOT EXISTS idx_query2_join_order   ON immutable_store (key, posix_timestamp, instance_step, append_step);
CREATE INDEX IF NOT EXISTS idx_latest_keys         ON immutable_store (key, posix_timestamp, instance_step, append_step);
CREATE INDEX IF NOT EXISTS idx_join_optimization   ON immutable_store (key, posix_timestamp);
CREATE INDEX IF NOT EXISTS idx_order_by            ON immutable_store (posix_timestamp, instance_step, append_step);

`

type Row = {
    key_space: string
    append_step: number
    instance_step: number
    posix_timestamp: number
    key: string
    value: string | null
}

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
        }
    }

    return null
}

export const SqlStore = <TKey extends string | number, TValue>({
    executeSql,
    keySpace,
    encodeValue,
    decodeValue,
}: {
    keySpace: string
    executeSql: (rawSql: string) => Promise<unknown[]>
    decodeValue: (encoded: string | null) => TValue | null
    encodeValue: (value: TValue | null) => string | null
}): StoreModule<TKey, TValue> => {
    let upgraded = false
    const upgrade = async () => {
        if (upgraded) {
            return
        }
        await executeSql(UPGRADE_SQL)
        upgraded = true
    }

    let runningAppendStep = 1

    const append = async (
        now: number,
        instance: Store<TKey, TValue>,
        entries: [TKey, TValue | null][],
    ): Promise<Store<TKey, TValue>> => {
        await upgrade()

        const instanceNew: Store<TKey, TValue> = {
            _posixTimestamp: Math.max(now, 0),
            _instanceStep: instance._instanceStep + 1,
            _appendStep: runningAppendStep++,
        }

        const sql_values = entries
            .map(([key, value]) => {
                const encodedValue = value ? encodeValue(value) : null
                const valueSql =
                    typeof encodedValue === "string"
                        ? quote(encodedValue)
                        : "NULL"
                return [
                    quote(keySpace),
                    quote(key),
                    instanceNew._posixTimestamp,
                    instanceNew._appendStep,
                    instanceNew._instanceStep,
                    valueSql,
                ].join(", ")
            })
            .map((values) => `(${values})`)
            .join(",\n")

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
    `

        await executeSql(sql_query)

        return instanceNew
    }

    return {
        startingAt(now) {
            return {
                _posixTimestamp: Math.max(now, 0),
                _instanceStep: 0,
                _appendStep: 0,
            }
        },
        async assoc(now, instance, key, value) {
            await upgrade()
            return append(now, instance, [[key, value]])
        },

        async assocMany(now, instance, entries) {
            await upgrade()
            return append(now, instance, entries)
        },

        async dissoc(now, instance, key) {
            await upgrade()
            return append(now, instance, [[key, null]])
        },

        async dissocMany(now, instance, keys) {
            await upgrade()
            return append(
                now,
                instance,
                keys.map((key) => [key, null]),
            )
        },

        async listLatest(from, to, instance, _log) {
            await upgrade()
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
      `

            const rows = await executeSql(listLatestQuery)

            const values = rows.flatMap((row) => {
                const maybeParsedRow = toRow(row)
                if (!maybeParsedRow) {
                    return []
                }
                const parsedValue = decodeValue(maybeParsedRow.value)
                if (!parsedValue) {
                    return []
                }
                return [parsedValue]
            })

            return values
        },

        async get(instance, key) {
            await upgrade()
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
      `

            const rows = await executeSql(latestQuery)

            const values = rows.flatMap((row) => {
                const maybeParsedRow = toRow(row)
                if (maybeParsedRow) {
                    const parsedValue = decodeValue(maybeParsedRow.value)
                    return [parsedValue]
                }
                return []
            })

            const latestValue = values[0] ?? null

            return latestValue
        },
    }
}

function quote(str: string | number): string {
    return `'${str}'`
}
