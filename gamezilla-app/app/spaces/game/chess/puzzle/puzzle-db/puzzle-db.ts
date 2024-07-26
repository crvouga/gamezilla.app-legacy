import type {Result} from 'gamezilla-app/@/core';
import type {UserId} from 'gamezilla-app/app/@/data';
import type {Puzzle, PuzzleInteraction} from '../puzzle.types';

export type PuzzleDb = {
	interactions: {
		insert: (
			interaction: PuzzleInteraction,
		) => Promise<Result<string, null>>;
	};
	puzzles: {
		replace: (
			puzzle: Puzzle,
		) => Promise<Result<string, null>>;
		findForProfile: (input: {
			userId: UserId;
		}) => Promise<Result<string, Puzzle[]>>;
	};
	profiles: {
		find: null;
		insert: null;
		findElseInsert: null;
		update: null;
	};
};
