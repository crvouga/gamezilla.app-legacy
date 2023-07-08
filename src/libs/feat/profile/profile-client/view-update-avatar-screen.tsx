import { ProfileAvatar } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import { MyAvatar, MyButton, MyTextField, TopBar } from "@gamezilla/shared/ui";
import { ClientModel, ClientMsg } from "../profile.shared";

export const ViewUpdateAvatarScreen = ({
  ctx,
  model,
  $send,
}: {
  ctx: ViewCtx;
  model: ClientModel;
  $send: (msg: ClientMsg) => void;
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center">
      <TopBar
        left={
          <MyButton color="primary" variant="text" onClick={() => ctx.$back()}>
            Cancel
          </MyButton>
        }
        title="Avatar"
        right={
          <MyButton color="primary" variant="text">
            Done
          </MyButton>
        }
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
            onChange={(val) => $send({ t: "inputted-avatar-seed", seed: val })}
            id="seed"
          />

          <MyButton
            onClick={() => $send({ t: "clicked-generate-random-seed" })}>
            Random seed
          </MyButton>
        </div>
      </div>
    </div>
  );
};
