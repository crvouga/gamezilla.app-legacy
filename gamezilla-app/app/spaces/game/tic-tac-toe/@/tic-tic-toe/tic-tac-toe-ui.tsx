import {
	Empty,
	MAX_X,
	MAX_Y,
	type Model,
	type PlayerType,
	type Position,
	type Slot,
	allPositions,
	toSlot,
	toWins,
} from "./tic-tac-toe";

export const gameTheme = {
	background: "#14BDAC",
	line: "#0DA192",
	cross: "#545454",
	naught: "#F2EBD3",
	text: "#fff",
};

const scale = 1_000;

export const ViewBoard = ({
	board,
	onClick,
}: {
	board: Model;
	onClick: (position: Position) => void;
}) => {
	return (
		<svg
			width={"100%"}
			viewBox={[0, 0, MAX_X * scale, MAX_Y * scale].join(" ")}
		>
			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill={gameTheme.background}
			/>
			<g>
				{lines.map((line, index) => (
					<line
						key={index}
						x1={line.x1 * scale}
						y1={line.y1 * scale}
						x2={line.x2 * scale}
						y2={line.y2 * scale}
						stroke={gameTheme.line}
						strokeWidth={0.1 * scale}
					/>
				))}
			</g>

			{board.flatMap((slots, x) =>
				slots.flatMap((slot, y) => {
					const key = [x, y, slot].join(" ");
					const cx = x * scale + scale / 2;
					const cy = y * scale + scale / 2;
					const r = 0.28 * scale;
					const strokeWidth = 0.1 * scale;

					if (slot === "O") {
						return (
							<circle
								r={r}
								cx={cx}
								cy={cy}
								stroke={gameTheme.naught}
								strokeWidth={strokeWidth}
								fill="transparent"
							/>
						);
					}

					if (slot === "X") {
						return (
							<g strokeWidth={strokeWidth} stroke={gameTheme.cross}>
								{/* direction: \ */}
								<line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
								{/* direction: / */}
								<line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
							</g>
						);
					}

					return <g key={key}></g>;
				}),
			)}

			<ViewWins board={board} />

			{allPositions.map((position) => (
				<rect
					key={[position.column, position.row, toSlot(board, position)].join(
						" ",
					)}
					className="cursor-pointer"
					x={Number(position.column) * scale}
					y={Number(position.row) * scale}
					width={1 * scale}
					height={1 * scale}
					onClick={() => onClick(position)}
					fill="transparent"
				/>
			))}
		</svg>
	);
};

const strokeWidth = 0.1 * scale;
const ViewWins = (props: { board: Model }) => {
	const wins = toWins(props.board);

	return (
		<g>
			{[...wins.X, ...wins.O].map((winningGroup) => {
				const key = winningGroup
					.map((position) => `${position.column}-${position.row}`)
					.join(",");

				const leftMost = winningGroup[0];
				const rightMost = winningGroup[winningGroup.length - 1] ?? leftMost;

				return (
					<line
						key={key}
						x1={(leftMost.column + 1 / 2) * scale}
						y1={(leftMost.row + 1 / 2) * scale}
						x2={(rightMost.column + 1 / 2) * scale}
						y2={(rightMost.row + 1 / 2) * scale}
						strokeWidth={strokeWidth}
						stroke={gameTheme.cross}
					></line>
				);
			})}
		</g>
	);
};

const DRAW_DURATION = 100;
const UNDRAW_DURATION = DRAW_DURATION;

export function drawNaught(node: HTMLElement) {
	if (!(node instanceof SVGCircleElement)) {
		return;
	}
	draw(node, { duration: DRAW_DURATION });
}

export function undrawNaught(node: HTMLElement) {
	if (!(node instanceof SVGCircleElement)) {
		return;
	}
	undraw(node, { duration: UNDRAW_DURATION });
}

export function drawCross(node: HTMLElement) {
	if (!(node instanceof SVGElement)) {
		return;
	}
	const lines = node.querySelectorAll("line");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line) {
			continue;
		}
		draw(line, { duration: DRAW_DURATION });
	}
}

export function undrawCross(node: HTMLElement) {
	if (!(node instanceof SVGElement)) {
		return;
	}
	const lines = node.querySelectorAll("line");
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line) {
			continue;
		}
		undraw(line, { duration: UNDRAW_DURATION });
	}
}

type AnimationOptions = { delay?: number; duration?: number };

export function onEnterWin(node: HTMLElement) {
	if (!(node instanceof SVGLineElement)) {
		return;
	}
	draw(node, {
		duration: 200,
		delay: 300,
	});
}

