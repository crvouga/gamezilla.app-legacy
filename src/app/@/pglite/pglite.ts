import { PGlite } from '@electric-sql/pglite'
import { electricSync } from '@electric-sql/pglite-sync'
import { ELECTRIC_URL } from '~/config/shared'
// @ts-ignore
import { live } from '@electric-sql/pglite/live'

const m1 = `
CREATE TABLE game_flow_pack (
    flow_pack_id text NOT NULL,
    flow_pack_name text NOT NULL,
    flow_puzzle_ids text[] NOT NULL,
    created_at_posix bigint NOT NULL,
    created_by_user_id text NOT NULL,
    last_updated_at_posix bigint NOT NULL,
    last_updated_by_user_id text NOT NULL,
    deleted_at_posix bigint,
    deleted_by_user_id text
);

ALTER TABLE ONLY game_flow_pack
    ADD CONSTRAINT game_flow_pack_pkey PRIMARY KEY (flow_pack_id);


CREATE TABLE game_flow_puzzle (
    flow_puzzle_id text NOT NULL,
    flow_puzzle_name text NOT NULL,
    flow json NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    created_by_user_id text NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_by_user_id text NOT NULL,
    deleted_at bigint,
    deleted_by_user_id text,
    flow_solutions jsonb DEFAULT '[]'::jsonb NOT NULL
);

ALTER TABLE ONLY game_flow_puzzle
    ADD CONSTRAINT game_flow_puzzle_pkey PRIMARY KEY (flow_puzzle_id);


CREATE TABLE game_flow_solutions (
    flow_hash text NOT NULL,
    solutions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL,
    last_updated_at_posix bigint DEFAULT ((EXTRACT(epoch FROM CURRENT_TIMESTAMP) * (1000)::numeric))::bigint NOT NULL
);

ALTER TABLE ONLY game_flow_solutions
    ADD CONSTRAINT game_flow_solutions_pkey PRIMARY KEY (flow_hash);
`
const dbName = 'gamezilla-app'

const deleteDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      const deleteRequest = indexedDB.deleteDatabase(dbName)

      deleteRequest.onsuccess = () => {
        console.log(`Database '${dbName}' deleted successfully.`)
        resolve(null)
      }

      deleteRequest.onerror = (event) => {
        console.error(`Failed to delete database '${dbName}':`, event)
        reject(event)
      }

      deleteRequest.onblocked = () => {
        console.warn(`Deletion of database '${dbName}' is blocked. Close all connections and try again.`)
        resolve(null)
      }
    } catch (error) {
      console.error(`Error while deleting database '${dbName}':`, error)
      reject(error)
    }
  })
}

// await deleteDatabase()

export const pgLite = await PGlite.create({
  dataDir: 'idb://gamezilla-app',
  relaxedDurability: true,
  extensions: {
    electric: electricSync(),
    live,
  },
})

// await pgLite.exec(m1)

const electricUrl = new URL(ELECTRIC_URL)
electricUrl.pathname = '/v1/shape'

const urlPuzzle = new URL(electricUrl)
urlPuzzle.searchParams.set('table', 'game_flow_puzzle')
await pgLite.electric.syncShapeToTable({
  shape: { url: urlPuzzle.toString() },
  table: 'game_flow_puzzle',
  primaryKey: ['flow_puzzle_id'],
})

const urlPack = new URL(electricUrl)
urlPack.searchParams.set('table', 'game_flow_pack')
await pgLite.electric.syncShapeToTable({
  shape: { url: urlPack.toString() },
  table: 'game_flow_pack',
  primaryKey: ['flow_pack_id'],
})

const urlSolutions = new URL(electricUrl)
urlSolutions.searchParams.set('table', 'game_flow_solutions')
await pgLite.electric.syncShapeToTable({
  shape: { url: urlSolutions.toString() },
  table: 'game_flow_solutions',
  primaryKey: ['flow_hash'],
})
