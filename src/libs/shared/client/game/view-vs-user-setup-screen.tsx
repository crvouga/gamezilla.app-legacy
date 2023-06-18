import { UserId } from "@gamezilla/shared/app";
import { RoomViewCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  IconQuestionMark,
  MyAvatar,
  MyButton,
  VDom,
  cn,
} from "@gamezilla/shared/ui";
import { ViewGameHeader } from "./view-game-header";

type IconProps = { className: string };

type PlayerProp = {
  label: string;
  userId: UserId | null;
  onStartPlaying: () => void;
  onStopPlaying: () => void;
  renderIcon: (props: IconProps) => VDom;
};

const VersusSection = ({
  playerOne,
  playerTwo,
  ctx,
}: {
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  ctx: ViewCtx;
}) => {
  return (
    <div className="flex w-full items-center justify-center">
      <Player player={playerOne} ctx={ctx} />

      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center text-3xl font-black">
          VS
        </div>
        <div className="flex-1"></div>
      </div>

      <Player player={playerTwo} ctx={ctx} />
    </div>
  );
};

export const VsUserSetup = {
  VersusSection,
};

const Player = ({ player, ctx }: { ctx: ViewCtx; player: PlayerProp }) => {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div
        className="grid w-full grid-cols-2 justify-center gap-4"
        onClick={player.onStartPlaying}>
        <div className={cn("flex flex-col items-center justify-center gap-2")}>
          {player.userId ? (
            <MyAvatar
              className="h-16 w-16 flex-shrink-0"
              src={ctx.profiles[player.userId]?.avatarUrl}
              alt=""
            />
          ) : (
            <div
              role="button"
              className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-neutral-600">
              <IconQuestionMark className="h-10 w-10 text-neutral-300" />
            </div>
          )}

          <p className="text-sm text-secondary">
            {player.userId
              ? ctx.profiles[player.userId]?.username ?? "..."
              : "?"}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          {player.renderIcon({ className: "w-16 h-16" })}

          <p className="text-sm text-secondary">{player.label}</p>
        </div>
      </div>

      <div className="h-12 w-full">
        {player.userId && player.userId === ctx.currentUserId && (
          <MyButton
            size="sm"
            className="w-full"
            variant="text"
            color="primary"
            onClick={player.onStopPlaying}>
            Stop Playing
          </MyButton>
        )}

        {!player.userId && (
          <MyButton
            size="sm"
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

export const VsUserSetupScreen = ({
  playerOne,
  playerTwo,
  ctx,
  title,
  renderCoverArt,
  onStartGame,
  onQuit,
  canStartGame = Boolean(playerOne.userId && playerTwo.userId),
}: {
  ctx: RoomViewCtx;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  onStartGame: () => void;
  onQuit: () => void;
  canStartGame?: boolean;
}) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewGameHeader title={title} renderCoverArt={renderCoverArt} />

      <VersusSection playerOne={playerOne} playerTwo={playerTwo} ctx={ctx} />

      <div className="flex-1"></div>

      {ctx.currentUserId === ctx.hostId && (
        <div className="flex w-full items-center gap-4 p-4 pt-8">
          <MyButton
            variant="contained"
            color="default"
            className="flex-1 gap-2"
            onClick={onQuit}>
            <IconArrowLeftOnRect />
            Quit
          </MyButton>

          <MyButton
            disabled={!canStartGame}
            variant="contained"
            color="primary"
            className="flex-1"
            onClick={onStartGame}>
            Start Game
          </MyButton>
        </div>
      )}
    </div>
  );
};
