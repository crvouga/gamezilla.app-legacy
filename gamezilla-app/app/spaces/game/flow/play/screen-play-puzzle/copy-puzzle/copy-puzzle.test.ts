import { describe, expect, test } from "bun:test";
import { ScreenPuzzleClientFixture } from "../@/testing.client";

const Fixture = async () => {
	const f = await ScreenPuzzleClientFixture();

	return {
		...f,
	};
};

describe(import.meta.file, () => {
	test.todo("render copy puzzle button for super users", async () => {
		const f = await Fixture();
		const r = f.render(f.initial);
		const button = r.getByRole(
			"button",
			f.ctx.t("flow.copy-puzzle-to-clipboard"),
		);
		expect(button).toBeTruthy();
	});
});
