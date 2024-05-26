import type { NonEmpty } from "gamezilla-app/@/core";
import { Flow } from "../../flow";
import * as FlowGrid from "./flow-grid";
import * as FlowGridDimensions from "./flow-grid-dimensions";
import { FlowGridPosition } from ".";

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

export const isEmpty = (element: string): element is Empty => element === " ";

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

			const element = row[x];

			if (!element) {
				continue
			}

			if (!isTerminal(element) && !isTerminalWithPipe(element)) {
				continue
			}

			const elementGroupId = elementToGroupId(element);

			if (!elementGroupId) {
				continue
			}

			const draftTerminal = terminalsByGroupId[elementGroupId];

			if (!draftTerminal) {
				const draftTerminalNew: DraftTerminal = {
					groupId: elementGroupId,
					startId: nodeId,
					endId: null,
				};
				terminalsByGroupId[elementGroupId] = draftTerminalNew;
				continue;
			}

			terminalsByGroupId[elementGroupId] = {
				...draftTerminal,
				endId: nodeId,
			};
		}
	}

	return terminalsByGroupId;
};

const DELTAS = [
	{
		x: 0,
		y: -1,
	},
	{
		x: 1,
		y: 0,
	},
	{
		x: 0,
		y: 1,
	},
	{
		x: -1,
		y: 0,
	},
];

const pipeToGroupId = (pipe: Pipe): Flow.GroupId => {
	const uppercase = pipe.toUpperCase();
	if (Flow.isGroupId(uppercase)) {
		return uppercase;
	}
	return "A";
}

const terminalWithPipeToGroupId = (terminalWithPipe: TerminalWithPipe): Flow.GroupId => {
	const groupId = terminalWithPipe[0];
	if (Flow.isGroupId(groupId)) {
		return groupId;
	}
	return "A";
}

const elementToGroupId = (element: Element): Flow.GroupId | null => {
	if (isPipe(element)) {
		return pipeToGroupId(element);
	}

	if(isTerminal(element)) {
		return element;
	}

	if (isTerminalWithPipe(element)) {
		return terminalWithPipeToGroupId(element);
	}
	
	return null
}

const toPipesBySourceIdForTerminal = (input: {
	model: Model;
	grid: FlowGrid.Model;
	terminal: Flow.Terminal;
}): FlowGrid.Model["pipesBySourceId"] => {
	const pipesBySourceId: FlowGrid.Model["pipesBySourceId"] = {};
	const vistedNodeIds = new Set<Flow.NodeId>();

	const groupId = input.terminal.groupId;

	let currentNodeId = input.terminal.startId;

	vistedNodeIds.add(currentNodeId);
	
	for (let i = 0; i < 100; i++) {
		const currentNode = FlowGrid.toNode(input.grid, currentNodeId);

		if (!currentNode) {
			break;
		}

		const currentElement = input.model[currentNode.y]?.[currentNode.x];	

		if (!currentElement) {
			continue			
		}
		

		if (isTerminalWithPipe(currentElement)) {
			let adjacentTerminalNode: Flow.Node | null = null;
			for (const delta of DELTAS) {
				const adjacentPosition =  {
					x: currentNode.x + delta.x,
					y: currentNode.y + delta.y,
				}

				const adjacentNodeId = FlowGrid.toNodeId(adjacentPosition);

				const adjacentNode = FlowGrid.toNode(input.grid, adjacentNodeId);

				if (!adjacentNode) {
					continue;
				}
			
				const adjacentElement = input.model[adjacentPosition.y]?.[adjacentPosition.x];
			
				if (!adjacentElement) {
					continue;
				}

				if (isTerminal(adjacentElement)) {
					adjacentTerminalNode = adjacentNode;
					break;
				}
			}
		
			if (!adjacentTerminalNode) {
				continue
			}

			const edgeId = Flow.toEdgeId({
				sourceId: currentNodeId,
				targetId: adjacentTerminalNode.nodeId,
			});

			pipesBySourceId[currentNodeId] = {
				edgeId,
				groupId,
			}

			vistedNodeIds.add(adjacentTerminalNode.nodeId);
			break
		}

		let adjacentElement: Element | null = null;
		let adjacentPosition: FlowGridPosition.Position | null = null;
		let adjacentNodeId: Flow.NodeId | null = null;

		for (const delta of DELTAS) {
			const adjacentPosition_ =  {
				x: currentNode.x + delta.x,
				y: currentNode.y + delta.y,
			}
			const adjacentNodeId_ = FlowGrid.toNodeId(adjacentPosition_);

			if (vistedNodeIds.has(adjacentNodeId_)) {
				continue;
			}
			
			const adjacentNode_ = FlowGrid.toNode(input.grid, adjacentNodeId_);

			if (!adjacentNode_) {
				continue;
			}

			const adjacentElement_ = input.model[adjacentPosition_.y]?.[adjacentPosition_.x];

			if (!adjacentElement_) {
				continue;
			}

			const adjacentGroupId = elementToGroupId(adjacentElement_);
			
			if (!adjacentGroupId) {
				continue
			}

			if (adjacentGroupId !== groupId) {
				continue
			}
			
			adjacentElement = adjacentElement_;
			adjacentPosition = adjacentPosition_;
			adjacentNodeId = adjacentNodeId_;
			break;
		}

		if (!adjacentElement || !adjacentPosition || !adjacentNodeId) {
			break;
		}

		vistedNodeIds.add(currentNodeId);

		const edgeId = Flow.toEdgeId({
			sourceId: currentNodeId,
			targetId: adjacentNodeId,
		});
		pipesBySourceId[currentNodeId] = {
			edgeId,
			groupId,
		}
		currentNodeId = adjacentNodeId;


		if (isTerminal(adjacentElement)) {
			break
		}

		if (isTerminalWithPipe(adjacentElement)) {
			break
		}
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
			...input,
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
