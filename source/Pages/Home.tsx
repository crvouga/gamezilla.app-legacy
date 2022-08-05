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

export type Msg =
  | ["ClickedPlay"]
  | ['ClickedRoom', { roomId: string }]

export type OutAction = Games.Action

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case 'ClickedPlay': {
      const roomId = Uuid.generateSync()
      return [model, Route.push({ type: "GameRoom" }), []]
    }

    case 'ClickedRoom': {
      return [model, Cmd.None, [["Games", ["JoinRoom", { userId: currentUserId, roomId: msg[1].roomId }]]]]
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


    return (dispatch) => {
      return (
        <UI.FillBox>
          <UI.Header title="Home" />
          <UI.Box sx={{ paddingX: 2 }}>
            <UI.Button loading={games.createRoom.type === 'Loading'} fullWidth size="large" variant="contained" onClick={() => dispatch(['ClickedPlay'])}>
              Play
            </UI.Button>
          </UI.Box>

          <UI.List sx={{ overflowY: "scroll" }}>
            {Object.values(games.rooms.rooms)
              .map((room) => ({
                room,
                profiles: Object.values(store.Profile).filter(
                  (profile) => games.rooms.users[profile.userId]?.roomId === room.roomId,
                ),
              }))
              .map(({ room, profiles }) => (
                <UI.ListItemButton
                  key={room.roomId}
                  onClick={() => {
                    dispatch(["ClickedRoom", { roomId: room.roomId }])
                  }}
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
        </UI.FillBox >
      )
    }
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