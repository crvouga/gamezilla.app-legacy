type ITicTacToePosition = {
  x: 0 | 1 | 2;
  y: 0 | 1 | 2;
};

type ITicTacToePlayer = "x" | "o";

type ITicTacToeEvent = {
  type: "ticTacToeGame:playerMoved";
  player: ITicTacToePlayer;
  position: ITicTacToePosition;
};

export type ITicTacToeGameSession = {
  gameSessionId: string;
  gameState: {
    gameStatId: string;
    events: ITicTacToeEvent[];
  };
};

export type ITicTacToeCommand = {
  type: "ticTacToeGame:movePlayer";
  player: ITicTacToePlayer;
  position: ITicTacToePosition;
};

const event0: ITicTacToeEvent[] = [{
  type: "ticTacToeGame:playerMoved",
  player: "x",
  position: {
    x: 1,
    y: 2,
  },
}];
