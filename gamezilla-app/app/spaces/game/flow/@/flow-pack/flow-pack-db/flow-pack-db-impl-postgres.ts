import {Posix, Result} from 'gamezilla-app/@/core';
import {p} from 'gamezilla-app/@/core/parser';
import {Sql} from 'gamezilla-app/@/sql';
import {UserId} from 'gamezilla-app/app/@/data';
import type {IDbConnSql} from 'gamezilla-app/app/@/server/db-conn-sql';
import {FlowPuzzleId} from '../../flow-puzzle/flow-puzzle-id';
import type {FlowPack} from '../flow-pack';
import {FlowPackId} from '../flow-pack-id';
import {FlowPackName} from '../flow-pack-name';
import type {IFlowPackDb, OrderClause, WhereClause} from './flow-pack-db';

const Row = p.obj({
	flow_pack_id: FlowPackId,
	flow_pack_name: FlowPackName,
	flow_puzzle_ids: p.arr(FlowPuzzleId),
	created_at_posix: p.or(p.num, p.str),
	created_by_user_id: UserId,
	last_updated_at_posix: p.or(p.num, p.str),
	last_updated_by_user_id: UserId,
	deleted_at_posix: p.maybe(p.or(p.num, p.str)),
	deleted_by_user_id: p.maybe(UserId),
});

type Row = p.Infer<typeof Row>;

const rowToFlowPack = (row: Row): FlowPack | null => {
	return {
		createdAt: Posix.init(row.created_at_posix),
		createdBy: row.created_by_user_id,
		id: row.flow_pack_id,
		lastUpdatedAt: Posix.init(
			row.last_updated_at_posix,
		),
		lastUpdatedBy: row.last_updated_by_user_id,
		name: row.flow_pack_name,
		puzzleIds: row.flow_puzzle_ids,
	};
};

const toSqlWhere = (where: WhereClause) => {
	const clauses: string[] = [];
	const vars: Record<string, any> = {};
	if (where.createdBy) {
		clauses.push(
			'created_by_user_id = :created_by_user_id',
		);
		vars['created_by_user_id'] = where.createdBy;
	}

	const str =
		clauses.length > 0
			? `WHERE ${clauses.join(
					'\nAND\t',
			  )}`
			: '';

	return {str, vars};
};

const toSqlOrder = (order: OrderClause) => {
	const clauses: string[] = [];
	const vars: Record<string, any> = {};
	if (order.createdAt) {
		clauses.push(
			`created_at_posix ${
				order.createdAt ===
				'asc'
					? 'ASC'
					: 'DESC'
			}`,
		);
	}
	if (order.lastUpdatedAt) {
		clauses.push(
			`last_updated_at_posix ${
				order.lastUpdatedAt ===
				'asc'
					? 'ASC'
					: 'DESC'
			}`,
		);
	}

	const str =
		clauses.length > 0
			? `ORDER BY ${clauses.join(
					',\n',
			  )}`
			: '';

	return {str, vars};
};

const ensureNumber = (maybeNumber: unknown): number => {
	if (typeof maybeNumber === 'number') {
		return maybeNumber;
	}
	if (typeof maybeNumber === 'string') {
		return Number.parseFloat(maybeNumber);
	}
	return 0;
};

export const FlowPackDbPostgres = ({
	dbConnSql,
}: {
	dbConnSql: IDbConnSql;
}): IFlowPackDb => {
	return {
		async get(id) {
			const queried =
				await dbConnSql.query(
					Row,
					'SELECT * FROM game_flow_pack WHERE flow_pack_id = :flow_pack_id',
					{
						flow_pack_id: id,
					},
				);
			return Result.mapOk(
				queried,
				(row) =>
					row[0]
						? rowToFlowPack(
								row[0],
						  )
						: null,
			);
		},

		async count(input) {
			const where = toSqlWhere(
				input.where,
			);
			const vars = where.vars;
			const str = `
				SELECT
					COUNT(*)
				FROM
					game_flow_pack
				${where.str}
			`;

			const queried =
				await dbConnSql.query(
					p.obj(
						{
							count: p.or(
								p.num,
								p.str,
							),
						},
					),
					str,
					vars,
				);

			return Result.mapOk(
				queried,
				(rows) =>
					ensureNumber(
						rows[0]
							?.count,
					),
			);
		},

		async list(input) {
			const sqlWhere = toSqlWhere(
				input.where,
			);
			const sqlOrder = toSqlOrder(
				input.order,
			);
			const sqlPagination =
				Sql.pagination(
					input.pagination,
				);
			const vars = {
				...sqlWhere.vars,
				...sqlOrder.vars,
				...sqlPagination.vars,
			};

			const str = `
				SELECT * FROM game_flow_pack
				${sqlWhere.str}
				${sqlOrder.str}
				${sqlPagination.str}
			`;

			const queried =
				await dbConnSql.query(
					Row,
					str,
					vars,
				);

			const total =
				Result.withDefault(
					await this.count(
						input,
					),
					0,
				);

			const result = Result.mapOk(
				queried,
				(rows) => {
					return {
						...input.pagination,
						items: rows.flatMap(
							(
								row,
							) => {
								const pack =
									rowToFlowPack(
										row,
									);
								return pack
									? [
											pack,
									  ]
									: [];
							},
						),
						total,
					};
				},
			);

			return result;
		},

		async put(input) {
			const queried =
				await dbConnSql.query(
					p.unknown,
					`
				INSERT INTO game_flow_pack (
					flow_pack_id,
					flow_pack_name,
					flow_puzzle_ids,
					created_at_posix,
					created_by_user_id,
					last_updated_at_posix,
					last_updated_by_user_id,
					deleted_at_posix,
					deleted_by_user_id
				) VALUES (
					:flow_pack_id,
					:flow_pack_name,
					ARRAY[:flow_puzzle_ids]::TEXT[],
					:created_at_posix,
					:created_by_user_id,
					:last_updated_at_posix,
					:last_updated_by_user_id,
					:deleted_at_posix,
					:deleted_by_user_id
				) ON CONFLICT (flow_pack_id) DO UPDATE SET
					flow_pack_name = :flow_pack_name,
					flow_puzzle_ids = ARRAY[:flow_puzzle_ids]::TEXT[],
					last_updated_at_posix = :last_updated_at_posix,
					last_updated_by_user_id = :last_updated_by_user_id
				`,
					{
						flow_pack_id: input.id,
						flow_pack_name: input.name,
						flow_puzzle_ids: Sql.commas(
							input.puzzleIds,
						),
						created_at_posix: input.createdAt,
						created_by_user_id: input.createdBy,
						last_updated_at_posix:
							input.lastUpdatedAt,
						last_updated_by_user_id:
							input.lastUpdatedBy,
						deleted_at_posix: null,
						deleted_by_user_id: null,
					},
				);
			return Result.mapOk(
				queried,
				() => input,
			);
		},

		async zap(input) {
			const queried =
				await dbConnSql.query(
					p.unknown,
					'DELETE FROM game_flow_pack WHERE flow_pack_id = :flow_pack_id',
					{
						flow_pack_id: input.id,
					},
				);
			return Result.mapOk(
				queried,
				() => null,
			);
		},
	};
};
