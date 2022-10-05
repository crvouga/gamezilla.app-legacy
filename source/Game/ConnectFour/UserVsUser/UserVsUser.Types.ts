import { UserId } from "../../../Data"


// 
// 
// 
// Model
// 
// 
// 



export type SharedModel = {
    type: "Setup",
    playerOne: UserId.UserId | "None"
    playerTwo: UserId.UserId | "None"
    moveTimeLimit: MoveTimeLimit
}

export type MoveTimeLimit = 5 | 7 | 9

export const moveTimeLimit: { [moveTimeLimit in MoveTimeLimit]: MoveTimeLimit } = {
    "5": 5,
    "7": 7,
    "9": 9
}

export const moveTimeLimitToString = (timeLimit: MoveTimeLimit): string => {
    switch (timeLimit) {
        case 5: {
            return "5 sec"
        }

        case 7: {
            return "7 sec"
        }

        case 9: {
            return "9 sec"
        }
    }
}

export type FrontendModel = SharedModel

export type BackendModel = SharedModel

// 
// 
// 
// Msg
// 
// 
// 

export type BackendMsg = ["None"]

export type FrontendMsg = ["None"]

export type ToBackend = ["None"]

export type ToFrontend = ["None"]

export type Req = ["InputMove"]