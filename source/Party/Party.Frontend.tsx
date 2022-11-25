import { Cmd, exhaustive, p, RemoteData, Sub } from "../Core"
import { PartyId, UserId } from "../Data"
import * as ProfileStore from "../Profile/Profile.Store"
import * as Route from "../Route"
import * as UI from "../UI"
import { Mic } from "./Mic"
import {
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from "./Party.Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd
}): [Model, Cmd<Msg>] => {
  return [
    {
      parties: {},
      users: {},
      //
      requests: {},
      volume: 0,
    },
    sendToBackend(["PartyGet", {}]),
  ]
}

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = ProfileStore.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClickedBanner": {
      return [model, Route.push(["Party"])]
    }

    case "MicSound": {
      return [{ ...model, volume: msg[1].volume }, Cmd.None]
    }

    case "MicUnload":
    case "MicLoad": {
      return [model, Cmd.None]
    }

    case "PartyGet":
    case "PartyCreate":
    case "PartyDestroy":
    case "PartyLeave":
    case "PartyJoin": {
      return [
        {
          ...model,
          requests: { ...model.requests, [msg[0]]: RemoteData.Loading },
        },
        sendToBackend(msg),
      ]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  { currentUserId }: { currentUserId: UserId },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "PartyGet":
    case "PartyDestroy":
    case "PartyCreate":
    case "PartyJoin":
    case "PartyLeave": {
      const requestsNew: Model["requests"] = {
        ...model.requests,
        [msg[0]]: p(
          msg[2],
          RemoteData.map(() => null),
        ),
      }

      if (msg[2].type === "Err") {
        return [{ ...model, requests: requestsNew }, Cmd.None, []]
      }

      const modelNext: Model = {
        ...model,
        requests: requestsNew,
        ...msg[2].value,
      }

      const userIds = Object.values(modelNext.users).map((user) => user.userId)

      const action: OutAction = ["Profile", ["FindMany", { userIds }]]

      const cmd = toLifecycleCmd({
        currentUserId,
        modelNext: modelNext,
        modelPrev: model,
      })

      return [modelNext, cmd, [action]]
    }
    default: {
      return exhaustive(msg[0])
    }
  }
}

const toLifecycleCmd = ({
  currentUserId,
  modelNext,
  modelPrev,
}: {
  currentUserId: UserId
  modelPrev: Model
  modelNext: Model
}): Cmd<Msg> => {
  const userPrev = modelPrev.users[currentUserId]
  const userNext = modelNext.users[currentUserId]

  // did user just leave party?
  if (userPrev && !userNext) {
    return p(
      Mic.unload,
      Cmd.perform((result) => ["MicUnload", result]),
    )
  }

  // did user just join party?
  if (!userPrev && userNext) {
    return p(
      Mic.load,
      Cmd.perform((result) => ["MicLoad", result]),
    )
  }

  return Cmd.None
}

export type Action = ["Party", ["Msg", Msg]]

export const runAction = (
  wire: { sendToBackend: (msg: ToBackend) => Cmd },
  action: Action,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Msg": {
      return update(wire, action[1][1], model)
    }
  }
}

//
//
//
// View
//
//
//

