import { Ok, Result } from "gamezilla-app/@shared/core";
import type { FlowPack } from "../flow-pack";
import type { IFlowPackDb } from "./flow-pack-db";

const db = new Map<string, FlowPack>();

export const FlowPackDbHashMap = (): IFlowPackDb => {
	return {
		async get(id) {
			return Ok(db.get(id) ?? null);
		},

		async count(input) {
			const listed = await this.list({
				order: { createdAt: "asc" },
				pagination: { limit: 0, offset: 0 },
				where: input.where,
			});

			return Result.mapOk(listed, (l) => l.total);
		},

		async list(input) {
			const all = Array.from(db.values());

			const filtered = all.filter((pack) =>
				input.where.createdBy ? pack.createdBy === input.where.createdBy : true,
			);
			const sliced = filtered.slice(
				input.pagination.offset,
				input.pagination.offset + input.pagination.limit,
			);
			return Ok({
				total: filtered.length,
				items: sliced,
				limit: input.pagination.limit,
				offset: input.pagination.offset,
			});
		},

		async put(pack) {
			db.set(pack.id, pack);
			return Ok(pack);
		},

		async zap({ id }) {
			db.delete(id);
			return Ok(null);
		},
	};
};
