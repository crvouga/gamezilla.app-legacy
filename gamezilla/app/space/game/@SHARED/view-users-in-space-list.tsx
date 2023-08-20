import { Profile, UserId } from "gamezilla/app/@SHARED/data";
import { IconCrown, MyAvatar } from "gamezilla/app/@SHARED/ui";
import { Space, SpaceViewCtx } from "gamezilla/app/space/@SHARED";

export const ViewUsersInSpaceList = <T,>({
  space,
  ctx,
}: {
  space: Space<T>;
  ctx: SpaceViewCtx;
}) => {
  const profiles = toProfiles(ctx, space);
  return (
    <section className="flex w-full flex-col gap-2 py-4">
      <p className="text-center text-3xl font-bold">People</p>

      <div className="w-full">
        {profiles.map((profile) => {
          return (
            <button
              key={profile.userId}
              onClick={() => ctx.viewProfile(profile.userId)}
              className="flex w-full items-center gap-2 p-2 px-4 active:opacity-60">
              <MyAvatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.hostId && <ViewSpaceHostChip />}
              {profile.userId === ctx.currentUserId && <ViewYouChip />}
            </button>
          );
        })}
      </div>
    </section>
  );
};

const toProfiles = <T,>(ctx: SpaceViewCtx, space: Space<T>) => {
  const profiles: Profile[] = [];
  for (const userId in space.users) {
    if (!UserId.is(userId)) {
      continue;
    }
    const profile = ctx.profiles[userId];
    if (!profile) {
      continue;
    }
    profiles.push(profile);
  }
  return profiles;
};

export const ViewSpaceHostChip = () => {
  return (
    <div className="flex items-center gap-1 rounded-xl border px-2 py-1 text-xs font-semibold">
      <IconCrown className="h-4 w-4 text-yellow-300" />
      Host
    </div>
  );
};

export const ViewYouChip = () => {
  return <div className="rounded-xl bg-white/20 px-2 py-1 text-xs">You</div>;
};
