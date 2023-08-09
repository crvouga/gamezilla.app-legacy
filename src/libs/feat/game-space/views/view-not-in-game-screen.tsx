import {
  GameSpace,
  GameSpaceViewCtx,
  ViewGameHeaderEmpty,
  ViewUsersInSpaceList,
} from "@gamezilla/shared/game-space";
import { ClientMsg } from "../game-space.core";
import {
  ViewCoverArt,
  gameNameList,
  gameNameToString,
} from "../game/game.core";
import * as Game from "../game/game.core";

export const ViewNotInGameScreen = ({
  ctx,
  space,
  dispatch,
}: {
  space: GameSpace<Game.ClientModel>;
  ctx: GameSpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  if (space.hostId !== ctx.currentUserId) {
    return (
      <>
        <ViewGameHeaderEmpty />
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
