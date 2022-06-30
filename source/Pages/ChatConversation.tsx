import * as Route from "Route"
import * as Store from "Store"
import * as View from "View"
import { Cmd } from "Core"

//
//
//
// Model
//
//
//

export type Model = {
  text: string
}

export const init: Model = {
  text: "",
}

//
//
//
// Update
//
//
//

export type Msg =
  | { type: "ClickedBack" }
  | { type: "ClickedSend" }
  | { type: "InputtedText"; text: string }

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "ClickedBack":
      return [model, Route.back]

    case "ClickedSend":
      return [model, Cmd.None]

    case "InputtedText":
      return [{ ...model, text: msg.text }, Cmd.None]
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
  (store: Store.Model, conversationId: string, model: Model): View.View<Msg> =>
  (dispatch) => {
    const conversation = Store.Conversation.toConversation(
      conversationId,
      store,
    )
    return (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "ClickedBack" })}
            />
          }
          title="Chat"
        />
        <View.List>
          {conversation.profiles.map((profile) => (
            <View.ListItemButton key={profile.userId}>
              <View.ListItemAvatar>
                <View.Avatar src={profile.avatarUrl} />
              </View.ListItemAvatar>
              <View.ListItemText primary={profile.username} />
            </View.ListItemButton>
          ))}
        </View.List>
        <View.Box sx={{ flex: 1 }}></View.Box>
        <View.Divider />
        <View.Box sx={{ width: "100%", display: "flex", p: 1 }}>
          <View.InputBase
            value={model.text}
            onChange={(event) => {
              const textNew = event.currentTarget.value
              dispatch({ type: "InputtedText", text: textNew })
            }}
            sx={{ flex: 1 }}
            placeholder="Message..."
          />

          <View.Button
            variant="text"
            size="large"
            disabled={model.text.length === 0}
            onClick={() => dispatch({ type: "ClickedSend" })}
          >
            Send
          </View.Button>
        </View.Box>
      </View.Page>
    )
  }
