import { UserId } from "@gamezilla/shared/app";
import { RoomViewCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  MyAvatar,
  MyButton,
  ViewNode,
  cn,
} from "@gamezilla/shared/ui";
import { ViewGameHeader } from "./view-game-header";

type IconProps = { className: string };

type PlayerProp = {
  label: string;
  userId: UserId | null;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
  renderIcon: (props: IconProps) => ViewNode;
};

export const VsUserSetupScreen = ({
  playerOne,
  playerTwo,
  ctx,
  title,
  renderCoverArt,
  onStartGame,
  onQuit,
}: {
  ctx: RoomViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => ViewNode;
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  onStartGame: () => void;
  onQuit: () => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

      <div className="flex items-center justify-center w-full py-6">
        <Player variant="player-one" player={playerOne} ctx={ctx} />

        <div className="h-full flex flex-col">
          <div className="flex-1 font-black text-3xl flex items-center justify-center">
            VS
          </div>
          <div className="flex-1"></div>
        </div>

        <Player variant="player-two" player={playerTwo} ctx={ctx} />
      </div>

      <div className="flex-1"></div>

      <div className="px-4">
        <p className="text-secondary">Settings</p>

        <p className="text-lg">Move Limit Count</p>
      </div>

      <div className="w-full p-4 pt-8 gap-4 flex items-center">
        <MyButton
          variant="contained"
          color="default"
          className="flex-1 gap-2"
          onClick={onQuit}>
          <IconArrowLeftOnRect />
          Quit
        </MyButton>

        <MyButton
          variant="contained"
          color="primary"
          className="flex-1"
          onClick={onStartGame}>
          Start Game
        </MyButton>
      </div>
    </div>
  );
};

const Player = ({
  player,
  ctx,
  variant,
}: {
  ctx: ViewCtx;
  player: PlayerProp;
  variant: "player-one" | "player-two";
}) => {
  return (
    <div className="flex-1 flex flex-col gap-6 p-4">
      <div className="grid grid-cols-2 w-full justify-center gap-4">
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-1",
            variant === "player-two" ? "order-last" : ""
          )}>
          <MyAvatar
            className="w-16 h-16"
            src={
              player.userId ? ctx.profiles[player.userId]?.avatarUrl : undefined
            }
            alt=""
          />
          <p className="text-sm text-secondary">
            {player.userId
              ? ctx.profiles[player.userId]?.username ?? "..."
              : "?"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          {player.renderIcon({ className: "w-16 h-16" })}

          <p className="text-sm text-secondary">{player.label}</p>
        </div>
      </div>

      <div className="w-full">
        {player.userId && (
          <MyButton
            className="w-full"
            variant="text"
            color="primary"
            onClick={player.onStopPlaying}>
            Stop Playing
          </MyButton>
        )}

        {!player.userId && (
          <MyButton
            className="w-full"
            variant="contained"
            color="primary"
            onClick={player.onStartPlaying}>
            Start Playing
          </MyButton>
        )}
      </div>
    </div>
  );
};
