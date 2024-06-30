import { describe, expect, it, test } from "bun:test";
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

	type Input = {
		msg: FlowHint.Msg;
		flowPuzzle?: FlowPuzzle;
	};

	const update = (
		init: FlowHint.Model,
		inputs: Input[],
	): ReturnType<typeof FlowHint.update> => {
		let output: ReturnType<typeof FlowHint.update> = { model: init };
		for (const input of inputs) {
			output = FlowHint.update({
				flowPuzzle: input.flowPuzzle ?? flowPuzzle,
				model: output.model,
				msg: input.msg,
			});
		}
		return output;
	};

	const init: FlowHint.Model = {
		...FlowHint.init({
			flowPuzzle,
		}),
		pipesBySourceId: {
			...flow.pipesBySourceId,
		},
	};

	return {
		flowPuzzle,
		flow,
		update,
		init,
	};
};

describe(import.meta.file, () => {
	test("hint", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);
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
			{ msg: { t: "user-clicked-hint" } },
			{ msg: { t: "user-clicked-hint" } },
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

		const output = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);
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
			{ msg: { t: "user-clicked-hint" } },
			{ msg: { t: "user-clicked-hint" } },
			{ msg: { t: "user-clicked-hint" } },
		]);
		expect(output.event?.t).toBe("solved");
	});

	it("should not create branching in pipes after using a hint", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", "a", "a", " "],
				[" ", " ", "a", " "],
				["a", "a", "a", " "],
				[" ", " ", " ", "A"],
			]),
		});

		const output = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);

		const derived = FlowHint.deriveFlow({
			flow: f.flow,
			model: output.model,
		});

		expect(Flow.hasMultipleDeadEndPipelines(derived)).toBe(false);
	});

	it("should work even with flipped terminal", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", " ", " "],
				[" ", " ", " "],
				["A", " ", " "],
			]),
		});

		const terminal = Flow.toTerminalByGroupId(f.flow, "A");
		const flipped = Flow.flipTerminal(f.flow, terminal);

		const output = f.update(
			{
				...f.init,
				terminalsByGroupId: { ...flipped.terminalsByGroupId },
			},
			[
				{
					msg: { t: "user-clicked-hint" },
				},
			],
		);

		const derived = FlowHint.deriveFlow({
			flow: f.flow,
			model: output.model,
		});

		const pipeline = Flow.toPipelineByGroupId(derived, "A");

		expect(pipeline.length > 0).toBe(true);
	});

	test("record used hints", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);
		expect(Object.keys(after.model.usedHints)).toEqual(["A"]);
	});
});
