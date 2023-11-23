import { Eff, Sub, chain } from "gamezilla/@SHARED/core";
import { withMeta } from "gamezilla/@SHARED/event-stream";
import {
  APP_SOUND,
  AnonymousClientCtx,
  ClientCmd,
  ClientCtx,
  ClientEvt,
  RouteGameSpace,
  ViewCtx,
  addProfiles,
  playSound,
  pushRoute,
  sendToServer,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data";
import {
  ActionButton,
  Button,
  Drawer,
  IconHome,
  IconUserGroup,
  IconVolumeHigh,
  IconVolumeXMark,
  IconXMark,
  MyAvatar,
  VDom,
  cn,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { SpaceViewCtx } from "gamezilla/@CHILD/app/@CHILD/space/@SHARED";
import {
  ViewSpaceHostChip,
  ViewUsersInSpaceList,
  ViewYouChip,
} from "gamezilla/@CHILD/app/@CHILD/space/@CHILD/game/@SHARED";
import * as GameClient from "./@CHILD/game/game.client";
import { CoverArt } from "./@CHILD/game/game-cover-art";
import {
  ViewNotInGameScreen,
  ViewSpaceJoinScreen,
  ViewSpaceListScreen,
} from "./space-ui";
import {
  ClientModel,
  ClientMsg,
  Event,
  EventWithMeta,
  StateStarted,
  ToClient,
  ToServer,
  appendEvent,
  initCore,
  mergeModels,
  toStateSpace,
  toStateUser,
} from "./space.core";

//
//
//
// Model
//
//
//

export const init = ({
  stored,
}: {
  stored: ClientModel | null;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  if (stored) {
    return {
      model: stored,
    };
  }
  return {
    model: {
      ...initCore(),
      games: {},
      modal: null,
      previewUserId: null,
    },
  };
};

//
//
//
// Update
//
//
//

export const update = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx | AnonymousClientCtx;
  msg: ClientMsg;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "modal-closed": {
      return { model: { ...model, modal: null } };
    }

    case "modal-open": {
      return { model: { ...model, modal: msg.c } };
    }

    case "clicked-user": {
      return {
        model: {
          ...model,
          previewUserId: msg.userId,
          modal: "user-preview",
        },
      };
    }

    case "game-msg": {
      if (!ctx.currentUserId) {
        return { model };
      }

      const game = model.games[msg.spaceId];

      if (!game) {
        return { model };
      }

      const space = toStateSpace(model, msg.spaceId);

      if (space.type === "initial") {
        return { model };
      }

      if (space.type === "ended") {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const updated = GameClient.update({
        ctx: { ...ctx, currentUserId: ctx.currentUserId, space: space },
        msg: msg.c,
        model: game,
        state: space.game,
      });

      const event = updated.gameEvent
        ? withMeta<Event>({
            t: "game",
            c: updated.gameEvent,
            spaceId: msg.spaceId,
          })
        : null;

      if (!ctx.currentUserId) {
        return { model };
      }

      return chain(
        { model },
        (model) => {
          if (!event) {
            return { model };
          }
          if (!ctx.currentUserId) {
            return { model };
          }
          const appended = appendEvent(model, event);

          const modelNew: ClientModel = {
            ...model,
            ...appended,
          };

          return {
            model: modelNew,
            cmd: [
              sendToServer({
                ...event,
                profile: ctx.profiles[ctx.currentUserId],
              }),
            ],
          };
        },
        (model) => {
          if (!event) {
            return { model };
          }
          if (!ctx.currentUserId) {
            return { model };
          }

          return updateGameModel({
            ctx: { ...ctx, currentUserId: ctx.currentUserId },
            model,
            msg: event,
          });
        },
        (model) => {
          const modelNew: ClientModel = {
            ...model,
            games: {
              ...model.games,
              [msg.spaceId]: updated.model,
            },
          };
          return {
            model: modelNew,
            eff: Eff.map_(
              (c) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c,
              }),
              updated.eff
            ),
            cmd: ClientCmd.map(
              updated.cmd ?? [],
              (m) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c: m,
              }),
              (m) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c: m,
              })
            ),
          };
        }
      );
    }

    default: {
      if (!ctx.currentUserId) {
        return { model };
      }
      return chain(
        { model },
        (model): ReturnType<typeof update> => {
          if (!ctx.currentUserId) {
            return { model };
          }
          const updated = appendEvent(model, msg);

          const modelNew: ClientModel = {
            ...model,
            ...updated,
          };

          return {
            model: modelNew,
            cmd: [
              sendToServer({
                ...msg,
                profile: ctx.profiles[ctx.currentUserId],
              }),
            ],
          };
        },
        (model) => {
          if (
            msg.t === "user-started-space" &&
            toStateUser(model, msg.userId).spaceId === msg.spaceId
          ) {
            return {
              model,
              cmd: [
                pushRoute({
                  t: "space",
                  c: { t: "space", spaceId: msg.spaceId },
                }),
              ],
            };
          }
          return { model };
        },
        (model) => {
          if (!ctx.currentUserId) {
            return { model };
          }
          return updateGameModel({
            msg,
            ctx: { ...ctx, currentUserId: ctx.currentUserId },
            model,
          });
        },
        (model) => {
          if (!ctx.currentUserId) {
            return { model };
          }
          return updateSound({
            ctx: { ...ctx, currentUserId: ctx.currentUserId },
            model,
            msg,
          });
        }
      );
    }
  }
};

