import { Button, TopBar, TopBarBackButton } from "gamezilla/app/@SHARED/ui";
import { SpaceViewCtx, spaceToHostTitle } from "gamezilla/app/space/@SHARED";
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/app/space/game/@SHARED";
import { ViewCoverArt, gameNameToString } from "../game/game.core";
import { ClientModel, Event, toState } from "../space.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatchEvent,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  dispatchEvent: (m: Event) => void;
}) => {
  const space = model.spaceEvents[ctx.space.spaceId];

  if (!space) {
    return <div>Space not found</div>;
  }

  const state = toState(model.spaceIdByUserId, space);

  if (state.type === "ended") {
    return <div>Space ended</div>;
  }

  if (state.type === "initial") {
    return <div>Space not started</div>;
  }

  const game = state.game;

  const hostTitle = ctx.profiles[state.hostId]?.username ?? state.hostId;

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

        <ViewUsersInSpaceList ctx={ctx} />
      </div>

      <div className="flex border-t border-neutral-700 p-4">
        <Button
          className="w-full"
          variant="contained"
          color="primary"
          onClick={() => {
            dispatchEvent({
              t: "user-joined-space",
              userId: ctx.currentUserId,
              spaceId: ctx.space.spaceId,
            });
          }}
          text="Join space"
        />
      </div>
    </div>
  );
};
