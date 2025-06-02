export type PGLiteFileSystem =
  | {
      t: 'in-memory'
    }
  | {
      t: 'indexed-db'
      dbName: string
    }
  | {
      t: 'file-system'
      dataDir: string
    }

const toDataDir = (fs: PGLiteFileSystem): string => {
  switch (fs.t) {
    case 'file-system': {
      return fs.dataDir
    }
    case 'in-memory': {
      return 'memory://'
    }
    case 'indexed-db': {
      return `idb://${fs.dbName}`
    }
  }
}
export const PGLiteFileSystem = {
  toDataDir,
}
