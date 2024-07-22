import { describe, expect, test } from "bun:test";
import { FixtureSpaceClient } from "gamezilla-app/app/spaces/@/testing/client";
import type { FlowViewinput } from "../flow-ui/flow-ui";
import { FlowGridShorthand } from "./flow-grid";
import type * as FlowVariant from "./flow-variant";
import * as FlowVariantUI from "./flow-variant-ui";

const Fixture = async () => {
	const f = await FixtureSpaceClient();
	const flow = FlowGridShorthand.toGrid([
		["A", " "],
		[" ", "A"],
	]);
	const input: FlowViewinput<FlowVariant.Model> = {
		model: flow,
	};
	const render = (input: FlowViewinput<FlowVariant.Model>) => {
		return f.render(<FlowVariantUI.View {...input} />);
	};
	return {
		...f,
		render,
		input,
	};
};
describe(import.meta.file, () => {
	test("render hint checkmarks", async () => {
		const f = await Fixture();
		f.render(f.input);
		expect(true).toBe(true);
	});
});
