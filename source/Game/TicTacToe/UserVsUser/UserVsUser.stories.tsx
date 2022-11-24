import { ComponentMeta, ComponentStory } from "@storybook/react"
import { ctx, userA, userB, userC } from "../../../test-data"
import * as UI from "../../../UI"
import { Model, View } from "./UserVsUser.Frontend"

const modelSetup: Model = {
  type: "Setup",
  maxRoundCount: 3,
  moveTimeLimit: 5,
  O: "None",
  X: "None",
  openedModal: "None",
}

const props: Parameters<typeof View>[0] = {
  $d: () => {},
  ctx: ctx,
  model: modelSetup,
  onCloseGame: () => {},
}

export default {
  title: "TicTacToe / UserVsUser",
  component: View,
  args: props,
} as ComponentMeta<typeof View>

const Template: ComponentStory<typeof View> = (args) => {
  return (
    <UI.AppContainer themeMode="System">
      <View {...args} />
    </UI.AppContainer>
  )
}

export const SetupMissingAll = Template.bind({})
SetupMissingAll.args = {
  model: {
    ...modelSetup,
  },
}

export const SetupMissingX = Template.bind({})
SetupMissingX.args = {
  model: {
    ...modelSetup,
    O: userA.userId,
  },
}

export const SetupMissingO = Template.bind({})
SetupMissingO.args = {
  model: {
    ...modelSetup,
    X: userB.userId,
  },
}

export const SetupReady = Template.bind({})
SetupReady.args = {
  model: {
    ...modelSetup,
    O: userA.userId,
    X: userB.userId,
  },
}

export const GameStarting = Template.bind({})
GameStarting.args = {
  model: {
    type: "Game",
    maxRoundCount: 3,
    moveTimeLimit: 5,
    O: userA.userId,
    X: userB.userId,
    round: {
      type: "RoundStarting",
      countDown: 3,
    },
    openedModal: "None",
  },
}

export const GameStarted = Template.bind({})
GameStarted.args = {
  model: {
    type: "Game",
    maxRoundCount: 3,
    moveTimeLimit: 5,
    O: userA.userId,
    X: userB.userId,
    round: {
      type: "RoundStarted",
      board: [
        ["O", "X", "O"],
        ["O", "X", "_"],
        ["X", "_", "_"],
      ],
      moveCountDown: 4,
    },
    openedModal: "None",
  },
}

export const RoundOverTie = Template.bind({})
RoundOverTie.args = {
  model: {
    type: "Game",
    maxRoundCount: 3,
    moveTimeLimit: 5,
    O: userA.userId,
    X: userB.userId,
    round: {
      type: "RoundOver",
      board: [
        ["O", "X", "O"],
        ["O", "X", "O"],
        ["X", "O", "X"],
      ],
      next: {
        type: "RoundStarting",
        countDown: 3,
      },
      roundOver: {
        type: "Tie",
      },
    },
    openedModal: "None",
  },
}

export const RoundOverWin = Template.bind({})
RoundOverWin.args = {
  model: {
    type: "Game",
    maxRoundCount: 5,
    moveTimeLimit: 5,
    O: userA.userId,
    X: userB.userId,
    round: {
      type: "RoundOver",
      board: [
        ["O", "X", "O"],
        ["O", "X", "O"],
        ["X", "X", "_"],
      ],
      next: {
        type: "RoundStarting",
        countDown: 3,
      },
      roundOver: {
        type: "Win",
        winner: "X",
      },
    },
    openedModal: "None",
  },
}

export const RoundOverWinOther = Template.bind({})
RoundOverWinOther.args = {
  model: {
    type: "Game",
    maxRoundCount: 5,
    moveTimeLimit: 5,
    O: userA.userId,
    X: userB.userId,
    round: {
      type: "RoundOver",
      board: [
        ["O", "O", "X"],
        ["X", "O", "O"],
        ["X", "O", "X"],
      ],
      next: {
        type: "RoundStarting",
        countDown: 3,
      },
      roundOver: {
        type: "Win",
        winner: "O",
      },
    },
    openedModal: "None",
  },
}

const gameOverBase: Model = {
  type: "GameOver",
  maxRoundCount: 3,
  moveTimeLimit: 5,
  O: userA.userId,
  X: userB.userId,
  gameOver: {
    type: "Tie",
  },
  round: {
    type: "RoundOver",
    board: [
      ["O", "X", "X"],
      ["X", "O", "O"],
      ["X", "O", "X"],
    ],
    next: {
      type: "RoundStarting",
      countDown: 3,
    },
    roundOver: {
      type: "Win",
      winner: "O",
    },
  },
  openedModal: "None",
  rematch: {
    type: "NotAsking",
  },
}

export const GameOverTie = Template.bind({})
GameOverTie.args = {
  model: {
    ...gameOverBase,
    gameOver: {
      type: "Tie",
    },
  },
}

export const GameOverWin = Template.bind({})
GameOverWin.args = {
  model: {
    ...gameOverBase,
    gameOver: {
      type: "Winner",
      winner: "X",
    },
  },
}

export const GameOverWinOther = Template.bind({})
GameOverWinOther.args = {
  model: {
    ...gameOverBase,
    gameOver: {
      type: "Winner",
      winner: "O",
    },
  },
}

export const GameOverWinNotPlaying = Template.bind({})
GameOverWinNotPlaying.args = {
  model: {
    ...gameOverBase,
    X: userC.userId,
    gameOver: {
      type: "Winner",
      winner: "O",
    },
  },
}

export const GameOverResigned = Template.bind({})
GameOverResigned.args = {
  model: {
    ...gameOverBase,
    round: {
      type: "RoundStarting",
      countDown: 3,
    },
    gameOver: {
      type: "Resignation",
      resigner: "X",
    },
  },
}

export const GameOverRematchAsked = Template.bind({})
GameOverRematchAsked.args = {
  model: {
    ...gameOverBase,
    rematch: {
      type: "Asking",
      asker: "O",
    },
  },
}

export const GameOverRematchAsking = Template.bind({})
GameOverRematchAsking.args = {
  model: {
    ...gameOverBase,
    rematch: {
      type: "Asking",
      asker: "X",
    },
  },
}
