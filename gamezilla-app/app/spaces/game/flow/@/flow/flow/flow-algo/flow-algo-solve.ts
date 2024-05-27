import * as Flow from "../flow";
import * as FlowAlgoDrawPipes from "./flow-algo-draw-pipes";

export const toCandiatePipeline = function * (
    model: Flow.Model,
    groupId: Flow.GroupId,
	startId: Flow.NodeId,
	endId: Flow.NodeId,
	visited: Set<Flow.NodeId> = new Set(),
): Iterable<Flow.Edge[]> {
	if (startId === endId) {
        yield [];
        return
	}

	if (visited.has(startId)) {
        return
	}

	visited.add(startId);
    for (const edgeOut of Flow.yieldEdgesOut(model, startId)) {
        const targetGroupId = Flow.toGroupId(model, edgeOut.targetId)
        
        if (targetGroupId && targetGroupId !== groupId) {
            continue;
        }

		const subPaths = toCandiatePipeline(
            model,
            groupId,
			edgeOut.targetId,
			endId,
			new Set(visited),
		);

		for (const subPath of subPaths) {
            yield [edgeOut, ...subPath];
		}
	}

	visited.delete(startId);
};

const drawPipeline = (
	model: Flow.Model,
	terminal: Flow.Terminal,
	path: Flow.Edge[],
): Flow.Model => {
	let modelNew = { ...model };
    for (const edge of path) {
		modelNew = FlowAlgoDrawPipes.drawPipes(
			() => 0,
			modelNew,
			terminal.groupId,
			edge.targetId,
		);
	}
	return modelNew;
};


const hasPipeline = (model: Flow.Model, path: Flow.Edge[]): boolean => {
    for (const edge of path) {
        if (!Flow.toPipeBySourceId(model, edge.sourceId)) {
            return false;
        }
    }
    return true;
}

export const toSolutions = function* (model: Flow.Model): Iterable<Flow.Model> {
	if (Flow.isSolved(model)) {
        yield model
        return
	}
	for (const terminal of Flow.toTerminals(model)) {
		if (!terminal.endId) {
			continue;
		}

		if (Flow.isConnectedWithPipes(model, terminal.startId, terminal.endId)) {
			continue;
		}

		for (const candiate of toCandiatePipeline(model, terminal.groupId, terminal.startId, terminal.endId)) {
            const drew = drawPipeline(model, terminal, candiate);
            
            if (!hasPipeline(drew, candiate)) {
                continue;
            }
            
            yield* solve(drew)
		}
	}
};

export const solve = (model: Flow.Model): Flow.Model[] => {
	const solutions = Array.from(toSolutions(model));

	const minimalSolutions = minAllBy(solutions, toTotalPipelineLength);

	const uniqueSolutions = uniqueWith(minimalSolutions, Flow.isSame);

	return uniqueSolutions;
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

const uniqueWith = <T>(arr: T[], fn: (left: T, right: T) => boolean): T[] => {
	const unique: T[] = [];
	for (const left of arr) {
		if (!unique.some((right) => fn(left, right))) {
			unique.push(left);
		}
	}
	return unique;
};

const minAllBy = <T>(arr: T[], fn: (item: T) => number): T[] => {
	let min = Infinity;
	for (const item of arr) {
		const value = fn(item);
		if (value < min) {
			min = value;
		}
	}
	return arr.filter((item) => fn(item) === min);
};
