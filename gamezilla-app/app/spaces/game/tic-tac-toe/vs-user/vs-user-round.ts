import type * as TicTacToe from '../@/tic-tic-toe/tic-tac-toe';

export type Round =
	| {
			type: 'RoundStarting';
			countDown: number;
	  }
	| {
			type: 'RoundStarted';
			board: TicTacToe.Model;
			moveCountDown: number;
	  }
	| RoundOver;

type RoundOver = {
	type: 'RoundOver';
	roundOver: TicTacToe.GameOver;
	board: TicTacToe.Model;
	next: Round;
};

export const toCurrent = (round: Round): Round => {
	switch (round.type) {
		case 'RoundOver': {
			return toCurrent(round.next);
		}

		case 'RoundStarted': {
			return round;
		}

		case 'RoundStarting': {
			return round;
		}
	}
};

export const toPrevious = (round: Round): RoundOver | {type: 'none'} => {
	switch (round.type) {
		case 'RoundOver': {
			const next = round.next;

			switch (next.type) {
				case 'RoundOver': {
					return toPrevious(
						round.next,
					);
				}

				case 'RoundStarted': {
					return round;
				}

				case 'RoundStarting': {
					return round;
				}

				default: {
					return round;
				}
			}
		}

		case 'RoundStarted': {
			return {
				type: 'none',
			};
		}

		case 'RoundStarting': {
			return {
				type: 'none',
			};
		}
	}
};

export const toCurrentBoard = (round: Round): TicTacToe.Model | null => {
	switch (round.type) {
		case 'RoundStarting': {
			return null;
		}

		case 'RoundStarted': {
			return round.board;
		}

		case 'RoundOver': {
			const next = toCurrentBoard(
				round.next,
			);

			if (next) {
				return next;
			}

			return round.board;
		}
	}
};

export const toCount = (round: Round): number => {
	switch (round.type) {
		case 'RoundOver': {
			return 1 + toCount(round.next);
		}

		case 'RoundStarted': {
			return 1;
		}

		case 'RoundStarting': {
			return 1;
		}
	}
};

export const mapCurrent = (
	round: Round,
	updater: (current: Round) => Round,
): Round => {
	switch (round.type) {
		case 'RoundOver': {
			return {
				...round,
				next: mapCurrent(
					round.next,
					updater,
				),
			};
		}

		case 'RoundStarted': {
			return updater(round);
		}

		case 'RoundStarting': {
			return updater(round);
		}
	}
};

export type Score = {X: number; O: number; Tie: number};

export const toScore = (round: Round): Score => {
	switch (round.type) {
		case 'RoundOver': {
			const nextScore = toScore(
				round.next,
			);

			switch (round.roundOver.type) {
				case 'Tie': {
					return {
						...nextScore,
						Tie:
							nextScore.Tie +
							1,
					};
				}

				case 'Win': {
					return {
						...nextScore,
						[round
							.roundOver
							.winner]:
							nextScore[
								round
									.roundOver
									.winner
							] +
							1,
					};
				}

				default: {
					return nextScore;
				}
			}
		}

		case 'RoundStarting': {
			return {
				X: 0,
				O: 0,
				Tie: 0,
			};
		}

		case 'RoundStarted': {
			return {
				X: 0,
				O: 0,
				Tie: 0,
			};
		}
	}
};

export type GameOver =
	| {
			type: 'Winner';
			winner: TicTacToe.PlayerType;
	  }
	| {
			type: 'Tie';
	  };

export const toGameOver = ({
	maxRoundCount,
	round,
}: {
	maxRoundCount: number;
	round: Round;
}): GameOver | {type: 'none'} => {
	const score = toScore(round);
	const winCount = Math.floor((maxRoundCount + 1) / 2);

	if (score.X >= winCount) {
		return {
			type: 'Winner',
			winner: 'X',
		};
	}

	if (score.O >= winCount) {
		return {
			type: 'Winner',
			winner: 'O',
		};
	}

	if (score.Tie >= maxRoundCount) {
		return {type: 'Tie'};
	}

	// const roundCount = toCount(round)

	// if (roundCount >= maxRoundCount) {
	//   return { type: "Tie" }
	// }

	return {type: 'none'};
};
