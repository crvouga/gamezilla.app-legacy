import { pipe } from "gamezilla-app/@/core";
import { FlowGridShorthand } from "../../flow-variant/flow-grid";
import * as Flow from "../flow";
import * as FlowAlgoDrawPipes from "./flow-algo-draw-pipes";
FlowGridShorthand

export const toPossiblePipelines = function*(
    input: {
        model: Flow.Model,
        groupId: Flow.GroupId,
        startId: Flow.NodeId,
        endId: Flow.NodeId,
        visited: Set<Flow.NodeId>
    }
): Iterable<Flow.Edge[]> {
    if (input.startId === input.endId) {
        yield []
        return
	}

	if (input.visited.has(input.startId)) {
        return
	} 

    input.visited.add(input.startId);
    
    for (const edgeOut of Flow.yieldEdgesOut(input.model, input.startId)) {
        const targetGroupId = Flow.toGroupId(input.model, edgeOut.targetId)
        
        if (targetGroupId && targetGroupId !== input.groupId) {
            continue;
        }

        const subPipelines = toPossiblePipelines(
            {
                ...input,
                startId: edgeOut.targetId,
                visited: new Set(input.visited)
                
            }
		);

		for (const subPipeline of subPipelines) {
            const pipeline = [edgeOut, ...subPipeline];
            yield pipeline            
        }
	}

    input.visited.delete(input.startId);
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
        
        const possiblePipelines = toPossiblePipelines({
            ...terminal,
            model,
            visited: new Set(),
            endId: terminal.endId,
            groupId: terminal.groupId,
            startId: terminal.startId,
        })


        const solutions: Flow.Model[] = []

        for (const possiblePipeline of possiblePipelines) {
            const drew = drawPipeline(model, terminal, possiblePipeline);
            
            const solutions = Array.from(toSolutions(drew))
            
            solutions.push(...solutions)

            yield* solutions
        }

        if (solutions.length === 0) {
            break
        }
	}
};


export const solve = (model: Flow.Model): Flow.Model[] => {
    const solutions = pipe(
        model,
        model => toSolutions(model),
        solutions => Array.from(solutions),
        solutions => minAllBy(solutions, toTotalPipelineLength),
        solutions => uniqueWith(solutions, Flow.isSame),
    )
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
