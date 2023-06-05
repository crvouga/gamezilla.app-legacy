import { UserId } from "@gamezilla/shared/app";
import { RoomViewCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  MyAvatar,
  MyButton,
  ViewNode,
  cn,
} from "@gamezilla/shared/ui";

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
      <div className="flex flex-col justify-center items-center w-full pt-4 gap-4">
        <p className="font-bold text-3xl">{title}</p>
        {renderCoverArt({ className: "w-24 h-24 overflow-hidden rounded-lg" })}
      </div>

      <div className="flex items-center justify-center w-full py-6">
        <Player variant="player-one" player={playerOne} ctx={ctx} />

        <div className="font-black text-3xl">VS</div>

        <Player variant="player-two" player={playerTwo} ctx={ctx} />
      </div>

      <div className="flex-1"></div>

      <div className="w-full p-4 gap-4 flex items-center">
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
      <div
        className={cn(
          "flex items-center w-full justify-center gap-4",
          variant === "player-one" ? "flex-row" : "flex-row-reverse"
        )}>
        <div className="flex flex-col items-center justify-center">
          <MyAvatar
            src={
              player.userId ? ctx.profiles[player.userId]?.avatarUrl : undefined
            }
            alt=""
          />
          <p>
            {player.userId
              ? ctx.profiles[player.userId]?.username ?? "..."
              : "?"}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {player.renderIcon({ className: "w-14 h-14" })}

          <p className="text-sm text-secondary">{player.label}</p>
        </div>
      </div>

      <div className="w-full">
        {player.userId && (
          <MyButton
            variant="text"
            color="primary"
            onClick={player.onStopPlaying}>
            Stop Playing
          </MyButton>
        )}

        {!player.userId && (
          <MyButton
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
