import { NonEmpty } from "gamezilla-app/@/core";
import { Flow } from "../../../flow";
import * as FlowGrid from "../flow-grid";
import * as FlowGridDimensions from "../flow-grid-dimensions";

//
//
//
// Model
//
//
//

type Terminal = Flow.GroupId;

type Pipe = Lowercase<Flow.GroupId>;

type AppendLowercase<T extends string> = T extends `${infer U}${infer _L}`
	? `${U}${Lowercase<U>}`
	: never;

type TerminalWithPipe = AppendLowercase<Flow.GroupId>;

type Empty = " ";

export type Element = Empty | Terminal | Pipe | TerminalWithPipe;

export type Model = NonEmpty<NonEmpty<Element>>;

export const transpose = (model: Model): Model => {
	return model[0].map((_, i) => model.map((row) => row[i])) as Model;
};

export const rotateClockwise = (model: Model): Model => {
	return transpose(model).map((row) => row.reverse()) as Model;
};

export const reflectHorizontally = (model: Model): Model => {
	return model.map((row) => row.reverse()) as Model;
};

export const isModel = (maybeModel: Element[][]): maybeModel is Model =>
	NonEmpty.is(maybeModel) &&
	maybeModel.every(
		(row) =>
			NonEmpty.is(row) && row.every((element) => typeof element === "string"),
	);

//
//
//
//
//
//

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
const groupIdToPipe = (groupId: Flow.GroupId): Pipe => {
	const lowercase = groupId.toLowerCase();
	if (isPipe(lowercase)) {
		return lowercase;
	}
	return "a";
};

const groupIdToTerminalWithPipe = (groupId: Flow.GroupId): TerminalWithPipe => {
	const terminalWithPipe = `${groupId.toUpperCase()}${groupId.toLowerCase()}`;
	if (isTerminalWithPipe(terminalWithPipe)) {
		return terminalWithPipe;
	}
	return "Aa";
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

//
//
//
// Init
//
//
//

export const init = (model: Model): Model => {
	return model;
};

//
//
//
//
//
//
//

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

		const validAdjacent: {
			adjacentNodeId: Flow.NodeId;
			adjacentElement: Element;
		}[] = [];

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

			validAdjacent.push({ adjacentNodeId, adjacentElement });
		}

		for (const { adjacentNodeId, adjacentElement } of validAdjacent) {
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
				if (
					isPipe(currentElement) ||
					isTerminalWithPipe(currentElement) ||
					isTerminalWithPipe(adjacentElement)
				) {
					allPaths.push(newPath);
				}
				continue;
			}
			findPaths(adjacentNodeId, newPath);
		}

		if (validAdjacent.length === 0) {
			allPaths.push(path);
		}

		visitedNodeIds.delete(currentNodeId);
	};

	findPaths(input.terminal.startId, {});
	return allPaths;
};

/**
 * Returns a list of all possible pipes for a grid.
 * It will return solutions with the longest pipelines.
 */
