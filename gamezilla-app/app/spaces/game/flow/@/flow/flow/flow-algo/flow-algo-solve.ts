import * as Flow from "../flow";

const toPossiblePipelines = function* (input: {
	model: Flow.Model;
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId;
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number;
}): Iterable<Flow.Edge[]> {
	type QueueItem = {
		path: Flow.Edge[];
		currentNode: Flow.NodeId;
		visited: Set<Flow.NodeId>;
		cost: number;
		heuristic: number;
	};

	const queue: QueueItem[] = [];

	const heuristic = input.distance(input.startId, input.endId);
	queue.push({
		path: [],
		currentNode: input.startId,
		visited: new Set([input.startId]),
		cost: 0,
		heuristic,
	});

	while (queue.length > 0) {
		// Use a priority queue to always expand the node with the lowest estimated cost
		queue.sort((a, b) => a.heuristic - b.heuristic);
		const { path, currentNode, visited, cost } = queue.shift()!;

		if (currentNode === input.endId) {
			yield path;
			continue;
		}

		for (const edgeOut of Flow.yieldEdgesOut(input.model, currentNode)) {
			const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId);

			if (targetGroupId && targetGroupId !== input.groupId) {
				continue;
			}

			if (visited.has(edgeOut.targetId)) {
				continue;
			}

			const newPath = [...path, edgeOut];
			const newVisited = new Set(visited).add(edgeOut.targetId);
			const newCost = cost + 1; // Assuming uniform cost for each step
			const newHeuristic = newCost + input.distance(edgeOut.targetId, input.endId);

			queue.push({
				path: newPath,
				currentNode: edgeOut.targetId,
				visited: newVisited,
				cost: newCost,
				heuristic: newHeuristic,
			});
		}
	}
};


const drawPipeline = (
	model: Flow.Model,
	terminal: Flow.Terminal,
	path: Flow.Edge[],
): Flow.Model => {
	const pipesBySourceId = { ...model.pipesBySourceId };

	for (let i = 0; i < path.length; i++) {
		const edge = path[i]!;
		pipesBySourceId[edge.sourceId] = {
			edgeId: Flow.toEdgeId(edge),
			groupId: terminal.groupId,
		};
	}

	return {
		...model,
		pipesBySourceId,
	};
};

export const solve = function* (
	model: Flow.Model,
	distance: (a: Flow.NodeId, b: Flow.NodeId) => number,
): Iterable<Flow.Model> {
	if (Flow.isSolved(model)) {
		yield model;
		return;
	}

	const terminals = Flow.toTerminals(model);

	terminals.sort((a, b) => {
		if (a.endId && b.endId) {
			return distance(a.startId, a.endId) - distance(b.startId, b.endId);
		}
		return 0;
	});

	for (const terminal of terminals) {
		if (!terminal.endId) {
			continue;
		}

		if (Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
			continue;
		}

		const possiblePipelines = toPossiblePipelines({
			model,
			endId: terminal.endId,
			groupId: terminal.groupId,
            startId: terminal.startId,
            distance,
		});

		for (const possiblePipeline of possiblePipelines) {
			const drew = drawPipeline(model, terminal, possiblePipeline);
			for (const solution of solve(drew, distance)) {
				yield solution;
			}
		}
		return;
	}
};