export const View = ({
  currentUserId,
  store,
  model,
  $d,
}: {
  currentUserId: UserId
  store: ProfileStore.Model
  model: Model
  $d: (msg: Msg) => void
}) => {
  const theme = UI.useTheme()
  const user = model.users[currentUserId]

  if (!user) {
    return (
      <ViewNotInParty
        model={model}
        store={store}
        currentUserId={currentUserId}
        $d={$d}
      />
    )
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return (
      <ViewNotInParty
        model={model}
        store={store}
        currentUserId={currentUserId}
        $d={$d}
      />
    )
  }

  return (
    <UI.FillBox>
      <UI.Box
        sx={{ flex: 1, display: "flex", flexWrap: "wrap", width: "100%" }}
      >
        {Object.values(model.users)
          .filter((user) => user.partyId === party.partyId)
          .map((user) => {
            const isActive = model.volume > 1 && user.userId === currentUserId

            return (
              <UI.Box
                key={user.userId}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <UI.Box sx={{ padding: 2 }}>
                  <UI.Avatar
                    src={store.profiles[user.userId]?.avatarUrl}
                    sx={{
                      width: 100,
                      height: 100,
                      boxSizing: "content-box",
                      border: `solid 8px ${
                        isActive ? theme.palette.primary.main : "transparent"
                      }`,
                    }}
                  />
                </UI.Box>
                <UI.Typography
                  variant="h6"
                  noWrap
                  sx={{ width: "100%", paddingX: 1 }}
                  align="center"
                >
                  {`${store.profiles[user.userId]?.username ?? "..."}`}
                </UI.Typography>
                <UI.Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ height: "1rem" }}
                >
                  {party.hostId === user.userId ? "Host" : " "}
                </UI.Typography>
              </UI.Box>
            )
          })}
      </UI.Box>
      <UI.Box
        sx={{
          paddingX: 2,
          paddingY: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {party.hostId === currentUserId ? (
          <UI.Button
            variant="outlined"
            startIcon={<UI.Icons.CallEnd />}
            color="error"
            size="large"
            loading={model.requests.PartyDestroy?.type === "Loading"}
            onClick={() => $d(["PartyDestroy", { userId: currentUserId }])}
          >
            End
          </UI.Button>
        ) : (
          <UI.Button
            variant="outlined"
            startIcon={<UI.Icons.CallEnd />}
            color="error"
            size="large"
            loading={model.requests.PartyLeave?.type === "Loading"}
            onClick={() => $d(["PartyLeave", { userId: currentUserId }])}
          >
            Leave
          </UI.Button>
        )}
      </UI.Box>
    </UI.FillBox>
  )
}

const ViewNotInParty = ({
  currentUserId,
  model,
  store,
  $d,
}: {
  store: ProfileStore.Model
  model: Model
  currentUserId: UserId
  $d: (msg: Msg) => void
}) => {
  const parties = Object.values(model.parties)
  return (
    <UI.FillBox>
      <UI.Header title="Party" />
      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Button
          fullWidth
          variant="contained"
          size="large"
          loading={model.requests.PartyCreate?.type === "Loading"}
          onClick={() =>
            $d([
              "PartyCreate",
              { userId: currentUserId, partyId: PartyId.generate() },
            ])
          }
        >
          Start Party
        </UI.Button>
      </UI.Box>
      <UI.Box sx={{ flex: 1 }}>
        {parties.length === 0 && (
          <UI.Typography sx={{ padding: 2 }} color="text.secondary">
            No active parties
          </UI.Typography>
        )}
        {parties.map((party) => (
          <UI.ListItemButton
            key={party.partyId}
            onClick={() =>
              $d([
                "PartyJoin",
                { userId: currentUserId, partyId: party.partyId },
              ])
            }
          >
            <UI.ListItemAvatar>
              <UI.Avatar src={store.profiles[party.hostId]?.avatarUrl} />
            </UI.ListItemAvatar>

            <UI.ListItemText
              primary={`${
                store.profiles[party.hostId]?.username ?? "..."
              }'s party`}
              secondary={`${countUsersInParty(party.partyId, model)} in party`}
            />
          </UI.ListItemButton>
        ))}
      </UI.Box>
    </UI.FillBox>
  )
}

const countUsersInParty = (partyId: PartyId, model: Model): number => {
  let count = 0
  for (const userId in model.users) {
    if (UserId.is(userId) && model.users[userId]?.partyId === partyId) {
      count++
    }
  }
  return count
}

export const ViewBanner = ({
  $d,
  route,
  currentUserId,
  model,
}: // store,
{
  store: ProfileStore.Model
  route: Route.Model
  currentUserId: UserId
  model: Model
  $d: (msg: Msg) => void
}) => {
  if (route[0] === "Party") {
    return <></>
  }

  const user = model.users[currentUserId]

  if (!user) {
    return <></>
  }

  const party = model.parties[user.partyId]

  if (!party) {
    return <></>
  }

  return (
    <UI.Typography
      variant="caption"
      align="center"
      onClick={() => $d(["ClickedBanner"])}
      sx={{
        width: "100%",
        paddingX: 2,
        paddingY: 1 / 2,
        backgroundColor: "primary.dark",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <UI.Icons.Group sx={{ marginRight: 1 / 2 }} />
      Party
    </UI.Typography>
  )
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return p(
    Mic.volumes,
    Sub.map((volume) => ["MicSound", { volume }]),
  )
}
