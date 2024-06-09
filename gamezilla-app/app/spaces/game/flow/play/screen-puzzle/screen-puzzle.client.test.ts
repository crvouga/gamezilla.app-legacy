import { describe, expect, it } from "bun:test";
import { didPlaySound } from "gamezilla-app/app/@/client";
import { withEventMeta } from "gamezilla-app/app/spaces/@/event";
import { Flow, FlowVariantUIPlay } from "../../@/flow";
import { FlowPack } from "../../@/flow-pack";
import { FlowPuzzle } from "../../@/flow-puzzle";
import { type FixtureUpdateInput, FlowPlayClientFixture } from "../@/testing";

const toCompletePuzzleMsgs = (puzzle: FlowPuzzle) =>
	FlowVariantUIPlay.toSolutionMsgs({
		flow: puzzle.flow,
	}).map(
		(c): FixtureUpdateInput => ({
			msgCore: withEventMeta({
				t: "got-puzzle-screen-flow-play-msg",
				c,
			}),
		}),
	);

const Fixture = async () => {
	const f = await FlowPlayClientFixture();
	const puzzle = await FlowPuzzle.random();
	const nextPuzzle = await FlowPuzzle.random();
	const prevPuzzle = await FlowPuzzle.random();
	const pack = await FlowPack.random({
		puzzleIds: [prevPuzzle.id, puzzle.id, nextPuzzle.id],
	});
	const puzzleIndex = 1;
	const prevPuzzleIndex = 0;
	const nextPuzzleIndex = 2;

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
				flowPuzzle: puzzle,
				puzzleIndex,
			},
		},
	]);

	const firstPuzzle = prevPuzzle;
	const firstPuzzleIndex = 0;
	const lastPuzzle = nextPuzzle;
	const lastPuzzleIndex = 2;

	const completePuzzleMsgs = toCompletePuzzleMsgs(puzzle);
	const completeLastPuzzleMsgs: FixtureUpdateInput[] = [
		{
			msgCore: withEventMeta({
				t: "user-clicked-next-puzzle-button",
				nextPuzzleIndex: lastPuzzleIndex,
				nextPuzzle: lastPuzzle,
			}),
		},
		...toCompletePuzzleMsgs(lastPuzzle),
	];

	return {
		...f,
		completeLastPuzzleMsgs,
		completePuzzleMsgs,
		initial,
		pack,
		puzzle,
		puzzleIndex,
		firstPuzzle,
		firstPuzzleIndex,
		lastPuzzle,
		lastPuzzleIndex,
		//
		nextPuzzle,
		nextPuzzleIndex,
		prevPuzzle,
		prevPuzzleIndex,
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
			f.render(f.initial).getByRole("button", f.ctx.t("app.exit")),
		).toBeTruthy();
	});

	it("should make a sound after clicking exit button", async () => {
		const f = await Fixture();
		const updated = f.update(f.initial, [
			{
				msgCore: withEventMeta({
					t: "user-clicked-exit-puzzle-button",
				}),
			},
		]);
		expect(didPlaySound(updated)).toBe(true);
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
			f.render(f.initial).getByRole("button", f.ctx.t("app.next")),
		).toBeTruthy();
	});

	it("should dispatch msg after clicking next puzzle button", async () => {
		const f = await Fixture();
		const r = f.render(f.initial);
		const nextButton = r.getByRole("button", f.ctx.t("app.next"));
		nextButton?.click();
		const msg = await r.msgs.once();
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
			f.render(f.initial).getByRole("button", f.ctx.t("app.prev")),
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

	it("should render prev puzzle after clicking prev puzzle button", async () => {
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
	});

	it("should emit msg after clicking prev puzzle button", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		const prevButton = rendered.getByRole("button", f.ctx.t("app.prev"));
		prevButton?.click();
		const msg = await rendered.msgs.once();
		expect(msg.t).toBe("user-clicked-prev-puzzle-button");
	});

	it("should disable prev puzzle button when on first puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-prev-puzzle-button",
					prevPuzzle: f.prevPuzzle,
					prevPuzzleIndex: f.prevPuzzleIndex,
				},
			},
		]);
		const r = f.render(output);
		const prevButton = r.getByRole("button", f.ctx.t("app.prev"));
		expect(prevButton?.disabled).toBe(true);
	});

	it("should disabled next button when on last puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msg: {
					t: "user-clicked-next-puzzle-button",
					nextPuzzle: f.nextPuzzle,
					nextPuzzleIndex: f.nextPuzzleIndex,
				},
			},
		]);
		const nextButton = f
			.render(output)
			.getByRole("button", f.ctx.t("app.next"));
		expect(nextButton?.disabled).toBe(true);
	});

	it("should render which level of the pack is being played", async () => {
		const f = await Fixture();
		const r = f.render(f.initial);
		expect(r.getByRole("heading", `Level ${f.puzzleIndex + 1}`)).toBeTruthy();
	});

	it("should render puzzle complete dialog after completing a puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completePuzzleMsgs);
		const r = f.render(output);
		expect(
			r
				.getByRole("dialog")
				?.getByRole("heading", f.ctx.t("flow.puzzle-completed")),
		).toBeTruthy();
	});

	it("should render next puzzle button in completion dialog", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completePuzzleMsgs);
		const r = f.render(output);
		expect(
			r.getByRole("dialog")?.getByRole("button", f.ctx.t("flow.next-puzzle")),
		).toBeTruthy();
	});

	it("should render select next pack button in completion dialog after completing last puzzle", async () => {
		const f = await Fixture();
		const before = f.render(f.initial);
		const output = f.update(f.initial, f.completeLastPuzzleMsgs);
		const after = f.render(output);
		expect(
			before
				.getByRole("dialog")
				?.getByRole("button", f.ctx.t("flow.select-next-pack")),
		).toBeFalsy();
		expect(
			after
				.getByRole("dialog")
				?.getByRole("button", f.ctx.t("flow.select-next-pack")),
		).toBeTruthy();
	});

	it.todo("should render congrats message after completing last puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completeLastPuzzleMsgs);

		expect(
			f
				.render(output)
				.getByRole("dialog")
				?.getByRole("heading", f.ctx.t("app.congratulations")),
		).toBeTruthy();
	});

	it("should dispatch correct msg after clicking select next pack button", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completeLastPuzzleMsgs);
		const r = f.render(output);
		const button = r
			.getByRole("dialog")
			?.getByRole("button", f.ctx.t("flow.select-next-pack"));
		button?.click();
		expect(button).toBeTruthy();
		const msg = await r.msgs.once();
		expect(msg.t).toBe("user-clicked-select-next-pack-button");
	});

	it("should output correct msg after clicking select name pacl button", async () => {});

	it("should play sound after completing a puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completePuzzleMsgs);
		expect(didPlaySound(output)).toBe(true);
	});

	it("should play sound pressing down on a terminal", async () => {
		const f = await Fixture();
		const terminal = Flow.randomTerminal(f.puzzle.flow);

		if (!terminal) {
			expect(terminal).not.toBe(null);
			return;
		}

		const output = f.update(f.initial, [
			{
				msgCore: withEventMeta({
					t: "got-puzzle-screen-flow-play-msg",
					c: {
						t: "pressed-down",
						nodeId: terminal.startId,
					},
				}),
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	it("should play sound after solving puzzle", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, f.completePuzzleMsgs);
		expect(didPlaySound(output)).toBe(true);
	});
});
