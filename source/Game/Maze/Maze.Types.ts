import { Keyboard, Result, Set } from "../../Core"
import { Err, Ok } from "../../Core/Result"
import { UserId } from "../../Data"
import { Maze } from "./Maze"
import { Direction, Position } from "./Position"

//
//
//
// Model
//
//
//

export type SharedModel = SetupModel

export type SetupModel =
  | {
    type: "Setup"
    players: Set<UserId>,
    colors: ColorMap
    seed: string
    lower: Position
    upper: Position
  }
  | {
    type: "Game",
    players: { [userId: UserId]: Player }
    colors: ColorMap
    seed: string,
    lower: Position
    upper: Position
  }

type ColorMap = { [color in Color]?: UserId }

type Player = {
  userId: UserId;
  position: Position
  direction: Direction | "None"
}

type Color = "Red" | "Blue" | "Green" | "Purple"


// const colorSequence: Color[] = ['Red', 'Blue', "Green", "Purple"]

export type FrontendModel = SharedModel

export type BackendModel = SharedModel



// 
// 
// 
// Msg
// 
// 
// 

export type FrontendMsg = Req | ['KeyDown', Keyboard.Key]

export type BackendMsg = ['None']

export type ToBackend = Req

export type ToFrontend = Res

// 
// 
// 
// 

export type Req =
  | ['StartPlaying', { userId: UserId }]
  | ['StopPlaying', { userId: UserId }]
  | ['StartGame', { userId: UserId }]
  | ['InputDirection', { userId: UserId, direction: Direction }]
  | ['InputSeed', { userId: UserId, seed: string }]

export type Res = [...Req, Result<Problem, SharedModel>]

type Problem =
  | "must_be_setup"
  | "already_playing"
  | "must_have_at_least_one_player"
  | "must_be_playing"
  | "must_be_game"
  | "out_of_bounds"
  | "hit_wall"

export const handle = (msg: Req, model: SharedModel): Result<Problem, SharedModel> => {
  switch (msg[0]) {

    case 'InputSeed': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err("must_be_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        seed: msg[1].seed
      }

      return Ok(modelNew)
    }

    case 'StartPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      if (Set.isMember(msg[1].userId, model.players)) {
        return Err("already_playing")
      }

      const modelNew: SharedModel = {
        ...model,
        players: Set.add(msg[1].userId, model.players)
      }
      return Ok(modelNew)
    }

    case 'StopPlaying': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      const modelNew: SharedModel = {
        ...model,
        players: Set.remove(msg[1].userId, model.players)
      }

      return Ok(modelNew)
    }

    case 'StartGame': {
      if (model.type !== 'Setup') {
        return Err("must_be_setup")
      }

      if (Object.values(model.players).length === 0) {
        return Err("must_have_at_least_one_player")
      }

      const playersNew: { [userId: UserId]: Player } =
        Set.toArray(model.players)
          .reduce<{ [userId: UserId]: Player }>((byId, userId) => ({
            ...byId,
            [userId]: {
              userId,
              position: { x: 0, y: 0 },
              direction: "None"
            }
          }),
            {}
          )

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        seed: model.seed,
        lower: model.lower,
        upper: model.upper,
        players: playersNew,
      }

      return Ok(modelNew)
    }

    case 'InputDirection': {
      if (model.type !== 'Game') {
        return Err("must_be_game")
      }

      const player = model.players[msg[1].userId]

      if (!player) {
        return Err("must_be_playing")
      }

      const positionNew = Position.add(
        Direction.toVector(msg[1].direction),
        player.position,
      )

      const maze = Maze.make(model)

      if (!Maze.hasEdge([player.position, positionNew], maze)) {
        return Err("hit_wall")
      }

      const inbounds =
        Position.inclusiveContains({ lower: model.lower, upper: model.upper }, positionNew)


      if (!inbounds) {
        return Err("out_of_bounds")
      }

      const playerNew: Player = {
        ...player,
        position: positionNew,
        direction: msg[1].direction
      }

      const modelNew: SharedModel = {
        type: "Game",
        colors: model.colors,
        seed: model.seed,
        upper: model.upper,
        lower: model.lower,
        players: {
          ...model.players,
          [playerNew.userId]: playerNew
        },
      }

      return Ok(modelNew)
    }
  }
}


//
//
//
// Init
//
//
//


export const initShared: SharedModel = {
  type: "Setup",
  players: {},
  colors: {},
  seed: "some arbitrary seed",
  lower: { x: -10, y: -10 },
  upper: { x: 10, y: 10 }
}