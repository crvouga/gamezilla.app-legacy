import { Ok, isErr } from "gamezilla-app/@/core";
import { FlowAlgoSolveAsync } from "../../flow/flow-variant/flow-variant-aglo/flow-algo-solve-async";
import { IFlowPuzzleDb } from "./flow-puzzle-db";

export const WithSolutions = (flowPuzzleDb: IFlowPuzzleDb): IFlowPuzzleDb => {
	return {
		...flowPuzzleDb,
		async list(input) {
			const listed = await flowPuzzleDb.list(input);

			if (isErr(listed)) return listed;

			const promises = listed.value.items.map(async (puzzle) => {
				if (puzzle.flowSolutions.length > 0) return puzzle;

				const solution = await FlowAlgoSolveAsync.solve(puzzle.flow);

				if (!solution) return puzzle;

				const withSolution: typeof puzzle = {
					...puzzle,
					flowSolutions: [solution],
				};

				return withSolution;
			});

			const awaited = await Promise.all(promises);

			return Ok({
				...listed.value,
				items: awaited,
			});
		},
		async get(id) {
			const got = await flowPuzzleDb.get(id);

			if (isErr(got)) return got;

			if (!got.value) return got;

			if (got.value.flowSolutions.length > 0) return got;

			const solution = await FlowAlgoSolveAsync.solve(got.value.flow);

			if (!solution) return got;

			const withSolution: typeof got.value = {
				...got.value,
				flowSolutions: [solution],
			};

			return Ok(withSolution);
		},
		async put(puzzle) {
			const solution = await FlowAlgoSolveAsync.solve(puzzle.flow);
			const withSolution: typeof puzzle = {
				...puzzle,
				flowSolutions: solution ? [solution] : [],
			};
			const output = await flowPuzzleDb.put(withSolution);
			return output;
		},
	};
};
