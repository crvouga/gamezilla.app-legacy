import {
  ClientEvent,
  RouteChat,
  ClientCtx,
} from "gamezilla/@CHILD/app/@SHARED/client";
import { VDom } from "gamezilla/@CHILD/app/@SHARED/ui";
import { Browser, Eff, exhaustive, p } from "gamezilla/@SHARED/core";
import { ClientModel, MsgClient, MsgToClient } from "./chat.core";

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
}): { model: ClientModel } => {
  if (stored) {
    return {
      model: stored,
    };
  }

  return {
    model: {
      chats: {},
      chatsUsers: {},
      users: {},
      messageDrafts: {},
      messages: {},
      requests: {},
      userSearch: "",
      userSelected: {},
    },
  };
};

//
//
//
// Msg
//
//
//

export type Msg = MsgClient;

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
  model: ClientModel;
}): { model: ClientModel; eff?: Eff<Msg> } => {
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
        eff: p(
          Browser.focus(userSearchInputId),
          Eff.perform((result) => ["focused", result])
        ),
      };
    }

    default: {
      return {
        model,
        eff: Eff.None,
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
  msg: MsgToClient;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<Msg>;
} => {
  return { model };
};

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: ClientEvent;
  model: ClientModel;
}): {
  model: ClientModel;
  eff?: Eff<Msg>;
} => {
  switch (msg.t) {
    case "routing/route-changed": {
      if (msg.route.t !== "chat") {
        return { model };
      }

      switch (msg.route.c.t) {
        case "chat-conversation": {
          return {
            model,
          };
        }

        case "chat-new": {
          return {
            model,
          };
        }

        default: {
          return {
            model,
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
  dispatch,
  ctx,
  route,
  userSearch,
  viewBottomBar,
}: {
  model: ClientModel;
  dispatch: (m: Msg) => void;
  ctx: ClientCtx;
  route: RouteChat;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
  viewBottomBar: VDom;
}) => {
  switch (route.t) {
    case "chat-conversation": {
      return <ViewChat model={model} dispatch={dispatch} />;
    }

    case "chat-new": {
      return (
        <ViewChatNew
          model={model}
          dispatch={dispatch}
          ctx={ctx}
          userSearch={userSearch}
        />
      );
    }

    case "chat": {
      return (
        <>
          <ViewChatList model={model} dispatch={dispatch} ctx={ctx} />
          {viewBottomBar}
        </>
      );
    }

    default: {
      return exhaustive(route);
    }
  }
};

const ViewChat = (_props: {
  model: ClientModel;
  dispatch: (m: Msg) => void;
}) => {
  return <div>ViewChat</div>;
};

const ViewChatNew = (_props: {
  ctx: ClientCtx;
  model: ClientModel;
  dispatch: (m: Msg) => void;
  userSearch: {
    onInput: (searchText: string) => void;
    loading: boolean;
  };
}) => {
  return <div></div>;
};

const ViewChatList = (_props: {
  ctx: ClientCtx;
  model: ClientModel;
  dispatch: (m: Msg) => void;
}) => {
  return <div></div>;
};
