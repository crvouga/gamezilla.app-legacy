import {
  ClientGameSpaceViewCtx,
  ViewGameHeader,
  ViewGameHeaderEmpty,
  ViewUsersInSpaceList,
} from "@gamezilla/shared/client";
import { MyButton, TopBar, TopBarBackButton } from "@gamezilla/ui";
import { gameNameToString, ViewCoverArt } from "../game.core";
import { ClientModel, ClientMsg } from "../game-space.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: ClientGameSpaceViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const host = ctx.profiles[ctx.space.hostId];
  const game = model.games[ctx.space.spaceId];

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              ctx.onPush({ t: "game-space", c: { t: "game-space-list" } })
            }
          />
        }
        title={host?.username ? `${host.username}'s space` : "..."}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-auto">
        {game ? (
          <ViewGameHeader
            title={gameNameToString(game.t)}
            renderCoverArt={(props) => (
              <div {...props}>
                <ViewCoverArt gameName={game.t} />
              </div>
            )}
          />
        ) : (
          <ViewGameHeaderEmpty />
        )}

        <ViewUsersInSpaceList ctx={ctx} />
      </div>

      <div className="flex border-t border-neutral-700 p-4">
        <MyButton
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch({
              t: "join",
              userId: ctx.currentUserId,
              spaceId: ctx.space.spaceId,
            });
          }}>
          Join space
        </MyButton>
      </div>
    </div>
  );
};
