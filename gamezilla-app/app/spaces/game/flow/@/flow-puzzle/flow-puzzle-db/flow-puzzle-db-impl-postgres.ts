import { type Pagination, UserId } from "gamezilla-app/app/@/data";
import type { IDbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";
import { Ok, Posix, Result, isErr } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { FlowVariant } from "../../flow";
import type { FlowPuzzle } from "../flow-puzzle";
import { FlowPuzzleId } from "../flow-puzzle-id";
import { FlowPuzzleName } from "../flow-puzzle-name";
import type { IFlowPuzzleDb, OrderClause, WhereClause } from "./flow-puzzle-db";
import { Sql } from "gamezilla-app/@/sql";

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
});

export type Row = p.Infer<typeof Row>;

const ensureNumber = (x: string | number): number => {
	return typeof x === "string" ? Number.parseFloat(x) : x;
};

const rowToFlowPuzzle = (row: Row): FlowPuzzle | null => {
	const flowPuzzleId = FlowPuzzleId.is(row.flow_puzzle_id)
		? row.flow_puzzle_id
		: null;
	const flowPuzzleName = FlowPuzzleName.is(row.flow_puzzle_name)
		? row.flow_puzzle_name
		: null;

	const parsedFlow = FlowVariant.Model.parse(row.flow_puzzle);
	const flow = parsedFlow.t === "ok" ? parsedFlow.value : null;

	const createdAt = Posix.init(ensureNumber(row.created_at));
	const createdBy = UserId.is(row.created_by_user_id)
		? row.created_by_user_id
		: null;
	const lastUpdatedAt = Posix.init(ensureNumber(row.last_updated_at));
	const lastUpdatedBy = UserId.is(row.last_updated_by_user_id)
		? row.last_updated_by_user_id
		: null;
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
		};
	}
	console.error(
		`[flow-puzzle-db] Failed to parse row=${JSON.stringify(
			row,
			null,
			4,
		)} \nerror=${JSON.stringify(parsedFlow, null, 4)}`,
	);
	return null;
};

//
//
//
//
//

const toSqlWhere = (input: { where: WhereClause }) => {
	const variables: Sql.Vars = {};

	const where: string[] = [
		//
		`deleted_at IS NULL`,
	];

	if (input.where.createdBy?.equals) {
		where.push(`created_by_user_id = :created_by_user_id`);
		variables[`created_by_user_id`] = input.where.createdBy?.equals;
	}

	if (input.where.puzzleId?.in) {
		const puzzleIds = input.where.puzzleId?.in
			.map((puzzleId) => `'${puzzleId}'`)
			.join(", ");
		where.push(`flow_puzzle_id IN (${puzzleIds})`);
	}

	const str = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

	return {
		str,
		variables,
	};
};

const toSqlOrder = (input: { order: OrderClause }) => {
	const orderBy: string[] = [];

	if (input.order.createdAt) {
		orderBy.push(
			`created_at ${input.order.createdAt === "desc" ? "DESC" : "ASC"}`,
		);
	}

	if (input.order.lastUpdatedAt) {
		orderBy.push(
			`last_updated_at ${
				input.order.lastUpdatedAt === "desc" ? "DESC" : "ASC"
			}`,
		);
	}

	const str = orderBy.length > 0 ? `ORDER BY ${orderBy.join(", ")}` : "";

	return {
		str,
	};
};

const toSqlPagination = (input: { pagination: Pagination }) => {
	const variables: Sql.Vars = {
		limit: input.pagination.limit,
		offset: input.pagination.offset,
	};
	const str = `LIMIT :limit OFFSET :offset`;
	return {
		variables,
		str,
	};
};

export const FlowPuzzleDbPostgres = ({
	dbConnSql,
}: {
	dbConnSql: IDbConnSql;
}): IFlowPuzzleDb => {
	return {
		async get(flowPuzzleId) {
			const queried = await dbConnSql.query(
				Row,
				`
        SELECT
          *
        FROM
          game_flow_puzzle
        WHERE
              flow_puzzle_id = :flow_puzzle_id
          AND deleted_at IS NULL
        LIMIT 1`,
				{
					flow_puzzle_id: flowPuzzleId,
				},
			);
			return Result.mapOk(
				queried,
				(rows) => rows.map(rowToFlowPuzzle)[0] ?? null,
			);
		},

		async count(input) {
			const where = toSqlWhere(input);

			const queried = await dbConnSql.query(
				p.obj({ count: p.str }),
				`
        SELECT
          COUNT(*) AS count
        FROM
          game_flow_puzzle
        ${where.str}
        `,
				where.variables,
			);
			return Result.mapOk(queried, (x) =>
				Number.parseFloat(x[0]?.count ?? "0"),
			);
		},

		async list(input) {
			const where = toSqlWhere(input);
			const order = toSqlOrder(input);
			const pagination = toSqlPagination(input);

			const variables: Sql.Vars = {
				...where.variables,
				...pagination.variables,
			};

			const queried = await dbConnSql.query(
				Row,
				`
          SELECT
            *
          FROM
            game_flow_puzzle
          ${where.str}
          ${order.str}
          ${pagination.str}
        `,
				variables,
			);

			if (isErr(queried)) {
				return queried;
			}

			const queriedCount = await dbConnSql.query(
				p.obj({ count: p.str }),
				`
          SELECT
            COUNT(*) AS count
          FROM
            game_flow_puzzle
          ${where.str}
        `,
				variables,
			);

			if (isErr(queriedCount)) {
				return queriedCount;
			}

			const items = queried.value.flatMap((row) => {
				const parsed = rowToFlowPuzzle(row);
				return parsed ? [parsed] : [];
			});

			const total = Number.parseFloat(queriedCount.value[0]?.count ?? "0") ?? 0;

			return Ok({
				items: items,
				total: total,
				limit: input.pagination.limit,
				offset: input.pagination.offset,
			});
		},

		async put(input) {
			const queried = await dbConnSql.query(
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
				{
					flow_puzzle_id: input.id,
					flow_puzzle_name: input.name,
					flow_puzzle: Sql.json(input.flow),
					created_at: input.createdAt,
					created_by_user_id: input.createdBy,
					last_updated_at: input.lastUpdatedAt,
					last_updated_by_user_id: input.lastUpdatedBy,
				},
			);
			return Result.mapOk(queried, () => null);
		},

		async zap(input) {
			const queried = await dbConnSql.query(
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
					deleted_at: Posix.now(),
					deleted_by_user_id: input.deletedByUserId,
					flow_puzzle_id: input.id,
				},
			);
			return Result.mapOk(queried, () => null);
		},
	};
};
