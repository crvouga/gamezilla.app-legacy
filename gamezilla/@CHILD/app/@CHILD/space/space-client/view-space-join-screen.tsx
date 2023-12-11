import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED/game";
import { SpaceClientCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED/space";
import {
  Button,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { gameNameToString } from "../@CHILD/game/game.core";
import { ClientModel, ClientMsg, Event, toSpaceState } from "../space.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  const space = toSpaceState(model, ctx.space.spaceId);

  if (space.type === "ended") {
    return <div>Space ended</div>;
  }

  if (space.type === "initial") {
    return <div>Space not started</div>;
  }

  const game = space.game;

  const hostTitle = ctx.profiles[space.hostId]?.username ?? space.hostId;

  return (
    <div class="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({ t: "clicked-back-button", from: "join-screen" })
            }
          />
        }
        title="Join space"
      />

      <div class="flex w-full flex-1 flex-col overflow-y-scroll">
        <ViewGameHeader
          title={game ? gameNameToString(game.t) : hostTitle ?? " "}
          renderCoverArt={
            game
              ? (props) => (
                  <div {...props}>
                    <CoverArt gameName={game.t} />
                  </div>
                )
              : undefined
          }
        />

        <ViewUsersInSpaceList ctx={ctx} />
      </div>

      <div class="flex border-t border-neutral-700 p-4">
        <Button
          class="w-full"
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