const updateSound = ({
  ctx,
  model,
  msg,
}: {
  ctx: ClientCtx;
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  if (msg.t === "user-joined-space" && msg.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (msg.t === "user-left-space" && msg.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (msg.t === "user-started-space" && msg.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navForward)],
    };
  }

  if (msg.t === "user-ended-space" && msg.userId === ctx.currentUserId) {
    return {
      model,
      cmd: [playSound(APP_SOUND.navBackward)],
    };
  }

  if (msg.t === "user-inputted-game") {
    return {
      model,
      cmd: [
        playSound(
          msg.game ? APP_SOUND.navForwardMin : APP_SOUND.navBackwardMin
        ),
      ],
    };
  }

  return {
    model,
  };
};

export const updateFromServer = ({
  ctx,
  msg,
  model,
}: {
  ctx: ClientCtx;
  msg: ToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  evt?: ClientEvt[];
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  return chain(
    { model },
    (model): ReturnType<typeof updateFromServer> => {
      switch (msg.t) {
        case "game-msg": {
          const space = toStateSpace(model, msg.spaceId);

          if (space.type === "initial") {
            return { model };
          }

          if (space.type === "ended") {
            return { model };
          }

          if (!space.game) {
            return { model };
          }

          const game = model.games[msg.spaceId];

          if (!game) {
            return { model };
          }

          const updated = GameClient.updateFromServer({
            ctx: { ...ctx, space: space },
            model: game,
            msg: msg.c,
            state: space.game,
          });

          const gameEventNew = updated.gameEvent
            ? withMeta<Event>({
                t: "game",
                c: updated.gameEvent,
                spaceId: msg.spaceId,
              })
            : null;

          const appended = gameEventNew
            ? appendEvent(model, gameEventNew)
            : updated.model;

          return {
            model: {
              ...model,
              ...appended,
              games: {
                ...model.games,
                [msg.spaceId]: updated.model,
              },
            },
            eff: Eff.map_(
              (c) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c,
              }),
              updated.eff
            ),
            cmd: ClientCmd.map(
              updated.cmd ?? [],
              (m) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c: m,
              }),
              (m) => ({
                t: "game-msg",
                spaceId: msg.spaceId,
                c: m,
              })
            ),
          };
        }

        case "sync": {
          return chain(
            { model },
            (model) => {
              const merged = mergeModels(model, {
                events: msg.events,
                initialState: model.initialState,
              });
              return {
                model: { ...model, ...merged },
              };
            },
            (model) => {
              return {
                model,
                cmd: msg.profiles ? [addProfiles(msg.profiles)] : [],
              };
            }
          );
        }

        default: {
          if (msg.eventId in model.events.events) {
            return { model };
          }
          return chain(
            { model },
            (model) => {
              const modelNew = appendEvent(model, msg);

              return {
                model: {
                  ...model,
                  ...modelNew,
                },
              };
            },
            (model) => {
              return updateGameModel({ msg, ctx, model });
            }
          );
        }
      }
    },
    (model) => {
      return {
        model,
        cmd: msg.profiles ? [addProfiles(msg.profiles)] : [],
      };
    }
  );
};

