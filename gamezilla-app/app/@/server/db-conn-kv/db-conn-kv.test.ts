import { describe, expect, it } from "bun:test";
import { Ok, TimeSpan, Uuid } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { Logger } from "../logger";
import { AppServerTestEnv } from "../server-test-env";
import { DbConnKv } from "./db-conn-kv-impl";

const Fixture = async () => {
	const testEnv = await AppServerTestEnv();
	const logger = Logger({ t: "noop" });
	switch (testEnv.t) {
		case "integration": {
			const dbConnKv = testEnv.dbConnKv;

			return {
				logger,
				dbConnKv,
			};
		}

		case "unit": {
			const dbConnKv = await DbConnKv({
				t: "hash-map",
			});

			return {
				logger,
				dbConnKv,
			};
		}
	}
};

type Implementation = {
	name: string;
	Fixture: () => ReturnType<typeof Fixture>;
};

const implementations: Implementation[] = [
	{
		name: "base",
		Fixture,
	},
	{
		name: "with-cache",
		async Fixture() {
			const f = await Fixture();
			return {
				...f,
				dbConnKv: DbConnKv.withCache({
					cache: await DbConnKv({ t: "hash-map" }),
					source: f.dbConnKv,
					logger: f.logger,
				}),
			};
		},
	},
	{
		name: "with-reduced-parsing",
		async Fixture() {
			const f = await Fixture();
			return {
				...f,
				dbConnKv: DbConnKv.withReducedParsing({
					dbConnKv: f.dbConnKv,
					verifiedKeys: new Set(),
				}),
			};
		},
	},
	{
		name: "with-throttled-writes-to-source",
		async Fixture() {
			const f = await Fixture();
			return {
				...f,
				dbConnKv: DbConnKv.withCache({
					cache: await DbConnKv({ t: "hash-map" }),
					source: DbConnKv.withThrottledWrites({
						dbConnKv: f.dbConnKv,
						logger: f.logger,
						throttle: TimeSpan.seconds(10),
					}),
					logger: f.logger,
				}),
			};
		},
	},
];

export const Item = p.obj({ id: p.str });
export type Item = p.Infer<typeof Item>;

const randomItem = (): Item => {
	return {
		id: Uuid.generate(),
	};
};

for (const { name, Fixture } of implementations) {
	describe(`${import.meta.file} ${name}`, () => {
		it("should set correctly", async () => {
			const f = await Fixture();

			const item = randomItem();

			const before = await f.dbConnKv.get(item.id, Item);
			await f.dbConnKv.set(item.id, item);
			const after = await f.dbConnKv.get(item.id, Item);

			expect(before).toEqual(Ok(null));
			expect(after).toEqual(Ok(item));
		});

		it("should set many correctly", async () => {
			const f = await Fixture();

			const items = [randomItem(), randomItem(), randomItem()];

			const before = await f.dbConnKv.getMany(
				items.map((item) => item.id),
				Item,
			);

			await f.dbConnKv.setMany(items.map((item) => [item.id, item]));

			const after = await f.dbConnKv.getMany(
				items.map((item) => item.id),
				Item,
			);

			expect(before).toEqual(Ok([]));
			expect(after).toEqual(Ok(items));
		});

		it("should get correctly", async () => {
			const f = await Fixture();

			const item = randomItem();

			await f.dbConnKv.set(item.id, item);

			const got = await f.dbConnKv.get(item.id, Item);

			expect(got).toEqual(Ok(item));
		});

		it("should get many correctly", async () => {
			const f = await Fixture();

			const items = [randomItem(), randomItem(), randomItem()];

			await f.dbConnKv.setMany(items.map((item) => [item.id, item]));

			const got = await f.dbConnKv.getMany(
				items.map((item) => item.id),
				Item,
			);

			expect(got).toEqual(Ok(items));
		});

		it("should zap items correctly", async () => {
			const f = await Fixture();

			const item = randomItem();

			await f.dbConnKv.set(item.id, item);

			const before = await f.dbConnKv.get(item.id, Item);

			await f.dbConnKv.zap(item.id);

			const after = await f.dbConnKv.get(item.id, Item);

			expect(before).toEqual(Ok(item));
			expect(after).toEqual(Ok(null));
		});
	});
}
