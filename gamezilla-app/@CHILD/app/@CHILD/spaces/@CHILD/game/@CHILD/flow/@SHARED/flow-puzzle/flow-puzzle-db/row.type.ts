/** @see {isRow} ts-auto-guard:type-guard */
export type Row = {
  flow_puzzle_id: string
  flow_puzzle_name: string
  flow_puzzle: Record<string, unknown>
  created_at: string
  created_by_user_id: string
  last_updated_at: string
  last_updated_by_user_id: string
}
