import { UserId } from "@gamezilla/shared/app";
import { ViewCtx } from "@gamezilla/shared/client";
import {
  IconArrowLeftOnRect,
  IconSpinner,
  IconUserPen,
  MyAvatar,
  MyButton,
  TopBar,
  TopBarBackButton,
} from "@gamezilla/shared/ui";
import { ClientModel, ClientMsg } from "../profile.shared";

export const ViewProfileScreen = ({
  model,
  ctx,
  userId,
}: {
  ctx: ViewCtx;
  userId: UserId;
  model: ClientModel;
  dispatch: (msg: ClientMsg) => void;
}) => {
  const profile = model.profiles[userId];

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <IconSpinner className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (profile.userId === ctx.currentUserId) {
    return (
      <div className="h-full w-full">
        <TopBar title={profile.username} />

        <div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
          <MyAvatar
            className="h-28 w-28"
            src={profile.avatarUrl}
            alt="profile avatar"
          />
          <p className="w-full overflow-hidden text-ellipsis text-center text-3xl">
            @{profile.username}
          </p>
          <MyButton
            onClick={() =>
              ctx.onPush({ t: "profile", c: { t: "profile-update" } })
            }
            className="w-full">
            <IconUserPen />
            Edit Profile
          </MyButton>
          <MyButton
            onClick={() => ctx.onPush({ t: "logout" })}
            className="w-full">
            <IconArrowLeftOnRect />
            Logout
          </MyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <TopBar
        left={<TopBarBackButton onClick={ctx.onBack} />}
        title={profile.username}
      />
      <div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
        <MyAvatar
          className="h-28 w-28"
          src={profile.avatarUrl}
          alt="profile avatar"
        />
        <p className="w-full overflow-hidden text-ellipsis text-center text-3xl">
          {profile.username}
        </p>
      </div>
    </div>
  );
};
