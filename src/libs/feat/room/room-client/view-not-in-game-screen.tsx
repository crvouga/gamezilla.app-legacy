import { Ctx, Profile, ViewCtx } from "@gamezilla/shared/client";
import { UserId } from "@gamezilla/shared/app";
import { ClientModel, ClientMsg, ClientRoom, RoomUser } from "../room.shared";
import { viewCoverArt, gameNameList, gameNameToString } from "../game.shared";

import { IconCrown, MyAvatar } from "@gamezilla/shared/ui";

export const ViewNotInGameScreen = ({
  room,
  ctx,
  model,
  $send,
}: {
  model: ClientModel;
  room: ClientRoom;
  ctx: ViewCtx;
  $send: (m: ClientMsg) => void;
}) => {
  if (room.hostId !== ctx.currentUserId) {
    const profiles = toProfilesByRoomId({
      model,
      roomId: room.roomId,
      ctx,
    });
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-8">
        {/* <div className="flex flex-col gap-2">
          <MyAvatar
            className="h-24 w-24"
            src={ctx.profiles[room.hostId]?.avatarUrl}
            alt="..."
          />
          <div className="flex items-center gap-1">
            <p>{`${ctx.profiles[room.hostId]?.username ?? "..."}`}</p>
            <div className="rounded-xl bg-neutral-700 px-2 py-1 text-xs">
              Host
            </div>
          </div>
        </div> */}

        <section className="flex w-full flex-col gap-2">
          <p className="px-4 text-left text-2xl font-semibold">People</p>
          <ul className="w-full">
            {Array.from(profiles).map((profile) => {
              return (
                <li
                  key={profile.userId}
                  className="flex w-full items-center gap-2 p-4">
                  <MyAvatar src={profile.avatarUrl} />
                  <p>{profile.username}</p>
                  {profile.userId === room.hostId && (
                    <div className="flex items-center gap-1 rounded-xl bg-neutral-700 px-2 py-1 text-xs">
                      <IconCrown className="h-4 w-4" />
                      Host
                    </div>
                  )}
                  {profile.userId === ctx.currentUserId && (
                    <div className="rounded-xl bg-neutral-700 px-2 py-1 text-xs">
                      You
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-6 p-4 py-6">
      {gameNameList.map((gameName) => (
        <div key={gameName}>
          <div className="px-2">
            <button
              onClick={() => $send({ t: "input-game", gameName })}
              className="focus:ring-primary flex overflow-hidden rounded-lg focus:outline-none focus:ring">
              {viewCoverArt(gameName)}
            </button>
          </div>
          <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm">
            {gameNameToString(gameName)}
          </p>
        </div>
      ))}
    </div>
  );
};

const toProfilesByRoomId = function* ({
  roomId,
  model,
  ctx,
}: {
  roomId: string;
  model: ClientModel;
  ctx: Ctx;
}): Generator<Profile> {
  for (const user of toUsers({ model })) {
    if (user.roomId !== roomId) {
      continue;
    }

    const profile = ctx.profiles[user.userId];

    if (!profile) {
      continue;
    }

    yield profile;
  }
};

const toUsers = function* ({
  model,
}: {
  model: ClientModel;
}): Generator<RoomUser> {
  for (const userId in model.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const user = model.users[userId];

    if (!user) {
      continue;
    }

    yield user;
  }
};
