import {
  AlertError,
  Button,
  MyTextField,
  TopBar,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { ClientModel, ClientMsg } from "./auth-sms.core";

export const update = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
} => {
  switch (model.t) {
    case "input-code": {
      switch (msg.t) {
        case "clicked-verify-code": {
          return { model };
        }
        case "inputted-code": {
          return { model };
        }
        default: {
          return { model };
        }
      }
    }

    case "input-phone-number": {
      switch (msg.t) {
        case "clicked-send-code": {
          return { model };
        }
        case "inputted-phone-number": {
          return { model };
        }
        default: {
          return { model };
        }
      }
    }

    case "send-code-error": {
      return { model };
    }

    case "sending-code": {
      return { model };
    }

    case "verified": {
      return { model };
    }

    case "verify-code-error": {
      return { model };
    }

    case "verifying-code": {
      return { model };
    }
  }
};

export const View = ({
  model,
  dispatch,
}: {
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  switch (model.t) {
    case "input-phone-number":
    case "sending-code":
    case "send-code-error":
      return (
        <div className="w-full">
          <TopBar title="Login with phone" />

          <div className="w-full">
            <MyTextField
              value={model.phoneNumberInput}
              id="phoneNumberInput"
              label="Phone Number"
              onChange={(value) => {
                dispatch({ t: "inputted-phone-number", phoneNumber: value });
              }}
            />
            <Button
              text="Send Code"
              loading={model.t === "sending-code"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.t === "send-code-error" && (
            <AlertError>{model.error}</AlertError>
          )}
        </div>
      );

    case "input-code":
    case "verified":
    case "verify-code-error":
    case "verifying-code":
      return (
        <div className="w-full">
          <TopBar title="Login with phone" />

          <div className="w-full">
            <MyTextField id="codeInput" label="Code" onChange={(value) => {}} />
            <Button
              text="Verify Code"
              loading={model.t === "verifying-code"}
              onClick={() => {
                dispatch({ t: "clicked-verify-code" });
              }}
            />
          </div>

          {model.t === "verify-code-error" && (
            <AlertError>{model.error}</AlertError>
          )}
        </div>
      );
  }
};
