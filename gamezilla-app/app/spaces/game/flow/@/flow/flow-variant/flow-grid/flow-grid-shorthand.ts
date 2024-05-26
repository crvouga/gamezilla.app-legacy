import type { NonEmpty } from "gamezilla-app/@/core";
import { Flow } from "../../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridDimensions from "./flow-grid-dimensions";
import { is } from "gamezilla-app/@/core/parser/parser";

type AppendLowercase<T extends string> = T extends `${infer U}${infer _L}`
	? `${U}${Lowercase<U>}`
	: never;

type Terminal = Flow.GroupId;
type Pipe = Lowercase<Flow.GroupId>;
type TerminalWithPipe = AppendLowercase<Flow.GroupId>;
type Empty = " ";

type Element = Empty | Terminal | Pipe | TerminalWithPipe;

export type Model = NonEmpty<NonEmpty<Element>>;

const isLowercase = (string: string): boolean =>
	string === string.toLowerCase();

const isTerminal = (element: string): element is Terminal =>
	Flow.isGroupId(element);
const isPipe = (element: string): element is Pipe =>
	isLowercase(element) && Flow.isGroupId(element.toUpperCase());
const isTerminalWithPipe = (element: string): element is TerminalWithPipe =>
	Boolean(
		element[0] && isTerminal(element[0]) && element[1] && isPipe(element[1]),
	);
const isEmpty = (element: string): element is Empty => element === " ";

const init = (model: Model): Model => {
	return model;
};

type DraftTerminal = {
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId | null;
};

const ___ = null;

const toTerminalsByGroupId = (
	model: Model,
): FlowGrid.Model["terminalsByGroupId"] => {
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
};

const toPipesBySourceIdForTerminal = (input: {
	model: Model;
	grid: FlowGrid.Model;
	terminal: Flow.Terminal;
}): FlowGrid.Model["pipesBySourceId"] => {
	const pipesBySourceId: FlowGrid.Model["pipesBySourceId"] = {};
	let currentNodeId = input.terminal.startId;
	while (true) {
		const currentNode = FlowGrid.toNode(input.grid, currentNodeId);

		if (!currentNode) {
			break;
		}

		const north = input.model[currentNode.y - 1]?.[currentNode.x];
		const east = input.model[currentNode.y]?.[currentNode.x + 1];
		const south = input.model[currentNode.y + 1]?.[currentNode.x];
		const west = input.model[currentNode.y]?.[currentNode.x - 1];

		for (const direction of [north, east, south, west]) {
			if (!direction) {
				continue;
			}

			if (isPipe(direction)) {
				continue;
			}

			if (isTerminalWithPipe(direction)) {
				continue;
			}

			if (isTerminal(direction)) {
				continue;
			}

			if (isEmpty(direction)) {
				continue;
			}
		}

		break;
		//
	}
	return pipesBySourceId;
};

const toPipesBySourceId = (input: {
	model: Model;
	grid: FlowGrid.Model;
}): FlowGrid.Model["pipesBySourceId"] => {
	let pipesBySourceId: FlowGrid.Model["pipesBySourceId"] = {};

	for (const groupId in input.grid.terminalsByGroupId) {
		const terminal = input.grid.terminalsByGroupId[groupId as Flow.GroupId];

		if (!terminal) {
			continue;
		}

		const pipesBySourceIdForTerminal = toPipesBySourceIdForTerminal({
			model: input.model,
			grid: input.grid,
			terminal,
		});

		pipesBySourceId = {
			...pipesBySourceId,
			...pipesBySourceIdForTerminal,
		};
	}

	return pipesBySourceId;
};

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
	const dimensions = toDimensions(model);
	const grid = FlowGrid.init({ dimensions, terminalsByGroupId });
	const pipesBySourceId = toPipesBySourceId({ grid, model });
	return {
		...grid,
		pipesBySourceId,
	};
};

export const FlowGridShorthand = {
	init,
	___,
	toDimensions,
	toGrid,
};
