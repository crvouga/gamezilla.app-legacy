import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  SpaceViewCtx,
  spaceToHostTitle,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { gameNameList, gameNameToString } from "../@CHILD/game/game.core";
import { Event } from "../space.core";

export const ViewNotInGameScreen = ({
  ctx,

  dispatchEvent,
}: {
  ctx: SpaceViewCtx;
  dispatchEvent: (m: Event) => void;
}) => {
  if (ctx.space.hostId !== ctx.currentUserId) {
    const hostTitle = spaceToHostTitle(ctx, ctx.space);
    return (
      <>
        <ViewGameHeader title={hostTitle ?? " "} />
        <ViewUsersInSpaceList ctx={ctx} />
      </>
    );
  }

  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <section class="flex flex-col gap-4 p-4">
        <h1 class="text-center text-3xl font-bold">Games</h1>

        <div class="grid grid-cols-3 justify-between gap-8">
          {gameNameList.map((gameName) => (
            <div key={gameName}>
              <button
                aria-label={gameName}
                onClick={() =>
                  dispatchEvent({
                    t: "user-inputted-game",
                    spaceId: ctx.space.spaceId,
                    userId: ctx.currentUserId,
                    game: gameName,
                  })
                }
                class="flex overflow-hidden rounded-lg">
                <CoverArt gameName={gameName} />
              </button>

              <p class="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
                {gameNameToString(gameName)}
              </p>
            </div>
          ))}
        </div>
      </section>
      {Object.values(ctx.space.users).length > 1 && (
        <ViewUsersInSpaceList ctx={ctx} />
      )}
      <div>
        <div class="h-24 w-full"></div>
      </div>
    </div>
  );
};
