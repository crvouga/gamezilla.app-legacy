import { column, Schema, Table } from '@powersync/web'

const game_flow_pack = new Table({
  flow_pack_id: column.text,
  flow_pack_name: column.text,
})
export type GameFlowPack = AppSchema['game_flow_pack']

const game_flow_puzzle = new Table({
  flow_puzzle_id: column.text,
  flow_puzzle_name: column.text,
  flow: column.text,
  created_at_posix: column.integer,
  created_by_user_id: column.text,
  last_updated_at_posix: column.integer,
  last_updated_by_user_id: column.text,
  deleted_at: column.integer,
  deleted_by_user_id: column.text,
  flow_solutions: column.text,
})
export type GameFlowPuzzle = AppSchema['game_flow_puzzle']

export const AppSchema = new Schema({
  game_flow_pack,
  game_flow_puzzle,
})
export type AppSchema = (typeof AppSchema)['types']
