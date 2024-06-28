import { describe, expect, it } from "bun:test";
import { ScreenPuzzlePlayCoreFixture } from "../@/testing.core";

const Fixture = async () => {
	const f = await ScreenPuzzlePlayCoreFixture();

	return {
		...f,
	};
};

describe(import.meta.file, () => {
	it('should exit to pack list after clicking "select next pack" button', async () => {
		const f = await Fixture();
		const before = f.update(f.init, f.completePuzzleMsgs);
		const after = f.update(before, [
			{
				t: "user-clicked-select-next-pack",
			},
		]);
		expect(before.screen.t).toBe("screen-play-puzzle");
		expect(after.screen.t).toBe("screen-select-pack");
	});
});
