// AppSchema.ts
import { column, Schema, Table } from '@powersync/web'

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

export const AppSchema = new Schema({
  game_flow_puzzle,
})

export type Database = (typeof AppSchema)['types']
export type GameFlowPuzzle = Database['game_flow_puzzle']
