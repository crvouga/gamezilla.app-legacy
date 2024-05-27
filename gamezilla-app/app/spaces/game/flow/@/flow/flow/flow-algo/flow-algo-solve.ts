import * as Flow from "../flow";

const toPossiblePipelines = function* (input: {
	model: Flow.Model;
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId;
}): Iterable<Flow.Edge[]> {
	type QueueItem = {
		path: Flow.Edge[];
		currentNode: Flow.NodeId;
		visited: Set<Flow.NodeId>;
	};

	const queue: QueueItem[] = [];

	queue.push({
		path: [],
		currentNode: input.startId,
		visited: new Set(),
	});

	while (queue.length > 0) {
		const { path, currentNode, visited } = queue.shift()!;

		if (visited.has(currentNode)) {
			continue;
		}

		visited.add(currentNode);

		if (currentNode === input.endId) {
			yield path;
			continue;
		}

		for (const edgeOut of Flow.yieldEdgesOut(input.model, currentNode)) {
			const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId);

			if (targetGroupId && targetGroupId !== input.groupId) {
				continue;
			}

            const newPath = [...path, edgeOut];
			const newVisited = new Set(visited);
			queue.push({
				path: newPath,
				currentNode: edgeOut.targetId,
				visited: newVisited,
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
