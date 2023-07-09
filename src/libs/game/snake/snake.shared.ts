import { Keyboard, Option, Result } from "@gamezilla/shared/core";
import { UserId } from "@gamezilla/shared/app";
import * as Direction from "./direction";
import * as Snake from "./snake";

//
//
//
// Model
//
//
//

export type ServerModel = SharedModel;

export type ClientModel = SharedModel & {
  openedMenuId: Option<string>;
};

export type SharedModel = Snake.Model & {
  gameStatus:
    | {
        type: "GameSetup";
        player: Option<Player>;
      }
    | {
        type: "GameStarted";
        player: Player;
      };
};

export type Player = ["User", UserId];

export type MouseStatus = "Active" | "Inactive";

//
//
// Init
//
//

export const initSharedModel: SharedModel = {
  ...Snake.init,
  gameStatus: {
    type: "GameSetup",
    player: Option.None,
  },
};

//
//
//
// Msg
//
//
//

export type ClientMsg =
  | ["PressedKeyDown", Keyboard.Key]
  | ["OpenedMenu", string]
  | ["ClosedMenu"]
  | Request;

export type ServerMsg = ["tick"];

export type ToServer = Request;

export type ToClient = ["tick", SharedModel] | Response;

export type Request = ToggleStatus | InputPlayer | InputDirection | StartGame;

export type Response =
  | InputDirection_Done
  | ToggleStatus_Done
  | InputPlayer_Done
  | StartGame_Done;

//
//
//

export type InputDirection = [
  "input-direction",
  { direction: Direction.Direction; userId: UserId }
];

export type InputDirection_Done = [
  "InputDirection_Done",
  Result<InputDirectionProblem, SharedModel>
];

export type InputDirectionProblem =
  | "user_must_be_the_current_player"
  | "must_be_in_game_started";

//
//
//

export type ToggleStatus = ["ToggleStatus", { userId: UserId }];

export type ToggleStatus_Done = ["ToggleStatus_Done", ToggleStatusResult];

export type ToggleStatusResult = Result<
  "user_must_be_the_current_player" | "must_be_in_game_started",
  SharedModel
>;

//
//
//
//

export type InputPlayer = ["InputPlayer", Option<Player>];

export type InputPlayer_Done = [
  "InputPlayer_Done",
  Result<"must_be_in_game_setup", SharedModel>
];

export type StartGame = ["start-game"];
export type StartGame_Done = [
  "StartGame_Done",
  Result<"must_be_in_game_setup" | "missing_player", SharedModel>
];

export const canStartGame = (model: SharedModel): boolean => {
  return (
    model.gameStatus.type === "GameSetup" &&
    model.gameStatus.player.type === "Some"
  );
};

export const startGame = (model: SharedModel): StartGame_Done[1] => {
  if (model.gameStatus.type !== "GameSetup") {
    return Result.Err("must_be_in_game_setup");
  }

  if (model.gameStatus.player.type === "none") {
    return Result.Err("missing_player");
  }

  const playerUserId = model.gameStatus.player.value[1];

  const modelNew: SharedModel = {
    ...model,
    gameStatus: {
      type: "GameStarted",
      player: ["User", playerUserId],
    },
  };

  return Result.Ok(modelNew);
};
