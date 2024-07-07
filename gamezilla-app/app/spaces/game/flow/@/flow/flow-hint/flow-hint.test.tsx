import { describe, expect, it, test } from "bun:test";
import { FlowPuzzle } from "../../flow-puzzle/flow-puzzle";
import { FlowClientFixture } from "../../testing";
import { Flow } from "../flow";
import { FlowVariant } from "../flow-variant";
import { FlowGridShorthand } from "../flow-variant/flow-grid";
import * as FlowHint from "./flow-hint";

const Fixture = async (input?: { flow?: FlowVariant.Model }) => {
	const f = await FlowClientFixture();
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
		...f,
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
		const flow = FlowHint.toFlow({
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
		const flow = FlowHint.toFlow({
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

		const derived = FlowHint.toFlow({
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

		const derived = FlowHint.toFlow({
			flow: f.flow,
			model: output.model,
		});

		const pipeline = Flow.toPipelineFromGroupId(derived, "A");

		expect(pipeline.length > 0).toBe(true);
	});

	test("record used hints", async () => {
		const f = await Fixture();
		const after = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);
		expect(Object.keys(after.model.usedHints)).toEqual(["A"]);
	});

	test("cut pipes after using a hint", async () => {
		const before = FlowGridShorthand.toGrid([
			["A", " ", "B"],
			["a", "a", "A"],
			[" ", "B", " "],
			[" ", " ", " "],
		]);
		const f = await Fixture({ flow: before });
		const updated = f.update(f.init, [{ msg: { t: "user-clicked-hint" } }]);
		const after = FlowHint.toFlow({
			flow: f.flow,
			model: updated.model,
		});
		const pipelineBefore = Flow.toPipelineFromGroupId(before, "A");
		const pipelineAfter = Flow.toPipelineFromGroupId(after, "A");
		expect(pipelineBefore.length).toEqual(3);
		expect(pipelineAfter.length).toEqual(1);
	});

	it.todo("should NOT branch pipelines after using hint", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", " ", " "],
				[" ", " ", " "],
				[" ", " ", "A"],
			]),
		});
		FlowGridShorthand.toGrid([
			["A", " ", " "],
			[" ", " ", " "],
			["a", "a", "A"],
		]);
		const init: FlowHint.Model = {
			...f.init,
			// pipesBySourceId: shorthand.p,
		};
		const updated = f.update(init, [
			{
				flowPuzzle: {
					...f.flowPuzzle,
					flow: {
						...f.flow,
						// pipesBySourceId,
					}
				},
				msg: { t: "user-clicked-hint" },
			},
		]);
		const after = FlowHint.toFlow({
			flow: f.flow,
			model: updated.model,
		});
		expect(Flow.hasMultipleDeadEndPipelines(after)).toBe(false);
		expect(Flow.hasBranchingPipelines(after)).toBe(false);
	});

	it.todo("should disable hint button if no hints are available", async () => {
		const f = await Fixture({
			flow: FlowGridShorthand.toGrid([
				["A", " ", "B"],
				[" ", " ", " "],
				["B", " ", "A"],
			]),
		});
		f;
	});
});
