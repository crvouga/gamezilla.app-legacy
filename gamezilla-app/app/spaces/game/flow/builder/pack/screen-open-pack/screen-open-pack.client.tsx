import { GameClientModule } from "gamezilla-app/app/spaces/@/architecture/game-client-v2";
import { FlowPackListClient } from "../../../@/flow-pack/flow-pack-list";
import type { ClientModule } from "../../builder.types";
import { PackCreateNewClient } from "../create-new-pack/pack-create-new.client";
import { withId } from "gamezilla-app/app/spaces/@/event";
import { APP_SOUND, playSound } from "gamezilla-app/app/@/client";

const update: ClientModule["update"] = (input) => {
	return GameClientModule.andThen(
		{ model: input.model },
		//
		(model) => updateClickedPackItem({ ...input, model }),
	);
};

export const updateClickedPackItem: ClientModule["update"] = ({
	msg,
	model,
}) => {
	switch (msg?.t) {
		case "pack-list.clicked-pack-item": {
			return {
				model,
				msgCore: [
					withId({ t: "pack-list.user-clicked-pack-item", pack: msg.pack }),
				],
				msgCmd: [playSound(APP_SOUND.navForwardMin)],
			};
		}
		default: {
			return { model };
		}
	}
};

const View: ClientModule["View"] = (input) => {
	return (
		<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
			<FlowPackListClient.View
				{...input}
				dispatch={(c) => input.dispatch({ t: "flow-pack-list", c })}
				model={input.model.flowPackList}
				slots={{
					fab: () => <PackCreateNewClient.ViewCreateButton {...input} />,
				}}
				emits={{
					clickedPackItem: (pack) =>
						input.dispatch({ t: "pack-list.clicked-pack-item", pack }),
				}}
			/>
		</div>
	);
};

export const PackListClient = {
	View,
	update,
};
