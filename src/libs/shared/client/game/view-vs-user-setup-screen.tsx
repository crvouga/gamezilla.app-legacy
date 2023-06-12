import { UserId } from "@gamezilla/shared/app";
import { RoomViewCtx, ViewCtx } from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  IconQuestionMark,
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
    <div className="flex items-center justify-center w-full py-6">
      <Player player={playerOne} ctx={ctx} />

      <div className="h-full flex flex-col">
        <div className="flex-1 font-black text-3xl flex items-center justify-center">
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
    <div className="flex-1 flex flex-col gap-6 p-4">
      <div className="grid grid-cols-2 w-full justify-center gap-4">
        <div className="flex flex-col items-center justify-center gap-2">
          {player.renderIcon({ className: "w-16 h-16" })}

          <p className="text-sm text-secondary">{player.label}</p>
        </div>

        <div className={cn("flex flex-col items-center justify-center gap-2")}>
          {player.userId ? (
            <MyAvatar
              className="w-16 h-16"
              src={ctx.profiles[player.userId]?.avatarUrl}
              alt=""
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-600 overflow-hidden grid place-items-center">
              <IconQuestionMark className="w-10 h-10 text-neutral-300" />
            </div>
          )}
          <p className="text-sm text-secondary">
            {player.userId
              ? ctx.profiles[player.userId]?.username ?? "..."
              : "?"}
          </p>
        </div>
      </div>

      <div className="w-full h-12">
        {player.userId && player.userId === ctx.currentUserId && (
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

      <VersusSection playerOne={playerOne} playerTwo={playerTwo} ctx={ctx} />

      <div className="flex-1"></div>

      {ctx.currentUserId === ctx.hostId && (
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
      )}
    </div>
  );
};
