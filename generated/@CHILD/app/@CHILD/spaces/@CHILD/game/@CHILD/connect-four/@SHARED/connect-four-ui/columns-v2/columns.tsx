import "./columns-element";
import { ColumnsProps, columnsPropsSub } from "./shared";
export function ViewColumns(props: ColumnsProps) {
    columnsPropsSub.publish(props);
    return (
    // @ts-ignore
    <connect-four-columns initial-columns-json={JSON.stringify(props.columns)}/>);
}
