import { VDom } from "@gamezilla/shared/ui";
import { PlayerType } from "./view-vs-bot";
import { SpaceViewCtx } from "../game-shared";
import { UserId } from "@gamezilla/shared/app";

type GameOver =
  | {
      t: "winner";
      winner: PlayerType;
    }
  | {
      t: "draw";
    };

export const VsBotGameOverOverlay = ({
  gameOver,
}: {
  ctx: SpaceViewCtx;
  gameOver: GameOver;
  human: {
    userId: UserId;
  };
  playerOne: {
    renderIcon: (props: { className: string }) => VDom;
  };
  playerTwo: {
    renderIcon: (props: { className: string }) => VDom;
  };
}) => {
  if (gameOver.t === "winner") {
    return <div></div>;
  }

  if (gameOver.t === "draw") {
    return <div></div>;
  }

  return (
    <div>
      <div className="w-full"></div>
    </div>
  );
};
