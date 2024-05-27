import * as Flow from "../flow";

const toPossiblePipelines = function* (input: {
	model: Flow.Model;
	groupId: Flow.GroupId;
	startId: Flow.NodeId;
	endId: Flow.NodeId;
	visited: Set<Flow.NodeId>;
}): Iterable<Flow.Edge[]> {
	if (input.visited.has(input.startId)) {
		return;
	}

	input.visited.add(input.startId);

	if (input.startId === input.endId) {
		yield [];
		return;
	}

	for (const edgeOut of Flow.yieldEdgesOut(input.model, input.startId)) {
		const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId);

		if (targetGroupId && targetGroupId !== input.groupId) {
			continue;
		}

		const subPipelines = toPossiblePipelines({
			...input,
			startId: edgeOut.targetId,
			visited: new Set(input.visited),
		});

		for (const subPipeline of subPipelines) {
			yield [edgeOut, ...subPipeline];
		}
	}

	input.visited.delete(input.startId);
};

const drawPipeline = (
	model: Flow.Model,
	terminal: Flow.Terminal,
	path: Flow.Edge[],
): Flow.Model => {
	const pipesBySourceId = { ...model.pipesBySourceId };

	for (const sourceId in pipesBySourceId) {
		const pipe = pipesBySourceId[sourceId as Flow.NodeId]!;
		if (pipe.groupId === terminal.groupId) {
			delete pipesBySourceId[sourceId as Flow.NodeId];
		}
	}

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

export const solve = function* (model: Flow.Model): Iterable<Flow.Model> {
	if (Flow.isSolved(model)) {
		yield model;
		return;
	}

    for (const terminal of Flow.toTerminals(model)) {
		if (!terminal.endId) {
			continue;
		}

		if (Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
			continue;
		}

		const possiblePipelines = toPossiblePipelines({
			model,
			visited: new Set(),
			endId: terminal.endId,
			groupId: terminal.groupId,
			startId: terminal.startId,
        });
        
		for (const possiblePipeline of possiblePipelines) {
			const drew = drawPipeline(model, terminal, possiblePipeline);
			for (const solution of solve(drew)) {
				yield solution;
			}
        }
		return;
	}
};