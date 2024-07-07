import { ModelCore } from "./battleship-play.types";

const View = (input: { modelCore: ModelCore }) => {
	return (
		<div>
			<h1>Play</h1>
			{input.modelCore.players.map((player) => player)}
		</div>
	);
};

export const BattleshipPlay = {
	View,
};
