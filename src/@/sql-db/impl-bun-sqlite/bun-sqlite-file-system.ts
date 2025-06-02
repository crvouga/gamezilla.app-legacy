export type BunSqliteFileSystem =
  | {
      t: 'in-memory'
    }
  | {
      t: 'file-system'
      fileName: string
    }

const toConnectionString = (fs: BunSqliteFileSystem): string => {
  switch (fs.t) {
    case 'file-system': {
      return `${fs.fileName}.sqlite`
    }
    case 'in-memory': {
      return ':memory:'
    }
  }
}
export const BunSqliteFileSystem = {
  toConnectionString,
}
