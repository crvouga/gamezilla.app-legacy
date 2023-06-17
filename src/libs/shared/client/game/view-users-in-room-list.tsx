import { UserId } from "@gamezilla/shared/app";
import { Profile, RoomViewCtx } from "@gamezilla/shared/client";
import { IconCrown, MyAvatar } from "@gamezilla/shared/ui";

export const ViewUsersInRoomList = ({ ctx }: { ctx: RoomViewCtx }) => {
  const profiles = toProfilesByRoomId({ ctx });
  return (
    <section className="w-full">
      <p className="px-4 text-3xl font-semibold">People</p>

      <div className="w-full">
        {Array.from(profiles).map((profile) => {
          return (
            <button
              key={profile.userId}
              className="flex w-full items-center gap-2 p-4 active:opacity-60">
              <MyAvatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.hostId && (
                <div className="flex items-center gap-1 rounded-xl bg-neutral-700 px-2 py-1 text-xs">
                  <IconCrown className="h-4 w-4 text-yellow-300" />
                  Host
                </div>
              )}
              {profile.userId === ctx.currentUserId && (
                <div className="rounded-xl bg-neutral-700 px-2 py-1 text-xs">
                  You
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const toProfilesByRoomId = function* ({
  ctx,
}: {
  ctx: RoomViewCtx;
}): Generator<Profile> {
  for (const userId in ctx.room.users) {
    if (!UserId.is(userId)) {
      continue;
    }

    const profile = ctx.profiles[userId];

    if (profile) {
      yield profile;
    }
  }
};
