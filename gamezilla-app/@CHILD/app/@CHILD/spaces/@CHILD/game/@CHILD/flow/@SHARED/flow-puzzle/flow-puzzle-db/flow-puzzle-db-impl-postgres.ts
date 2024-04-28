import { UserId } from "gamezilla-app/@CHILD/app/@SHARED/data"
import { IDbConnSql } from "gamezilla-app/@CHILD/app/@SHARED/server/db-conn-sql"
import { Ok, Posix, Result, isErr } from "gamezilla-app/@SHARED/core"
import { p } from "gamezilla-app/@SHARED/core/parser"
import { FlowVariant } from "../../flow"
import { FlowPuzzle } from "../flow-puzzle"
import { FlowPuzzleId } from "../flow-puzzle-id"
import { FlowPuzzleName } from "../flow-puzzle-name"
import { IFlowPuzzleDb } from "./flow-puzzle-db"

//
//
//
//
//
//
//

export const Row = p.obj({
  flow_puzzle_id: p.str,
  flow_puzzle_name: p.str,
  flow_puzzle: p.dict(p.or(p.str, p.num), p.unknown),
  created_at: p.or(p.num, p.str),
  created_by_user_id: p.str,
  last_updated_at: p.or(p.num, p.str),
  last_updated_by_user_id: p.str,
})

export type Row = p.Infer<typeof Row>

const ensureNumber = (x: string | number): number => {
  return typeof x === "string" ? parseFloat(x) : x
}

const rowToFlowPuzzle = (row: Row): FlowPuzzle | null => {
  const flowPuzzleId = FlowPuzzleId.is(row.flow_puzzle_id)
    ? row.flow_puzzle_id
    : null
  const flowPuzzleName = FlowPuzzleName.is(row.flow_puzzle_name)
    ? row.flow_puzzle_name
    : null

  const parsedFlow = FlowVariant.Model.parse(row.flow_puzzle)
  const flow = parsedFlow.t === "ok" ? parsedFlow.value : null

  const createdAt = Posix.fromNumber(ensureNumber(row.created_at))
  const createdBy = UserId.is(row.created_by_user_id)
    ? row.created_by_user_id
    : null
  const lastUpdatedAt = Posix.fromNumber(ensureNumber(row.last_updated_at))
  const lastUpdatedBy = UserId.is(row.last_updated_by_user_id)
    ? row.last_updated_by_user_id
    : null
  if (
    flowPuzzleId &&
    flowPuzzleName &&
    flow &&
    createdAt &&
    createdBy &&
    lastUpdatedAt &&
    lastUpdatedBy
  ) {
    return {
      id: flowPuzzleId,
      name: flowPuzzleName,
      flow: flow,
      createdAt,
      createdBy,
      lastUpdatedAt,
      lastUpdatedBy,
    }
  }
  console.error(
    `[flow-puzzle-db] Failed to parse row=${JSON.stringify(
      row,
      null,
      4,
    )} \nerror=${JSON.stringify(parsedFlow, null, 4)}`,
  )
  return null
}

const puzzleToRow = (puzzle: FlowPuzzle): Row => {
  return {
    flow_puzzle_id: puzzle.id,
    flow_puzzle_name: puzzle.name,
    flow_puzzle: puzzle.flow,
    created_at: puzzle.createdAt,
    created_by_user_id: puzzle.createdBy,
    last_updated_at: puzzle.lastUpdatedAt,
    last_updated_by_user_id: puzzle.lastUpdatedBy,
  }
}

//
//
//
//
//

