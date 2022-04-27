module Main exposing (..)

import Browser
import Direction exposing (Direction(..))
import Html exposing (button, text)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import Snake



-- Main


main : Program () Model Msg
main =
    Browser.document
        { update = update
        , view = view
        , subscriptions = subscriptions
        , init = init
        }



-- Model


type alias Flags =
    InteropDefinitions.Flags


type alias Model =
    { snake : Snake.Model
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { snake = Snake.init
      }
    , Cmd.none
    )



-- Update


type Msg
    = SnakeMsg Snake.Msg
    | Greet


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        SnakeMsg snakeMsg ->
            let
                ( snakeModel, snakeCmd ) =
                    Snake.update snakeMsg model.snake
            in
            ( { model | snake = snakeModel }, Cmd.map SnakeMsg snakeCmd )

        Greet ->
            ( model, greet "Hello" )


greet : String -> Cmd msg
greet text =
    text
        |> InteropDefinitions.Alert
        |> InteropPorts.fromElm



-- Subscriptions


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.map SnakeMsg (Snake.subscriptions model.snake)



-- View


view : Model -> Browser.Document Msg
view model =
    { title = "Gamezilla"
    , body =
        [ button [ onClick Greet ]
            [ text "Greet" ]
        , Html.map SnakeMsg (Snake.view model.snake)
        ]
    }
