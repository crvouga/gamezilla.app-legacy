import { toProfilesByRoomId } from "@gamezilla/feat/room";
import { RoomViewCtx } from "@gamezilla/shared/client";
import { Text, IconCrown, MyAvatar } from "@gamezilla/shared/ui";

export const ViewUsersInRoomList = ({ ctx }: { ctx: RoomViewCtx }) => {
  const profiles = toProfilesByRoomId({ ctx });
  return (
    <section className="flex w-full flex-col gap-2 py-4">
      <Text variant="h3" className="text-center">
        People
      </Text>

      <div className="w-full">
        {Array.from(profiles).map((profile) => {
          return (
            <button
              key={profile.userId}
              onClick={() => ctx.onViewProfile(profile)}
              className="flex w-full items-center gap-2 p-2 px-4 active:opacity-60">
              <MyAvatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.hostId && <ViewRoomHostChip />}
              {profile.userId === ctx.currentUserId && <ViewYouChip />}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const ViewRoomHostChip = () => {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/20 px-2 py-1 text-xs">
      <IconCrown className="h-4 w-4 text-yellow-300" />
      Host
    </div>
  );
};

export const ViewYouChip = () => {
  return <div className="rounded-xl bg-white/20 px-2 py-1 text-xs">You</div>;
};
