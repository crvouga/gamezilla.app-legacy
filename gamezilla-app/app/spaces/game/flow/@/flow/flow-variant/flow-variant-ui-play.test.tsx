import { describe, expect, test } from "bun:test";
import * as FlowVariantPlay from "./flow-variant-ui-play";
import { FlowGridShorthand } from "./flow-grid/flow-grid-shorthand";
import { FlowVariant, FlowVariantUIPlay } from ".";
import { Flow } from "../flow";

const Fixture = ({ flow }: { flow: FlowVariant.Model }) => {
	const init = FlowVariantPlay.init({ flow });
	const update = (
		init: FlowVariantPlay.Model,
		msgs: FlowVariantPlay.Msg[],
	): FlowVariantPlay.Model => {
		return msgs.reduce(
			(model, msg) => FlowVariantPlay.update({ flow, model, msg }),
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
});
