import { pipe } from "gamezilla-app/@/core";
import { FlowGridShorthand, FlowGridUI } from "./flow/flow-variant/flow-grid";

const grid = pipe(
	FlowGridShorthand.init([
		["B", "a", "a", "A", "D"],
		["b", "a", "c", "C", "d"],
		["b", "a", "C", "d", "d"],
		["b", "A", "D", "d", "E"],
		["b", "B", "E", "e", "e"],
	]),
	FlowGridShorthand.toGrid,
);

export const CoverArt = (props: { className?: string }) => {
	return (
		<div {...props}>
			<FlowGridUI.View
				model={grid}
				disabled
				disableHighlight
				className={"bg-black"}
			/>
		</div>
	);
};
