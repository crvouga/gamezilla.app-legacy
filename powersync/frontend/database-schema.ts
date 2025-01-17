import { column, Schema, Table } from '@powersync/web'

const game_flow_pack = new Table({
  id: column.text,
  flow_pack_name: column.text,
})
export type GameFlowPack = AppSchema['game_flow_pack']

const game_flow_puzzle = new Table(
  {
    id: column.text,
    flow_puzzle_name: column.text,
    flow: column.text,
    created_at_posix: column.integer,
    created_by_user_id: column.text,
    last_updated_at_posix: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at: column.integer,
    deleted_by_user_id: column.text,
    flow_solutions: column.text,
  },
  {
    indexes: {
      idx_created_by_last_updated: ['created_by_user_id', 'deleted_at', 'last_updated_at_posix'],
      idx_created_by_created_at: ['created_by_user_id', 'deleted_at', 'created_at_posix'],
    },
  },
)
export type GameFlowPuzzle = AppSchema['game_flow_puzzle']

export const AppSchema = new Schema({
  game_flow_pack,
  game_flow_puzzle,
})
export type AppSchema = (typeof AppSchema)['types']
