import { describe, expect, it } from "bun:test";
import { Ok, Posix } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import type { FlowPack } from "../flow-pack";
import { FlowPackId } from "../flow-pack-id";
import { FlowPackName } from "../flow-pack-name";
import { FlowPackDb } from "./flow-pack-db-impl";
import { IS_INTEGRATION_TEST } from "public-config";
import { Logger } from "gamezilla-app/app/@/server/logger";
import { DbConnSql } from "gamezilla-app/app/@/server/db-conn-sql";

const Fixture = async () => {
	if (IS_INTEGRATION_TEST) {
		const DATABASE_URL = process.env["DATABASE_URL"];

		if (!DATABASE_URL) {
			throw new Error(`DATABASE_URL not set`);
		}

		const dbConnSql = await DbConnSql({
			databaseUrl: DATABASE_URL,
			logger: Logger({ t: "noop" }),
		});

		const flowPackDb = FlowPackDb({
			t: "db-conn-sql",
			dbConnSql,
		});

		return {
			flowPackDb,
		};
	}

	const flowPackDb = FlowPackDb({
		t: "hash-map",
	});
	return {
		flowPackDb,
	};
};

const randomFlowPack = async (): Promise<FlowPack> => {
	const createdBy = UserId.generate();
	return {
		createdAt: Posix.now(),
		createdBy: createdBy,
		id: FlowPackId.generate(),
		lastUpdatedAt: Posix.now(),
		lastUpdatedBy: createdBy,
		name: await FlowPackName.generate({
			count: 0,
		}),
		puzzleIds: [],
	};
};

describe(import.meta.file, () => {
	it("should be able to put", async () => {
		const f = await Fixture();
		const put = await f.flowPackDb.put(await randomFlowPack());
		expect(put.t).toBe("ok");
	});

	it("should be able to get", async () => {
		const f = await Fixture();
		const pack = await randomFlowPack();
		const before = await f.flowPackDb.get(pack.id);
		await f.flowPackDb.put(pack);
		const after = await f.flowPackDb.get(pack.id);
		expect(before).toEqual(Ok(null));
		expect(after).toEqual(Ok(pack));
	});

	it("should be able to list", async () => {
		const f = await Fixture();
		const pack = await randomFlowPack();
		await f.flowPackDb.put(pack);
		const listed = await f.flowPackDb.list({
			order: {
				createdAt: "asc",
			},
			pagination: {
				limit: 10,
				offset: 0,
			},
			where: {
				createdBy: pack.createdBy,
			},
		});
		expect(listed.t).toBe("ok");
		if (listed.t === "ok") {
			expect(listed.value.items).toEqual([pack]);
		}
	});
});
