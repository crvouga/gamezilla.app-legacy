import { describe, expect, test } from "bun:test";
import { Flow } from "../flow";
import { FlowGridShorthand } from "./flow-grid";
import * as FlowHint from "./flow-hint";
import type * as FlowVariant from "./flow-variant";
import { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";

const Fixture = async (input?: { flow?: FlowVariant.Model }) => {
	const flow =
		input?.flow ??
		FlowGridShorthand.toGrid([
			["A", " "],
			[" ", "A"],
		]);

	const flowPuzzle = await FlowPuzzle.random({
		flow,
	});
	const update = (
		init: FlowHint.Model,
		msgs: FlowHint.Msg[],
	): ReturnType<typeof FlowHint.update> => {
		let output: ReturnType<typeof FlowHint.update> = { model: init };
		for (const msg of msgs) {
			output = FlowHint.update({
				msg,
				flowPuzzle,
				model: output.model,
			});
		}
		return output;
	};

	const init: FlowHint.Model = {
		...FlowHint.init,
		pipesBySourceId: {
			...flow.pipesBySourceId,
		}
	};

	return {
		flow,
		update,
		init,
	};
};

describe(import.meta.file, () => {
	test("hint", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ t: "user-clicked-hint" }]);
		const flow = FlowHint.deriveFlow({
			flow: f.flow,
			model: after.model,
		});
		for (const groupId of FlowHint.toShowingHintGroupIds(after.model)) {
			expect(Flow.isTerminalConnectedWithPipes(flow, groupId)).toBe(true);
		}
	});

	test("hint multiple terminals", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", "B"],
				[" ", " "],
				["A", "B"],
			]),
		});

		const output = f.update(f.init, [
			{ t: "user-clicked-hint" },
			{ t: "user-clicked-hint" },
		]);
		const flow = FlowHint.deriveFlow({
			flow: f.flow,
			model: output.model,
		});
		expect(Flow.isSolved(flow)).toBe(true);
	});

	test("output use hint event", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", "B"],
				[" ", " "],
				["A", "B"],
			]),
		});

		const output = f.update(f.init, [{ t: "user-clicked-hint" }]);
		expect(output.event?.t).toBe("used-hint");
	});

	test("output solved event", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", "B", "C"],
				[" ", " ", " "],
				["A", "B", "C"],
			]),
		});

		const output = f.update(f.init, [
			{ t: "user-clicked-hint" },
			{ t: "user-clicked-hint" },
			{ t: "user-clicked-hint" },
		]);
		expect(output.event?.t).toBe("solved");
	});

	test("should not create branching in pipes after using a hint", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", "a", "a", " "],
				[" ", " ", "a", " "],
				["a", "a", "a", " "],
				[" ", " ", " ", "A"],
			]),
		});

		const output = f.update(f.init, [
			{ t: "user-clicked-hint" },
		]);

		const derived = FlowHint.deriveFlow({
			flow: f.flow,
			model: output.model,
		});

		expect(Flow.hasMultipleDeadEndPipelines(derived)).toBe(false);
	})
});
