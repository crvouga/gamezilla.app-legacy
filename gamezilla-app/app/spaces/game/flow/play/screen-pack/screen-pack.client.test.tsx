import { describe, expect, it } from "bun:test";
import { Sub } from "gamezilla-app/@/core";
import { FlowPack } from "../../@/flow-pack";
import { FlowPlayClientFixture } from "../@/testing";

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	const pack = await FlowPack.random()
	const initial = f.update(f.initial, [
		{
			msg: {
				t: 'user-clicked-open-pack-list-item',
				pack,
			}
		}
	]);
	return {
		...f,
		initial,
		pack,
	};
}

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await FlowPlayClientFixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-open-pack-list-item",
					pack: await FlowPack.random(),
				},
			},
		]);
		const rendered = f.render(output);
		expect(rendered.getByText(f.ctx.t("app.exit"))).toBeTruthy();
	});

	it("should render pack grid", async () => {
		const f = await FlowPlayClientFixture();
		const pack = await FlowPack.random();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-open-pack-list-item",
					pack,
				},
			},
		]);
		const rendered = f.render(output);
		expect(rendered.getByRole("grid")).toBeTruthy();
	});

	it("should exit on exit button click", async () => {
		const f = await FlowPlayClientFixture();
		const pack = await FlowPack.random();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-open-pack-list-item",
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

	it("should emit msg from clicking exit button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		const exitButton = rendered.getByText(f.ctx.t("app.exit"));
		exitButton?.click()		
		const msg = await Sub.next(rendered.msgs)
		expect(msg).toEqual({t: "user-clicked-exit-pack-button",});
	});
});
