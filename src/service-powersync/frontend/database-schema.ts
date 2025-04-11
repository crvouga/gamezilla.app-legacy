import { column, Schema, Table } from '@powersync/web'

const game_flow_puzzle = new Table(
  {
    id: column.text,
    name: column.text,
    flow: column.text,
    created_at_posix: column.integer,
    created_by_user_id: column.text,
    last_updated_at_posix: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at: column.integer,
    deleted_by_user_id: column.text,
    solutions: column.text,
  },
  {
    indexes: {
      idx_game_flow_puzzle_created_by_last_updated: ['created_by_user_id', 'deleted_at', 'last_updated_at_posix'],
      idx_game_flow_puzzle_created_by_created_at: ['created_by_user_id', 'deleted_at', 'created_at_posix'],
    },
  },
)
export type GameFlowPuzzle = AppSchema['game_flow_puzzle']

const game_flow_pack = new Table(
  {
    id: column.text,
    flow_pack_name: column.text,
    created_at_posix: column.integer,
    created_by_user_id: column.text,
    last_updated_at_posix: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at_posix: column.integer,
    deleted_by_user_id: column.text,
  },
  {
    indexes: {
      idx_game_flow_pack_created_by_last_updated: ['created_by_user_id', 'deleted_at', 'last_updated_at_posix'],
      idx_game_flow_pack_created_by_created_at: ['created_by_user_id', 'deleted_at', 'created_at_posix'],
    },
  },
)
export type GameFlowPack = AppSchema['game_flow_pack']

const game_flow_pack_item = new Table(
  {
    id: column.text,
    pack_id: column.text,
    puzzle_id: column.text,
    position: column.integer,
    created_at_posix: column.integer,
    created_by_user_id: column.text,
    deleted_at_posix: column.integer,
    deleted_at_user_id: column.text,
  },
  {
    indexes: {
      idx_game_flow_pack_item_pack_id: ['pack_id'],
    },
  },
)
export type GameFlowPackItem = AppSchema['game_flow_pack_item']

const game_flow_solutions = new Table(
  {
    id: column.text,
    solutions: column.text,
    created_at_posix: column.integer,
    last_updated_at_posix: column.integer,
  },
  {
    indexes: {
      idx_game_flow_solutions_created_by_last_updated: ['created_by_user_id', 'deleted_at', 'last_updated_at_posix'],
      idx_game_flow_solutions_created_by_created_at: ['created_by_user_id', 'deleted_at', 'created_at_posix'],
    },
  },
)
export type GameFlowSolutions = AppSchema['game_flow_solutions']

export const AppSchema = new Schema({
  game_flow_puzzle,
  game_flow_pack,
  game_flow_pack_item,
  game_flow_solutions,
})
export type AppSchema = (typeof AppSchema)['types']
