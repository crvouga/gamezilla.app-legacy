import { AnonymousClientCtx, ClientCtx } from "gamezilla-app/app/@/client";
import { ProfileAvatar } from "gamezilla-app/app/@/data";
import { Avatar, TextField, TopBar } from "gamezilla-app/app/@/ui";
import type { ModelClient, MsgClient } from "../profile.types";

export const ViewUpdateAvatarScreen = (input: {
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
	ctx: AnonymousClientCtx | ClientCtx;
}) => {
	return (
		<div className="flex h-full w-full flex-col items-center">
			<TopBar
				onBack={() =>
					input.dispatch({
						t: "clicked-back-button",
						from: { t: "profile-avatar" },
					})
				}
				title={input.ctx.t("profile.update-avatar")}
				ctx={input.ctx}
			/>

			<div className="flex w-full flex-1 flex-col gap-8 p-4">
				<Avatar
					src={
						input.model.draft?.avatarSeed && input.model.draft?.avatarStyle
							? ProfileAvatar.toUrl({
									seed: input.model.draft?.avatarSeed,
									style: input.model.draft?.avatarStyle,
								})
							: undefined
					}
					className="mx-auto h-32 w-32"
				/>

				<div className="flex w-full flex-col gap-4">
					<TextField
						label="Seed"
						value={input.model.draft?.avatarSeed ?? ""}
						onChange={(val) =>
							input.dispatch({ t: "inputted-avatar-seed", seed: val })
						}
						id="seed"
					/>

				</div>
			</div>
		</div>
	);
};
