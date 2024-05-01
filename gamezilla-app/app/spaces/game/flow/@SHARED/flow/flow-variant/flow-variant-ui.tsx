import type { FlowViewProps } from "../flow/flow-ui";
import { FlowGridUI } from "./flow-grid";
import { FlowHexUI } from "./flow-hex";
import { FlowTriUI } from "./flow-tri";
import type { Model } from "./flow-variant";

export const View = (props: FlowViewProps<Model>) => {
	switch (props.model.t) {
		case "flow-grid": {
			return <FlowGridUI.View {...props} model={props.model} />;
		}

		case "flow-hex": {
			return <FlowHexUI.View {...props} model={props.model} />;
		}

		case "flow-tri": {
			return <FlowTriUI.View {...props} model={props.model} />;
		}
	}
};