const updateGameModel = ({
  model,
  msg,
  ctx,
}: {
  model: ClientModel;
  msg: EventWithMeta;
  ctx: ClientCtx;
}): {
  model: ClientModel;
  eff?: Eff<ClientMsg>;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  switch (msg.t) {
    case "user-inputted-game": {
      const space = toStateSpace(model, msg.spaceId);

      if (space.type === "initial") {
        return { model };
      }

      if (space.type === "ended") {
        return { model };
      }

      if (!space.game) {
        return { model };
      }

      const initial = GameClient.init({
        ctx: { ...ctx, space },
        state: space.game,
        model: null,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: initial.model,
          },
        },
        eff: Eff.map_(
          (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }),
          initial.eff
        ),
        cmd: ClientCmd.map(
          initial.cmd ?? [],
          (m) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c: m,
          }),
          (m) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c: m,
          })
        ),
      };
    }

    case "game": {
      const space = toStateSpace(model, msg.spaceId);

      if (space.type === "initial") {
        return { model };
      }

      if (space.type === "ended") {
        return { model };
      }

      const gameState = space.game;

      if (!gameState) {
        return { model };
      }

      const gameModel = model.games[msg.spaceId];

      const game = GameClient.init({
        ctx: { ...ctx, space: space },
        state: gameState,
        model: gameModel ? gameModel : null,
      });

      const updated = GameClient.updateFromGame({
        ctx: { ...ctx, space: space },
        msg: msg.c,
        model: game.model,
        state: gameState,
      });

      return {
        model: {
          ...model,
          games: {
            ...model.games,
            [msg.spaceId]: updated.model,
          },
        },
        eff: Eff.map_(
          (c) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c,
          }),
          updated.eff
        ),
        cmd: ClientCmd.map(
          [...(updated.cmd ?? []), ...(game.cmd ?? [])],
          (m) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c: m,
          }),
          (m) => ({
            t: "game-msg",
            spaceId: msg.spaceId,
            c: m,
          })
        ),
      };
    }

    default: {
      return { model };
    }
  }
};

export const updateFromEvent = (input: {
  ctx: ClientCtx | AnonymousClientCtx;
  msg: ClientEvt;
  model: ClientModel;
}): {
  model: ClientModel;
  cmd?: ClientCmd<{ ToServer: ToServer; ClientMsg: ClientMsg }>[];
} => {
  const { msg, model } = input;

  switch (msg.t) {
    case "routing/route-changed": {
      return { model: { ...model, modal: null } };
    }

    case "wire/server-connected": {
      const currentUserId = input.ctx.currentUserId;
      const currentUserProfile = currentUserId
        ? input.ctx.profiles[currentUserId]
        : null;
      return {
        model,
        cmd: [
          sendToServer({
            t: "sync",
            events: model.events,
            meta: { initiator: msg },
            profiles: currentUserProfile
              ? {
                  [currentUserProfile.userId]: currentUserProfile,
                }
              : {},
          }),
        ],
      };
    }

    default: {
      return input;
    }
  }
};

//
//
//
//
// Subscriptions
//
//
//
//

