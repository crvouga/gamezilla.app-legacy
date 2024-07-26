import './columns-element'
import { type Columnsinput, columnsinputSub } from './shared'

export const ViewColumns = (input: Columnsinput) => {
  columnsinputSub.pub(input)
  return (
    // @ts-ignore
    <connect-four-columns initial-columns-json={JSON.stringify(input.columns)} />
  )
}
