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
    deleted_at_posix: column.integer,
    deleted_by_user_id: column.text,
    solutions: column.text,
  },
  {
    indexes: {
      idx_game_flow_puzzle_created_by_last_updated: ['created_by_user_id', 'deleted_at_posix', 'last_updated_at_posix'],
      idx_game_flow_puzzle_created_by_created_at: ['created_by_user_id', 'deleted_at_posix', 'created_at_posix'],
    },
  },
)
export type GameFlowPuzzle = AppSchema['game_flow_puzzle']

const game_flow_pack = new Table(
  {
    id: column.text,
    name: column.text,
    created_at_posix: column.integer,
    created_by_user_id: column.text,
    last_updated_at_posix: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at_posix: column.integer,
    deleted_by_user_id: column.text,
  },
  {
    indexes: {
      idx_game_flow_pack_created_by_last_updated: ['created_by_user_id', 'deleted_at_posix', 'last_updated_at_posix'],
      idx_game_flow_pack_created_by_created_at: ['created_by_user_id', 'deleted_at_posix', 'created_at_posix'],
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
  {},
)
export type GameFlowSolutions = AppSchema['game_flow_solutions']

const user_account = new Table(
  {
    id: column.text,
    created_at_posix: column.integer,
    user_role: column.text,
    phone_number: column.text,
  },
  {},
)
export type UserAccount = AppSchema['user_account']

const user_session = new Table(
  {
    id: column.text,
    user_id: column.text,
    session_id: column.text,
    created_at_posix: column.integer,
    ended_at_posix: column.integer,
    client_session_id: column.text,
  },
  {},
)
export type UserSession = AppSchema['user_session']

const user_guest_session_mapping = new Table(
  {
    id: column.text,
    guest_user_id: column.text,
    client_session_id: column.text,
    session_id: column.text,
    created_at_posix: column.integer,
  },
  {
    indexes: {
      idx_user_guest_session_mapping_session_id: ['session_id'],
      idx_user_guest_session_mapping_user_id: ['guest_user_id'],
    },
  },
)
export type UserGuestSessionMapping = AppSchema['user_guest_session_mapping']

const user_profile = new Table(
  {
    id: column.text,
    username: column.text,
    avatar_seed: column.text,
    avatar_style: column.text,
    created_at_posix: column.integer,
    updated_at_posix: column.integer,
  },
  {},
)
export type UserProfile = AppSchema['user_profile']

export const AppSchema = new Schema({
  game_flow_puzzle,
  game_flow_pack,
  game_flow_pack_item,
  game_flow_solutions,
  user_account,
  user_session,
  user_guest_session_mapping,
  user_profile,
})
export type AppSchema = (typeof AppSchema)['types']
