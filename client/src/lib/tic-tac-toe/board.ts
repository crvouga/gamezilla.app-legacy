const DIRECTIONS = [
	[1, 1],
	[1, -1],
	[1, 0],
	[0, 1]
];

export const toConsecutives = <T>(columns: T[][]): T[][] => {
	const consecutives = [];
	const visited = new Set();
	for (let i = 0; i < columns.length; i++) {
		for (let j = 0; j < columns[i].length; j++) {
			for (const [di, dj] of DIRECTIONS) {
				if (visited.has('' + di + dj + i + j)) {
					continue;
				}

				const consecutive = [];

				let ii = i;
				let jj = j;

				while (columns[i][j] === columns[ii]?.[jj]) {
					visited.add('' + di + dj + ii + jj);
					consecutive.push([ii, jj]);
					ii += di;
					jj += dj;
				}

				if (consecutive.length >= 2) {
					consecutives.push(consecutive);
				}
			}
		}
	}
	return consecutives;
};
