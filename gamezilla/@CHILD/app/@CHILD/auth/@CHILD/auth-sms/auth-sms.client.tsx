import {
  AnonymousViewCtx,
  Location,
} from "gamezilla/@CHILD/app/@SHARED/client";
import {
  AlertError,
  Button,
  MyTextField,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui";
import { toLocation, toRoute } from "./route";
import { ClientModel, ClientMsg } from "./auth-sms.core";

export const update = ({
  model,
  msg,
}: {
  model: ClientModel;
  msg: ClientMsg;
}): {
  model: ClientModel;
  // cmd: RouteCmd<AuthRoute>;
} => {
  return { model };
};

export const View = ({
  location,
  model,
  dispatch,
  ctx,
}: {
  ctx: AnonymousViewCtx;
  location: Location;
  model: ClientModel;
  dispatch: (m: ClientMsg) => void;
}) => {
  const route = toRoute(location);

  switch (route.t) {
    case "/": {
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
              loading={model.sendCode.t === "loading"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.sendCode.t === "err" && (
            <AlertError>{model.sendCode.error}</AlertError>
          )}
        </div>
      );
    }

    case "/verify": {
      return (
        <div className="w-full">
          <TopBar
            left={<TopBarBackButton onClick={() => {}} />}
            title="Login with phone"
          />

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
              text="Verify Code"
              loading={model.verifyCode.t === "loading"}
              onClick={() => {
                dispatch({ t: "clicked-send-code" });
              }}
            />
          </div>

          {model.verifyCode.t === "err" && (
            <AlertError>{model.verifyCode.error}</AlertError>
          )}
        </div>
      );
    }
  }
};
