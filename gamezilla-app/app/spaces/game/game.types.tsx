import { p } from "gamezilla-app/@/core/parser";
import * as ConnectFour from "./connect-four/connect-four.types";
import * as Flow from "./flow/flow.types";
//
//
//
// Model
//
//
//

export type ModelClient =
	| { t: "connect-four"; c: ConnectFour.ModelClient }
	| { t: "flow"; c: Flow.ModelClient };

export const ModelServer = p.or(
	p.obj({
		t: p.l("connect-four"),
		c: ConnectFour.ModelServer,
	}),
	p.obj({
		t: p.l("flow"),
		c: Flow.ModelServer,
	}),
);
export type ModelServer = p.Infer<typeof ModelServer>;

//
//
//
// Msg
//
//
//

export type MsgServer =
	| { t: "connect-four"; c: ConnectFour.MsgServer }
	| { t: "flow"; c: Flow.MsgServer };

export type MsgClient =
	| { t: "connect-four"; c: ConnectFour.MsgClient }
	| { t: "flow"; c: Flow.MsgClient };

export type MsgToClient =
	| { t: "connect-four"; c: ConnectFour.MsgToClient }
	| { t: "flow"; c: Flow.MsgToClient };

export type MsgToServer =
	| { t: "connect-four"; c: ConnectFour.MsgToServer }
	| { t: "flow"; c: Flow.MsgToServer };

//
//
//
// Game Name
//
//
//

export const GAME_NAME = ["connect-four", "flow"] as const;

export const GameName = p.enumeration(GAME_NAME);

export type GameName = p.Infer<typeof GameName>;

export const gameNames: { [gameName in GameName]: GameName } = {
	"connect-four": "connect-four",
	flow: "flow",
};

export const isGameName = (x: unknown): x is GameName => {
	return typeof x === "string" && Object.keys(gameNames).includes(x);
};

export const gameNameList: GameName[] = [
	// "connect-four",
	"flow",
];

export const gameNameToString = (gameName: GameName): string => {
	switch (gameName) {
		case "connect-four": {
			return "Connect Four";
		}

		case "flow": {
			return "Flow";
		}
	}
};

export type ModelCore =
	| {
			t: "connect-four";
			c: ConnectFour.ModelCore;
	  }
	| {
			t: "flow";
			c: Flow.ModelCore;
	  };

export const ModelCore = p.custom(
	(_x: unknown): _x is ModelCore => true,
	"Invalid model sync",
);

export type MsgCore =
	| { t: "connect-four"; c: ConnectFour.MsgCore }
	| { t: "flow"; c: Flow.MsgCore };

export const MsgCore = p.custom(
	(_x: unknown): _x is MsgCore => true,
	"Invalid msg sync",
);
