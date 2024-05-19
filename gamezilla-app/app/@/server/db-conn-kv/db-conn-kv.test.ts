import { describe, expect, it } from "bun:test";
import { Ok, Uuid } from "gamezilla-app/@/core";
import { p } from "gamezilla-app/@/core/parser";
import { AppServerTestEnv } from "../server-test-env";
import { DbConnKv } from "./db-conn-kv-impl";

const Fixture = async () => {
	const testEnv = await AppServerTestEnv();
	switch (testEnv.t) {
		case "integration": {
			const dbConnKv = testEnv.dbConnKv;

			return {
				dbConnKv,
			};
		}

		case "unit": {
			const dbConnKv = await DbConnKv({
				t: "hash-map",
			});

			return {
				dbConnKv,
			};
		}
	}
};

const Item = p.obj({
	id: p.str,
});
type Item = p.Infer<typeof Item>;

const randomItem = (): Item => {
	return {
		id: Uuid.generate(),
	};
};

describe(import.meta.file, () => {
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
});
