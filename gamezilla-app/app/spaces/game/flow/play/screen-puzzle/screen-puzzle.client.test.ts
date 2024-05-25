import { describe, expect, it } from "bun:test";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";
import { FlowPlayClientFixture } from "../@/testing";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { LamportTimestamp } from "gamezilla-app/@/lamport-clock";
import {
	EventId,
	WithEventMeta,
	withEventMeta,
} from "gamezilla-app/app/spaces/@/event";

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	const puzzle = await FlowPuzzle.random();
	const nextPuzzle = await FlowPuzzle.random();
	const prevPuzzle = await FlowPuzzle.random();
	const pack = await FlowPack.random({
		puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
	});

	f.initial.model = {
		...f.initial.model,
		flowPuzzles: {
			[puzzle.id]: puzzle,
			[nextPuzzle.id]: nextPuzzle,
			[prevPuzzle.id]: prevPuzzle,
		},
		flowPacks: {
			[pack.id]: pack,
		},
	};

	const initial = f.update(f.initial, [
		{
			msg: {
				t: "user-clicked-open-pack-list-item",
				pack,
			},
		},
		{
			msg: {
				t: "user-clicked-open-puzzle-grid-item",
				puzzle,
				puzzleIndex: 1,
			},
		},
	]);

	return {
		...f,
		initial,
		pack,
		puzzle,
		puzzleIndex: 1,
		nextPuzzle,
		nextPuzzleIndex: 2,
		prevPuzzle,
		prevPuzzleIndex: 0,
	};
};

describe(import.meta.file, () => {
	it("should render puzzle screen after opening puzzle from pack", async () => {
		const f = await Fixture();
		const r = f.render(f.initial);
		expect(r.getAttribute("data-puzzle-id")).toBe(f.puzzle.id);
	});

	it("should render exit button for puzzle screen", async () => {
		const f = await Fixture();
		expect(
			f.render(f.initial).getByRoleAndText("button", f.ctx.t("app.exit")),
		).toBeTruthy();
	});

	it("should exit to pack after clicking exit puzzle button", async () => {
		const f = await Fixture();
		const updated = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-exit-puzzle-button",
				},
			},
		]);
		expect(updated.modelCore.screen.t).toBe("screen-pack");
	});

	it("should render next puzzle button", async () => {
		const f = await Fixture();
		expect(
			f.render(f.initial).getByRoleAndText("button", f.ctx.t("app.next")),
		).toBeTruthy();
	});

	it("should emit msg after clicking next puzzle button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		const nextButton = rendered.getByRoleAndText("button", f.ctx.t("app.next"));
		nextButton.click();
		const msg = await rendered.msgs.once();
		expect(msg.t).toBe("user-clicked-next-puzzle-button");
	});

	it("should render next puzzle after clicking next puzzle button", async () => {
		const f = await Fixture();
		const updated = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-next-puzzle-button",
					nextPuzzle: f.nextPuzzle,
					nextPuzzleIndex: f.nextPuzzleIndex,
				},
			},
		]);
		const r = f.render(updated);
		expect(r.getAttribute("data-puzzle-id")).toBe(f.nextPuzzle.id);
	});

	it("should play sound after user clicks next puzzle button", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msgCore: withEventMeta({
					t: "user-clicked-next-puzzle-button",
					nextPuzzle: f.nextPuzzle,
					nextPuzzleIndex: f.nextPuzzleIndex,
				}),
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	it("should render prev puzzle button", async () => {
		const f = await Fixture();
		expect(
			f.render(f.initial).getByRoleAndText("button", f.ctx.t("app.prev")),
		).toBeTruthy();
	});

	it("should play sound after user clicks prev puzzle button", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msgCore: withEventMeta({
					t: "user-clicked-prev-puzzle-button",
					prevPuzzle: f.prevPuzzle,
					prevPuzzleIndex: f.prevPuzzleIndex,
				}),
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	it('should render prev puzzle after clicking prev puzzle button', async () => {
		const f = await Fixture();
		const updated = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-prev-puzzle-button",
					prevPuzzle: f.prevPuzzle,
					prevPuzzleIndex: f.prevPuzzleIndex,
				},
			},
		]);
		const r = f.render(updated);
		expect(r.getAttribute("data-puzzle-id")).toBe(f.prevPuzzle.id);
	})

	it.todo('should emit msg after clicking prev puzzle button', async () => {
		
	})

	it.todo('should disable prev puzzle button when on first puzzle', async () => {
	})
});
