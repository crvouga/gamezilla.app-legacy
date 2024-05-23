import { describe, it } from "bun:test";
import { FlowVariantUIEdit } from ".";
import { FlowPuzzle } from "../../flow-puzzle";


describe(import.meta.file, () => {
	it("should make a tap sound when opening dimension form", async () => {
		const puzzle = (await FlowPuzzle.random())
		const flow = puzzle.flow
		FlowVariantUIEdit.update({
			flow,
			model: FlowVariantUIEdit.init({
				flow,
			}),
			msg: {
				t: 'dimensions-form.clicked-open',
			}
		});
	});
});
