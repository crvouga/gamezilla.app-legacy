import { FlowAlgoSolveAsync } from "../../flow/flow-variant/flow-variant-aglo/flow-algo-solve-async";
import { IFlowPuzzleDb } from "./flow-puzzle-db";

export const WithSolutions = (flowPuzzleDb: IFlowPuzzleDb): IFlowPuzzleDb => {
    return {
        ...flowPuzzleDb,
        async put(puzzle) {
            const solution = await FlowAlgoSolveAsync.solve(puzzle.flow);
            const withSolution: typeof puzzle = {
                ...puzzle,
                flowSolutions: solution ?  [solution] : []
            }
            const output = await flowPuzzleDb.put(withSolution);
            return output
        }
    }
}