export const subscriptions = (
  ctx: AnonymousClientCtx,
  model: ClientModel
): Sub<ClientMsg> => {
  const { currentUserId } = ctx;
  if (!currentUserId) {
    return Sub.None;
  }

  const clientCtx = {
    ...ctx,
    currentUserId,
  };

  const subs: Sub<ClientMsg>[] = [];
  for (const spaceId in model.events.indexes.indexSpaceId) {
    if (!SpaceId.is(spaceId)) {
      continue;
    }

    const game = model.games[spaceId];

    if (!game) {
      continue;
    }

    const space = toStateSpace(model, spaceId);

    if (space.type === "initial") {
      continue;
    }

    if (space.type === "ended") {
      continue;
    }

    if (!space.game) {
      continue;
    }

    const sub = Sub.map(
      GameClient.subscriptions({
        ctx: { ...clientCtx, space: space },
        state: space.game,
        model: game,
        intervalId: String(spaceId),
      }),
      (c): ClientMsg => ({
        t: "game-msg",
        c,
        spaceId,
      })
    );
    subs.push(sub);
  }

  return Sub.batch(subs);
};

//
//
//
//
// View
//
//
//
//

export const View = ({
  ctx,
  dispatch,
  model,
  route,
  viewBottomBar,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatch: (m: ClientMsg) => void;
  route: RouteGameSpace;
  viewBottomBar: VDom;
}): VDom => {
  const dispatchEvent = (m: Event) => {
    dispatch(withMeta(m));
  };
  switch (route.t) {
    case "space-list": {
      return (
        <>
          <ViewSpaceListScreen dispatch={dispatch} ctx={ctx} model={model} />
          {viewBottomBar}
        </>
      );
    }

    case "space": {
      return (
        <ViewSpaceScreen
          dispatchEvent={dispatchEvent}
          spaceId={route.spaceId}
          ctx={ctx}
          dispatch={dispatch}
          model={model}
        />
      );
    }
  }
};

const ViewSpaceScreen = ({
  ctx,
  dispatchEvent,
  dispatch,
  model,
  spaceId,
}: {
  model: ClientModel;
  ctx: ViewCtx;
  dispatchEvent: (m: Event) => void;
  dispatch: (m: ClientMsg) => void;
  spaceId: SpaceId;
}) => {
  const space = toStateSpace(model, spaceId);

  if (space.type === "initial") {
    return <ViewSpaceNotFound ctx={ctx} />;
  }

  if (space.type === "ended") {
    return <ViewSpaceEnded ctx={ctx} />;
  }

  const spaceCtx: SpaceViewCtx = {
    ...ctx,
    space: space,
    viewProfile: (userId) => dispatch({ t: "clicked-user", userId: userId }),
    quit: () =>
      dispatchEvent({
        t: "user-inputted-game",
        spaceId: space.spaceId,
        userId: ctx.currentUserId,
        game: null,
      }),
  };

  return (
    <>
      {/* <pre class="w-full text-xs">{JSON.stringify(state, null, 4)}</pre> */}

      <ViewSpaceScreenMain
        space={space}
        dispatchEvent={dispatchEvent}
        dispatch={dispatch}
        model={model}
        ctx={spaceCtx}
      />

      <Drawer
        id="users"
        open={model.modal === "users"}
        onClose={() => dispatch({ t: "modal-closed" })}>
        <ViewUsersInSpaceList ctx={spaceCtx} />
      </Drawer>

      <Drawer
        id="user-preview"
        open={model.modal === "user-preview"}
        onClose={() => dispatch({ t: "modal-closed" })}>
        <div>
          <button
            class="flex w-full flex-col items-center justify-center gap-2 p-4"
            onClick={() => {
              if (model.previewUserId) {
                ctx.push({
                  t: "profile",
                  c: {
                    t: "profile",
                    userId: model.previewUserId,
                  },
                });
              }
            }}>
            <MyAvatar
              src={
                model.previewUserId
                  ? ctx.profiles[model.previewUserId]?.avatarUrl
                  : undefined
              }
              class="h-24 w-24"
            />
            <p class="text-xl font-semibold">
              {model.previewUserId
                ? ctx.profiles[model.previewUserId]?.username ?? "..."
                : "..."}
            </p>
            <div class="flex items-center gap-2">
              {spaceCtx.space.hostId === model.previewUserId && (
                <ViewSpaceHostChip />
              )}
              {spaceCtx.currentUserId === model.previewUserId && (
                <ViewYouChip />
              )}
            </div>
          </button>

          <div class="w-full px-4 pb-8">
            <Button
              onClick={() => {
                if (model.previewUserId) {
                  ctx.push({
                    t: "profile",
                    c: {
                      t: "profile",
                      userId: model.previewUserId,
                    },
                  });
                }
              }}
              class="w-full"
              text="See profile"
            />
          </div>
        </div>
      </Drawer>
    </>
  );
};

