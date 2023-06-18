import {
  RoomViewCtx,
  ViewGameHeader,
  ViewGameHeaderEmpty,
  ViewUsersInRoomList,
} from "@gamezilla/shared/client";
import { MyButton, TopBar, TopBarBackButton } from "@gamezilla/shared/ui";
import { gameNameToString, viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg } from "../room.shared";

export const ViewRoomJoinScreen = ({
  model,
  ctx,
  $send,
}: {
  ctx: RoomViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  const host = ctx.profiles[ctx.room.hostId];
  const game = model.games[ctx.room.roomId];

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: "room", c: { t: "room-list" } })}
          />
        }
        title={host?.username ? `${host.username}'s space` : "..."}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-auto">
        {game ? (
          <ViewGameHeader
            title={gameNameToString(game.t)}
            renderCoverArt={(props) => (
              <div {...props}>{viewCoverArt(game.t)}</div>
            )}
          />
        ) : (
          <ViewGameHeaderEmpty />
        )}

        <ViewUsersInRoomList ctx={ctx} />
      </div>

      <div className="flex p-4">
        <MyButton
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            $send({
              t: "join",
              userId: ctx.currentUserId,
              roomId: ctx.room.roomId,
            });
          }}>
          Join space
        </MyButton>
      </div>
    </div>
  );
};
