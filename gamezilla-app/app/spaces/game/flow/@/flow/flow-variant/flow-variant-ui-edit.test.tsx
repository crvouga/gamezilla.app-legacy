import { describe, expect, it } from "bun:test";
import { FlowVariantUIEdit } from ".";
import { FlowPuzzle } from "../../flow-puzzle";

const Fixture = async () => {
	const puzzle = await FlowPuzzle.random();
	const flow = puzzle.flow;

	const init = FlowVariantUIEdit.init({
		flow,
	});
	const update = (
		init: FlowVariantUIEdit.Model,
		msgs: FlowVariantUIEdit.Msg[],
	) => {
		let updated: ReturnType<typeof FlowVariantUIEdit.update> = {
			model: init,
		};

		for (const msg of msgs) {
			updated = FlowVariantUIEdit.update({
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
	it("should make sound opening dimensions form", async () => {
		const f = await Fixture();
		const updated = f.update(f.init, [
			{
				t: "dimensions-form.clicked-open",
			},
		]);
		expect(updated.msgCmd?.t).toBe("play-sound");
	});
	it("should make sound cancelling dimensions form", async () => {
		const f = await Fixture();
		const updated = f.update(f.init, [
			{
				t: "dimensions-form.clicked-cancel",
			},
		]);
		expect(updated.msgCmd?.t).toBe("play-sound");
	});
	
	it("should make sound saving dimensions form", async () => {
		const f = await Fixture();
		const updated = f.update(f.init, [
			{
				t: "dimensions-form.clicked-save",
			},
		]);
		expect(updated.msgCmd?.t).toBe("play-sound");
	});
});