const ViewActivityFeedBar = ({
  model,
  ctx,

  dispatch,
}: {
  dispatch: (m: ClientMsg) => void;

  model: ClientModel;
  ctx: SpaceViewCtx;
}) => {
  return (
    <>
      <button class="flex w-full items-center justify-start text-center"></button>

      <Drawer id="activity-feed-drawer" open={false} onClose={() => {}}>
        <div class="pb-4ya flex max-h-72 w-full flex-col justify-end overflow-y-scroll text-left"></div>
      </Drawer>
    </>
  );
};
const ViewActivityFeedItem = ({
  event,
  ctx,
}: {
  ctx: SpaceViewCtx;
  event: Event;
}) => {
  return null;
};

const Item = ({
  text,
  variant,
}: {
  text: string;
  variant?: "error" | "normal";
}) => {
  return (
    <div
      class={cn(
        "w-full p-2 text-sm text-secondary",
        variant === "error" && "text-orange-500"
      )}>
      {text}
    </div>
  );
};

const ViewSpaceScreenMain = ({
  ctx,
  space,
  model,
  dispatch,
  dispatchEvent,
}: {
  space: StateStarted;
  model: ClientModel;
  ctx: SpaceViewCtx;
  dispatch: (m: ClientMsg) => void;
  dispatchEvent: (m: Event) => void;
}) => {
  const user = toStateUser(model, ctx.currentUserId);

  if (user.spaceId !== space.spaceId) {
    return (
      <ViewSpaceJoinScreen
        ctx={ctx}
        dispatchEvent={dispatchEvent}
        model={model}
      />
    );
  }

  const peopleCount = Object.keys(ctx.space.users).length;

  const gameModel = model.games[ctx.space.spaceId];

  return (
    <div class="flex h-full w-full flex-1 flex-col">
      <nav class="flex h-14 w-full items-center border-b border-neutral-700 px-2">
        <button
          class="grid w-20 place-items-center py-1"
          onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}>
          <IconHome class="h-6 w-6" />
          <p class="text-sm">Home</p>
        </button>

        <button
          class="grid w-20 place-items-center py-1"
          onClick={() => dispatch({ t: "modal-open", c: "users" })}>
          <IconUserGroup class="h-6 w-6" />
          <p>{peopleCount > 1 ? `People (${peopleCount})` : `People`}</p>
        </button>

        <div class="flex-1"></div>

        <button
          class="grid w-20 place-items-center py-1"
          onClick={ctx.toggleSound}>
          {ctx.sound.muted ? (
            <IconVolumeHigh class="h-6 w-6" />
          ) : (
            <IconVolumeXMark class="h-6 w-6" />
          )}
          <p>{ctx.sound.muted ? "Unmute" : "Mute"}</p>
        </button>

        {ctx.space.hostId !== ctx.currentUserId && (
          <Button
            color="danger"
            variant="contained"
            size="sm"
            text="Leave"
            onClick={() => {
              dispatchEvent({
                t: "user-left-space",
                spaceId: ctx.space.spaceId,
                userId: ctx.currentUserId,
              });
            }}
          />
        )}

        {ctx.space.hostId === ctx.currentUserId && (
          <Button
            color="danger"
            variant="contained"
            size="sm"
            text="End"
            onClick={() => {
              dispatchEvent({
                t: "user-ended-space",
                userId: ctx.currentUserId,
                spaceId: ctx.space.spaceId,
              });
            }}
          />
        )}
      </nav>

      <div class="flex w-full flex-1 flex-col overflow-hidden">
        {space.game ? (
          <GameClient.View
            state={space.game}
            ctx={ctx}
            dispatch={(msg) =>
              dispatch({ t: "game-msg", spaceId: ctx.space.spaceId, c: msg })
            }
            model={
              gameModel ??
              GameClient.init({
                ctx,
                state: space.game,
              }).model
            }
          />
        ) : (
          <ViewNotInGameScreen ctx={ctx} dispatchEvent={dispatchEvent} />
        )}
      </div>
    </div>
  );
};

