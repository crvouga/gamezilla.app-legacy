import { describe, expect, test } from "bun:test";
import { ScreenPlayPuzzleClientFixture } from "../@/testing.client";
import { withEventMeta } from "gamezilla-app/app/spaces/@/event";
import { didPlaySound } from "gamezilla-app/app/@/client";

const Fixture = async () => {
	const f = await ScreenPlayPuzzleClientFixture();
	const ctx: typeof f.ctx = {
		...f.ctx,
		currentUserRole: "super",
	};

	return {
		...f,
		ctx,
	};
};

describe(import.meta.file, () => {
	test.todo("render button for super users", async () => {
		const f = await Fixture();
		const r = f.render(f.initial, f.ctx);
		const button = r.getByRole(
			"button",
			f.ctx.t("flow.copy-puzzle-to-clipboard"),
		);
		expect(button).toBeTruthy();
	});

	test.todo("does not render button for non-super users");

	test("play sound", async () => {
		const f = await Fixture();
		const output = f.update(f.initial, [
			{
				msgCore: withEventMeta({
					t: "user-clicked-copy-to-clipboard",
				}),
			},
		]);
		expect(didPlaySound(output)).toBe(true);
	});

	test.todo("copy puzzle to clipboard");

	test.todo("show toast on copy success");
});
