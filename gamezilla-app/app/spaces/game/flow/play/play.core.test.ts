import { describe, expect, it } from "bun:test";
import { FlowPack } from "../@/flow-pack";
import { CoreFixture } from "./@/testing";

describe(import.meta.file, () => {
	it("should be able to open pack from list", async () => {
		const f = await CoreFixture();
		const before = f.init;
		const after = f.update(before, [
			{
				t: "user-clicked-pack-list-item",
				pack: await FlowPack.random(),
			},
		]);

		expect(before.screen.t).toEqual("select-pack");
		expect(after.screen.t).toEqual("pack");
	});

	it("should exit to select pack screen after clicking exit button", async () => {
		const f = await CoreFixture();
		const before = f.update(f.init, [
			{
				t: "user-clicked-pack-list-item",
				pack: await FlowPack.random(),
			},
		]);
		const after = f.update(before, [
			{
				t: "user-clicked-exit-pack-button",
			},
		]);
		expect(before.screen.t).toEqual("pack");
		expect(after.screen.t).toEqual("select-pack");
	});
});