export const FlowPuzzleDbPostgres = ({
  dbConn,
}: {
  dbConn: IDbConnSql
}): IFlowPuzzleDb => {
  return {
    async get(flowPuzzleId) {
      const queried = await dbConn.query(
        Row,
        `
        SELECT
          *
        FROM
          game_flow_puzzle
        WHERE
          flow_puzzle_id = :flow_puzzle_id
        LIMIT 1`,
        {
          flow_puzzle_id: flowPuzzleId,
        },
      )
      return Result.mapOk(
        queried,
        (rows) => rows.map(rowToFlowPuzzle)[0] ?? null,
      )
    },

    async count(input) {
      const queried = await dbConn.query(
        p.obj({ count: p.num }),
        `
        SELECT
          COUNT(*) AS count
        FROM
          game_flow_puzzle
        WHERE
          created_by_user_id = :created_by_user_id
        `,
        {
          created_by_user_id: input.where.createdBy,
        },
      )
      return Result.mapOk(queried, (x) => x[0]?.count ?? 0)
    },

    async list(input) {
      const variables: Record<string, unknown> = {}

      //
      //
      //

      const where: string[] = [
        //
        `deleted_at IS NULL`,
      ]

      if (!input.where.createdBy?.equals) {
        where.push(`created_by_user_id = :created_by_user_id`)
        variables[`created_by_user_id`] = input.where.createdBy?.equals
      }

      const whereStr = where.length > 0 ? `WHERE ${where.join(" AND ")}` : ""

      //
      //
      //

      const orderBy: string[] = []

      if (input.order.createdAt) {
        orderBy.push(
          `created_at ${input.order.createdAt === "desc" ? "DESC" : "ASC"}`,
        )
      }

      if (input.order.lastUpdatedAt) {
        orderBy.push(
          `last_updated_at ${
            input.order.lastUpdatedAt === "desc" ? "DESC" : "ASC"
          }`,
        )
      }

      const orderByStr =
        orderBy.length > 0 ? `ORDER BY ${orderBy.join(", ")}` : ""

      //
      //
      //

      const queried = await dbConn.query(
        Row,
        `
          SELECT
            *
          FROM
            game_flow_puzzle
          ${whereStr}
          ${orderByStr}
          LIMIT :limit
          OFFSET :offset
        `,
        {
          created_by_user_id: input.where.createdBy,
          limit: input.pagination.limit,
          offset: input.pagination.offset,
        },
      )

      if (isErr(queried)) {
        return queried
      }

      const queriedCount = await dbConn.query(
        p.obj({ count: p.str }),
        `
          SELECT
            COUNT(*) AS count
          FROM
            game_flow_puzzle
          ${whereStr}
        `,
        {
          created_by_user_id: input.where.createdBy,
        },
      )

      if (isErr(queriedCount)) {
        return queriedCount
      }

      const items = queried.value.flatMap((row) => {
        const parsed = rowToFlowPuzzle(row)
        return parsed ? [parsed] : []
      })

      const total = parseFloat(queriedCount.value[0]?.count ?? "0") ?? 0

      return Ok({
        items: items,
        total: total,
        limit: input.pagination.limit,
        offset: input.pagination.offset,
      })
    },

    async upsert(input) {
      const row = puzzleToRow(input)
      const queried = await dbConn.query(
        p.unknown,
        `
          INSERT INTO game_flow_puzzle (
            flow_puzzle_id,
            flow_puzzle_name,
            flow_puzzle,
            created_at,
            created_by_user_id,
            last_updated_at,
            last_updated_by_user_id
          )
          VALUES (
            :flow_puzzle_id,
            :flow_puzzle_name,
            :flow_puzzle,
            :created_at,
            :created_by_user_id,
            :last_updated_at,
            :last_updated_by_user_id
          ) ON CONFLICT (flow_puzzle_id) DO
          UPDATE SET
            flow_puzzle_name = :flow_puzzle_name,
            flow_puzzle = :flow_puzzle,
            last_updated_at = :last_updated_at,
            last_updated_by_user_id = :last_updated_by_user_id
        `,
        row,
      )
      return Result.mapOk(queried, () => null)
    },

    async zap(input) {
      const queried = await dbConn.query(
        p.num,
        `
        UPDATE
          game_flow_puzzle
        SET
          deleted_at = :deleted_at,
          deleted_by_user_id = :deleted_by_user_id
        WHERE
          flow_puzzle_id = :flow_puzzle_id
        `,
        {
          deleted_at: new Date().toISOString(),
          deleted_by_user_id: input.deletedByUserId,
          flow_puzzle_id: input.id,
        },
      )
      return Result.mapOk(queried, () => null)
    },
  }
}
