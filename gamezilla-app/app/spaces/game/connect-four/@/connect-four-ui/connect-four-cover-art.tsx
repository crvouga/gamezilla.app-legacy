import { Uuid } from "gamezilla-app/@/core";
import { COLUMN_COUNT, MAX_COLUMN_HEIGHT } from "../connect-four";
import { gameTheme } from "./shared";

const coverArtId = Uuid.generate();

export const CoverArt = (props: { className?: string }) => {
	const ids = {
		playerOneGradient: `playerOneGradient${coverArtId}`,
		playerTwoGradient: `playerTwoGradient${coverArtId}`,
		holePattern: `holePattern${coverArtId}`,
		columnGradient: `columnGradient${coverArtId}`,
		holeMask: `holeMask${coverArtId}`,
	};

	const playerOneFill = `url(#${ids.playerOneGradient})`;
	const playerTwoFill = `url(#${ids.playerTwoGradient})`;

	return (
		<svg width="100%" viewBox="0 0 2 2" {...props}>
			<defs>
				<pattern
					id={ids.holePattern}
					patternUnits="userSpaceOnUse"
					width={1}
					height={1}
				>
					<circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
				</pattern>

				<mask id={ids.holeMask}>
					<rect
						x={0}
						y={0}
						width={COLUMN_COUNT}
						height={MAX_COLUMN_HEIGHT}
						fill="white"
					></rect>
					<rect
						x={0}
						y={0}
						width={COLUMN_COUNT}
						height={MAX_COLUMN_HEIGHT}
						fill={`url(#${ids.holePattern})`}
					></rect>
				</mask>

				<linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
					<stop offset="0%" stopColor={gameTheme.primary.light} />
					<stop offset="100%" stopColor={gameTheme.primary.dark} />
				</linearGradient>

				<linearGradient
					id={ids.playerOneGradient}
					gradientTransform="rotate(90)"
				>
					<stop offset="0%" stopColor={gameTheme["player-one"].light} />
					<stop offset="100%" stopColor={gameTheme["player-one"].dark} />
				</linearGradient>

				<linearGradient
					id={ids.playerTwoGradient}
					gradientTransform="rotate(90)"
				>
					<stop offset="0%" stopColor={gameTheme["player-two"].light} />
					<stop offset="100%" stopColor={gameTheme["player-two"].dark} />
				</linearGradient>
			</defs>

			<rect x={0} y={0} width={2} height={2} fill={gameTheme.primary.darker} />

			<circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

			<circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

			<circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

			<circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

			<rect
				x={0}
				y={0}
				width={COLUMN_COUNT}
				height={MAX_COLUMN_HEIGHT}
				fill={`url(#${ids.columnGradient})`}
				mask={`url(#${ids.holeMask})`}
			/>
		</svg>
	);
};