export function onExitWin(node: HTMLElement) {
	if (!(node instanceof SVGLineElement)) {
		return;
	}
	undraw(node, {
		duration: UNDRAW_DURATION,
	});
}

function draw(
	node: SVGCircleElement | SVGLineElement | SVGRectElement,
	option?: AnimationOptions,
) {
	const length = node.getTotalLength();
	node.style.strokeDasharray = length.toString();
	node.style.strokeDashoffset = length.toString();

	node.animate([{ strokeDashoffset: length }, { strokeDashoffset: 0 }], {
		easing: "ease-in-out",
		fill: "both",
		duration: option?.duration ?? 1000,
		delay: option?.delay ?? 0,
	});
}

function undraw(
	node: SVGCircleElement | SVGLineElement | SVGRectElement,
	option?: AnimationOptions,
) {
	const length = node.getTotalLength();
	node.style.strokeDasharray = length.toString();
	node.style.strokeDashoffset = "0";

	node.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: length }], {
		easing: "ease-in-out",
		fill: "both",
		duration: option?.duration ?? 1000,
		delay: option?.delay ?? 0,
	});
}

export function removeWhenDone(node: HTMLElement) {
	node.addEventListener("transitionend", () => {
		node.remove();
	});
}

const lines = [
	{ x1: 1, y1: 0, x2: 1, y2: 3 },
	{ x1: 2, y1: 0, x2: 2, y2: 3 },
	{ x1: 0, y1: 1, x2: 3, y2: 1 },
	{ x1: 0, y1: 2, x2: 3, y2: 2 },
];

export const ViewSlot = ({
	slot,
	cx,
	cy,
	r,
	color,
	strokeWidth,
}: {
	color?: string;
	strokeWidth?: number;
	slot: Slot;
	r: number;
	cx: number;
	cy: number;
}) => {
	switch (slot) {
		case Empty:
			return <g></g>;

		case "O":
			return (
				<Naught strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
			);

		case "X":
			return (
				<Cross strokeWidth={strokeWidth} color={color} r={r} cx={cx} cy={cy} />
			);
	}
};

const Cross = ({
	cx,
	cy,
	r,
	color = gameTheme.cross,
	strokeWidth = 0.1,
}: {
	color?: string;
	r: number;
	cx: number;
	cy: number;
	strokeWidth?: number;
}) => {
	return (
		<g strokeWidth={strokeWidth} stroke={color}>
			{/* direction: \ */}
			<line x1={cx - r} y1={cy - r} x2={cx + r} y2={cy + r} />
			{/* direction: / */}
			<line x1={cx + r} y1={cy - r} x2={cx - r} y2={cy + r} />
		</g>
	);
};

const Naught = ({
	cx,
	cy,
	r,
	color = gameTheme.naught,
	strokeWidth = 0.1,
}: {
	color?: string;
	strokeWidth?: number;
	r: number;
	cx: number;
	cy: number;
}) => {
	return (
		<circle
			r={r}
			cx={cx}
			cy={cy}
			stroke={color}
			strokeWidth={strokeWidth}
			fill="transparent"
		/>
	);
};

export const PlayerTypeIcon = ({
	playerType,
	className,
}: {
	playerType: PlayerType;
	className?: string;
}) => {
	return (
		<svg viewBox="-1 -1 2 2" fill="currentColor" className={className}>
			<ViewSlot
				key={playerType}
				cx={0}
				cy={0}
				slot={playerType}
				r={2 / 3}
				color="currentColor"
				strokeWidth={0.33}
			/>
		</svg>
	);
};

export const CoverArt = (props: { className?: string }) => {
	const positions: [Position, Slot][] = [
		[{ row: 0, column: 0 }, "X"],
		[{ row: 0, column: 1 }, Empty],
		[{ row: 1, column: 0 }, Empty],
		[{ row: 1, column: 1 }, "O"],
	];

	const LINES = [
		{ x1: 1, y1: 0, x2: 1, y2: 3 },
		{ x1: 0, y1: 1, x2: 3, y2: 1 },
	] as const;

	return (
		<svg width="100%" viewBox="0 0 2 2" {...props}>
			<rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

			{LINES.map((line, index) => (
				<line key={index} {...line} stroke={gameTheme.line} strokeWidth={0.1} />
			))}

			{positions.map(([{ column, row }, slot], index) => (
				<ViewSlot
					key={index}
					slot={slot}
					cx={Number(column) + 0.5}
					cy={Number(row) + 0.5}
					r={0.3}
				/>
			))}
		</svg>
	);
};
