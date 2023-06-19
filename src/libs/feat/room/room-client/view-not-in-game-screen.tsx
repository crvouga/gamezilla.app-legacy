import {
  RoomViewCtx,
  ViewGameHeaderEmpty,
  ViewUsersInRoomList,
} from "@gamezilla/shared/client";
import { gameNameList, gameNameToString, viewCoverArt } from "../game.shared";
import { ClientMsg } from "../room.shared";
import { Text } from "@gamezilla/shared/ui";

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
        <Text variant="h3" className="text-center">
          Games
        </Text>
        <div className="grid grid-cols-3 justify-between gap-6">
          {gameNameList.map((gameName) => (
            <div key={gameName}>
              <button
                onClick={() => $send({ t: "input-game", gameName })}
                className="flex overflow-hidden rounded-lg">
                {viewCoverArt(gameName)}
              </button>

              <Text
                variant="body-sm"
                className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center font-semibold">
                {gameNameToString(gameName)}
              </Text>
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
