import {type Columns, type Win, findWins} from '../../../connect-four';

/* Have to increase the viewBox so that the draw animation is smooth >:-{ */
const N = 1000;

type Pos2 = {x: number; y: number};

const distance = (a: Pos2, b: Pos2): number => {
	return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
};

const angleBetween = (a: Pos2, b: Pos2): number => {
	return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
};

export function syncWins({
	parentNode,
	prevColumns,
	columns,
}: {
	prevColumns: Columns | null;
	parentNode: SVGElement;
	columns: Columns;
}) {
	const prevWins = prevColumns ? findWins(prevColumns) : null;
	const wins = columns ? findWins(columns) : [];

	const additions = prevWins
		? wins.filter(
				(win) =>
					!prevWins.some(
						(
							w,
						) =>
							toWinId(
								w,
							) ===
							toWinId(
								win,
							),
					),
		  )
		: wins;

	const removals = prevWins
		? prevWins.filter(
				(win) =>
					!wins.some(
						(
							w,
						) =>
							toWinId(
								w,
							) ===
							toWinId(
								win,
							),
					),
		  )
		: [];

	for (const win of additions) {
		enterWin({
			win,
			parentNode,
		});
	}

	for (const win of removals) {
		const node = parentNode.querySelector(
			`#${toWinId(win)}`,
		);

		if (node instanceof SVGRectElement) {
			exitWin({
				node,
			});
		}
	}
}

export function initWins({
	columns,
	parentNode,
}: {
	columns: Columns;
	parentNode: SVGElement;
}) {
	parentNode.innerHTML = '';

	const wins = findWins(columns);

	for (const win of wins) {
		const node = createWinNode(win);
		parentNode.appendChild(node);
	}
}

export function toWinId(win: Win) {
	return `win-${win.map((pos) => `${pos.x}-${pos.y}`).join('-')}`;
}

export function createWinNode(win: Win) {
	const westMost = win[0];
	const eastMost = win[win.length - 1]!;
	const theta = angleBetween(westMost, eastMost);
	const originX = (westMost.x + 0.5) * N;
	const originY = (westMost.y + 0.5) * N;
	const width = (distance(westMost, eastMost) + 1) * N;

	const winNode = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'rect',
	);
	winNode.setAttribute('id', toWinId(win));
	winNode.setAttribute('x', `${westMost.x * N}`);
	winNode.setAttribute('y', `${westMost.y * N}`);
	winNode.setAttribute('width', `${width}`);
	winNode.setAttribute('height', `${N}`);
	winNode.setAttribute('rx', `${N / 2}`);
	winNode.setAttribute('stroke', '#fff');
	winNode.setAttribute('fill', 'transparent');
	winNode.setAttribute('stroke-width', `${N / 8}`);
	winNode.classList.add('pointer-events-none');
	winNode.setAttribute(
		'transform',
		`rotate(${theta} ${originX} ${originY})`,
	);
	return winNode;
}

export async function enterWin({
	win,
	parentNode,
}: {
	win: Win;
	parentNode: SVGElement;
}) {
	const node = createWinNode(win);
	parentNode.appendChild(node);

	const length = node.getTotalLength();
	node.style.strokeDasharray = length.toString();
	node.style.strokeDashoffset = length.toString();
	node.style.stroke = '#fff';

	const animation = node.animate(
		[
			{
				strokeDashoffset: length,
			},
			{
				strokeDashoffset: 0,
			},
		],
		{
			duration: 500,
			easing: 'ease-in-out',
			fill: 'both',
		},
	);

	await animation.finished;
}

export async function exitWin({node}: {node: SVGRectElement}) {
	if (node.dataset['animating'] === 'true') {
		return;
	}

	node.dataset['animating'] = 'true';

	const length = node.getTotalLength();
	node.style.strokeDasharray = length.toString();
	node.style.strokeDashoffset = '0';

	const animation = node.animate(
		[
			{
				strokeDashoffset: 0,
			},
			{
				strokeDashoffset: length,
			},
		],
		{
			duration: 500,
			easing: 'ease-in-out',
			fill: 'both',
		},
	);

	await animation.finished;

	node.remove();
}
