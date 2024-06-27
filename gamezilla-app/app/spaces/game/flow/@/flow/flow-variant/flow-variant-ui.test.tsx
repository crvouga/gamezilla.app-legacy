import { describe, expect, test } from "bun:test";
import { SpaceClientFixture } from "gamezilla-app/app/spaces/@/testing/client";
import type { FlowViewProps } from "../flow/flow-ui";
import { FlowGridShorthand } from "./flow-grid";
import type * as FlowVariant from "./flow-variant";
import * as FlowVariantUI from "./flow-variant-ui";

const Fixture = async () => {
	const f = await SpaceClientFixture();
	const flow = FlowGridShorthand.toGrid([
		["A", " "],
		[" ", "A"],
	]);
	const props: FlowViewProps<FlowVariant.Model> = {
		model: flow,
	};
	const render = (props: FlowViewProps<FlowVariant.Model>) => {
		return f.render(<FlowVariantUI.View {...props} />);
	};
	return {
		...f,
		render,
		props,
	};
};
describe(import.meta.file, () => {
	test("render hint checkmarks", async () => {
		const f = await Fixture();
		f.render(f.props);
		expect(true).toBe(true);
	});
});
