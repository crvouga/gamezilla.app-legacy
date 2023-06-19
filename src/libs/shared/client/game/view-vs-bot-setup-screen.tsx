import { UserId } from "@gamezilla/shared/app";
import {
  IconArrowLeftOnRect,
  IconRobot,
  MyAvatar,
  MyButton,
  VDom,
} from "@gamezilla/shared/ui";
import { ViewGameHeader } from "./view-game-header";
import { RoomViewCtx } from ".";

export const VsBotSetupScreen = ({
  title,
  renderCoverArt,
  onQuit,
  playerOne,
  playerTwo,
  ctx,
}: {
  ctx: RoomViewCtx;
  botName: string;
  userId: UserId | null;

  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  title: string;
  renderCoverArt: (props: { className: string }) => VDom;
  onQuit: () => void;
}) => {
  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <ViewGameHeader renderCoverArt={renderCoverArt} title={title} />

      <div className="p-4">
        <div className=" grid w-full grid-cols-7">
          <PlayerIcons player={playerOne} ctx={ctx} />
          <div className="col-span-1">
            <p className="text-4xl font-bold">vs</p>
          </div>
          <PlayerIcons player={playerTwo} ctx={ctx} />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center"></div>

      {ctx.currentUserId === ctx.hostId && (
        <div className="border-t border-neutral-700 p-4">
          <MyButton className="w-full" onClick={onQuit}>
            <IconArrowLeftOnRect />
            Quit
          </MyButton>
        </div>
      )}
    </div>
  );
};

type BasePlayerProp = {
  renderIcon: (props: { className: string }) => VDom;
};

type PlayerProp = BasePlayerProp &
  (
    | {
        type: "user";
        userId: UserId;
      }
    | {
        type: "bot";
        label: string;
      }
  );

const PlayerIcons = ({
  player,
  ctx,
}: {
  ctx: RoomViewCtx;
  player: PlayerProp;
}) => {
  return (
    <div className="col-span-3 grid grid-cols-2 place-items-center">
      {player.type === "bot" ? (
        <IconRobot className="h-14 w-14" />
      ) : (
        <MyAvatar
          className="h-14 w-14"
          src={ctx.profiles[player.userId]?.avatarUrl}
        />
      )}

      {player.renderIcon({ className: "w-14 h-14" })}
    </div>
  );
};
