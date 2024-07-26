import {rescale} from 'gamezilla-app/@/core';

export type Position = {
	x: number;
	y: number;
};

export type Direction =
	| 'vertical'
	| 'horizontal'
	| 'left_diagonal'
	| 'right_diagonal';

const directions: {[direction in Direction]: Direction} = {
	vertical: 'vertical',
	horizontal: 'horizontal',
	left_diagonal: 'left_diagonal',
	right_diagonal: 'right_diagonal',
};

const toVector = (direction: Direction): Position => {
	switch (direction) {
		case 'horizontal': {
			return {
				x: 1,
				y: 0,
			};
		}

		case 'vertical': {
			return {
				x: 0,
				y: 1,
			};
		}

		case 'left_diagonal': {
			return {
				x: 1,
				y: 1,
			};
		}

		case 'right_diagonal': {
			return {
				x: 1,
				y: -1,
			};
		}
	}
};

export const Direction = {
	all: Object.values(directions),
	toVector: toVector,
};

// source:https://stackoverflow.com/questions/17410809/how-to-calculate-rotation-in-2d-in-javascript
const rotate = ({
	theta,
	center: {x: cx, y: cy},
	position: {x, y},
}: {
	theta: number;
	center: Position;
	position: Position;
}): Position => {
	return {
		x:
			(x - cx) * Math.cos(theta) -
			(y - cy) * Math.sin(theta) +
			cx,
		y:
			(y - cy) * Math.cos(theta) +
			(x - cx) * Math.sin(theta) +
			cy,
	};
};

const add = (a: Position, b: Position): Position => {
	return {
		x: a.x + b.x,
		y: a.y + b.y,
	};
};

export const rangeInclusive = ({
	lower,
	upper,
}: {
	lower: Position;
	upper: Position;
}): Position[] => {
	const positions: Position[] = [];
	for (let x = lower.x; x <= upper.x; x++) {
		for (let y = lower.y; y <= upper.y; y++) {
			positions.push({
				x,
				y,
			});
		}
	}
	return positions;
};

export const rangeExclusive = ({
	lower,
	upper,
}: {
	lower: Position;
	upper: Position;
}): Position[] => {
	const positions: Position[] = [];
	for (let x = lower.x; x < upper.x; x++) {
		for (let y = lower.y; y < upper.y; y++) {
			positions.push({
				x,
				y,
			});
		}
	}
	return positions;
};

type Bounds = {
	lower: Position;
	upper: Position;
};

const rescalePosition = ({
	value,
	from,
	to,
}: {
	value: Position;
	from: Bounds;
	to: Bounds;
}): Position => {
	return {
		x: rescale({
			value: value.x,
			from: [
				from.lower.x,
				from.upper.x,
			],
			to: [to.upper.x, to.upper.x],
		}),
		y: rescale({
			value: value.y,
			from: [
				from.lower.y,
				from.upper.y,
			],
			to: [to.upper.y, to.upper.y],
		}),
	};
};

export const Position = {
	rotate,
	add,
	rangeInclusive,
	rangeExclusive,
	rescale: rescalePosition,
};