const toPipesBySourceIdList_ = (input: {
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

	const pipeCombinations = combinations(
		...Object.values(pipesBySourceIdListByGroupId),
	).map((combination) =>
		combination.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
	);

	if (NonEmpty.is(pipeCombinations)) {
		return pipeCombinations;
	}

	return [{}];
};

const toPipesBySourceIdList = (input: {
	model: Model;
	grid: FlowGrid.Model;
}): NonEmpty<FlowGrid.Model["pipesBySourceId"]> => {
	const solutions = toPipesBySourceIdList_(input);

	const maxSolutions = maxAllBy(solutions, (pipesBySourceId) =>
		toTotalPipelineLength({
			...input.grid,
			pipesBySourceId,
		}),
	);

	const uniqueSolutions = uniqueWith(maxSolutions, (left, right) =>
		Flow.isSame(
			{
				...input.grid,
				pipesBySourceId: left,
			},
			{
				...input.grid,
				pipesBySourceId: right,
			},
		),
	);

	if (NonEmpty.is(uniqueSolutions)) {
		return uniqueSolutions;
	}

	return solutions;
};

const toTotalPipelineLength = (model: Flow.Model): number => {
	let total = 0;
	for (const terminal of Flow.yieldTerminals(model)) {
		for (const _ of Flow.yieldPipeline(model, terminal.startId)) {
			total += 1;
		}
	}
	return total;
};

/**
 * Generates all combinations where each combination includes one element from each array within the given array of arrays.
 * @param arrays - An array of arrays.
 * @returns An array of combinations.
 */
const combinations = <T>(...arrays: T[][]): T[][] => {
	const result: T[][] = [];

	const helper = (currentIndex: number, currentCombination: T[]) => {
		if (currentIndex === arrays.length) {
			result.push([...currentCombination]);
			return;
		}

		for (const element of arrays[currentIndex] ?? []) {
			currentCombination.push(element);
			helper(currentIndex + 1, currentCombination);
			currentCombination.pop();
		}
	};

	helper(0, []);
	return result;
};

const uniqueWith = <T>(arr: T[], fn: (left: T, right: T) => boolean): T[] => {
	const unique: T[] = [];
	for (const left of arr) {
		if (!unique.some((right) => fn(left, right))) {
			unique.push(left);
		}
	}
	return unique;
};

const maxAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
	let max = -Infinity;
	for (const item of arr) {
		const value = fn(item);
		if (value > max) {
			max = value;
		}
	}
	return arr.filter((item) => fn(item) === max);
};

export const toDimensions = (model: Model): FlowGridDimensions.Model => {
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

export const toGrid = (model: Model): FlowGrid.Model => {
	return toGrids(model)[0];
};

/**
 * Returns a list of all possible grids for inputted shorthand grid.
 * @exmaple ```ts
 *  // See how this can have multiple different paths for terminal A.
 *	const shorthand = FlowGridShorthand.init([
 * 		["A", "a", "a"],
 * 		["a", "a", "a"],
 * 		["a", "a", "A"],
 * 	]);
 */
export const toGrids = (model: Model): NonEmpty<FlowGrid.Model> => {
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

const isValid = (maybeModel: Element[][]): maybeModel is Model => {
	return NonEmpty.is(maybeModel) && maybeModel.every((row) => NonEmpty.is(row));
};

export const fromGrid = (grid: FlowGrid.Model): Model => {
	const shorthand: Element[][] = [];

	for (let y = 0; y < grid.height; y++) {
		const row: Element[] = [];
		for (let x = 0; x < grid.height; x++) {
			row.push(" ");
		}
		shorthand.push(row);
	}

	for (const terminal of Flow.toTerminals(grid)) {
		const start = grid.positions[terminal.startId];
		if (start) {
			const row = shorthand[start.y];
			if (row) {
				row[start.x] = terminal.groupId;
			}
		}

		const end = terminal.endId ? grid.positions[terminal.endId] : null;

		if (end) {
			const row = shorthand[end.y];
			if (row) {
				row[end.x] = terminal.groupId;
			}
		}
	}

	for (const pipelines of Flow.yieldPipelines(grid)) {
		for (const pipe of pipelines) {
			const edge = grid.edges[pipe.edgeId];

			if (!edge) {
				continue;
			}

			const groupId = Flow.toGroupId(grid, edge.sourceId);
			const terminal = groupId ? Flow.toTerminalByGroupId(grid, groupId) : null;
			const isSourceTerminal =
				terminal?.startId === edge.sourceId ||
				terminal?.endId === edge.sourceId;
			const isTargetTerminal =
				terminal?.startId === edge.targetId ||
				terminal?.endId === edge.targetId;

			const sourcePosition = grid.positions[edge.sourceId];

			if (!sourcePosition) {
				continue;
			}

			const row = shorthand[sourcePosition.y];

			if (!row) {
				continue;
			}

			if (isSourceTerminal && isTargetTerminal) {
				row[sourcePosition.x] = groupIdToTerminalWithPipe(pipe.groupId);
				continue;
			}

			if (!isSourceTerminal) {
				row[sourcePosition.x] = groupIdToPipe(pipe.groupId);
				continue;
			}
		}
	}

	if (isValid(shorthand)) {
		return shorthand;
	}

	return [[" "]];
};
