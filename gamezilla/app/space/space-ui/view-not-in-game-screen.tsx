import {
  Space,
  SpaceViewCtx,
  spaceToHostTitle,
} from "gamezilla/app/space/@SHARED";
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/app/space/game/@SHARED";
import * as Game from "../game/game.core";
import {
  ViewCoverArt,
  gameNameList,
  gameNameToString,
} from "../game/game.core";
import { ClientMsg } from "../space.core";

export const ViewNotInGameScreen = ({
  ctx,
  space,
  dispatch,
}: {
  space: Space<Game.ClientModel>;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  if (space.hostId !== ctx.currentUserId) {
    const hostTitle = spaceToHostTitle(ctx, space);
    return (
      <>
        <ViewGameHeader title={hostTitle ?? " "} />
        <ViewUsersInSpaceList space={space} ctx={ctx} />
      </>
    );
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <section className="flex flex-col gap-4 p-4">
        <h1 className="text-center text-3xl font-bold">Games</h1>

        <div className="grid grid-cols-3 justify-between gap-8">
          {gameNameList.map((gameName) => (
            <div key={gameName}>
              <button
                aria-label={gameName}
                onClick={() => dispatch({ t: "input-game", gameName })}
                className="flex overflow-hidden rounded-lg">
                <ViewCoverArt gameName={gameName} />
              </button>

              <p className="mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-sm font-semibold">
                {gameNameToString(gameName)}
              </p>
            </div>
          ))}
        </div>
      </section>
      {Object.values(space.users).length > 1 && (
        <ViewUsersInSpaceList space={space} ctx={ctx} />
      )}
      <div>
        <div className="h-24 w-full"></div>
      </div>
    </div>
  );
};
