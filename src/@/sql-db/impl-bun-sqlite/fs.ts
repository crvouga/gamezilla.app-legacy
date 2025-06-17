export type Fs =
  | {
      t: 'in-memory'
    }
  | {
      t: 'file-system'
      fileName: string
    }

const toConnectionString = (fs: Fs): string => {
  switch (fs.t) {
    case 'file-system': {
      return `${fs.fileName}.sqlite`
    }
    case 'in-memory': {
      return ':memory:'
    }
  }
}
export const Fs = {
  toConnectionString,
}
