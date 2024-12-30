import type { VDom } from '~/@/vdom/vdom'
import { IconBotCute, IconBotLevel1, IconBotLevel4, IconBotScary, IconBotSimple } from '~/app/spaces/games/@/vs-bot'
import * as ChessBotLevelTypes from './chess-bot-level.types'

export type ChessBotLevel = ChessBotLevelTypes.ChessBotLevel

const all: ChessBotLevel[] = [0, 1, 2, 3, 4]

const toString = (level: ChessBotLevel): string => {
  switch (level) {
    case 0: {
      return 'Monkey'
      // return "Level 0";
    }
    case 1: {
      return 'Beginner'
      // return "Level 1";
    }
    case 2: {
      return 'Intermediate'
      // return "Level 2";
    }
    case 3: {
      return 'Advanced'
      // return "Level 3";
    }
    case 4: {
      return 'Experienced'
      // return "Level 4";
    }
  }
}

const render = ({ level, ...input }: { level: ChessBotLevel; className?: string }): VDom => {
  switch (level) {
    case 0: {
      return <IconBotSimple {...input} />
    }
    case 1: {
      return <IconBotCute {...input} />
    }
    case 2: {
      return <IconBotLevel1 {...input} />
    }
    case 3: {
      return <IconBotLevel4 {...input} />
    }
    case 4: {
      return <IconBotScary {...input} />
    }
  }
}

export const ChessBotLevel = {
  all,
  toString,
  render
}
