import {
  Button,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import {
  ViewGameHeader,
  ViewUsersInSpaceList,
} from "../@CHILD/game/@SHARED/game";
import { CoverArt } from "../@CHILD/game/game-cover-art";
import { gameNameToString } from "../@CHILD/game/game.core";
import { SpaceClientCtx } from "../@SHARED/space";
import { SpaceClientModule } from "../architechure/space-client";
import { SpaceEvent, Spaces } from "../spaces-core";
import { ModelClient, MsgClient } from "../spaces.core";

const update: SpaceClientModule["update"] = (input) => {
  return { model: input.model };
};

const ViewScreenJoinSpace = ({
  model,
  ctx,
  dispatch,
  dispatchEvent,
}: {
  ctx: SpaceClientCtx;
  model: ModelClient;
  dispatch: (msg: MsgClient) => void;
  dispatchEvent: (m: SpaceEvent) => void;
}) => {
  const space = Spaces.toSpaceState(model, ctx.space.spaceId);

  const header = (
    <>
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({ t: "clicked-back-button", from: "join-screen" })
            }
          />
        }
        title="Space"
      />
      {/* {false && (
        <ViewFeed
          ctx={ctx}
          dispatch={dispatch}
          model={model}
          spaceState={space}
        />
      )} */}
    </>
  );

  switch (space.type) {
    case "ended": {
      return (
        <div className="flex h-full w-full flex-col">
          {header}
          <div className="w-full flex-1 items-center justify-center">
            Space not found
          </div>
        </div>
      );
    }
    case "initial": {
      return (
        <div className="flex h-full w-full flex-col">
          {header}
          <div className="w-full flex-1 items-center justify-center">
            Space not found
          </div>
        </div>
      );
    }
    case "started": {
      const game = space.game;

      return (
        <div className="flex h-full w-full flex-col">
          {header}

          <div className="flex w-full flex-1 flex-col overflow-y-scroll">
            <ViewGameHeader
              title={game ? gameNameToString(game.t) : null}
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

          <div className="flex border-t border-neutral-600 p-4">
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
    }
  }
};

export const JoinSpaceClient = {
  ViewScreenJoinSpace,
  update,
};
