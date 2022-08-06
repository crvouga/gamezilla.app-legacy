import * as Columns from "./Columns"

//
//
//
// Model
//
//
//

export type Model = {
  columns: Columns.Columns
}

export const init: Model = {
  columns: Columns.emptyColumns,
}