const ViewSpaceNotFound = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space not found</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome class="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

const ViewSpaceEnded = ({ ctx }: { ctx: ViewCtx }) => {
  return (
    <div class="flex flex-1 flex-col items-center justify-center gap-4">
      <p class="text-center text-2xl">Space ended</p>
      <Button
        onClick={() => ctx.push({ t: "space", c: { t: "space-list" } })}
        size="lg"
        variant="contained"
        color="primary"
        start={<IconHome class="h-6 w-6" />}
        text="Go Home"
      />
    </div>
  );
};

export const ViewCurrentSpaceBar = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const dispatchEvent = (msg: Event) => {
    dispatch(withMeta(msg));
  };

  const userState = toStateUser(model, ctx.currentUserId);

  if (!userState.spaceId) {
    return null;
  }

  const space = toStateSpace(model, userState.spaceId);

  if (space.type === "initial") {
    return null;
  }

  if (space.type === "ended") {
    return null;
  }

  const game = model.games[userState.spaceId];

  const hostProfile = ctx.profiles[space.hostId];

  const userCount = Object.values(space.users).length;

  return (
    <div class="flex w-full items-center overflow-hidden border-t-2 border-blue-600 text-inherit">
      <button
        class="flex flex-1 items-center overflow-hidden"
        onClick={() => {
          ctx.push({
            t: "space",
            c: { t: "space", spaceId: space.spaceId },
          });
        }}>
        <div class="mr-2 p-2">
          {!game && (
            <MyAvatar
              src={hostProfile?.avatarUrl}
              alt="Host Avatar"
              class="h-12 w-12"
            />
          )}
          {game && (
            <div class="h-12 w-12 overflow-hidden rounded border border-neutral-600">
              <CoverArt gameName={game.t} />
            </div>
          )}
        </div>

        <div class="flex flex-1 flex-col gap-1 overflow-hidden">
          <p class="text-left">
            {hostProfile ? `${hostProfile.username}'s space` : "..."}
          </p>
          <p class="text-left text-xs text-neutral-300">{userCount} in space</p>
        </div>
      </button>

      {ctx.currentUserId === space.hostId && (
        <button
          aria-label="end space"
          onClick={() => {
            dispatchEvent({
              t: "user-ended-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
          }}
          class="mr-4">
          <IconXMark class="h-8 w-8" />
        </button>
      )}

      {ctx.currentUserId !== space.hostId && (
        <button
          aria-label="leave space"
          onClick={() => {
            dispatchEvent({
              t: "user-left-space",
              userId: ctx.currentUserId,
              spaceId: space.spaceId,
            });
          }}
          class="mr-4">
          <IconXMark class="h-8 w-8" />
        </button>
      )}
    </div>
  );
};
