import { ProfileAvatar } from "gamezilla-app/app/@/data";
import { Button, Avatar, TextField, TopBar } from "gamezilla-app/app/@/ui";
import type { ModelClient, MsgClient } from "../profile.core";

export const ViewUpdateAvatarScreen = ({
	model,
	dispatch,
}: {
	model: ModelClient;
	dispatch: (msg: MsgClient) => void;
}) => {
	return (
		<div className="flex h-full w-full flex-col items-center">
			<TopBar
				left={
					<Button
						color="primary"
						variant="text"
						onClick={() =>
							dispatch({
								t: "clicked-back-button",
								from: { t: "profile-avatar" },
							})
						}
						text="Cancel"
					/>
				}
				title="Avatar"
				right={<Button color="primary" variant="text" text="Done" />}
			/>

			<div className="flex w-full flex-1 flex-col gap-8 p-4">
				<Avatar
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
					<TextField
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
