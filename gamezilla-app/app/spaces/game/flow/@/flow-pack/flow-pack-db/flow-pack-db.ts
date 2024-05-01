import type { Result } from "gamezilla-app/@/core";
import type { Paginated, Pagination, UserId } from "gamezilla-app/app/@/data";
import type { FlowPuzzleId } from "../../flow-puzzle/flow-puzzle-id";
import type { FlowPack } from "../flow-pack";
import type { FlowPackId } from "../flow-pack-id";

export type IFlowPackDb = {
	count: (input: {
		where: {
			createdBy?: UserId;
		};
	}) => Promise<Result<string, number>>;
	list: (input: {
		pagination: Pagination;
		where: {
			createdBy?: UserId;
		};
		order: {
			createdAt?: "asc" | "desc";
			lastUpdatedAt?: "asc" | "desc";
		};
	}) => Promise<Result<string, Paginated<FlowPack>>>;
	get: (id: FlowPackId) => Promise<Result<string, FlowPack | null>>;
	put: (pack: FlowPack) => Promise<Result<string, FlowPack>>;
	zap: (input: {
		id: FlowPuzzleId;
		deletedBy: UserId;
	}) => Promise<Result<string, null>>;
};
