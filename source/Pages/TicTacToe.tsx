import { Button } from "@mui/material";
import React from "react";
import { cmd, react } from "../Framework";
import * as Routes from "../Routes";
import * as Game from "../Game";
import * as View from "../View";

/* 

                                                             
88b           d88                        88              88  
888b         d888                        88              88  
88`8b       d8'88                        88              88  
88 `8b     d8' 88   ,adPPYba,    ,adPPYb,88   ,adPPYba,  88  
88  `8b   d8'  88  a8"     "8a  a8"    `Y88  a8P_____88  88  
88   `8b d8'   88  8b       d8  8b       88  8PP"""""""  88  
88    `888'    88  "8a,   ,a8"  "8a,   ,d88  "8b,   ,aa  88  
88     `8'     88   `"YbbdP"'    `"8bbdP"Y8   `"Ybbd8"'  88  
                                                             

*/

export type Model = {
  board: Game.TicTacToe.Board;
};

export const init: Model = {
  board: Game.TicTacToe.emptyBoard,
};

/* 

                                                                        
88        88                        88                                  
88        88                        88                ,d                
88        88                        88                88                
88        88  8b,dPPYba,    ,adPPYb,88  ,adPPYYba,  MM88MMM  ,adPPYba,  
88        88  88P'    "8a  a8"    `Y88  ""     `Y8    88    a8P_____88  
88        88  88       d8  8b       88  ,adPPPPP88    88    8PP"""""""  
Y8a.    .a8P  88b,   ,a8"  "8a,   ,d88  88,    ,88    88,   "8b,   ,aa  
 `"Y8888Y"'   88`YbbdP"'    `"8bbdP"Y8  `"8bbdP"Y8    "Y888  `"Ybbd8"'  
              88                                                        
              88                                                        
                                                  
*/

export type Msg =
  | { type: "PressedBackButton" }
  | { type: "BoardClicked"; position: Game.TicTacToe.Position }
  | { type: "RestartButtonClicked" };

export const update = (msg: Msg, model: Model): [Model, cmd.Cmd<Msg>] => {
  switch (msg.type) {
    case "PressedBackButton":
      return [model, Routes.replace({ type: "Home" })];

    case "RestartButtonClicked":
      return [
        {
          ...model,
          board: Game.TicTacToe.emptyBoard,
        },
        cmd.none,
      ];

    case "BoardClicked":
      return [
        {
          ...model,
          board: Game.TicTacToe.move(
            model.board,
            Game.TicTacToe.toTurn(model.board),
            msg.position
          ),
        },
        cmd.none,
      ];
  }
};

/* 
                                                     
8b           d8  88                                  
`8b         d8'  ""                                  
 `8b       d8'                                       
  `8b     d8'    88   ,adPPYba,  8b      db      d8  
   `8b   d8'     88  a8P_____88  `8b    d88b    d8'  
    `8b d8'      88  8PP"""""""   `8b  d8'`8b  d8'   
     `888'       88  "8b,   ,aa    `8bd8'  `8bd8'    
      `8'        88   `"Ybbd8"'      YP      YP      

*/

export const view =
  (model: Model): react.Html<Msg> =>
  (dispatch) =>
    (
      <View.Page>
        <View.Header
          left={
            <View.HeaderBackButton
              onClick={() => dispatch({ type: "PressedBackButton" })}
            />
          }
          title="Tic Tac Toe"
        />
        <Game.TicTacToe.Board
          board={model.board}
          onClick={(position) => dispatch({ type: "BoardClicked", position })}
        />

        <Button
          size="large"
          fullWidth
          onClick={() => dispatch({ type: "RestartButtonClicked" })}
        >
          Restart
        </Button>
      </View.Page>
    );
