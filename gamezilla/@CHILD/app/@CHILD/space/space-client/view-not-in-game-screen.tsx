import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import {
  SpaceClientCtx,
  spaceToHostTitle,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { gameNameList, gameNameToString } from "../@CHILD/game/game.core";
import {
  Event
} from '../space-state';

export const ViewNotInGameScreen = ({
  ctx,

  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  dispatchEvent: (m: Event) => void;
}) => {
  if (ctx.space.hostId !== ctx.currentUserId) {
    const hostTitle = spaceToHostTitle(ctx, ctx.space);
    return (
      <div className="flex h-full w-full flex-1 flex-col py-4 gap-8">
        <ViewGameHeader title={hostTitle ?? ""} />
        <ViewUsersInSpaceList ctx={ctx} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-4 p-4">
      <h1 className="text-center text-3xl font-bold">Games</h1>

      <div className="grid grid-cols-3 justify-between gap-8">
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
              className="flex overflow-hidden rounded-lg border border-neutral-600"
            >
              <CoverArt gameName={gameName} />
            </button>

            <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
              {gameNameToString(gameName)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
