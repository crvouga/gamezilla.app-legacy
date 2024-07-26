import type * as Position from './position';

export type Piece = Position.Position[];

export type Name = 'I' | 'T' | 'O' | 'J' | 'L' | 'S' | 'Z';

export const allNames: Name[] = ['I', 'T', 'O', 'J', 'L', 'S', 'Z'];

export const pieces: {[name in Name]: Piece} = {
	I: [
		{x: -1, y: 0},
		{x: 0, y: 0},
		{x: 1, y: 0},
		{x: 2, y: 0},
	],
	T: [
		{x: 0, y: -1},
		{x: -1, y: 0},
		{x: 0, y: 0},
		{x: 1, y: 0},
	],
	O: [
		{x: 0, y: -1},
		{x: 1, y: -1},
		{x: 0, y: 0},
		{x: 1, y: 0},
	],
	J: [
		{x: -1, y: -1},
		{x: -1, y: 0},
		{x: 0, y: 0},
		{x: 1, y: 0},
	],
	L: [
		{x: 1, y: -1},
		{x: -1, y: 0},
		{x: 0, y: 0},
		{x: 1, y: 0},
	],
	S: [
		{x: 0, y: -1},
		{x: 1, y: -1},
		{x: -1, y: 0},
		{x: 0, y: 0},
	],
	Z: [
		{x: -1, y: -1},
		{x: 0, y: -1},
		{x: 0, y: 0},
		{x: 1, y: 0},
	],
};

export const toUnit = (name: Name): Piece => {
	return pieces[name];
};

export const colors: {[name in Name]: string} = {
	I: 'cyan',
	J: 'blue',
	L: 'orange',
	O: 'yellow',
	S: 'green',
	T: 'magenta',
	Z: 'red',
};

export const View = (input: {name: Name}) => {
	switch (input.name) {
		case 'I': {
			return (
				<svg>
					{pieces.I.map(
						(
							position,
						) => (
							<rect
								key={[
									position.x,
									position.y,
								].join(
									'-',
								)}
								x={
									position.x
								}
								y={
									position.x
								}
								width={
									1
								}
								height={
									1
								}
							/>
						),
					)}
				</svg>
			);
		}

		case 'J': {
			return null;
		}

		case 'L': {
			return null;
		}

		case 'O': {
			return null;
		}

		case 'S': {
			return null;
		}

		case 'T': {
			return null;
		}

		case 'Z': {
			return null;
		}
	}
};
