import { RoomId, UserId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import {
  MyAvatar,
  MyButton,
  TopBar,
  TopBarBackButton,
} from "@gamezilla/shared/ui";
import { gameNameToString, viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg, toRoomUsers } from "../room.shared";

export const ViewRoomJoinScreen = ({
  model,
  ctx,
  room,
  $send,
}: {
  room: { roomId: RoomId; hostId: UserId };
  ctx: ViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  const usersInRoom = toRoomUsers(room.roomId, model);
  const host = ctx.profiles[room.hostId];

  const game = model.games[room.roomId];

  return (
    <div className="w-full h-full flex flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: "room", c: { t: "room-list" } })}
          />
        }
        title={host?.username ? `${host.username}'s room` : "..."}
      />

      {game && (
        <div className="flex items-center justify-center w-full flex-col gap-2">
          <div className="w-24 h-24 flex items-center justify-center rounded-lg overflow-hidden">
            {viewCoverArt(game.t)}
          </div>

          <p className="text-md font-semibold">{gameNameToString(game.t)}</p>
        </div>
      )}

      <div className="flex items-center justify-center w-full flex-col gap-2">
        <MyAvatar className="w-24 h-24" src={host?.avatarUrl} alt="..." />
        <div className="flex items-center gap-1">
          <p>{`${host?.username ?? "..."}`}</p>
          <div className="rounded-xl bg-neutral-700 py-1 px-2">Host</div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <p className="text-lg font-semibold">{usersInRoom.length} players</p>
      </div>

      <div className="flex-1"></div>

      <div className="flex p-4">
        <MyButton
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            $send({
              t: "join",
              userId: ctx.currentUserId,
              roomId: room.roomId,
            });
          }}>
          Join Room
        </MyButton>
      </div>
    </div>
  );
};
