import { CrudTransaction as PowerSyncCrudTransaction, UpdateType } from '@powersync/common'
import { CrudTransaction } from '~/@/upload-data/crud-transaction'
import { CrudTransactionEntry } from '~/@/upload-data/crud-transaction-entry'
import { CrudTransactionEntryOp } from '~/@/upload-data/crud-transaction-entry-op'

export const fromPowerSyncCrudTransaction = (input: PowerSyncCrudTransaction): CrudTransaction => {
  return {
    entries: input.crud.map((powersyncEntry): CrudTransactionEntry => {
      const entry: CrudTransactionEntry = {
        id: powersyncEntry.id,
        table: powersyncEntry.table,
        op: fromPowerSyncUpdateType(powersyncEntry.op),
        newData: powersyncEntry.opData,
        prevData: powersyncEntry.previousValues,
      }
      return entry
    }),
  }
}

export const fromPowerSyncUpdateType = (updateType: UpdateType): CrudTransactionEntryOp => {
  switch (updateType) {
    case UpdateType.PUT:
      return 'create'
    case UpdateType.PATCH:
      return 'update'
    case UpdateType.DELETE:
      return 'delete'
  }
}
