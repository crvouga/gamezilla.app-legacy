import "./columns-element";
import { type ColumnsProps, columnsPropsSub } from "./shared";

export const ViewColumns = (props: ColumnsProps) => {
	columnsPropsSub.pub(props);
	return (
		// @ts-ignore
		<connect-four-columns
			initial-columns-json={JSON.stringify(props.columns)}
		/>
	);
};
