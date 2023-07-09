import { AppMsg, RouteChat, ViewCtx } from "@gamezilla/shared/client";
import { Browser, Cmd, exhaustive, p } from "@gamezilla/shared/core";
import { VDom } from "@gamezilla/shared/ui";
import { ClientModel, ClientMsg, ToClient, ToServer } from "./chat.shared";

//
//
//
// Model
//
//
//

export type Model = ClientModel;

export const init: Model = {
  chats: {},
  chatsUsers: {},
  users: {},
  messageDrafts: {},
  messages: {},
  requests: {},
  userSearch: "",
  userSelected: {},
};

//
//
//
// Msg
//
//
//

export type Msg = ClientMsg;

//
//
//
// Update
//
//
//

const userSearchInputId = "user-search-input";

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): { model: Model; cmd?: Cmd<Msg> } => {
  switch (msg[0]) {
    case "clicked-user-search-result": {
      return {
        model: {
          ...model,
          userSelected: toggleKey(model.userSelected, msg[1].userId),
          userSearch: "",
        },
      };
    }

    case "clicked-user-selected-delete-button": {
      return {
        model: {
          ...model,
          userSelected: removeKey(model.userSelected, msg[1].userId),
        },
      };
    }

    case "inputted-user-search": {
      return {
        model: {
          ...model,
          userSearch: msg[1].userSearch,
        },
      };
    }

    case "clicked-user-search-clear-button": {
      return {
        model: {
          ...model,
          userSelected: {},
          userSearch: "",
        },
        cmd: p(
          Browser.focus(userSearchInputId),
          Cmd.perform((result) => ["focused", result])
        ),
      };
    }

    default: {
      return {
        model,
        cmd: Cmd.None,
      };
    }
  }
};

const toggleKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj };
  if (key in newObj) {
    delete newObj[key];
  } else {
    newObj[key] = key as T[keyof T];
  }
  return newObj;
};
const removeKey = <T extends object>(obj: T, key: keyof T) => {
  const newObj: T = { ...obj };
  if (key in newObj) {
    delete newObj[key];
  }
  return newObj;
};

export const updateFromServer = ({
  model,
}: {
  msg: ToClient;
  model: Model;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  return { model };
};

export const updateFromApp = ({
  msg,
  model,
  sendToServer,
}: {
  msg: AppMsg;
  model: Model;
  sendToServer: (m: ToServer) => Cmd;
}): {
  model: Model;
  cmd?: Cmd<Msg>;
} => {
  switch (msg.t) {
    case "route-changed": {
      if (msg.route.t !== "chat") {
        return { model };
      }

      switch (msg.route.c.t) {
        case "chat-conversation": {
          return {
            model,
            cmd: sendToServer(["chat-join", { chatId: "todo" }]),
          };
        }

        case "chat-new": {
          return {
            model,
            cmd: sendToServer(["chat-join", { chatId: "todo" }]),
          };
        }

        default: {
          return {
            model,
            cmd: sendToServer(["chat-leave", { chatId: "todo" }]),
          };
        }
      }
    }
    default: {
      return { model };
    }
  }
};

//
//
//
// View
//
//
//

export const View = ({
  model,
  $send,
  ctx,
  route,
  userSearch,
  viewBottomBar,
}: {
  model: Model;
  $send: (m: Msg) => void;
  ctx: ViewCtx;
  route: RouteChat;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
  viewBottomBar: VDom;
}) => {
  switch (route.t) {
    case "chat-conversation": {
      return <ViewChat model={model} $send={$send} />;
    }

    case "chat-new": {
      return (
        <ViewChatNew
          model={model}
          $send={$send}
          ctx={ctx}
          userSearch={userSearch}
        />
      );
    }

    case "chat": {
      return (
        <>
          <ViewChatList model={model} $send={$send} ctx={ctx} />
          {viewBottomBar}
        </>
      );
    }

    default: {
      return exhaustive(route);
    }
  }
};

const ViewChat = (_props: { model: Model; $send: (m: Msg) => void }) => {
  return <div>ViewChat</div>;
};

const ViewChatNew = (_props: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
}) => {
  return <div></div>;
};

const ViewChatList = (_props: {
  ctx: ViewCtx;
  model: Model;
  $send: (m: Msg) => void;
}) => {
  return <div></div>;
};
