import {
	Posix,
	Result,
	Sub,
	Time,
	TimeSpan,
	isErr,
	isLoading,
	Loading,
} from "gamezilla-app/@/core";
import {
	APP_SOUND,
	playSound,
	sendToServer,
	showCreatedSm,
	showErrSm,
} from "gamezilla-app/app/@/client";
import { Button, IconPlus } from "gamezilla-app/app/@/ui";
import { ClientModule } from "../../builder.types";

const update: ClientModule["update"] = (input) => {
	const { msgCore, model, msg, ctx } = input;

	switch (msg?.t) {
		case "puzzle-create.user-clicked-create-button": {
			return {
				model: {
					...model,
					puzzleCreateRequest: Loading,
					puzzleCreateRequestedAt: ctx.now,
				},
				msgCmd: [
					playSound(APP_SOUND.tap),
					sendToServer({
						t: "puzzle-create.user-clicked-create-button",
					}),
				],
			};
		}

		case "time-passed": {
			if (
				isLoading(model.puzzleCreateRequest) &&
				TimeSpan.gte(
					Posix.diff(model.puzzleCreateRequestedAt, ctx.now),
					TimeSpan.seconds(5),
				)
			) {
				return {
					model: {
						...model,
						puzzleCreateRequest: Result.Err(ctx.t("app.something-went-wrong")),
					},
					msgCmd: showErrSm(input.ctx.t("app.something-went-wrong")),
				};
			}
			return { model };
		}

		default: {
			break;
		}
	}

	switch (msgCore?.t) {
		case "user-created-puzzle": {
			if (isErr(msgCore.created)) {
				return {
					model: { ...model, puzzleCreateRequest: msgCore.created },
					msgCmd: showErrSm(input.ctx.t("app.something-went-wrong")),
				};
			}

			const puzzleNew = msgCore.created.value;

			return {
				model: {
					...model,
					puzzleCreateRequest: Result.mapOk(msgCore.created, () => null),
					puzzles: { ...model.puzzles, [puzzleNew.id]: puzzleNew },
				},
				msgCmd: showCreatedSm(input.ctx.t("flow.puzzle-created")),
			};
		}

		default: {
			break;
		}
	}

	return { model };
};

const id = "puzzle-create-request";

const subscriptions: ClientModule["subscriptions"] = ({ model }) => {
	switch (model.puzzleCreateRequest.t) {
		case "loading": {
			return Time.interval(id, TimeSpan.seconds(1), () => ({
				t: "time-passed",
			}));
		}
		default: {
			return Sub.None;
		}
	}
};

const ViewCreateFab: ClientModule["View"] = (input) => {
	return (
		<Button
			text={input.ctx.t("flow.create-puzzle")}
			variant="contained"
			color="primary"
			fab
			loading={input.model.puzzleCreateRequest.t === "loading"}
			renderIconStart={(iconInput) => <IconPlus {...iconInput} />}
			onClick={() =>
				input.dispatch({ t: "puzzle-create.user-clicked-create-button" })
			}
		/>
	);
};

export const CreateNewPuzzleClient = {
	update,
	ViewCreateFab,
	subscriptions,
};
