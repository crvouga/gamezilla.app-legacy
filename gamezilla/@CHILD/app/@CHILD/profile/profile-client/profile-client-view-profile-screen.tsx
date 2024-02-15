import {
  AnonymousClientCtx,
  ClientCtx,
} from "gamezilla/@CHILD/app/@SHARED/client"
import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import {
  Button,
  IconArrowLeftOnRect,
  IconSpinner,
  IconUserPen,
  Avatar,
  TopBar,
  TopBarBackButton,
} from "gamezilla/@CHILD/app/@SHARED/ui"
import { ModelClient, MsgClient } from "../profile.core"

export const ViewProfileScreen = ({
  model,
  ctx,
  userId,
  dispatch,
}: {
  ctx: ClientCtx | AnonymousClientCtx
  userId: UserId
  model: ModelClient
  dispatch: (msg: MsgClient) => void
}) => {
  const profile = model.profiles[userId]

  if (!profile) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <IconSpinner className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (profile.userId === ctx.currentUserId) {
    return (
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <TopBar title={profile.username} />

        <div className="flex flex-1 shrink-0 flex-col items-center justify-start gap-4 overflow-x-hidden overflow-y-scroll p-4">
          <Avatar
            className="h-28 w-28"
            src={profile.avatarUrl}
            alt="profile avatar"
          />
          <p className="w-full shrink-0 overflow-hidden text-ellipsis text-center text-3xl">
            @{profile.username}
          </p>
          <Button
            onClick={() => dispatch({ t: "clicked-edit-profile-button" })}
            className="w-full"
            start={<IconUserPen className="h-6 w-6" />}
            text="Edit Profile"
          />
          <Button
            onClick={() => dispatch({ t: "clicked-logout-button" })}
            className="w-full"
            start={<IconArrowLeftOnRect className="h-6 w-6" />}
            text="Logout"
          />
          <div className="w-full p-4"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-1 grow-0 flex-col">
      <TopBar
        left={
          <TopBarBackButton
            onClick={() =>
              dispatch({
                t: "clicked-back-button",
                from: { t: "profile", userId: profile.userId },
              })
            }
          />
        }
        title={profile.username}
      />
      <div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
        <Avatar
          className="h-28 w-28"
          src={profile.avatarUrl}
          alt="profile avatar"
        />
        <p className="w-full overflow-hidden text-ellipsis text-center text-3xl">
          {profile.username}
        </p>
      </div>
    </div>
  )
}
