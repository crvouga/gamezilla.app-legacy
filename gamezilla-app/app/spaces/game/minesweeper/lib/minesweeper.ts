import {
	Iter,
	type NonNegInt,
	Random,
	Set,
	pipe,
} from "gamezilla-app/@/core";
import { Position } from "./position";

export type Model = {
	mines: Set<Position>;
	flags: Set<Position>;
	holes: Set<Position>;
	rowCount: NonNegInt;
	columnCount: NonNegInt;
};

export const toMineCount = (model: Model, position: Position): NonNegInt => {
	return Set.size(Set.intersect(model.mines, Position.toAdjacent(position)));
};

export const initMines = ({
	rowCount,
	columnCount,
	mineCount,
	seed,
}: {
	rowCount: NonNegInt;
	columnCount: NonNegInt;
	mineCount: NonNegInt;
	seed: string;
}): Set<Position> => {
	return pipe(
		Position.range(columnCount, rowCount),
		(x) => Random.shuffle(seed, x),
		(x) => Iter.take(mineCount, x),
		(x) => Set.from(Position.toKey, x),
	);
};

export const didLose = (model: Model) => {
	return !Set.isEmpty(Set.intersect(model.mines, model.holes));
};

const toAllPositions = (model: Model): Set<Position> => {
	return Set.from(
		Position.toKey,
		Position.range(model.columnCount, model.rowCount),
	);
};

export const didWin = (model: Model) => {
	return Set.eq(model.holes, Set.diff(toAllPositions(model), model.mines));
};

export const plantFlag = (model: Model, position: Position): Model => {
	if (Set.isMember(Position.toKey, position, model.holes)) {
		return model;
	}

	return {
		...model,
		flags: Set.add(Position.toKey, position, model.flags),
	};
};

export const removeFlag = (model: Model, position: Position): Model => {
	return {
		...model,
		flags: Set.remove(Position.toKey, position, model.flags),
	};
};

export const digHole = (model: Model, position: Position): Model => {
	if (Set.isMember(Position.toKey, position, model.flags)) {
		return model;
	}

	return {
		...model,
		holes: Set.add(Position.toKey, position, model.holes),
	};
};
