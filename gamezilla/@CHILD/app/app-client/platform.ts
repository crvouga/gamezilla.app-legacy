//
//
//
//
//
//

export type Model = {
  documentVisibilityState: DocumentVisibilityState;
};

export type Msg = {
  t: "document-visibility-change";
  state: DocumentVisibilityState;
};

export const update = ({
  msg,
  model,
}: {
  msg: Msg;
  model: Model;
}): {
  model: Model;
} => {
  switch (msg.t) {
    case "document-visibility-change": {
      return {
        model: {
          ...model,
          documentVisibilityState: msg.state,
        },
      };
    }
  }
};

export const subscribers = B;
