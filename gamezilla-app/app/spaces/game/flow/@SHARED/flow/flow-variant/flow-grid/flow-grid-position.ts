import { p } from "gamezilla-app/@shared/core/parser";

export const parser = p.obj({
	x: p.num,
	y: p.num,
});

export type Position = p.Infer<typeof parser>;

const distance = (a: Position, b: Position) => {
	return Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2);
};

export const Position = {
	distance,
	parser,
};

export const DELTAS: Position[] = [
	{ x: -1, y: 0 },
	{ x: 1, y: 0 },
	{ x: 0, y: 1 },
	{ x: 0, y: -1 },
];
