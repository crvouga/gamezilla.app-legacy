import { describe, expect, it } from "bun:test";
import { Sub } from "gamezilla-app/@/core";
import { FlowPack } from "../../@/flow-pack";
import { FlowPlayClientFixture } from "../@/testing";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import { didPlaySound } from "gamezilla-app/app/@/client";

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	const pack = await FlowPack.random();
	const initial = f.update(f.initial, [
		{
			msg: {
				t: "user-clicked-open-pack-list-item",
				pack,
			},
		},
	]);
	return {
		...f,
		initial,
		pack,
	};
};

describe(import.meta.file, () => {
	it("should render exit button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(rendered.getByText(f.ctx.t("app.exit"))).toBeTruthy();
	});

	it("should render pack grid", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(rendered.getByRole("grid")).toBeTruthy();
	});

	it("should emit msg from clicking exit button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		const exitButton = rendered.getByText(f.ctx.t("app.exit"));
		exitButton?.click();
		const msg = await Sub.next(rendered.msgs);
		expect(msg).toEqual({ t: "user-clicked-exit-pack-button" });
	});

	it("should exit on exit button click", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-exit-pack-button",
				},
			},
		]);
		expect(output.modelCore.screen.t).toBe("select-pack");
	});

	it("should play nav back sound on exit", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msgCore: {
					t: "user-clicked-exit-pack-button",
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(1),
				},
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	it("should render puzzles in pack", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		rendered;

		// const cells = rendered.getByRole("")
		// expect(cells.length).toBe(30);
	});
});
