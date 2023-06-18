import {
  RoomViewCtx,
  ViewGameHeaderEmpty,
  ViewUsersInRoomList,
} from "@gamezilla/shared/client";
import { gameNameList, gameNameToString, viewCoverArt } from "../game.shared";
import { ClientMsg } from "../room.shared";

export const ViewNotInGameScreen = ({
  ctx,
  $send,
}: {
  ctx: RoomViewCtx;
  $send: (m: ClientMsg) => void;
}) => {
  if (ctx.room.hostId !== ctx.currentUserId) {
    return (
      <>
        <ViewGameHeaderEmpty />
        <ViewUsersInRoomList ctx={ctx} />
      </>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <section className="flex flex-col gap-4 p-4">
        <p className="text-center text-3xl font-semibold">Games</p>
        <div className="grid grid-cols-3 justify-between gap-6">
          {gameNameList.map((gameName) => (
            <div key={gameName}>
              <button
                onClick={() => $send({ t: "input-game", gameName })}
                className="flex overflow-hidden rounded-lg">
                {viewCoverArt(gameName)}
              </button>

              <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
                {gameNameToString(gameName)}
              </p>
            </div>
          ))}
        </div>
      </section>
      {Object.values(ctx.room.users).length > 1 && (
        <ViewUsersInRoomList ctx={ctx} />
      )}
      <div>
        <div className="h-24 w-full"></div>
      </div>
    </div>
  );
};
