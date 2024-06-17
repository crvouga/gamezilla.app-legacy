import { describe, expect, it, test } from "bun:test";
import { FlowVariantUIPlay, type FlowVariant } from ".";
import { Flow } from "../flow";
import { FlowGrid } from "./flow-grid";
import { FlowGridShorthand } from "./flow-grid/flow-grid-shorthand";
import * as FlowVariantPlay from "./flow-variant-ui-play";

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

	it("should output connected terminals event", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", "B"],
			["a", "B", " "],
			["a", " ", "A"],
		]);
		const f = Fixture({ flow });

		const msgs: FlowVariantPlay.Msg[] = [
			{ t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 0, y: 2 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 1, y: 2 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 2, y: 2 }) },
			{ t: "pressed-up", nodeId: FlowGrid.toNodeId({ x: 2, y: 2 }) },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.event?.t).toBe("connected-terminals");
	});

	it("should output started dragging event", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", "B", " "],
			["a", " ", "A"],
		]);
		const f = Fixture({ flow });

		const msgs: FlowVariantPlay.Msg[] = [
			{ t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 0, y: 2 }) },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.event?.t).toBe("started-dragging");
	});

	it("should output solved event", () => {
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
			{ t: "pressed-up", nodeId: FlowGrid.toNodeId({ x: 2, y: 2 }) },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.event?.t).toBe("solved");
	});

	it("should output solved event even after dragging left the board", () => {
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
			{ t: "left" },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.event?.t).toBe("solved");
	});

	it("should not output solved event after dragging left the board if not connected", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", "B", " "],
			["a", " ", "A"],
		]);
		const f = Fixture({ flow });

		const msgs: FlowVariantPlay.Msg[] = [
			{ t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 0, y: 2 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 1, y: 2 }) },
			{ t: "left" },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);
		expect(output.event).toBeUndefined();
	});

	it("should not output solved if not pressed up on terminal", () => {
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

		expect(output.event?.t).not.toBe("solved");
	});

	it("should not output solved event if terminals are not connected", () => {
		const flow = FlowGridShorthand.toGrid([
			["A", " ", " "],
			["a", "B", " "],
			["a", "a", "A"],
		]);
		const f = Fixture({ flow });

		const msgs: FlowVariantPlay.Msg[] = [
			{ t: "pressed-down", nodeId: FlowGrid.toNodeId({ x: 1, y: 1 }) },
			{ t: "dragged-over", nodeId: FlowGrid.toNodeId({ x: 1, y: 0 }) },
			{ t: "pressed-up", nodeId: FlowGrid.toNodeId({ x: 1, y: 0 }) },
		];

		const output = msgs.reduce<ReturnType<typeof FlowVariantUIPlay.update>>(
			(output, msg) =>
				FlowVariantUIPlay.update({ flow, model: output.model, msg }),
			{ model: f.init },
		);

		expect(output.event?.t).not.toBe("solved");
	});

	test.todo("should show hint");
});
