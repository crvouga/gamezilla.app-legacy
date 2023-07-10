import {
  SpaceViewCtx,
  ViewGameHeaderEmpty,
  ViewUsersInSpaceList,
} from "@gamezilla/shared/client";
import { gameNameList, gameNameToString, ViewCoverArt } from "../game.shared";
import { ClientMsg } from "../space.shared";

export const ViewNotInGameScreen = ({
  ctx,
  dispatch,
}: {
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
}) => {
  if (ctx.space.hostId !== ctx.currentUserId) {
    return (
      <>
        <ViewGameHeaderEmpty />
        <ViewUsersInSpaceList ctx={ctx} />
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
      {Object.values(ctx.space.users).length > 1 && (
        <ViewUsersInSpaceList ctx={ctx} />
      )}
      <div>
        <div className="h-24 w-full"></div>
      </div>
    </div>
  );
};
