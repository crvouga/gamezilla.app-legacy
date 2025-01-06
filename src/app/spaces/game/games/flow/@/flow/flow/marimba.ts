export const OCTAVES = [3, 4, 5] as const

export type Octave = (typeof OCTAVES)[number]

export const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

export type Note = (typeof NOTES)[number]

export type NoteWithOctave = `${Note}${Octave}`
export const NODES_WITH_OCTAVE: NoteWithOctave[] = []
for (const octave of OCTAVES) {
  for (const note of NOTES) {
    NODES_WITH_OCTAVE.push(`${note}${octave}` as NoteWithOctave)
  }
}

export const MARIMBA_SOUND = {
  'marimba-a3-80': './marimba/marimba a3 80.m4a',
  'marimba-b3-80': './marimba/marimba b3 80.m4a',
  'marimba-c3-80': './marimba/marimba c3 80.m4a',
  'marimba-c4-80': './marimba/marimba c4 80.m4a',
  'marimba-d3-80': './marimba/marimba d3 80.m4a',
  'marimba-d4-80': './marimba/marimba d4 80.m4a',
  'marimba-e3-80': './marimba/marimba e3 80.m4a',
  'marimba-e4-80': './marimba/marimba e4 80.m4a',
  'marimba-f3-80': './marimba/marimba f3 80.m4a',
  'marimba-f4-80': './marimba/marimba f4 80.m4a',
  'marimba-g3-80': './marimba/marimba g3 80.m4a',
}

export const toSoundSrc = (noteWithOctave: NoteWithOctave): string => {
  switch (noteWithOctave) {
    case 'A3': {
      return MARIMBA_SOUND['marimba-a3-80']
    }
    case 'A4': {
      return MARIMBA_SOUND['marimba-a3-80']
    }
    case 'B3': {
      return MARIMBA_SOUND['marimba-b3-80']
    }
    case 'B4': {
      return MARIMBA_SOUND['marimba-b3-80']
    }
    case 'C3': {
      return MARIMBA_SOUND['marimba-c3-80']
    }
    case 'C4': {
      return MARIMBA_SOUND['marimba-c4-80']
    }
    case 'D3': {
      return MARIMBA_SOUND['marimba-d3-80']
    }
    case 'D4': {
      return MARIMBA_SOUND['marimba-d4-80']
    }
    case 'E3': {
      return MARIMBA_SOUND['marimba-e3-80']
    }
    case 'E4': {
      return MARIMBA_SOUND['marimba-e4-80']
    }
    case 'F3': {
      return MARIMBA_SOUND['marimba-f3-80']
    }
    case 'F4': {
      return MARIMBA_SOUND['marimba-f4-80']
    }
    case 'G3': {
      return MARIMBA_SOUND['marimba-g3-80']
    }
    case 'G4': {
      return MARIMBA_SOUND['marimba-g3-80']
    }
    default: {
      return MARIMBA_SOUND['marimba-b3-80']
    }
  }
}
