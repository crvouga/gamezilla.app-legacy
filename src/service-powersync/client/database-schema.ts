import { column, Schema, Table } from '@powersync/web'

const game_numberlink_puzzle = new Table(
  {
    id: column.text,
    name: column.text,
    model: column.text,
    created_at_unix_ms: column.integer,
    created_by_user_id: column.text,
    last_updated_at_unix_ms: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at_unix_ms: column.integer,
    deleted_by_user_id: column.text,
    solutions: column.text,
  },
  {
    indexes: {
      idx_game_numberlink_puzzle_created_by_last_updated: [
        'created_by_user_id',
        'deleted_at_unix_ms',
        'last_updated_at_unix_ms',
      ],
      idx_game_numberlink_puzzle_created_by_created_at: [
        'created_by_user_id',
        'deleted_at_unix_ms',
        'created_at_unix_ms',
      ],
    },
  },
)

const game_numberlink_pack = new Table(
  {
    id: column.text,
    name: column.text,
    created_at_unix_ms: column.integer,
    created_by_user_id: column.text,
    last_updated_at_unix_ms: column.integer,
    last_updated_by_user_id: column.text,
    deleted_at_unix_ms: column.integer,
    deleted_by_user_id: column.text,
  },
  {
    indexes: {
      idx_game_numberlink_pack_created_by_last_updated: [
        'created_by_user_id',
        'deleted_at_unix_ms',
        'last_updated_at_unix_ms',
      ],
      idx_game_numberlink_pack_created_by_created_at: [
        'created_by_user_id',
        'deleted_at_unix_ms',
        'created_at_unix_ms',
      ],
    },
  },
)

const game_numberlink_pack_item = new Table(
  {
    id: column.text,
    pack_id: column.text,
    puzzle_id: column.text,
    position: column.integer,
    created_at_unix_ms: column.integer,
    created_by_user_id: column.text,
    deleted_at_unix_ms: column.integer,
    deleted_at_user_id: column.text,
  },
  {
    indexes: {
      idx_game_numberlink_pack_item_pack_id: ['pack_id'],
    },
  },
)

const game_numberlink_solutions = new Table(
  {
    id: column.text,
    solutions: column.text,
    created_at_unix_ms: column.integer,
    last_updated_at_unix_ms: column.integer,
  },
  {},
)

const user_account = new Table(
  {
    id: column.text,
    created_at_unix_ms: column.integer,
    user_role: column.text,
    phone_number: column.text,
  },
  {},
)

const user_session = new Table(
  {
    id: column.text,
    user_id: column.text,
    session_id: column.text,
    created_at_unix_ms: column.integer,
    ended_at_unix_ms: column.integer,
    client_session_id: column.text,
  },
  {},
)

const user_guest_session_mapping = new Table(
  {
    id: column.text,
    guest_user_id: column.text,
    client_session_id: column.text,
    session_id: column.text,
    created_at_unix_ms: column.integer,
  },
  {
    indexes: {
      idx_user_guest_session_mapping_session_id: ['session_id'],
      idx_user_guest_session_mapping_user_id: ['guest_user_id'],
    },
  },
)

const user_profile = new Table(
  {
    id: column.text,
    username: column.text,
    avatar_seed: column.text,
    avatar_style: column.text,
    created_at_unix_ms: column.integer,
    updated_at_unix_ms: column.integer,
  },
  {},
)

const space = new Table(
  {
    id: column.text,
    created_at_epoch: column.integer,
    updated_at_epoch: column.integer,
    deleted_at_epoch: column.integer,
    model: column.text,
  },
  {},
)

export const AppSchema = new Schema({
  space,
  game_numberlink_puzzle,
  game_numberlink_pack,
  game_numberlink_pack_item,
  game_numberlink_solutions,
  user_account,
  user_session,
  user_guest_session_mapping,
  user_profile,
})
export type AppSchema = (typeof AppSchema)['types']
