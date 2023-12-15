import { IconCrown, Avatar } from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  SpaceClientCtx,
  spaceToProfiles,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";

export const ViewUsersInSpaceList = ({ ctx }: { ctx: SpaceClientCtx }) => {
  const profiles = spaceToProfiles(ctx, ctx.space);
  return (
    <section class="flex w-full flex-col gap-2 py-4">
      <p class="text-center text-3xl font-bold">People</p>

      <div class="w-full">
        {profiles.map((profile) => {
          return (
            <button
              key={profile.userId}
              onClick={() => ctx.viewProfile(profile.userId)}
              class="flex w-full items-center gap-2 p-2 px-4 active:opacity-60">
              <Avatar src={profile.avatarUrl} />
              <p>{profile.username}</p>
              {profile.userId === ctx.space.hostId && <ViewSpaceHostChip />}
              {profile.userId === ctx.currentUserId && <ViewYouChip />}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export const ViewSpaceHostChip = () => {
  return (
    <div class="flex items-center gap-1 rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs font-semibold">
      <IconCrown class="h-4 w-4 text-yellow-300" />
      Host
    </div>
  );
};

export const ViewYouChip = () => {
  return (
    <div class="rounded-xl border border-white/20 bg-white/20 px-2 py-1 text-xs">
      You
    </div>
  );
};
