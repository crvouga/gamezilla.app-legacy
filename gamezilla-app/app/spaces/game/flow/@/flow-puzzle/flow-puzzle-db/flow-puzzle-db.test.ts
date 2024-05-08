import { describe, expect, it } from "bun:test";
import { Ok, Result } from "gamezilla-app/@/core";
import { UserId } from "gamezilla-app/app/@/data";
import { ServerTestEnv } from "gamezilla-app/app/@/server/server-test-env";
import { randomFlowPuzzle } from "../../testing";
import type { FlowPuzzle } from "../flow-puzzle";
import { FlowPuzzleName } from "../flow-puzzle-name";
import { FlowPuzzleDb } from "./flow-puzzle-db-impl";

const Fixture = async () => {
	const testEnv = await ServerTestEnv();
	switch (testEnv.t) {
		case "integration": {
			const flowPuzzleDb = FlowPuzzleDb({
				t: "db-conn-sql",
				dbConnSql: testEnv.dbConnSql,
			});

			return {
				flowPuzzleDb,
			};
		}
		case "unit": {
			const flowPuzzleDb = FlowPuzzleDb({
				t: "hash-map",
			});
			return {
				flowPuzzleDb,
			};
		}
	}
};

describe(import.meta.file, () => {
	it("should be able to insert", async () => {
		const f = await Fixture();
		const puzzle = await randomFlowPuzzle();
		const inserted = await f.flowPuzzleDb.put(puzzle);
		expect(inserted.t).toBe("ok");
	});

	it("should be ok", async () => {
		const f = await Fixture();

		const puzzle = await randomFlowPuzzle();
		const before = await f.flowPuzzleDb.get(puzzle.id);
		const inserted = await f.flowPuzzleDb.put(puzzle);
		const after = await f.flowPuzzleDb.get(puzzle.id);

		expect(before.t).toBe("ok");
		expect(inserted.t).toBe("ok");
		expect(after.t).toBe("ok");
	});

	it("should be able to insert puzzles", async () => {
		const f = await Fixture();

		const puzzle = await randomFlowPuzzle();
		const before = await f.flowPuzzleDb.get(puzzle.id);
		await f.flowPuzzleDb.put(puzzle);
		const after = await f.flowPuzzleDb.get(puzzle.id);

		expect(before).toEqual(Ok(null));
		expect(after).toEqual(Ok(puzzle));
	});

	it("should be able to list puzzles by created by", async () => {
		const f = await Fixture();

		const puzzle = await randomFlowPuzzle();
		await f.flowPuzzleDb.put(puzzle);

		for (let i = 0; i < 3; i++) {
			await f.flowPuzzleDb.put(await randomFlowPuzzle());
		}

		const listed = await f.flowPuzzleDb.list({
			order: {
				createdAt: "asc",
			},
			pagination: {
				limit: 10,
				offset: 0,
			},
			where: {
				createdBy: {
					equals: puzzle.createdBy,
				},
			},
		});

		expect(listed.t).toBe("ok");
		if (listed.t === "ok") {
			expect(listed.value.items).toEqual([puzzle]);
		}
	});

	it("should be able to list puzzles by id", async () => {
		const f = await Fixture();

		const puzzleA = await randomFlowPuzzle();
		await f.flowPuzzleDb.put(puzzleA);
		const puzzleB = await randomFlowPuzzle();
		await f.flowPuzzleDb.put(puzzleB);

		for (let i = 0; i < 1; i++) {
			await f.flowPuzzleDb.put(await randomFlowPuzzle());
		}

		const listed = await f.flowPuzzleDb.list({
			order: {
				createdAt: "asc",
			},
			pagination: {
				limit: 10,
				offset: 0,
			},
			where: {
				puzzleId: {
					in: [puzzleA.id, puzzleB.id],
				},
			},
		});

		expect(listed.t).toBe("ok");
		if (listed.t === "ok") {
			expect(listed.value.items).toEqual([puzzleA, puzzleB]);
		}
	});

	it("should be able to count puzzles by created by user id", async () => {
		const EXPECTED_COUNT = 1;

		const f = await Fixture();

		const createdBy = UserId.generate();
		for (let i = 0; i < EXPECTED_COUNT; i++) {
			await f.flowPuzzleDb.put(await randomFlowPuzzle({ createdBy }));
		}
		for (let i = 0; i < 1; i++) {
			await f.flowPuzzleDb.put(await randomFlowPuzzle());
		}

		const counted = await f.flowPuzzleDb.count({
			where: {
				createdBy: {
					equals: createdBy,
				},
			},
		});

		expect(counted.t).toBe("ok");
		if (counted.t === "ok") {
			expect(counted.value).toBe(EXPECTED_COUNT);
		}
	});

	it("should paginate correctly", async () => {
		const f = await Fixture();
		const puzzles: FlowPuzzle[] = [];
		const createdBy = UserId.generate();
		for (let i = 0; i < 5; i++) {
			const puzzle = await randomFlowPuzzle({ createdBy });
			puzzles.push(puzzle);
			await f.flowPuzzleDb.put(puzzle);
		}
		for (let limit = 0; limit < puzzles.length; limit++) {
			for (let offset = 0; offset < puzzles.length; offset++) {
				const listed = await f.flowPuzzleDb.list({
					order: {
						createdAt: "asc",
					},
					pagination: {
						limit,
						offset,
					},
					where: {
						createdBy: {
							equals: createdBy,
						},
					},
				});
				expect(listed.t).toBe("ok");
				if (listed.t === "ok") {
					const expected = puzzles.slice(offset, offset + limit);
					expect(listed.value.items).toEqual(expected);
				}
			}
		}
	});

	it("should update existing record when upserting", async () => {
		const f = await Fixture();
		const puzzle = await randomFlowPuzzle();
		await f.flowPuzzleDb.put(puzzle);
		const updatedPuzzle = {
			...puzzle,
			name: await FlowPuzzleName.generate({
				count: 1,
			}),
		};
		await f.flowPuzzleDb.put(updatedPuzzle);
		const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null);
		expect(after).toEqual(updatedPuzzle);
	});

	it("should be able to zap records", async () => {
		const f = await Fixture();
		const puzzle = await randomFlowPuzzle();
		await f.flowPuzzleDb.put(puzzle);
		const before = Result.withDefault(
			await f.flowPuzzleDb.get(puzzle.id),
			null,
		);
		await f.flowPuzzleDb.zap({
			id: puzzle.id,
			deletedByUserId: UserId.generate(),
		});
		const after = Result.withDefault(await f.flowPuzzleDb.get(puzzle.id), null);
		expect(before).toEqual(puzzle);
		expect(after).toBe(null);
	});
});
