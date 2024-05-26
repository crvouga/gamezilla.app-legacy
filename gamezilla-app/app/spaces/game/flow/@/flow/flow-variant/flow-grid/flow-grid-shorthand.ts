import type { NonEmpty } from "gamezilla-app/@/core";
import { Flow } from "../../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridDimensions from "./flow-grid-dimensions";

export type Model = NonEmpty<NonEmpty<Flow.GroupId | null>>;

const init = (model: Model): Model => {
	return model;
}

type DraftTerminal = {
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId | null;
};


const ___ = null;

const toGrid = (model: Model): FlowGrid.Model => {
	const terminalsByGroupId: FlowGrid.Model["terminalsByGroupId"] = {};

	for (let y = 0; y < model.length; y++) {
		const row = model[y];

		if (!row) {
			continue;
		}

		for (let x = 0; x < row.length; x++) {
			const position = {
				x,
				y,
			};

			const nodeId = FlowGrid.toNodeId(position);

			const groupId = row[x];

			if (!groupId) {
				continue;
			}

			const draftTerminal = terminalsByGroupId[groupId];

			if (!draftTerminal) {
				const draftTerminalNew: DraftTerminal = {
					groupId,
					startId: nodeId,
					endId: null,
				};
				terminalsByGroupId[groupId] = draftTerminalNew;
				continue;
			}

			terminalsByGroupId[groupId] = {
				...draftTerminal,
				endId: nodeId,
			};
		}
	}

	const grid = FlowGrid.init({
		dimensions: toDimensions(model),
		terminalsByGroupId: terminalsByGroupId,
	});

	return grid;
}


const toDimensions = (model: Model): FlowGridDimensions.Model => {
	let maxWidth = 0;
	
	for(let y = 0; y < model.length; y++) {
		const row = model[y];
		if (!row) {
			continue;
		}
		maxWidth = Math.max(maxWidth, row.length);
	}

	return FlowGridDimensions.init({
		width: maxWidth,
		height: model.length,
	});
}

export const FlowGridShorthand = {
	init,
	___,
	toDimensions,
	toGrid,
}