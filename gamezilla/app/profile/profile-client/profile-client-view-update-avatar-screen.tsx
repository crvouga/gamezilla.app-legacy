import { ViewCtx } from "gamezilla/app/@SHARED/client";
import { ProfileAvatar } from "gamezilla/app/@SHARED/data";
import {
  Button,
  MyAvatar,
  MyTextField,
  TopBar,
} from "gamezilla/app/@SHARED/ui";
import { ClientModel, ClientMsg } from "./profile.core";

export const ViewUpdateAvatarScreen = ({
  ctx,
  model,
  dispatch,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <TopBar
        left={
          <Button
            color="primary"
            variant="text"
            onClick={() => ctx.back()}
            text="Cancel"
          />
        }
        title="Avatar"
        right={<Button color="primary" variant="text" text="Done" />}
      />

      <div className="flex w-full flex-1 flex-col gap-8 p-4">
        <MyAvatar
          src={
            model.draft?.avatarSeed && model.draft?.avatarStyle
              ? ProfileAvatar.toUrl({
                  seed: model.draft?.avatarSeed,
                  style: model.draft?.avatarStyle,
                })
              : undefined
          }
          className="mx-auto h-32 w-32"
        />

        <div className="flex w-full flex-col gap-4">
          <MyTextField
            label="Seed"
            value={model.draft?.avatarSeed ?? ""}
            onChange={(val) =>
              dispatch({ t: "inputted-avatar-seed", seed: val })
            }
            id="seed"
          />

          <Button
            onClick={() => dispatch({ t: "clicked-generate-random-seed" })}
            text=" Random seed"
          />
        </div>
      </div>
    </div>
  );
};
