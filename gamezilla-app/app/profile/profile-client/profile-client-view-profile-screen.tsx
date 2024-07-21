import type { AnonymousClientCtx, ClientCtx } from "gamezilla-app/app/@/client";
import type { UserId } from "gamezilla-app/app/@/data";
import {
	Avatar,
	Button,
	IconArrowLeftOnRect,
	IconSpinner,
	IconUserPen,
	TopBar,
	Typography,
} from "gamezilla-app/app/@/ui";
import type { ModelClient, MsgClient } from "../profile.types";

export const ViewProfileScreen = (input: {
	ctx: ClientCtx | AnonymousClientCtx;
	userId: UserId;
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
}) => {
	const profile = input.model.profiles[input.userId];

	if (!profile) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				<IconSpinner className="h-12 w-12 animate-spin" />
			</div>
		);
	}

	if (profile?.userId === input.ctx.currentUserId) {
		return (
			<div className="flex w-full flex-1 flex-col overflow-hidden">
				<TopBar
					center
					onBack={false}
					ctx={input.ctx}
					title={input.ctx.t("username", profile.username)}
				/>

				<div className="flex flex-1 shrink-0 flex-col items-center justify-start gap-4 overflow-x-hidden overflow-y-scroll p-4">
					<Avatar
						className="h-28 w-28"
						src={profile?.avatarUrl}
						alt="profile avatar"
					/>
					<Button
						onClick={() => input.dispatch({ t: "clicked-edit-profile-button" })}
						className="w-full"
						renderIconStart={iconInput => <IconUserPen {...iconInput} />}
						text={input.ctx.t("profile.update-profile")}
					/>
					<Button
						onClick={() => input.dispatch({ t: "clicked-logout-button" })}
						className="w-full"
						renderIconStart={iconInput => <IconArrowLeftOnRect {...iconInput} />}
						text={input.ctx.t("auth.logout")}
					/>
					<div className="w-full p-4" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-1 flex-col">
			<TopBar
				onBack={() =>
					input.dispatch({
						t: "clicked-back-button",
						from: { t: "profile", userId: profile?.userId },
					})
				}
				title={input.ctx.t("username", profile.username)}
				ctx={input.ctx}
			/>
			<div className="flex flex-col items-center justify-center gap-4 overflow-x-hidden p-4">
				<Avatar
					className="h-28 w-28"
					src={profile?.avatarUrl}
					alt="profile avatar"
				/>
				<Typography
					variant="title"
					text={input.ctx.t("username", profile.username)}
				/>
			</div>
		</div>
	);
};
