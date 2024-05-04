import { describe, expect, it } from "bun:test";
import { Ok, Posix } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import { ServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import type { FlowPack } from "../flow-pack";
import { FlowPackId } from "../flow-pack-id";
import { FlowPackName } from "../flow-pack-name";
import { FlowPackDb } from "./flow-pack-db-impl";

const Fixture = async () => {
	const testEnv = await ServerTestEnv();
	switch (testEnv.t) {
		case "integration": {
			const flowPackDb = FlowPackDb({
				t: "db-conn-sql",
				dbConnSql: testEnv.dbConnSql,
			});

			return {
				flowPackDb,
			};
		}

		case "unit": {
			const flowPackDb = FlowPackDb({
				t: "hash-map",
			});

			return {
				flowPackDb,
			};
		}
	}
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
		const pack = await randomFlowPack();
		const put = await f.flowPackDb.put(pack);
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

	it("should be able to count", async () => {
		const f = await Fixture();
		const pack = await randomFlowPack();
		await f.flowPackDb.put(pack);
		const count = await f.flowPackDb.count({
			where: {
				createdBy: pack.createdBy,
			},
		});
		expect(count).toEqual(Ok(1));
	});

	it('should be able to zap', async () => {
		const f = await Fixture();
		const pack = await randomFlowPack();
		await f.flowPackDb.put(pack);
		const zapped = await f.flowPackDb.zap({
			deletedBy: pack.createdBy,
			id: pack.id,
		});
		const after = await f.flowPackDb.get(pack.id);
		expect(zapped).toEqual(Ok(null));
		expect(after).toEqual(Ok(null));
	})
});
