import { describe, expect, it } from "bun:test";
import { FlowPlayClientFixture } from "../@/testing";
import { FlowPack } from "../../@/flow-pack";
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
		{
			msg: {
				t: "user-clicked-open-puzzle-grid-item",
				puzzle,
				puzzleIndex: 0,
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
	it("should render puzzle screen after opening puzzle from pack", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(rendered.getByRole("heading").hasText(f.puzzle.name)).toBe(true);
	});

	it("should render exit button for puzzle screen", async () => {
		const f = await Fixture();
		const rendered = f.render(f.initial);
		expect(
			rendered.getByRoleAndText("button", f.ctx.t("app.exit")),
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
});
