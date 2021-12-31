module Main exposing (Flags, Model, Msg, main)

import Browser exposing (Document)
import Button
import Container
import Direction exposing (Direction)
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (class)
import Html.Events exposing (onClick)
import InteropDefinitions
import InteropPorts
import List
import LogInMethod
import LoginSession
import Position exposing (Position)
import Random
import Set exposing (Set)
import Snake
import Svg exposing (rect, svg)
import Svg.Attributes exposing (fill, height, viewBox, width, x, y)
import Svg.Events
import Time
import Utility exposing (isEven, isOdd)



-- PROGRAM


main : Program Flags Model Msg
main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Flags =
    InteropDefinitions.Flags


type alias Model =
    { logInSession : LoginSession.Model
    , snake : Snake.Model
    }


initialModel : Model
initialModel =
    { logInSession = LoginSession.IsLoading
    , snake = Snake.initialModel
    }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = GotSnakeMsg Snake.Msg
    | GotLoginSessionMsg LoginSession.Msg
    | Noop


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )

        GotLoginSessionMsg loginSessionMsg ->
            let
                ( loginSessionModel, loginSessionCommand ) =
                    LoginSession.update loginSessionMsg model.logInSession
            in
            ( { model | logInSession = loginSessionModel }, Cmd.map (\commandMsg -> GotLoginSessionMsg commandMsg) loginSessionCommand )

        GotSnakeMsg snakeMsg ->
            let
                ( snakeModel, snakeCommand ) =
                    Snake.update snakeMsg model.snake
            in
            ( { model | snake = snakeModel }, Cmd.map (\commandMsg -> GotSnakeMsg commandMsg) snakeCommand )



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map GotSnakeMsg (Snake.subscriptions model.snake)
        , Sub.map GotLoginSessionMsg (LoginSession.subscriptions model.logInSession)
        ]



-- VIEW


view : Model -> Document Msg
view model =
    Document "Gamezilla"
        [ Container.view []
            [ Html.map GotLoginSessionMsg (LoginSession.viewLogInSessionButton model.logInSession)
            , Html.map GotSnakeMsg (Snake.view model.snake)
            ]
        ]
