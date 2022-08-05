import * as Games from "../Games/Frontend"
import * as Route from "../Route"
import * as Store from "../Store"
import * as UI from "../UI"
import { Cmd, Uuid } from "../Core"

//
//
//
// Model
//
//
//

export type Model = {}

export const init: Model = {}

//
//
//
// Update
//
//
//

export type Msg = ["ClickedPlay"] | ["ClickedGoToRoom", { roomId: string }]

export type OutAction = Games.Action

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedGoToRoom': {
      return [model, Route.push({ type: "GameRoom", }), []]
    }

    case 'ClickedPlay': {
      const roomId = Uuid.generateSync()
      return [model, Cmd.None, [["Games", ["CreateRoom", { userId: currentUserId, roomId }]]]]
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

export const view =
  (
    {
      currentUserId,
      games,
      store,
    }: {
      currentUserId: string
      games: Games.Model
      store: Store.Model
    },
    _model: Model,
  ): UI.View<Msg> => {

    const user = games.users[currentUserId]

    if (!user) {
      return viewNotInRoom({ games, store })
    }

    const room = games.rooms[user.roomId]

    if (!room) {
      return viewNotInRoom({ games, store })
    }

    return (dispatch) => {
      return (
        <UI.FillBox>
          <UI.Header title="Home" />
          <UI.Box sx={{ paddingX: 2 }}>
            <UI.Typography sx={{ marginBottom: 1 }} variant="h4">
              You are in a room
            </UI.Typography>
            <UI.Button fullWidth size="large" variant="contained" onClick={() => dispatch(['ClickedGoToRoom', { roomId: room.roomId }])}>
              Go to room
            </UI.Button>
          </UI.Box>
        </UI.FillBox>
      )
    }
  }


const viewNotInRoom = ({
  games,
  store,
}: {
  games: Games.Model
  store: Store.Model
}): UI.View<Msg> => (dispatch) => {
  return (
    <UI.FillBox>
      <UI.Header title="Home" />
      <UI.Box sx={{ paddingX: 2 }}>
        <UI.Button loading={games.createRoom.type === 'Loading'} fullWidth size="large" variant="contained" onClick={() => dispatch(['ClickedPlay'])}>
          Play
        </UI.Button>
      </UI.Box>

      <UI.List sx={{ overflowY: "scroll" }}>
        {Object.values(games.rooms)
          .map((room) => ({
            room,
            profiles: Object.values(store.Profile).filter(
              (profile) => games.users[profile.userId]?.roomId === room.roomId,
            ),
          }))
          .map(({ room, profiles }) => (
            <UI.ListItemButton
              key={room.roomId}
              onClick={() => { }
                // dispatch(["JoinRoom", { currentUserId, roomId: room.roomId }])
              }
            >
              <UI.ListItemAvatar>
                <UI.AvatarGroup>
                  {profiles.map((item) => (
                    <UI.Avatar key={item.userId} src={item.avatarUrl} />
                  ))}
                </UI.AvatarGroup>
              </UI.ListItemAvatar>
              <UI.ListItemText
                primaryTypographyProps={{
                  noWrap: true,
                  sx: { wordWrap: "break-word" },
                }}
                primary={profiles.map((item) => item.username).join(",")}
              />
            </UI.ListItemButton>
          ))}
      </UI.List>
    </UI.FillBox>
  )
}

const GameCard = ({
  icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) => {
  return (
    <UI.ButtonBase
      disabled={disabled}
      sx={{
        position: "relative",
        overflow: "hidden",
        opacity: disabled ? 0.3 : 1,
      }}
      onClick={onClick}
    >
      {icon}

      <UI.Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <UI.Box
          sx={{
            width: "100%",
            padding: 1,
            paddingTop: 2,
            background: `linear-gradient(transparent, rgba(0, 0, 0, 0.6))`,
          }}
        >
          <UI.Typography color="white" align="left" fontWeight={800}>
            {label}
          </UI.Typography>
        </UI.Box>
      </UI.Box>
    </UI.ButtonBase>
  )
}