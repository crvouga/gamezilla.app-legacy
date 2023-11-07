import {
  Button,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  SpaceViewCtx,
  spaceToHostTitle,
} from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import { gameNameToString } from "../@CHILD/game/game.core";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { ClientModel, Event, toStateSpace } from "../space.core";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  dispatchEvent,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  dispatchEvent: (m: Event) => void;
}) => {
  const space = toStateSpace(model, ctx.space.spaceId);

  if (space.type === "ended") {
    return <div>Space ended</div>;
  }

  if (space.type === "initial") {
    return <div>Space not started</div>;
  }

  const game = space.game;

  const hostTitle = ctx.profiles[space.hostId]?.username ?? space.hostId;

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
                    <CoverArt gameName={game.t} />
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
