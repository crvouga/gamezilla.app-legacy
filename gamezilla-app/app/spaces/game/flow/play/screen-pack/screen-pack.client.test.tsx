import { describe, expect, it } from "bun:test";
import { ClientFixture } from "../@/testing";
import { FlowPack } from "../../@/flow-pack";
import { expectByText, getByRole } from "gamezilla-app/@/vdom/vdom-testing";

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await ClientFixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-pack-list-item",
					pack: await FlowPack.random(),
				},
			},
		]);
		const rendered = f.render(output);
		expectByText(rendered, f.ctx.t("app.exit"));
	});

	it("should render pack grid", async () => {
		const f = await ClientFixture();
		const pack = await FlowPack.random();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-pack-list-item",
					pack,
				},
			},
		]);
		const rendered = f.render(output);
		expect(getByRole(rendered, "grid")).toBeTruthy();
	});

	it("should exit on exit button click", async () => {
		const f = await ClientFixture();
		const pack = await FlowPack.random();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-pack-list-item",
					pack,
				},
			},
			{
				msg: {
					t: "user-clicked-exit-pack-button",
				},
			},
		]);
		expect(output.modelCore.screen.t).toBe("select-pack");
	});
});
