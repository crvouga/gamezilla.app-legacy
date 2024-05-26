import { NonEmpty } from "gamezilla-app/@/core";
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

const pipeToGroupId = (pipe: Pipe): Flow.GroupId => {
	const uppercase = pipe.toUpperCase();
	if (Flow.isGroupId(uppercase)) {
		return uppercase;
	}
	return "A";
};

const terminalWithPipeToGroupId = (
	terminalWithPipe: TerminalWithPipe,
): Flow.GroupId => {
	const groupId = terminalWithPipe[0];
	if (Flow.isGroupId(groupId)) {
		return groupId;
	}
	return "A";
};

const elementToGroupId = (element: Element): Flow.GroupId | null => {
	if (isPipe(element)) {
		return pipeToGroupId(element);
	}

	if (isTerminal(element)) {
		return element;
	}

	if (isTerminalWithPipe(element)) {
		return terminalWithPipeToGroupId(element);
	}

	return null;
};

const init = (model: Model): Model => {
	return model;
};

type DraftTerminal = {
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId | null;
};

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

			const elementNodeId = FlowGrid.toNodeId(position);

			const element = row[x];

			if (!element) {
				continue;
			}

			if (!isTerminal(element) && !isTerminalWithPipe(element)) {
				continue;
			}

			const elementGroupId = elementToGroupId(element);

			if (!elementGroupId) {
				continue;
			}

			const draftTerminal = terminalsByGroupId[elementGroupId];

			if (!draftTerminal) {
				const draftTerminalNew: DraftTerminal = {
					groupId: elementGroupId,
					startId: elementNodeId,
					endId: null,
				};
				terminalsByGroupId[elementGroupId] = draftTerminalNew;
				continue;
			}

			terminalsByGroupId[elementGroupId] = {
				...draftTerminal,
				endId: elementNodeId,
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
] as const;

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

	const JUST_IN_CASE = 1000;
	for (let i = 0; i < JUST_IN_CASE; i++) {
		const currentNode = FlowGrid.toNode(input.grid, currentNodeId);

		if (!currentNode) {
			break;
		}

		const currentElement = input.model[currentNode.y]?.[currentNode.x];

		if (!currentElement) {
			continue;
		}

		if (isTerminalWithPipe(currentElement)) {
			let adjacentTerminalNode: Flow.Node | null = null;
			for (const delta of DELTAS) {
				const adjacentPosition = {
					x: currentNode.x + delta.x,
					y: currentNode.y + delta.y,
				};

				const adjacentNodeId = FlowGrid.toNodeId(adjacentPosition);

				const adjacentNode = FlowGrid.toNode(input.grid, adjacentNodeId);

				if (!adjacentNode) {
					continue;
				}

				const adjacentElement =
					input.model[adjacentPosition.y]?.[adjacentPosition.x];

				if (!adjacentElement) {
					continue;
				}

				const adjacentElementGroupId = elementToGroupId(adjacentElement);

				if (!adjacentElementGroupId) {
					continue;
				}

				if (adjacentElementGroupId !== groupId) {
					continue;
				}

				if (isTerminal(adjacentElement)) {
					adjacentTerminalNode = adjacentNode;
					break;
				}
			}

			if (!adjacentTerminalNode) {
				continue;
			}

			const edgeId = Flow.toEdgeId({
				sourceId: currentNodeId,
				targetId: adjacentTerminalNode.nodeId,
			});

			pipesBySourceId[currentNodeId] = {
				edgeId,
				groupId,
			};
			break;
		}

		let adjacentElement: Element | null = null;
		let adjacentPosition: FlowGridPosition.Position | null = null;
		let adjacentNodeId: Flow.NodeId | null = null;

		for (const delta of DELTAS) {
			const adjacentPosition_ = {
				x: currentNode.x + delta.x,
				y: currentNode.y + delta.y,
			};
			const adjacentNodeId_ = FlowGrid.toNodeId(adjacentPosition_);

			if (vistedNodeIds.has(adjacentNodeId_)) {
				continue;
			}

			const adjacentNode_ = FlowGrid.toNode(input.grid, adjacentNodeId_);

			if (!adjacentNode_) {
				continue;
			}

			const adjacentElement_ =
				input.model[adjacentPosition_.y]?.[adjacentPosition_.x];

			if (!adjacentElement_) {
				continue;
			}

			const adjacentGroupId = elementToGroupId(adjacentElement_);

			if (!adjacentGroupId) {
				continue;
			}

			if (adjacentGroupId !== groupId) {
				continue;
			}

			adjacentElement = adjacentElement_;
			adjacentPosition = adjacentPosition_;
			adjacentNodeId = adjacentNodeId_;
			break;
		}

		if (!adjacentElement || !adjacentPosition || !adjacentNodeId) {
			break;
		}

		vistedNodeIds.add(adjacentNodeId);

		const edgeId = Flow.toEdgeId({
			sourceId: currentNodeId,
			targetId: adjacentNodeId,
		});
		pipesBySourceId[currentNodeId] = {
			edgeId,
			groupId,
		};
		currentNodeId = adjacentNodeId;

		if (isTerminal(adjacentElement)) {
			break;
		}

		if (isTerminalWithPipe(adjacentElement)) {
			break;
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

/**
 * Returns a list of all possible pipes for a terminal.
 * @exmaple ```ts
 *  // See how this can have multiple different paths for terminal A.
 *	const shorthand = FlowGridShorthand.init([
 * 		["A", "a", "a"],
 * 		["a", "a", "a"],
 * 		["a", "a", "A"],
 * 	]);
 */
const toPipesBySourceIdForTerminalList = (input: {
	model: Model;
	grid: FlowGrid.Model;
	terminal: Flow.Terminal;
}): FlowGrid.Model["pipesBySourceId"][] => {
	const allPaths: FlowGrid.Model["pipesBySourceId"][] = [];
	const visitedNodeIds = new Set<Flow.NodeId>();

	const groupId = input.terminal.groupId;

	const findPaths = (
		currentNodeId: Flow.NodeId,
		path: FlowGrid.Model["pipesBySourceId"],
	) => {
		if (visitedNodeIds.has(currentNodeId)) {
			return;
		}

		visitedNodeIds.add(currentNodeId);

		const currentNode = FlowGrid.toNode(input.grid, currentNodeId);
		if (!currentNode) {
			visitedNodeIds.delete(currentNodeId);
			return;
		}

		const currentElement = input.model[currentNode.y]?.[currentNode.x];
		if (!currentElement) {
			visitedNodeIds.delete(currentNodeId);
			return;
		}

		// Special case for terminal with pipe.
		if (isTerminalWithPipe(currentElement)) {
			let adjacentTerminalNode: Flow.Node | null = null;
			for (const delta of DELTAS) {
				const adjacentPosition = {
					x: currentNode.x + delta.x,
					y: currentNode.y + delta.y,
				};
				const adjacentNodeId = FlowGrid.toNodeId(adjacentPosition);
				const adjacentNode = FlowGrid.toNode(input.grid, adjacentNodeId);

				if (!adjacentNode) {
					continue;
				}

				const adjacentElement =
					input.model[adjacentPosition.y]?.[adjacentPosition.x];
				if (!adjacentElement) {
					continue;
				}

				const adjacentElementGroupId = elementToGroupId(adjacentElement);
				if (!adjacentElementGroupId) {
					continue;
				}

				if (adjacentElementGroupId !== groupId) {
					continue;
				}

				if (isTerminal(adjacentElement)) {
					adjacentTerminalNode = adjacentNode;
					break;
				}
			}

			if (adjacentTerminalNode) {
				const edgeId = Flow.toEdgeId({
					sourceId: currentNodeId,
					targetId: adjacentTerminalNode.nodeId,
				});
				path[currentNodeId] = {
					edgeId,
					groupId,
				};
				allPaths.push({ ...path });
			}
			visitedNodeIds.delete(currentNodeId);
			return;
		}

		for (const delta of DELTAS) {
			const adjacentPosition = {
				x: currentNode.x + delta.x,
				y: currentNode.y + delta.y,
			};
			const adjacentNodeId = FlowGrid.toNodeId(adjacentPosition);

			if (visitedNodeIds.has(adjacentNodeId)) {
				continue;
			}

			const adjacentNode = FlowGrid.toNode(input.grid, adjacentNodeId);
			if (!adjacentNode) {
				continue;
			}

			const adjacentElement =
				input.model[adjacentPosition.y]?.[adjacentPosition.x];
			if (!adjacentElement) {
				continue;
			}

			const adjacentGroupId = elementToGroupId(adjacentElement);
			if (!adjacentGroupId || adjacentGroupId !== groupId) {
				continue;
			}

			const edgeId = Flow.toEdgeId({
				sourceId: currentNodeId,
				targetId: adjacentNodeId,
			});
			const newPath = { ...path };
			newPath[currentNodeId] = {
				edgeId,
				groupId,
			};

			if (adjacentNodeId === input.terminal.endId) {
				allPaths.push(newPath);
				continue;
			}
			findPaths(adjacentNodeId, newPath);
		}

		visitedNodeIds.delete(currentNodeId);
	};

	findPaths(input.terminal.startId, {});
	return allPaths;
};

const toPipesBySourceIdList = (input: {
	model: Model;
	grid: FlowGrid.Model;
}): NonEmpty<FlowGrid.Model["pipesBySourceId"]> => {
	const pipesBySourceIdListByGroupId: {
		[groupId in Flow.GroupId]?: FlowGrid.Model["pipesBySourceId"][];
	} = {};

	for (const groupId in input.grid.terminalsByGroupId) {
		const terminal = input.grid.terminalsByGroupId[groupId as Flow.GroupId];

		if (!terminal) {
			continue;
		}

		const pipesBySourceIdForTerminal = toPipesBySourceIdForTerminalList({
			grid: input.grid,
			model: input.model,
			terminal,
		});

		pipesBySourceIdListByGroupId[terminal.groupId] = [
			...(pipesBySourceIdListByGroupId[terminal.groupId] ?? []),
			...pipesBySourceIdForTerminal,
		];
	}

	const combinations: FlowGrid.Model["pipesBySourceId"][] = [];

	for (const groupId1 in pipesBySourceIdListByGroupId) {
		if (!Flow.isGroupId(groupId1)) {
			continue;
		}
		const paths1 = pipesBySourceIdListByGroupId[groupId1];
		if (!paths1) {
			continue;
		}

		for (const groupId2 in pipesBySourceIdListByGroupId) {
			if (!Flow.isGroupId(groupId2)) {
				continue;
			}

			const paths2 = pipesBySourceIdListByGroupId[groupId2];

			if (!paths2) {
				continue;
			}

			for (const path1 of paths1) {
				for (const path2 of paths2) {
					combinations.push({ ...path1, ...path2 });
				}
			}
		}
	}

	const uniqueCombinations: FlowGrid.Model["pipesBySourceId"][] = [];

	for (const combination of combinations) {
		const isUnique = uniqueCombinations.every(
			(existingUniqueCombination) =>
				!Flow.isSamePipesBySourceId(
					{
						edges: input.grid.edges,
						pipesBySourceId: combination,
					},
					{
						edges: input.grid.edges,
						pipesBySourceId: existingUniqueCombination,
					},
				),
		);

		if (isUnique) {
			uniqueCombinations.push(combination);
		}
	}
	
	let maxLength = 0;

	for (const combination of uniqueCombinations) {
		const length = Object.keys(combination).length;
		if (length > maxLength) {
			maxLength = length;
		}
	}

	const maxLengthCombinations = uniqueCombinations.filter(
		(combination) => Object.keys(combination).length === maxLength,
	);

	if (NonEmpty.is(maxLengthCombinations)) {
		return maxLengthCombinations;
	}

	return [{}];
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
	// const terminalsByGroupId = toTerminalsByGroupId(model);
	// const dimensions = toDimensions(model);
	// const grid = FlowGrid.init({ dimensions, terminalsByGroupId });
	// const pipesBySourceId = toPipesBySourceId({ grid, model });
	const grids = toGrids(model);
	return grids[0];
	// return {
	// 	...grid,
	// 	pipesBySourceId,
	// };
};

const toGrids = (model: Model): NonEmpty<FlowGrid.Model> => {
	const terminalsByGroupId = toTerminalsByGroupId(model);
	const dimensions = toDimensions(model);
	const grid = FlowGrid.init({ dimensions, terminalsByGroupId });
	const pipesBySourceIdList = toPipesBySourceIdList({ grid, model });
	const grids = NonEmpty.map(
		pipesBySourceIdList,
		(pipesBySourceId): FlowGrid.Model => {
			return {
				...grid,
				pipesBySourceId,
			};
		},
	);
	return grids;
};

export const FlowGridShorthand = {
	init,
	toDimensions,
	toGrid,
	toGrids,
};
