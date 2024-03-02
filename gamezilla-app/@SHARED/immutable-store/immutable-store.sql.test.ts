// import Database from "bun:sqlite"
// import { SqlStore } from "./immutable-store.sql"
// import { buildTest } from "./immutable-store.test"

// const SHOULD_TEST = false
// if (SHOULD_TEST) {
//   buildTest(async () => {
//     const db = new Database(":memory:", {
//       create: true,
//       readwrite: true,
//     })

//     const store = await SqlStore<string, string | null>({
//       async executeSql(rawSql) {
//         const rows = db.query(rawSql).all()
//         return rows
//       },
//       keySpace: "test-sql",
//       decodeValue: (encoded) => encoded,
//       encodeValue: (value) => value,
//     })

//     return store
//   })
// }
