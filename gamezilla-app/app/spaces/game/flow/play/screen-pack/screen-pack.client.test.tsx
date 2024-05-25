import { describe, expect, it } from "bun:test";
import { Sub } from "gamezilla-app/@/core";
import { FlowPack } from "../../@/flow-pack";
import { FlowPlayClientFixture } from "../@/testing";
import { EventId } from "gamezilla-app/app/spaces/@/event";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { FlowPuzzle } from "../../@/flow-puzzle";

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	const puzzle = await FlowPuzzle.random();
	const pack = await FlowPack.random({
		puzzleIds: [puzzle.id],
	});
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
		puzzle,
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

	it("should exit to pack list on exit button pack click", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-exit-pack-button",
				},
			},
		]);
		expect(output.modelCore.screen.t).toBe("screen-select-pack");
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

	it("should open puzzle after clicking grid item", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-open-puzzle-grid-item",
					puzzle: f.puzzle,
					puzzleIndex: 0,
				},
			},
		]);
		expect(output.modelCore.screen.t).toBe("screen-puzzle");
		if (output.modelCore.screen.t === "screen-puzzle") {
			expect(output.modelCore.screen.flowPuzzle).toEqual(f.puzzle);
		}
	});

	it("should play sound after user opens puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msgCore: {
					t: "user-clicked-open-puzzle-grid-item",
					puzzle: f.puzzle,
					eventId: EventId.generate(),
					happenedAt: LamportTimestamp.fromNumber(1),
					puzzleIndex: 0,
				},
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	it.todo("should render next puzzle button", async () => {
		//
	});

	it.todo(
		"should play sound after user clicks next puzzle button",
		async () => {},
	);

	it.todo("should render prev puzzle button", async () => {
		//
	});

	it.todo(
		"should play sound after user clicks prev puzzle button",
		async () => {},
	);
});
