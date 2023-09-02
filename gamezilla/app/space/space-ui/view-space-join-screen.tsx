import { Button, TopBar, TopBarBackButton } from "gamezilla/app/@SHARED/ui";
import { SpaceViewCtx, spaceToHostTitle } from "gamezilla/app/space/@SHARED";
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt, gameNameToString } from "../game/game.core";
import { ClientModel, ClientMsg } from "../space.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatch,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const space = model.spaces[ctx.spaceId];

  if (!space) {
    return null;
  }

  const game = space?.game;

  const hostTitle = spaceToHostTitle(ctx, space);

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
          />
        }
        title="Join space"
      />

      <div className="flex w-full flex-1 flex-col overflow-y-scroll">
        <ViewGameHeader
          title={game ? gameNameToString(game.t) : hostTitle ?? " "}
          renderCoverArt={
            game
              ? (props) => (
                  <div {...props}>
                    <ViewCoverArt gameName={game.t} />
                  </div>
                )
              : undefined
          }
        />

        <ViewUsersInSpaceList space={space} ctx={ctx} />
      </div>

      <div className="flex border-t border-neutral-700 p-4">
        <Button
          className="w-full"
          variant="contained"
          color="primary"
          loading={model.requests.join?.t === "loading"}
          onClick={() => {
            dispatch({
              t: "join",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
          }}
          text="Join space"
        />
      </div>
    </div>
  );
};
