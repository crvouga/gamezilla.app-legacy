import { ViewCtx } from "gamezilla/app/@SHARED/client";
import { UserId } from "gamezilla/app/@SHARED/data";
import {
  Button,
  IconQuestionMark,
  MyAvatar,
  VDom,
} from "gamezilla/app/@SHARED/ui";

type IconProps = { className: string };

type PlayerProp = {
  playerType:
    | { t: "human"; userId: UserId }
    | { t: "bot"; label: string }
    | { t: null };

  onStartPlaying: () => void;
  onStopPlaying: () => void;
  renderIcon: (props: IconProps) => VDom;
};

export const ViewVersusSection = ({
  playerOne,
  playerTwo,
  ctx,
}: {
  playerOne: PlayerProp;
  playerTwo: PlayerProp;
  ctx: ViewCtx;
}) => {
  return (
    <div className="flex w-full flex-col gap-2 p-4">
      <div className="grid w-full grid-cols-7">
        <PlayerIcons player={playerOne} ctx={ctx} />

        <div className="col-span-1">
          <p className=" flex h-full flex-1 flex-col items-center justify-center  text-3xl font-black">
            VS
          </p>
        </div>

        <PlayerIcons player={playerTwo} ctx={ctx} />
      </div>

      <div className="grid w-full grid-cols-7">
        <PlayerLabels player={playerOne} ctx={ctx} />

        <div className="col-span-1"></div>

        <PlayerLabels player={playerTwo} ctx={ctx} />
      </div>

      <div className="mt-2 grid w-full grid-cols-7">
        <PlayerButtons player={playerOne} ctx={ctx} />

        <div className="col-span-1"></div>

        <PlayerButtons player={playerTwo} ctx={ctx} />
      </div>
    </div>
  );
};

const PlayerButtons = ({
  player,
  ctx,
}: {
  ctx: ViewCtx;
  player: PlayerProp;
}) => {
  return (
    <div className="col-span-3 w-full">
      {player.playerType.t === "human" &&
        player.playerType.userId &&
        player.playerType.userId === ctx.currentUserId && (
          <Button
            key="toggle-play-button"
            className="w-full"
            variant="text"
            color="primary"
            onClick={player.onStopPlaying}
            text="Stop Playing"
          />
        )}

      {player.playerType.t === "human" && player.playerType.userId && (
        <Button
          key="toggle-play-button"
          className="w-full"
          variant="contained"
          color="primary"
          onClick={player.onStartPlaying}
          text="Start Playing"
        />
      )}
    </div>
  );
};

const PlayerIcons = ({ player, ctx }: { ctx: ViewCtx; player: PlayerProp }) => {
  return (
    <div
      className="col-span-3 grid w-full cursor-pointer grid-cols-2 place-items-center text-center"
      onClick={
        player.playerType.t === "human" &&
        player.playerType.userId &&
        player.playerType.userId === ctx.currentUserId
          ? player.onStopPlaying
          : player.onStartPlaying
      }>
      {player.playerType.t === "human" && player.playerType.userId ? (
        <MyAvatar
          className="h-14 w-14"
          src={ctx.profiles[player.playerType.userId]?.avatarUrl}
          alt=""
        />
      ) : (
        <div
          role="button"
          className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-neutral-600">
          <IconQuestionMark className="h-10 w-10 text-neutral-300" />
        </div>
      )}

      {player.renderIcon({ className: "h-14 w-14" })}
    </div>
  );
};

const PlayerLabels = ({
  player,
  ctx,
}: {
  ctx: ViewCtx;
  player: PlayerProp;
}) => {
  return (
    <div className="col-span-3 grid w-full grid-cols-2 place-items-center text-center text-sm text-secondary">
      <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-xs">
        {player.playerType.t === "human" && player.playerType.userId
          ? ctx.profiles[player.playerType.userId]?.username ?? "..."
          : "?"}
      </p>

      {/* <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-center">
        {}
      </p> */}
    </div>
  );
};
