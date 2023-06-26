import {
  SpaceViewCtx,
  ViewGameHeader,
  ViewGameHeaderEmpty,
  ViewUsersInSpaceList,
} from "@gamezilla/shared/client";
import { MyButton, TopBar, TopBarBackButton } from "@gamezilla/shared/ui";
import { gameNameToString, viewCoverArt } from "../game.shared";
import { ClientModel, ClientMsg } from "../space.shared";

export const ViewSpaceJoinScreen = ({
  model,
  ctx,
  $send,
}: {
  ctx: SpaceViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  const host = ctx.profiles[ctx.space.hostId];
  const game = model.games[ctx.space.spaceId];

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() => ctx.$push({ t: "space", c: { t: "space-list" } })}
          />
        }
        title={host?.username ? `${host.username}'s space` : "..."}
      />

      <div className="flex w-full flex-1 flex-col overflow-y-auto">
        {game ? (
          <ViewGameHeader
            title={gameNameToString(game.t)}
            renderCoverArt={(props) => (
              <div {...props}>{viewCoverArt(game.t)}</div>
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
            $send({
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
