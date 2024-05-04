import { Task } from "gamezilla-app/@/core";
import type { Paginated, Pagination, UserId } from "gamezilla-app/app/@/data";
import type { FlowPack } from "../flow-pack";
import type { FlowPackId } from "../flow-pack-id";

export type WhereClause = {
	createdBy?: UserId;
};

export type OrderClause = {
	createdAt?: "asc" | "desc";
	lastUpdatedAt?: "asc" | "desc";
};

export type IFlowPackDb = {
	count: (input: { where: WhereClause }) => Task<string, number>;
	list: (input: {
		pagination: Pagination;
		where: WhereClause;
		order: OrderClause;
	}) => Task<string, Paginated<FlowPack>>;
	get: (id: FlowPackId) => Task<string, FlowPack | null>;
	put: (pack: FlowPack) => Task<string, FlowPack>;
	zap: (input: { id: FlowPackId; deletedBy: UserId }) => Task<string, null>;
};
