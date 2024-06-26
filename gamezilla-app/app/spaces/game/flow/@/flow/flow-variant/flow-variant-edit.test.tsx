import { describe, expect, it } from "bun:test";
import { FlowVariantDimensions, FlowVarianEdit } from ".";
import { FlowPuzzle } from "../../flow-puzzle";

const Fixture = async () => {
	const puzzle = await FlowPuzzle.random();
	const flow = puzzle.flow;

	const init = FlowVarianEdit.init({
		flow,
	});
	const update = (
		init: FlowVarianEdit.Model,
		msgs: FlowVarianEdit.Msg[],
	) => {
		let updated: ReturnType<typeof FlowVarianEdit.update> = {
			model: init,
		};

		for (const msg of msgs) {
			updated = FlowVarianEdit.update({
				flow,
				model: updated.model,
				msg,
			});
		}

		return updated;
	};

	return {
		puzzle,
		flow,
		init,
		update,
	};
};

describe(import.meta.file, () => {
	it("should make sounds interacting with dimensions form", async () => {
		const f = await Fixture();
		const msgs: FlowVarianEdit.Msg[] = [
			{ t: "dimensions-form.clicked-save" },
			{ t: "dimensions-form.clicked-cancel" },
			{ t: "dimensions-form.clicked-open" },
			{ t: "dimensions-form.clicked-cancel" },
			{ t: "dimensions-form.closed" },
			{
				t: "dimensions-form.inputted",
				dimensions: FlowVariantDimensions.init({
					t: "flow-grid",
					height: 0,
					width: 0,
				}),
			},
		];

		for (const msg of msgs) {
			const updated = f.update(f.init, [msg]);
			expect(updated.msgCmd?.t).toBe("play-sound");
		}
	});
});
