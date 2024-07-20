import type { FlowViewinput } from "../flow-ui/flow-ui";
import { FlowGridUI } from "./flow-grid";
import { FlowHexUI } from "./flow-hex";
import { FlowTriUI } from "./flow-tri";
import type { Model } from "./flow-variant";

export const View = (input: FlowViewinput<Model>) => {
	switch (input.model.t) {
		case "flow-grid": {
			return <FlowGridUI.View {...input} model={input.model} />;
		}

		case "flow-hex": {
			return <FlowHexUI.View {...input} model={input.model} />;
		}

		case "flow-tri": {
			return <FlowTriUI.View {...input} model={input.model} />;
		}
	}
};
