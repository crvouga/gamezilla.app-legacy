import type { NonEmpty } from "gamezilla-app/@/core";
import { Flow } from "../../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridDimensions from "./flow-grid-dimensions";

type AppendLowercase<T extends string> = T extends `${infer U}${infer _L}` ? `${U}${Lowercase<U>}` : never;

type Terminal = Flow.GroupId
type Pipe = Lowercase<Flow.GroupId>
type TerminalWithPipe = AppendLowercase<Flow.GroupId>
type Empty = " "

type Element = Empty | Terminal | Pipe | TerminalWithPipe

export type Model = NonEmpty<NonEmpty<Element>>;


const isLowercase = (string: string): boolean => string === string.toLowerCase()	

const isTerminal = (element: string): element is Terminal => Flow.isGroupId(element)
const isPipe = (element: string): element is Pipe => isLowercase(element) && Flow.isGroupId(element.toUpperCase())
const isTerminalWithPipe = (element: string): element is TerminalWithPipe => Boolean(element[0] && isTerminal(element[0]) && element[1] && isPipe(element[1]))
const isEmpty = (element: string): element is Empty => element === " "

const init = (model: Model): Model => {
	return model;
};

type DraftTerminal = {
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId | null;
};

const ___ = null;

const toTerminalsByGroupId = (model: Model): FlowGrid.Model["terminalsByGroupId"] => {
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

			if (!Flow.isGroupId(groupId)) {
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

	return terminalsByGroupId;
}

const toPipesBySourceId = (
	terminalsByGroupId: FlowGrid.Model["terminalsByGroupId"],
	model: Model
): FlowGrid.Model["pipesBySourceId"] => {
	const pipesBySourceId: FlowGrid.Model["pipesBySourceId"] = {};

	

	for (const groupId in terminalsByGroupId) {
		const terminal = terminalsByGroupId[groupId as Flow.GroupId];
		
		if (!terminal) {
			continue;
		}

		let currentNode = terminal.startId;
		while (true) {
			// 
			break
		}


	}

	return pipesBySourceId;
}

const toDimensions = (model: Model): FlowGridDimensions.Model => {
	let maxWidth = 0;

	for (let y = 0; y < model.length; y++) {
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
};

const toGrid = (model: Model): FlowGrid.Model => {
	const terminalsByGroupId = toTerminalsByGroupId(model);
	const pipesBySourceId = toPipesBySourceId(terminalsByGroupId, model);
	const dimensions = toDimensions(model);
	return FlowGrid.init({ dimensions, terminalsByGroupId, pipesBySourceId });
};



export const FlowGridShorthand = {
	init,
	___,
	toDimensions,
	toGrid,
};
