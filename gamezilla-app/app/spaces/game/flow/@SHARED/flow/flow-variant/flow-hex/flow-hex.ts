import { p } from "gamezilla-app/@shared/core/parser";
import { Flow } from "../../flow";
import * as FlowHexDimensions from "./flow-hex-dimensions";

export const HexPosition = p.obj({
	x: p.num,
	y: p.num,
	z: p.num,
});
export type HexPosition = p.Infer<typeof HexPosition>;

export const Model = p.and(
	Flow.Model,
	FlowHexDimensions.Model,
	p.obj({
		t: p.l("flow-hex"),
		FlowHex: p.l(true),
		positions: p.dict(Flow.NodeId, HexPosition),
	}),
);
export type Model = p.Infer<typeof Model>;

export const init = (input: {
	dimensions: FlowHexDimensions.Model;
	terminalsByGroupId: Flow.Model["terminalsByGroupId"];
}): Model => {
	return {
		...Flow.init,
		...input.dimensions,
		t: "flow-hex",
		FlowHex: true,
		positions: {},
	};
};

export const distance =
	(model: Model) =>
	(a: Flow.NodeId, b: Flow.NodeId): number => {
		const positionA = model.positions[a];

		if (!positionA) {
			return Number.POSITIVE_INFINITY;
		}

		const positionB = model.positions[b];

		if (!positionB) {
			return Number.POSITIVE_INFINITY;
		}

		return hexDistance(positionA, positionB);
	};

const hexDistance = (a: HexPosition, b: HexPosition): number => {
	return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
};
