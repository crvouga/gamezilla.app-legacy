import "./columns-element"
import { ColumnsProps, columnsPropsSub } from "./shared"

export const ViewColumns = (props: ColumnsProps) => {
  columnsPropsSub.publish(props)
  return (
    // @ts-ignore
    <connect-four-columns
      initial-columns-json={JSON.stringify(props.columns)}
    />
  )
}
