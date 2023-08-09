import {
  GameSpace,
  GameSpaceViewCtx,
  ViewGameHeader,
  ViewGameHeaderEmpty,
  ViewUsersInSpaceList,
} from "@gamezilla/shared/game-space";
import { Button, TopBar, TopBarBackButton } from "@gamezilla/ui";
import { ClientModel, ClientMsg } from "../game-space.core";
import { ViewCoverArt, gameNameToString } from "../game.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: GameSpaceViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const space = model.spaces[ctx.gameSpaceId];

  if (!space) {
    return null;
  }

  const host = ctx.profiles[space?.hostId];
  const game = space?.game;

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

        <ViewUsersInSpaceList space={space} ctx={ctx} />
      </div>

      <div className="flex border-t border-neutral-700 p-4">
        <Button
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            dispatch({
              t: "join",
              userId: ctx.currentUserId,
              spaceId: space.gameSpaceId,
            });
          }}
          text="Join space"
        />
      </div>
    </div>
  );
};
