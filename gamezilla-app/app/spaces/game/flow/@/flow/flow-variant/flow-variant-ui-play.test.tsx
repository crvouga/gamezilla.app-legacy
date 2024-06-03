import { describe, expect, it, test } from "bun:test";
import { FlowVariant, FlowVariantUIPlay } from ".";
import { Flow } from "../flow";
import { FlowGridShorthand } from "./flow-grid/flow-grid-shorthand";
import * as FlowVariantPlay from "./flow-variant-ui-play";
import { FlowGrid } from "./flow-grid";

const Fixture = ({ flow }: { flow: FlowVariant.Model }) => {
	const init = FlowVariantPlay.init({ flow });
	const update = (
		init: FlowVariantPlay.Model,
		msgs: FlowVariantPlay.Msg[],
	): FlowVariantPlay.Model => {
		return msgs.reduce(
			(model, msg) => FlowVariantPlay.update({ flow, model, msg }).model,
			init,
		);
	};

	return {
		init,
		update,
	};
};

describe(import.meta.file, () => {
	test("to solution msgs", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			[" ", "B", " "],
			[" ", " ", "A"],
		]);

		const f = Fixture({ flow });

		const msgs = FlowVariantPlay.toSolutionMsgs({ flow });

		const before = FlowVariantUIPlay.deriveFlow({
			flow,
			model: f.init,
		});

		const after = FlowVariantUIPlay.deriveFlow({
			flow,
			model: f.update(f.init, msgs),
		});

		expect(Flow.isSolved(before)).toBe(false);
		expect(Flow.isSolved(after)).toBe(true);
	});

	it("should play a sound pressing down on a terminal", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			[" ", "B", " "],
			[" ", " ", "A"],
		]);
		const f = Fixture({ flow });

		const randomTerminal = Flow.randomTerminal(flow);

		if (!randomTerminal) return;

		const output = FlowVariantUIPlay.update({
			flow,
			model: f.init,
			msg: { t: "pressed-down", nodeId: randomTerminal?.startId },
		});

		expect(output.msg?.t).toBe("play-sound");
	});

	it("should not play a sound pressing down empty node", async () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			[" ", "B", " "],
			[" ", " ", "A"],
		]);
		const f = Fixture({ flow });

		const output = FlowVariantUIPlay.update({
			flow,
			model: f.init,
			msg: { t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 0, y: 1 }) },
		});

		expect(Boolean(output.msg)).toBe(false);
	});

	it("should play a sound after connecting terminals", async () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", "B", " "],
			["a", " ", "A"],
		]);
		const f = Fixture({ flow });

		const msgs: FlowVariantPlay.Msg[] = [
			{ t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 0, y: 2 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 1, y: 2 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 2, y: 2 }) },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.msg?.t).toBe("play-sound");
	});
});
